// Get the canvas and its context
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Resize canvas to fit the viewport while maintaining proper aspect ratio
function resizeCanvas() {
    const padding = 10; // Minimal padding
    
    const maxHeight = window.innerHeight - padding * 2;
    const maxWidth = window.innerWidth - padding * 2;
    
    // Air hockey table has a 1:2 width to height ratio (approximately)
    const aspectRatio = 1/1.8;
    
    let newWidth, newHeight;
    
    // Calculate dimensions based on available space
    if (maxWidth * (1/aspectRatio) <= maxHeight) {
        // Width is the limiting factor
        newWidth = maxWidth;
        newHeight = maxWidth * (1/aspectRatio);
    } else {
        // Height is the limiting factor
        newHeight = maxHeight;
        newWidth = maxHeight * aspectRatio;
    }
    
    // Set canvas size
    canvas.width = newWidth;
    canvas.height = newHeight;
    
    // Update game parameters based on new canvas size
    updateGameDimensions();
}

// Update game parameters based on canvas size
function updateGameDimensions() {
    // Scale game constants based on canvas size
    GOAL_WIDTH = canvas.width * 0.4;
    GOAL_X = (canvas.width - GOAL_WIDTH) / 2;
    GOAL_HEIGHT = canvas.height * 0.033;
    
    // Update puck and paddle sizes
    puck.radius = canvas.width * 0.03;
    player1.radius = canvas.width * 0.05;
    player2.radius = canvas.width * 0.05;
    
    // Update wall thickness
    walls.thickness = canvas.width * 0.04;
    
    // Reset positions
    resetPositions();
}

// Game constants - improved physics parameters
let FRICTION = 0.992;  // Slightly less friction for smoother gliding
const PUCK_SPEED_LIMIT = 25;  // Higher speed limit for faster gameplay
const PADDLE_ELASTICITY = 1.2; // More bounce on paddle hits
const MIN_COLLISION_SPEED = 4; // Increased minimum collision speed
let GOAL_WIDTH = canvas.width * 0.4; // Reduced from 0.6 to 0.4 for narrower goals
let GOAL_X = (canvas.width - GOAL_WIDTH) / 2;
let GOAL_HEIGHT = canvas.height * 0.033;
const GOAL_FLASH_DURATION = 45; // Longer flash duration

const logo = new Image();
logo.src = "./assets/logo.png";
let logoLoaded = false;
logo.onload = function() {
    logoLoaded = true;
};

// Game objects
const puck = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: canvas.width * 0.03,
    dx: 0,
    dy: 0,
    mass: 1,
    color: "#fff"
};

const player1 = {
    x: canvas.width / 2,
    y: canvas.height - 100,
    radius: canvas.width * 0.05,
    speed: 9,
    mass: 5, // Increased mass for more impactful hits
    prevX: canvas.width / 2,
    prevY: canvas.height - 100,
    color: "#f00",
    controls: {
        up: "w",
        down: "s",
        left: "a",
        right: "d"
    },
    keys: {
        up: false,
        down: false,
        left: false,
        right: false
    }
};

const player2 = {
    x: canvas.width / 2,
    y: 100,
    radius: canvas.width * 0.05,
    speed: 9,
    mass: 5, // Increased mass for more impactful hits
    prevX: canvas.width / 2,
    prevY: 100,
    color: "#00f",
    controls: {
        up: "ArrowUp",
        down: "ArrowDown",
        left: "ArrowLeft",
        right: "ArrowRight"
    },
    keys: {
        up: false,
        down: false,
        left: false,
        right: false
    }
};

// Add table edges/walls for collision
const walls = {
    thickness: canvas.width * 0.04,
    color: "#555"
};

// New physics constants
const REBOUND_DAMPING = 0.85; // Reduce energy when hitting walls
const ANGLE_RANDOMIZATION = 0.05; // Slight randomization in bounces for realism
const PADDLE_MOMENTUM_TRANSFER = 0.7; // How much paddle momentum transfers to puck

let player1Score = 0;
let player2Score = 0;
let lastUpdateTime = performance.now();
let goalFlashTimer = 0;
let lastScorer = null; // 1 for player1, 2 for player2
let gameStarted = false;
let isPaused = false;

// Keyboard event listeners
window.addEventListener("keydown", (e) => {
    if (e.key === "p" || e.key === "P") {
        isPaused = !isPaused;
        return;
    }
    
    if (e.key === " " && !gameStarted) {
        gameStarted = true;
        resetPuck();
        return;
    }
    
    handleKeyPress(e.key, true);
});

window.addEventListener("keyup", (e) => {
    handleKeyPress(e.key, false);
});

// Listen for window resize
window.addEventListener("resize", () => {
    resizeCanvas();
});

function handleKeyPress(key, isPressed) {
    // Player 1 controls
    if (key.toLowerCase() === player1.controls.up.toLowerCase()) player1.keys.up = isPressed;
    if (key.toLowerCase() === player1.controls.down.toLowerCase()) player1.keys.down = isPressed;
    if (key.toLowerCase() === player1.controls.left.toLowerCase()) player1.keys.left = isPressed;
    if (key.toLowerCase() === player1.controls.right.toLowerCase()) player1.keys.right = isPressed;
    
    // Player 2 controls
    if (key === player2.controls.up) player2.keys.up = isPressed;
    if (key === player2.controls.down) player2.keys.down = isPressed;
    if (key === player2.controls.left) player2.keys.left = isPressed;
    if (key === player2.controls.right) player2.keys.right = isPressed;
}

function updatePlayer(player, deltaTime) {
    // Save previous position for momentum calculation
    player.prevX = player.x;
    player.prevY = player.y;
    
    // Calculate movement direction
    let dx = 0;
    let dy = 0;
    
    if (player.keys.up) dy -= 1;
    if (player.keys.down) dy += 1;
    if (player.keys.left) dx -= 1;
    if (player.keys.right) dx += 1;
    
    // Normalize diagonal movement
    if (dx !== 0 && dy !== 0) {
        const length = Math.sqrt(dx * dx + dy * dy);
        dx /= length;
        dy /= length;
    }
    
    // Scale player speed based on canvas size
    const scaledSpeed = player.speed * (canvas.width / 500);
    
    // Apply movement with delta time scaling
    const adjustedSpeed = scaledSpeed * (deltaTime / 16);
    player.x += dx * adjustedSpeed;
    player.y += dy * adjustedSpeed;
    
    // Boundary checks including walls
    const effectiveWallThickness = walls.thickness + 2; // Small buffer
    player.x = Math.max(effectiveWallThickness + player.radius, 
                       Math.min(canvas.width - effectiveWallThickness - player.radius, player.x));
    
    // Player-specific y-boundaries
    if (player === player1) {
        player.y = Math.max(canvas.height / 2 + player.radius, 
                          Math.min(canvas.height - effectiveWallThickness - player.radius, player.y));
    } else {
        player.y = Math.max(effectiveWallThickness + player.radius, 
                          Math.min(canvas.height / 2 - player.radius, player.y));
    }
}

function handleCollision(paddle) {
    // Calculate normal vector (direction from paddle to puck)
    const dx = puck.x - paddle.x;
    const dy = puck.y - paddle.y;
    const distance = Math.hypot(dx, dy);
    const nx = dx / distance;
    const ny = dy / distance;
    
    // Calculate paddle velocity
    const paddleVx = (paddle.x - paddle.prevX) * PADDLE_MOMENTUM_TRANSFER;
    const paddleVy = (paddle.y - paddle.prevY) * PADDLE_MOMENTUM_TRANSFER;
    
    // Calculate relative velocity
    const relativeVx = puck.dx - paddleVx;
    const relativeVy = puck.dy - paddleVy;
    
    // Calculate impulse (dot product of relative velocity and normal)
    const dotProduct = relativeVx * nx + relativeVy * ny;
    
    // Only collide if objects are moving toward each other
    if (dotProduct > 0) return;
    
    // Calculate impulse scalar (improved conservation of momentum)
    const impulse = -(1 + PADDLE_ELASTICITY) * dotProduct / 
                  (1/puck.mass + 1/paddle.mass);
    
    // Apply impulse to puck
    puck.dx += (impulse * nx) / puck.mass;
    puck.dy += (impulse * ny) / puck.mass;
    
    // Add paddle velocity effect (pushes the puck)
    puck.dx += paddleVx * 0.7; // Increased effect
    puck.dy += paddleVy * 0.7;
    
    // Position correction to prevent sticking
    const overlap = (puck.radius + paddle.radius) - distance;
    if (overlap > 0) {
        puck.x += nx * overlap * 1.05;
        puck.y += ny * overlap * 1.05;
    }
    
    // Ensure minimum speed after collision
    const speed = Math.hypot(puck.dx, puck.dy);
    if (speed < MIN_COLLISION_SPEED) {
        const boost = MIN_COLLISION_SPEED / speed;
        puck.dx *= boost;
        puck.dy *= boost;
    }
    
    // Add slight randomization for realism
    puck.dx += (Math.random() - 0.5) * ANGLE_RANDOMIZATION * speed;
    puck.dy += (Math.random() - 0.5) * ANGLE_RANDOMIZATION * speed;
}

function updatePuck(deltaTime) {
    // Apply friction (scaled by frame time)
    const frameFriction = Math.pow(FRICTION, deltaTime / 16);
    puck.dx *= frameFriction;
    puck.dy *= frameFriction;
    
    // Stop very slow movement
    if (Math.abs(puck.dx) < 0.05) puck.dx = 0;
    if (Math.abs(puck.dy) < 0.05) puck.dy = 0;
    
    // Move puck with delta time scaling
    puck.x += puck.dx * (deltaTime / 16);
    puck.y += puck.dy * (deltaTime / 16);
    
    // Wall collisions (with more realistic physics)
    const effectiveWallThickness = walls.thickness;
    
    // Left wall collision
    if (puck.x - puck.radius <= effectiveWallThickness) {
        puck.x = effectiveWallThickness + puck.radius;
        puck.dx = Math.abs(puck.dx) * REBOUND_DAMPING;
    } 
    // Right wall collision
    else if (puck.x + puck.radius >= canvas.width - effectiveWallThickness) {
        puck.x = canvas.width - effectiveWallThickness - puck.radius;
        puck.dx = -Math.abs(puck.dx) * REBOUND_DAMPING;
    }
    
    // Goal detection (top/bottom)
    if (puck.y - puck.radius <= 0) {
        // Check if puck is within goal width
        if (puck.x >= GOAL_X && puck.x <= GOAL_X + GOAL_WIDTH) {
            player1Score++;
            lastScorer = 1;
            resetPuck();
        } else {
            // Bounce off if not in goal
            puck.y = puck.radius;
            puck.dy = Math.abs(puck.dy) * REBOUND_DAMPING;
        }
    } else if (puck.y + puck.radius >= canvas.height) {
        // Check if puck is within goal width
        if (puck.x >= GOAL_X && puck.x <= GOAL_X + GOAL_WIDTH) {
            player2Score++;
            lastScorer = 2;
            resetPuck();
        } else {
            // Bounce off if not in goal
            puck.y = canvas.height - puck.radius;
            puck.dy = -Math.abs(puck.dy) * REBOUND_DAMPING;
        }
    }
    
    // Paddle collision
    if (checkCollision(puck, player1)) {
        handleCollision(player1);
    } else if (checkCollision(puck, player2)) {
        handleCollision(player2);
    }
    
    // Speed limit with smoothing - scale based on canvas size
    const scaledSpeedLimit = PUCK_SPEED_LIMIT * (canvas.width / 500);
    const speed = Math.hypot(puck.dx, puck.dy);
    if (speed > scaledSpeedLimit) {
        const factor = scaledSpeedLimit / speed;
        puck.dx *= factor;
        puck.dy *= factor;
    }
}

function checkCollision(ball, paddle) {
    const distX = ball.x - paddle.x;
    const distY = ball.y - paddle.y;
    const distance = Math.sqrt(distX * distX + distY * distY);
    return distance < ball.radius + paddle.radius;
}

function resetPositions() {
    // Reset paddle positions
    player1.x = canvas.width / 2;
    player1.y = canvas.height - canvas.height * 0.11;
    player1.prevX = player1.x;
    player1.prevY = player1.y;
    
    player2.x = canvas.width / 2;
    player2.y = canvas.height * 0.11;
    player2.prevX = player2.x;
    player2.prevY = player2.y;
    
    // Reset puck
    puck.x = canvas.width / 2;
    puck.y = canvas.height / 2;
    puck.dx = 0;
    puck.dy = 0;
}

function resetPuck() {
    puck.x = canvas.width / 2;
    puck.y = canvas.height / 2;
    
    // Create a directional bias based on who scored last
    let angle;
    if (lastScorer === 1) {
        // Player 1 scored, so puck goes toward player 2
        angle = -Math.PI/2 + (Math.random() - 0.5) * Math.PI/2;
    } else if (lastScorer === 2) {
        // Player 2 scored, so puck goes toward player 1
        angle = Math.PI/2 + (Math.random() - 0.5) * Math.PI/2;
    } else {
        // Initial start or reset - random direction
        angle = Math.random() * Math.PI * 2;
    }
    
    // Scale initial speed based on canvas size
    const baseSpeed = 4 + Math.random() * 2;
    const scaledSpeed = baseSpeed * (canvas.width / 500);
    
    puck.dx = Math.cos(angle) * scaledSpeed;
    puck.dy = Math.sin(angle) * scaledSpeed;
    goalFlashTimer = GOAL_FLASH_DURATION;
}

function drawTable() {
    // Draw main background
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw playing surface
    ctx.fillStyle = "#222";
    ctx.fillRect(walls.thickness, walls.thickness, 
               canvas.width - walls.thickness * 2, 
               canvas.height - walls.thickness * 2);
    
    // Draw walls
    ctx.fillStyle = walls.color;
    
    // Left wall
    ctx.fillRect(0, 0, walls.thickness, canvas.height);
    
    // Right wall
    ctx.fillRect(canvas.width - walls.thickness, 0, walls.thickness, canvas.height);
    
    // Top wall (with goal cutout)
    ctx.fillRect(0, 0, GOAL_X, walls.thickness);
    ctx.fillRect(GOAL_X + GOAL_WIDTH, 0, canvas.width - GOAL_X - GOAL_WIDTH, walls.thickness);
    
    // Bottom wall (with goal cutout)
    ctx.fillRect(0, canvas.height - walls.thickness, GOAL_X, walls.thickness);
    ctx.fillRect(GOAL_X + GOAL_WIDTH, canvas.height - walls.thickness, 
               canvas.width - GOAL_X - GOAL_WIDTH, walls.thickness);
               
    // Draw center line and circle
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = canvas.width * 0.004;
    
    // Center line
    ctx.beginPath();
    ctx.moveTo(walls.thickness, canvas.height / 2);
    ctx.lineTo(canvas.width - walls.thickness, canvas.height / 2);
    ctx.stroke();
    
    // Center circle
    const circleRadius = canvas.width * 0.12;
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, circleRadius, 0, Math.PI * 2);
    ctx.stroke();
    
    // MODIFIED: Extend parallel lines to the full table width
    const lineOffset = circleRadius * 1.3; // Distance of lines from center
    
    if (logoLoaded) {
        // Calculate logo size to fit within the circle (80% of circle radius)
        const logoSize = circleRadius * 1.6;
        
        // Draw the logo centered in the circle
        ctx.save();
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, circleRadius * 0.8, 0, Math.PI * 2);
        ctx.clip();
        ctx.globalAlpha = 0.7;
        ctx.drawImage(
            logo, 
            canvas.width / 2 - logoSize / 2, 
            canvas.height / 2 - logoSize / 2, 
            logoSize, 
            logoSize
        );
        ctx.restore();
    }

    // Top parallel line - now extends to walls
    ctx.beginPath();
    ctx.moveTo(walls.thickness, canvas.height / 2 - lineOffset);
    ctx.lineTo(canvas.width - walls.thickness, canvas.height / 2 - lineOffset);
    ctx.stroke();
    
    // Bottom parallel line - now extends to walls
    ctx.beginPath();
    ctx.moveTo(walls.thickness, canvas.height / 2 + lineOffset);
    ctx.lineTo(canvas.width - walls.thickness, canvas.height / 2 + lineOffset);
    ctx.stroke();
    
    // Corner circles now closer to the middle
    const cornerRadius = canvas.width * 0.08;
    const cornerOffset = walls.thickness + canvas.width * 0.2;
    
    // Top-left corner circle
    ctx.beginPath();
    ctx.arc(cornerOffset, cornerOffset, cornerRadius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Top-right corner circle
    ctx.beginPath();
    ctx.arc(canvas.width - cornerOffset, cornerOffset, cornerRadius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Bottom-left corner circle
    ctx.beginPath();
    ctx.arc(cornerOffset, canvas.height - cornerOffset, cornerRadius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Bottom-right corner circle
    ctx.beginPath();
    ctx.arc(canvas.width - cornerOffset, canvas.height - cornerOffset, cornerRadius, 0, Math.PI * 2);
    ctx.stroke();
    
}

function drawGoals() {
    // Draw top goal (Player 2's goal)
    if (goalFlashTimer > 0 && lastScorer === 1) {
        // Flash green when Player 1 scores
        ctx.fillStyle = `rgba(0, 255, 0, ${goalFlashTimer/GOAL_FLASH_DURATION})`;
    } else {
        ctx.fillStyle = "rgba(255, 0, 0, 0.2)";
    }
    ctx.fillRect(GOAL_X, 0, GOAL_WIDTH, GOAL_HEIGHT);
    
    // Draw bottom goal (Player 1's goal)
    if (goalFlashTimer > 0 && lastScorer === 2) {
        // Flash green when Player 2 scores
        ctx.fillStyle = `rgba(0, 255, 0, ${goalFlashTimer/GOAL_FLASH_DURATION})`;
    } else {
        ctx.fillStyle = "rgba(0, 0, 255, 0.2)";
    }
    ctx.fillRect(GOAL_X, canvas.height - GOAL_HEIGHT, GOAL_WIDTH, GOAL_HEIGHT);
}

function drawPuck() {
    // Draw puck shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.beginPath();
    ctx.arc(puck.x + 3, puck.y + 3, puck.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw puck
    ctx.fillStyle = puck.color;
    ctx.beginPath();
    ctx.arc(puck.x, puck.y, puck.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw puck detail rings
    ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
    ctx.lineWidth = puck.radius * 0.1;
    ctx.beginPath();
    ctx.arc(puck.x, puck.y, puck.radius * 0.7, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
    ctx.lineWidth = puck.radius * 0.05;
    ctx.beginPath();
    ctx.arc(puck.x, puck.y, puck.radius * 0.3, 0, Math.PI * 2);
    ctx.stroke();
}

function drawPaddle(player) {
    // Draw paddle shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.beginPath();
    ctx.arc(player.x + 3, player.y + 3, player.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw paddle base
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw paddle details
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius * 0.7, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw handle grip
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius * 0.3, 0, Math.PI * 2);
    ctx.fill();
}

function drawScores() {
    // Calculate font size based on canvas width
    const fontSize = canvas.width * 0.056;
    
    // Draw scores with shadow effect
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.textAlign = "center";
    
    // Draw shadows
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillText(`${player1Score}`, canvas.width / 4 + 2, canvas.height / 2 + fontSize/3);
    ctx.fillText(`${player2Score}`, (canvas.width / 4) * 3 + 2, canvas.height / 2 + fontSize/3);
    
    // Draw actual scores
    ctx.fillStyle = player1.color;
    ctx.fillText(`${player1Score}`, canvas.width / 4, canvas.height / 2 + fontSize/3);
    
    ctx.fillStyle = player2.color;
    ctx.fillText(`${player2Score}`, (canvas.width / 4) * 3, canvas.height / 2 + fontSize/3);
}

function drawStartScreen() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const titleSize = canvas.width * 0.06;
    const textSize = canvas.width * 0.04;
    const smallTextSize = canvas.width * 0.032;
    
    ctx.fillStyle = "#fff";
    ctx.font = `${titleSize}px Arial`;
    ctx.textAlign = "center";
    ctx.fillText("AIR HOCKEY", canvas.width/2, canvas.height/2 - titleSize*1.5);
    
    ctx.font = `${textSize}px Arial`;
    ctx.fillText("Press SPACE to start", canvas.width/2, canvas.height/2);
    
    ctx.font = `${smallTextSize}px Arial`;
    ctx.fillText("Player 1: WASD keys", canvas.width/2, canvas.height/2 + textSize*1.5);
    ctx.fillText("Player 2: Arrow keys", canvas.width/2, canvas.height/2 + textSize*2.5);
    ctx.fillText("Press P to pause", canvas.width/2, canvas.height/2 + textSize*3.5);
}

function drawPauseScreen() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const titleSize = canvas.width * 0.06;
    const textSize = canvas.width * 0.04;
    
    ctx.fillStyle = "#fff";
    ctx.font = `${titleSize}px Arial`;
    ctx.textAlign = "center";
    ctx.fillText("PAUSED", canvas.width/2, canvas.height/2);
    
    ctx.font = `${textSize}px Arial`;
    ctx.fillText("Press P to resume", canvas.width/2, canvas.height/2 + titleSize);
}

function draw() {
    drawTable();
    drawGoals();
    
    // Draw game elements
    drawPuck();
    drawPaddle(player1);
    drawPaddle(player2);
    drawScores();
    
    // Draw overlays if needed
    if (!gameStarted) {
        drawStartScreen();
    } else if (isPaused) {
        drawPauseScreen();
    }
}

function gameLoop(timestamp) {
    const deltaTime = Math.min(timestamp - lastUpdateTime, 50); // Cap delta time to prevent jumps
    lastUpdateTime = timestamp;
    
    if (gameStarted && !isPaused) {
        if (goalFlashTimer > 0) {
            goalFlashTimer--;
        }
        
        updatePlayer(player1, deltaTime);
        updatePlayer(player2, deltaTime);
        updatePuck(deltaTime);
    }
    
    draw();
    requestAnimationFrame(gameLoop);
}

// Initialize game
function initGame() {
    // Resize canvas to fit window
    resizeCanvas();
    
    // Reset game state
    player1Score = 0;
    player2Score = 0;
    gameStarted = false;
    isPaused = false;
    
    // Start game loop
    requestAnimationFrame(gameLoop);
}

// Start game
initGame();