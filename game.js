const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Game constants
const FRICTION = 0.985;
const PUCK_SPEED_LIMIT = 20;
const PADDLE_ELASTICITY = 1.1;
const MIN_COLLISION_SPEED = 3;
const GOAL_WIDTH = canvas.width / 2;
const GOAL_X = (canvas.width - GOAL_WIDTH) / 2;
const GOAL_HEIGHT = 20;
const GOAL_FLASH_DURATION = 30; // frames

// Game objects
const puck = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 15,
    dx: 0,
    dy: 0,
    mass: 1
};

const player1 = {
    x: canvas.width / 3,
    y: canvas.height - 50,
    radius: 25,
    speed: 8,
    mass: 3,
    prevX: canvas.width / 3,
    prevY: canvas.height - 50,
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
    x: (canvas.width / 3) * 2,
    y: 50,
    radius: 25,
    speed: 8,
    mass: 3,
    prevX: (canvas.width / 3) * 2,
    prevY: 50,
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

let player1Score = 0;
let player2Score = 0;
let lastUpdateTime = performance.now();
let goalFlashTimer = 0;
let lastScorer = null; // 1 for player1, 2 for player2

// Keyboard event listeners
window.addEventListener("keydown", (e) => {
    handleKeyPress(e.key, true);
});

window.addEventListener("keyup", (e) => {
    handleKeyPress(e.key, false);
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
    
    // Apply movement
    player.x += dx * player.speed * deltaTime / 16;
    player.y += dy * player.speed * deltaTime / 16;
    
    // Boundary checks
    player.x = Math.max(player.radius, Math.min(canvas.width - player.radius, player.x));
    
    // Player-specific y-boundaries
    if (player === player1) {
        player.y = Math.max(canvas.height / 2, 
                          Math.min(canvas.height - player.radius, player.y));
    } else {
        player.y = Math.max(player.radius, 
                          Math.min(canvas.height / 2, player.y));
    }
}

function handleCollision(paddle) {
    // Calculate normal vector
    const dx = puck.x - paddle.x;
    const dy = puck.y - paddle.y;
    const distance = Math.hypot(dx, dy);
    const nx = dx / distance;
    const ny = dy / distance;
    
    // Calculate paddle velocity
    const paddleVx = (paddle.x - paddle.prevX) * 0.5;
    const paddleVy = (paddle.y - paddle.prevY) * 0.5;
    
    // Calculate relative velocity
    const relativeVx = puck.dx - paddleVx;
    const relativeVy = puck.dy - paddleVy;
    
    // Calculate impulse (dot product of relative velocity and normal)
    const dotProduct = relativeVx * nx + relativeVy * ny;
    
    // Only collide if objects are moving toward each other
    if (dotProduct > 0) return;
    
    // Calculate impulse scalar (conservation of momentum)
    const impulse = -(1 + PADDLE_ELASTICITY) * dotProduct / (1/puck.mass + 1/paddle.mass);
    
    // Apply impulse to puck (paddle is considered immovable due to mass)
    puck.dx += (impulse * nx) / puck.mass;
    puck.dy += (impulse * ny) / puck.mass;
    
    // Add paddle velocity effect (pushes the puck)
    puck.dx += paddleVx * 0.4;
    puck.dy += paddleVy * 0.4;
    
    // Position correction to prevent sticking
    const overlap = (puck.radius + paddle.radius) - distance;
    if (overlap > 0) {
        puck.x += nx * overlap * 1.2;
        puck.y += ny * overlap * 1.2;
    }
    
    // Ensure minimum speed after collision
    const speed = Math.hypot(puck.dx, puck.dy);
    if (speed < MIN_COLLISION_SPEED) {
        const boost = MIN_COLLISION_SPEED / speed;
        puck.dx *= boost;
        puck.dy *= boost;
    }
}

function updatePuck(deltaTime) {
    // Apply friction (scaled by frame time)
    const frameFriction = Math.pow(FRICTION, deltaTime / 16);
    puck.dx *= frameFriction;
    puck.dy *= frameFriction;
    
    // Stop very slow movement
    if (Math.abs(puck.dx) < 0.05) puck.dx = 0;
    if (Math.abs(puck.dy) < 0.05) puck.dy = 0;
    
    // Move puck
    puck.x += puck.dx * deltaTime / 16;
    puck.y += puck.dy * deltaTime / 16;
    
    // Wall collision (left/right)
    if (puck.x - puck.radius <= 0) {
        puck.x = puck.radius;
        puck.dx = Math.abs(puck.dx) * 0.95;
    } else if (puck.x + puck.radius >= canvas.width) {
        puck.x = canvas.width - puck.radius;
        puck.dx = -Math.abs(puck.dx) * 0.95;
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
            puck.dy = Math.abs(puck.dy) * 0.95;
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
            puck.dy = -Math.abs(puck.dy) * 0.95;
        }
    }
    
    // Paddle collision
    if (checkCollision(puck, player1)) {
        handleCollision(player1);
    } else if (checkCollision(puck, player2)) {
        handleCollision(player2);
    }
    
    // Speed limit
    const speed = Math.hypot(puck.dx, puck.dy);
    if (speed > PUCK_SPEED_LIMIT) {
        puck.dx = (puck.dx / speed) * PUCK_SPEED_LIMIT;
        puck.dy = (puck.dy / speed) * PUCK_SPEED_LIMIT;
    }
}

function checkCollision(ball, paddle) {
    const distX = ball.x - paddle.x;
    const distY = ball.y - paddle.y;
    const distance = Math.sqrt(distX * distX + distY * distY);
    return distance < ball.radius + paddle.radius;
}

function resetPuck() {
    puck.x = canvas.width / 2;
    puck.y = canvas.height / 2;
    const angle = Math.random() * Math.PI * 2;
    const speed = 3 + Math.random() * 2;
    puck.dx = Math.cos(angle) * speed;
    puck.dy = Math.sin(angle) * speed;
    goalFlashTimer = GOAL_FLASH_DURATION;
}

function drawGoals() {
    // Draw top goal (Player 2's goal)
    if (goalFlashTimer > 0 && lastScorer === 1) {
        // Flash green when Player 1 scores
        ctx.fillStyle = `rgba(0, 255, 0, ${goalFlashTimer/GOAL_FLASH_DURATION})`;
    } else {
        ctx.fillStyle = "rgba(0, 255, 0, 0.2)";
    }
    ctx.fillRect(GOAL_X, 0, GOAL_WIDTH, GOAL_HEIGHT);
    
    // Draw bottom goal (Player 1's goal)
    if (goalFlashTimer > 0 && lastScorer === 2) {
        // Flash green when Player 2 scores
        ctx.fillStyle = `rgba(0, 255, 0, ${goalFlashTimer/GOAL_FLASH_DURATION})`;
    } else {
        ctx.fillStyle = "rgba(0, 255, 0, 0.2)";
    }
    ctx.fillRect(GOAL_X, canvas.height - GOAL_HEIGHT, GOAL_WIDTH, GOAL_HEIGHT);
}

function draw() {
    // Clear canvas
    ctx.fillStyle = "#333";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw goals (semi-transparent green)
    drawGoals();
    
    // Draw center line and circles
    ctx.strokeStyle = "#fff";
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
    
    // Draw center circle
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 50, 0, Math.PI * 2);
    ctx.stroke();
    
    // Draw puck
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(puck.x, puck.y, puck.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw paddles with outline
    [player1, player2].forEach(player => {
        ctx.fillStyle = player.color;
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2;
        ctx.stroke();
    });
    
    // Draw scores
    ctx.fillStyle = "#fff";
    ctx.font = "24px Arial";
    ctx.fillText(`Player 1: ${player1Score}`, 20, 30);
    ctx.fillText(`Player 2: ${player2Score}`, canvas.width - 150, 30);
    
    // Draw speed meter
    const speed = Math.hypot(puck.dx, puck.dy).toFixed(1);
    ctx.fillText(`Speed: ${speed}`, canvas.width / 2 - 50, 30);
}

function gameLoop(timestamp) {
    const deltaTime = timestamp - lastUpdateTime;
    lastUpdateTime = timestamp;
    
    if (goalFlashTimer > 0) {
        goalFlashTimer--;
    }
    
    updatePlayer(player1, deltaTime);
    updatePlayer(player2, deltaTime);
    updatePuck(deltaTime);
    draw();
    
    requestAnimationFrame(gameLoop);
}

// Start game
resetPuck();
requestAnimationFrame(gameLoop);