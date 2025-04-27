// js/game/physics.js - Handles physics calculations and collisions

// Physics constants
const FRICTION = 0.992;
const PUCK_SPEED_LIMIT = 25;
const PADDLE_ELASTICITY = 1.2;
const MIN_COLLISION_SPEED = 4;
const REBOUND_DAMPING = 0.85;
const ANGLE_RANDOMIZATION = 0.05;
const PADDLE_MOMENTUM_TRANSFER = 0.7;

function updatePlayer(player, deltaTime, canvas, walls) {
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
    
    // Player-specific y-boundaries (divided table)
    // Check if this is player1 by color (red) instead of direct reference
    if (player.color === "#f00") {
        player.y = Math.max(canvas.height / 2 + player.radius, 
                          Math.min(canvas.height - effectiveWallThickness - player.radius, player.y));
    } else {
        player.y = Math.max(effectiveWallThickness + player.radius, 
                          Math.min(canvas.height / 2 - player.radius, player.y));
    }
}

function handlePaddleCollision(puck, paddle) {
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

function checkCollision(ball, paddle) {
    const distX = ball.x - paddle.x;
    const distY = ball.y - paddle.y;
    const distance = Math.sqrt(distX * distX + distY * distY);
    return distance < ball.radius + paddle.radius;
}

function updatePuck(puck, player1, player2, deltaTime, canvas, walls, goalInfo) {
    const { GOAL_X, GOAL_WIDTH, goalScored } = goalInfo;
    
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
            goalScored(1); // Player 1 scored
        } else {
            // Bounce off if not in goal
            puck.y = puck.radius;
            puck.dy = Math.abs(puck.dy) * REBOUND_DAMPING;
        }
    } else if (puck.y + puck.radius >= canvas.height) {
        // Check if puck is within goal width
        if (puck.x >= GOAL_X && puck.x <= GOAL_X + GOAL_WIDTH) {
            goalScored(2); // Player 2 scored
        } else {
            // Bounce off if not in goal
            puck.y = canvas.height - puck.radius;
            puck.dy = -Math.abs(puck.dy) * REBOUND_DAMPING;
        }
    }
    
    // Paddle collision
    if (checkCollision(puck, player1)) {
        handlePaddleCollision(puck, player1);
    } else if (checkCollision(puck, player2)) {
        handlePaddleCollision(puck, player2);
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

export {
    updatePlayer,
    updatePuck,
    checkCollision,
    handlePaddleCollision
};