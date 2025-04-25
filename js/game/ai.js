// ai.js - Handles AI opponent behavior with improved movement

// AI difficulty configurations with smoothed parameters
const AI_CONFIGURATIONS = {
    easy: {
        reactionTime: 180,      // ms to react to puck movement
        maxSpeed: 0.3,          // percentage of player speed
        accuracy: 0.5,          // accuracy of prediction (0-1)
        aggressiveness: 0.3,    // how likely to move toward puck vs defend
        smoothing: 0.1,         // lower = smoother movement
        positionNoise: 0.15,    // random position variation (0-1)
        defensivePosition: 0.15 // how far down from top (percentage of canvas)
    },
    medium: {
        reactionTime: 120,
        maxSpeed: 0.6,
        accuracy: 0.7,
        aggressiveness: 0.5,
        smoothing: 0.15,
        positionNoise: 0.08,
        defensivePosition: 0.12
    },
    hard: {
        reactionTime: 60,
        maxSpeed: 0.9, 
        accuracy: 0.85,
        aggressiveness: 0.7,
        smoothing: 0.25,
        positionNoise: 0.04,
        defensivePosition: 0.09
    }
};

let lastPuckPos = { x: 0, y: 0 };
let puckDirection = { x: 0, y: 0 };
let lastUpdateTime = 0;
let aiDecisionTimer = 0;
let aiTarget = { x: 0, y: 0 };
let currentDifficulty = 'medium';
let aiVelocity = { x: 0, y: 0 }; // Track AI velocity for smoothing

// Initialize AI with specified difficulty
function initAI(difficulty) {
    currentDifficulty = difficulty;
    lastUpdateTime = performance.now();
    aiDecisionTimer = 0;
    aiVelocity = { x: 0, y: 0 };
    console.log(`AI initialized with ${difficulty} difficulty`);
}

// Update AI paddle position based on puck movement
function updateAI(puck, aiPaddle, canvas, walls, deltaTime) {
    const ai = AI_CONFIGURATIONS[currentDifficulty];
    
    // Save previous position for physics calculations
    aiPaddle.prevX = aiPaddle.x;
    aiPaddle.prevY = aiPaddle.y;
    
    // Calculate puck direction with weighted averaging
    const newPuckDirection = {
        x: puck.x - lastPuckPos.x,
        y: puck.y - lastPuckPos.y
    };
    
    // Smooth puck direction tracking (prevents erratic response to bounces)
    puckDirection = {
        x: puckDirection.x * 0.7 + newPuckDirection.x * 0.3,
        y: puckDirection.y * 0.7 + newPuckDirection.y * 0.3
    };
    
    lastPuckPos = { x: puck.x, y: puck.y };
    
    // Only update decision after reaction time has passed
    aiDecisionTimer += deltaTime;
    if (aiDecisionTimer >= ai.reactionTime) {
        aiDecisionTimer = 0;
        decideAIMove(puck, aiPaddle, canvas, walls);
    }
    
    // Move toward target position with smoothing
    moveTowardTarget(aiPaddle, deltaTime);
}

// Predict puck trajectory with wall bounces
function predictPuckPosition(puck, walls, canvas, timeAhead) {
    // Simple trajectory prediction
    let predictedX = puck.x + (puck.dx * timeAhead);
    let predictedY = puck.y + (puck.dy * timeAhead);
    
    // Check for wall bounces (simplified)
    const leftWall = walls.thickness + puck.radius;
    const rightWall = canvas.width - walls.thickness - puck.radius;
    
    // Horizontal bounce check (simplified)
    if (predictedX < leftWall || predictedX > rightWall) {
        // Flip x direction for bounce
        predictedX = puck.x + (-puck.dx * timeAhead);
    }
    
    return { x: predictedX, y: predictedY };
}

// Decide where AI should move based on puck trajectory
function decideAIMove(puck, aiPaddle, canvas, walls) {
    const ai = AI_CONFIGURATIONS[currentDifficulty];
    const halfHeight = canvas.height / 2;
    
    // Define AI area boundaries
    const minY = walls.thickness + aiPaddle.radius;
    const maxY = halfHeight - aiPaddle.radius;
    const homeY = canvas.height * ai.defensivePosition;
    
    // Add slight randomness to home position for unpredictability
    const randomOffset = (Math.random() * 2 - 1) * canvas.width * ai.positionNoise;
    const homeX = canvas.width / 2 + randomOffset;
    
    // If puck is moving toward AI's side or is already in AI's half
    if (puckDirection.y < 0 || puck.y < halfHeight) {
        // Calculate time for puck to reach AI's position
        const distanceToAI = Math.abs(puck.y - homeY);
        const puckSpeed = Math.max(0.1, Math.abs(puck.dy));
        
        // Time to reach AI's Y position
        let timeToReach = distanceToAI / puckSpeed;
        
        // Add controlled inaccuracy based on difficulty
        const accuracyVariation = 1 - (Math.random() * (1 - ai.accuracy));
        timeToReach *= accuracyVariation;
        
        // Predict puck position with potential wall bounces
        const prediction = predictPuckPosition(puck, walls, canvas, timeToReach);
        
        // Bounded prediction (keep within play area)
        const boundedX = Math.max(
            walls.thickness + aiPaddle.radius,
            Math.min(canvas.width - walls.thickness - aiPaddle.radius, prediction.x)
        );
        
        // Decision making based on puck position and direction
        const isPuckApproaching = puck.y < halfHeight && puckDirection.y < 0;
        const isPuckInDangerZone = puck.y < canvas.height * 0.3;
        
        // Probability of attacking vs defending based on difficulty and situation
        let attackProbability = ai.aggressiveness;
        
        // Increase aggression if puck is in danger zone
        if (isPuckInDangerZone) {
            attackProbability += 0.3;
        }
        
        if (isPuckApproaching && Math.random() < attackProbability) {
            // Attack mode - go toward puck or intercept
            aiTarget.x = boundedX;
            // Don't go too far down when attacking
            aiTarget.y = Math.max(minY, Math.min(maxY, puck.y));
        } else {
            // Defend mode - move to predicted X but stay at home Y
            aiTarget.x = boundedX;
            aiTarget.y = homeY;
        }
    } else {
        // Puck moving away - gradually return to home position
        aiTarget.x = homeX;
        aiTarget.y = homeY;
    }
}

// Move AI paddle toward target position with smoothing
function moveTowardTarget(aiPaddle, deltaTime) {
    const ai = AI_CONFIGURATIONS[currentDifficulty];
    
    // Calculate direction to target
    const dx = aiTarget.x - aiPaddle.x;
    const dy = aiTarget.y - aiPaddle.y;
    
    // Calculate distance
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // If we're very close to target, slow down to prevent oscillation
    const slowDownThreshold = aiPaddle.radius * 0.5;
    let speedMultiplier = 1.0;
    
    if (distance < slowDownThreshold) {
        speedMultiplier = distance / slowDownThreshold;
    }
    
    // Calculate target velocity with smoothing factor
    const targetVelocityX = dx * ai.smoothing * speedMultiplier;
    const targetVelocityY = dy * ai.smoothing * speedMultiplier;
    
    // Smoothly adjust current velocity toward target velocity
    aiVelocity.x = aiVelocity.x * 0.8 + targetVelocityX * 0.2;
    aiVelocity.y = aiVelocity.y * 0.8 + targetVelocityY * 0.2;
    
    // Apply velocity with difficulty adjustment
    const maxSpeed = aiPaddle.speed * ai.maxSpeed;
    const moveSpeed = maxSpeed * (deltaTime / 16);
    
    // Calculate magnitude of current velocity
    const currentSpeed = Math.sqrt(aiVelocity.x * aiVelocity.x + aiVelocity.y * aiVelocity.y);
    
    // If current speed exceeds max speed, scale it down
    if (currentSpeed > moveSpeed && currentSpeed > 0) {
        const scaleFactor = moveSpeed / currentSpeed;
        aiVelocity.x *= scaleFactor;
        aiVelocity.y *= scaleFactor;
    }
    
    // Update paddle position
    aiPaddle.x += aiVelocity.x;
    aiPaddle.y += aiVelocity.y;
    
    // Keep paddle within boundaries
    const minX = aiPaddle.radius;
    const maxX = canvas.width - aiPaddle.radius;
    const minY = aiPaddle.radius;
    const maxY = canvas.height / 2 - aiPaddle.radius;
    
    aiPaddle.x = Math.max(minX, Math.min(maxX, aiPaddle.x));
    aiPaddle.y = Math.max(minY, Math.min(maxY, aiPaddle.y));
}

// Reset AI state
function resetAI() {
    aiDecisionTimer = 0;
    lastPuckPos = { x: 0, y: 0 };
    puckDirection = { x: 0, y: 0 };
    aiVelocity = { x: 0, y: 0 };
}

export {
    initAI,
    updateAI,
    resetAI
};