// js/game/ai.js - Balanced AI opponent behavior with improved movement and center-puck handling

// AI difficulty configurations with balanced parameters
const AI_CONFIGURATIONS = {
    easy: {
        reactionTime: 180,      // ms to react to puck movement
        maxSpeed: 0.35,         // percentage of player speed
        accuracy: 0.5,          // accuracy of prediction (0-1)
        aggressiveness: 0.3,    // how likely to move toward puck vs defend
        smoothing: 0.12,        // lower = smoother movement
        positionNoise: 0.1,     // random position variation (0-1)
        defensivePosition: 0.15, // how far down from top (percentage of canvas)
        centerActivityThreshold: 1.0, // speed threshold for center puck activity
        offensiveReach: 0.3,    // how far AI will reach into opponent's half (0-1)
        slowPuckThreshold: 0.3, // speed threshold for "slow" approaching pucks
        goalDefenseOffset: 0.08, // distance from goal line for defensive positioning
        stoppedPuckThreshold: 0.05, // threshold to consider puck stopped
        stoppedPuckReactionTime: 1000, // ms to wait before reacting to stopped puck
        hitForce: 0.7,          // multiplier for hit force (0-1)
        hitPrepDistance: 60     // how far to move back to prepare for a hit
    },
    medium: {
        reactionTime: 120,
        maxSpeed: 0.6,
        accuracy: 0.7,
        aggressiveness: 0.5,
        smoothing: 0.15,
        positionNoise: 0.07,
        defensivePosition: 0.12,
        centerActivityThreshold: 0.8,
        offensiveReach: 0.5,
        slowPuckThreshold: 0.4,
        goalDefenseOffset: 0.06,
        stoppedPuckThreshold: 0.03,
        stoppedPuckReactionTime: 700,
        hitForce: 0.85,
        hitPrepDistance: 80
    },
    hard: {
        reactionTime: 70,
        maxSpeed: 0.85, 
        accuracy: 0.9,
        aggressiveness: 0.7,
        smoothing: 0.2,
        positionNoise: 0.04,
        defensivePosition: 0.1,
        centerActivityThreshold: 0.5,
        offensiveReach: 0.7,
        slowPuckThreshold: 0.5,
        goalDefenseOffset: 0.04,
        stoppedPuckThreshold: 0.02,
        stoppedPuckReactionTime: 500,
        hitForce: 1.0,
        hitPrepDistance: 100
    }
};

let lastPuckPos = { x: 0, y: 0 };
let puckDirection = { x: 0, y: 0 };
let puckSpeed = 0;
let lastUpdateTime = 0;
let aiDecisionTimer = 0;
let aiTarget = { x: 0, y: 0 };
let currentDifficulty = 'medium';
let aiVelocity = { x: 0, y: 0 }; // Track AI velocity for smoothing
let centerIdleTime = 0; // Track how long the puck has been idle in center
let stoppedPuckTimer = 0; // Track how long the puck has been stopped
let isChargingHit = false; // Flag to indicate AI is preparing for a forceful hit
let hitTarget = null; // Target position for the puck after hit
let hitPreparationPhase = false; // Flag to indicate AI is in preparation phase
let hitExecutionPhase = false; // Flag to indicate AI is in execution phase

// Initialize AI with specified difficulty
function initAI(difficulty) {
    currentDifficulty = difficulty;
    lastUpdateTime = performance.now();
    aiDecisionTimer = 0;
    aiVelocity = { x: 0, y: 0 };
    centerIdleTime = 0;
    stoppedPuckTimer = 0;
    isChargingHit = false;
    hitTarget = null;
    hitPreparationPhase = false;
    hitExecutionPhase = false;
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
    
    // Calculate current puck speed
    const newPuckSpeed = Math.sqrt(
        newPuckDirection.x * newPuckDirection.x + 
        newPuckDirection.y * newPuckDirection.y
    );
    
    // Smooth puck direction tracking (prevents erratic response to bounces)
    puckDirection = {
        x: puckDirection.x * 0.7 + newPuckDirection.x * 0.3,
        y: puckDirection.y * 0.7 + newPuckDirection.y * 0.3
    };
    
    // Update puck speed with smoothing
    puckSpeed = puckSpeed * 0.7 + newPuckSpeed * 0.3;
    
    // Check if puck is stopped
    if (puckSpeed < ai.stoppedPuckThreshold) {
        stoppedPuckTimer += deltaTime;
    } else {
        // Reset all hit-related flags if puck starts moving
        stoppedPuckTimer = 0;
        isChargingHit = false;
        hitPreparationPhase = false;
        hitExecutionPhase = false;
        hitTarget = null;
    }
    
    lastPuckPos = { x: puck.x, y: puck.y };
    
    // Check if puck is stuck in center
    checkCenterPuck(puck, canvas, deltaTime);
    
    // Handle hitting stopped pucks with force
    if (handleStoppedPuckHit(puck, aiPaddle, canvas, walls, deltaTime)) {
        // If we're handling a stopped puck hit, skip regular AI movement
        return;
    }
    
    // Only update decision after reaction time has passed
    aiDecisionTimer += deltaTime;
    if (aiDecisionTimer >= ai.reactionTime) {
        aiDecisionTimer = 0;
        decideAIMove(puck, aiPaddle, canvas, walls);
    }
    
    // Move toward target position with smoothing
    moveTowardTarget(aiPaddle, deltaTime, canvas);
}

// Check if puck is "stuck" in center and increment counter
function checkCenterPuck(puck, canvas, deltaTime) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const centerRadius = canvas.width * 0.2; // Area considered "center"
    
    // Calculate distance from center
    const distanceFromCenter = Math.sqrt(
        Math.pow(puck.x - centerX, 2) + 
        Math.pow(puck.y - centerY, 2)
    );
    
    const ai = AI_CONFIGURATIONS[currentDifficulty];
    
    // If puck is in center area and moving slowly
    if (distanceFromCenter < centerRadius && puckSpeed < ai.centerActivityThreshold) {
        centerIdleTime += deltaTime;
    } else {
        centerIdleTime = 0;
    }
}

// Handle stopped puck with forceful hit
function handleStoppedPuckHit(puck, aiPaddle, canvas, walls, deltaTime) {
    const ai = AI_CONFIGURATIONS[currentDifficulty];
    const halfHeight = canvas.height / 2;
    
    // Define AI area boundaries
    const minY = walls.thickness + aiPaddle.radius;
    const maxY = halfHeight - aiPaddle.radius;
    const minX = aiPaddle.radius;
    const maxX = canvas.width - aiPaddle.radius;
    
    // Ignore stopped pucks that are too far into opponent's territory
    if (puck.y > halfHeight * 1.3 && !isChargingHit) {
        return false;
    }
    
    // Check if we should react to stopped puck
    if (stoppedPuckTimer > ai.stoppedPuckReactionTime && !isChargingHit) {
        // Start the hit sequence
        isChargingHit = true;
        hitPreparationPhase = true;
        hitExecutionPhase = false;
        
        // Calculate where to hit the puck (opponent's goal)
        const targetX = canvas.width / 2;
        const targetY = canvas.height; // Bottom of canvas (opponent's goal)
        
        // Calculate vector from puck to target
        const toTarget = {
            x: targetX - puck.x,
            y: targetY - puck.y
        };
        
        // Normalize the vector
        const distance = Math.sqrt(toTarget.x * toTarget.x + toTarget.y * toTarget.y);
        const normalized = {
            x: toTarget.x / distance,
            y: toTarget.y / distance
        };
        
        // Calculate preparation position (move back from puck to get momentum)
        const prepDistance = ai.hitPrepDistance; // How far to move back to get momentum
        
        // Position to move back to (opposite direction from target)
        const prepPosition = {
            x: puck.x - normalized.x * prepDistance,
            y: puck.y - normalized.y * prepDistance
        };
        
        // Keep within boundaries
        prepPosition.x = Math.max(minX, Math.min(maxX, prepPosition.x));
        prepPosition.y = Math.max(minY, Math.min(maxY, prepPosition.y));
        
        // Set as target for preparation phase
        aiTarget = prepPosition;
        
        // Calculate exact hit position (slightly behind puck in line with target)
        const hitDistance = aiPaddle.radius + puck.radius + 2; // Small extra distance for better hit
        hitTarget = {
            x: puck.x - normalized.x * hitDistance,
            y: puck.y - normalized.y * hitDistance
        };
        
        // Keep hit target within boundaries
        hitTarget.x = Math.max(minX, Math.min(maxX, hitTarget.x));
        hitTarget.y = Math.max(minY, Math.min(maxY, hitTarget.y));
        
        return true;
    }
    
    // If we're in preparation phase
    if (hitPreparationPhase) {
        // Check if we've reached the preparation position
        const dx = aiTarget.x - aiPaddle.x;
        const dy = aiTarget.y - aiPaddle.y;
        const distanceToPrep = Math.sqrt(dx * dx + dy * dy);
        
        if (distanceToPrep < aiPaddle.radius * 0.5) {
            // Switch to execution phase
            hitPreparationPhase = false;
            hitExecutionPhase = true;
            
            // Set high velocity toward the puck
            const dx = hitTarget.x - aiPaddle.x;
            const dy = hitTarget.y - aiPaddle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Create normalized direction vector
            const direction = {
                x: dx / distance,
                y: dy / distance
            };
            
            // Set high initial velocity (based on difficulty)
            const maxForce = aiPaddle.speed * 2.5 * ai.hitForce;
            aiVelocity = {
                x: direction.x * maxForce,
                y: direction.y * maxForce
            };
            
            return true;
        }
        
        // Continue moving to prep position with smoothing
        moveTowardTarget(aiPaddle, deltaTime, canvas);
        return true;
    }
    
    // If we're in execution phase
    if (hitExecutionPhase) {
        // Update paddle position with high velocity
        aiPaddle.x += aiVelocity.x * (deltaTime / 16);
        aiPaddle.y += aiVelocity.y * (deltaTime / 16);
        
        // Check if we've hit the puck
        const dx = puck.x - aiPaddle.x;
        const dy = puck.y - aiPaddle.y;
        const distanceToPuck = Math.sqrt(dx * dx + dy * dy);
        
        if (distanceToPuck <= aiPaddle.radius + puck.radius + 2) {
            // We've hit the puck, reset the hit sequence
            isChargingHit = false;
            hitPreparationPhase = false;
            hitExecutionPhase = false;
            stoppedPuckTimer = 0; // Reset timer to prevent immediate hit attempts
            hitTarget = null;
            
            // Let natural physics handle the collision
            return false;
        }
        
        // Keep within boundaries
        aiPaddle.x = Math.max(minX, Math.min(maxX, aiPaddle.x));
        aiPaddle.y = Math.max(minY, Math.min(maxY, aiPaddle.y));
        
        // Safety timeout - if we've been in execution phase too long
        if (distanceToPuck > 200) {
            // Something went wrong, reset the hit sequence
            isChargingHit = false;
            hitPreparationPhase = false;
            hitExecutionPhase = false;
            hitTarget = null;
        }
        
        return true;
    }
    
    return false;
}

// Improved puck trajectory prediction
function predictPuckPosition(puck, walls, canvas, timeAhead) {
    // Simple trajectory prediction
    let predictedX = puck.x + (puck.dx * timeAhead);
    let predictedY = puck.y + (puck.dy * timeAhead);
    
    // Check for wall bounces
    const leftWall = walls.thickness + puck.radius;
    const rightWall = canvas.width - walls.thickness - puck.radius;
    
    // Horizontal bounce check
    if (predictedX < leftWall) {
        predictedX = leftWall + (leftWall - predictedX);
    } else if (predictedX > rightWall) {
        predictedX = rightWall - (predictedX - rightWall);
    }
    
    return { x: predictedX, y: predictedY };
}

// Calculate a strategic position to hit puck toward opponent's side
function calculateOffensivePosition(puck, aiPaddle, canvas) {
    const halfHeight = canvas.height / 2;
    const opponentCenter = {
        x: canvas.width / 2,
        y: canvas.height - halfHeight / 2 // Lower half center
    };
    
    // Vector from puck to opponent's center
    const toOpponent = {
        x: opponentCenter.x - puck.x,
        y: opponentCenter.y - puck.y
    };
    
    // Normalize the vector
    const length = Math.sqrt(toOpponent.x * toOpponent.x + toOpponent.y * toOpponent.y);
    const normalized = {
        x: toOpponent.x / length,
        y: toOpponent.y / length
    };
    
    // Position slightly behind the puck to hit it toward opponent
    const distance = aiPaddle.radius + puck.radius;
    return {
        x: puck.x - normalized.x * distance,
        y: puck.y - normalized.y * distance
    };
}

// Calculate position between puck and goal for defensive positioning
function calculateDefensivePosition(puck, canvas, goalOffset) {
    // Define AI's goal line
    const goalLine = canvas.height * goalOffset;
    const goalCenter = canvas.width / 2;
    
    // Calculate vector from puck to goal center
    const toPuckVector = {
        x: puck.x - goalCenter,
        y: puck.y - goalLine
    };
    
    // Calculate distance from puck to goal
    const puckToGoalDistance = Math.sqrt(
        toPuckVector.x * toPuckVector.x + 
        toPuckVector.y * toPuckVector.y
    );
    
    // Normalize the vector
    const normalized = {
        x: toPuckVector.x / puckToGoalDistance,
        y: toPuckVector.y / puckToGoalDistance
    };
    
    // Position a percentage of the way from goal to puck
    // Closer to goal for slow pucks, closer to puck for fast ones
    const interceptPercentage = 0.3 + (0.4 * Math.min(1, puckSpeed));
    
    return {
        x: goalCenter + normalized.x * puckToGoalDistance * interceptPercentage,
        y: goalLine + normalized.y * puckToGoalDistance * interceptPercentage
    };
}

// Decide where AI should move based on puck trajectory and game state
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
    
    // If puck is stuck in center for too long, take action
    if (centerIdleTime > 2000) { // 2 seconds of inactivity
        const offensivePos = calculateOffensivePosition(puck, aiPaddle, canvas);
        aiTarget.x = Math.max(aiPaddle.radius, Math.min(canvas.width - aiPaddle.radius, offensivePos.x));
        aiTarget.y = Math.max(minY, Math.min(maxY, offensivePos.y));
        return;
    }
    
    // Define key zones and states
    const isInDefensiveZone = puck.y < halfHeight;
    const isNearGoal = puck.y < canvas.height * 0.25; // Close to AI's goal
    const isPuckApproaching = puckDirection.y < 0;
    const isPuckSlow = puckSpeed < ai.slowPuckThreshold;
    
    // Calculate time for puck to reach AI's position
    let timeToReach;
    
    if (Math.abs(puckDirection.y) < 0.1) {
        // If puck is barely moving vertically, use a default time
        timeToReach = 60; // Default prediction time
    } else {
        // Calculate based on current speed and distance
        const distanceToAI = Math.abs(puck.y - homeY);
        const puckSpeedY = Math.max(0.1, Math.abs(puckDirection.y));
        timeToReach = distanceToAI / puckSpeedY;
    }
    
    // Add controlled inaccuracy based on difficulty
    const accuracyVariation = 1 - (Math.random() * (1 - ai.accuracy));
    timeToReach *= accuracyVariation;
    
    // Predict puck position
    const prediction = predictPuckPosition(puck, walls, canvas, timeToReach);
    
    // Special handling for slow approaching pucks
    if (isInDefensiveZone && isPuckApproaching && isPuckSlow) {
        // Get defensive position between puck and goal
        const defensivePos = calculateDefensivePosition(puck, canvas, ai.goalDefenseOffset);
        
        // Move to intercept position
        aiTarget.x = Math.max(aiPaddle.radius, Math.min(canvas.width - aiPaddle.radius, defensivePos.x));
        aiTarget.y = Math.max(minY, Math.min(maxY, defensivePos.y));
        
        // If puck is very close to goal, move directly to block it
        if (puck.y < canvas.height * 0.15) {
            aiTarget.x = puck.x;
            aiTarget.y = Math.min(puck.y + puck.radius + aiPaddle.radius, maxY);
        }
        
        return;
    }
    
    // Defense is top priority when puck is coming toward AI's goal
    if (isInDefensiveZone && isPuckApproaching) {
        // Track predicted X position, but maintain defensive Y position
        aiTarget.x = Math.max(aiPaddle.radius, Math.min(canvas.width - aiPaddle.radius, prediction.x));
        aiTarget.y = homeY;
        
        // Emergency defense - move directly to block when puck is near goal
        if (isNearGoal) {
            // Move closer to the puck's Y position when it's threatening to score
            aiTarget.y = Math.max(minY, Math.min(maxY, homeY + (puck.y - homeY) * 0.7));
            
            // If puck is even closer to goal, move directly to it
            if (puck.y < canvas.height * 0.15) {
                aiTarget.x = puck.x;
                aiTarget.y = Math.min(puck.y + puck.radius + aiPaddle.radius, maxY);
            }
        }
    } 
    // Offensive approach when puck is in defensive zone but moving away or slow
    else if (isInDefensiveZone && (!isPuckApproaching || isPuckSlow)) {
        // Decide whether to play aggressively based on difficulty
        const playAggressive = Math.random() < ai.aggressiveness;
        
        if (playAggressive) {
            // Calculate offensive position to hit puck toward opponent's goal
            const offensivePos = calculateOffensivePosition(puck, aiPaddle, canvas);
            aiTarget.x = Math.max(aiPaddle.radius, Math.min(canvas.width - aiPaddle.radius, offensivePos.x));
            aiTarget.y = Math.max(minY, Math.min(maxY, offensivePos.y));
        } else {
            // More defensive approach - track puck but stay higher
            aiTarget.x = Math.max(aiPaddle.radius, Math.min(canvas.width - aiPaddle.radius, puck.x));
            aiTarget.y = Math.max(minY, Math.min(maxY, homeY + (halfHeight - homeY) * 0.3));
        }
    }
    // When puck is in opponent's half, prepare position
    else {
        // Return to home position with some anticipation of return
        aiTarget.x = homeX;
        aiTarget.y = homeY;
        
        // Sometimes venture a bit forward based on difficulty's offensive capability
        if (Math.random() < ai.offensiveReach * 0.3) {
            aiTarget.y = homeY + (halfHeight - homeY) * ai.offensiveReach;
        }
    }
}

// Move AI paddle toward target position with smoothing
function moveTowardTarget(aiPaddle, deltaTime, canvas) {
    const ai = AI_CONFIGURATIONS[currentDifficulty];
    
    // Calculate direction to target
    const dx = aiTarget.x - aiPaddle.x;
    const dy = aiTarget.y - aiPaddle.y;
    
    // Calculate distance
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // If we're very close to target, slow down to prevent oscillation
    const slowDownThreshold = aiPaddle.radius * 0.8;
    let speedMultiplier = 1.0;
    
    if (distance < slowDownThreshold) {
        speedMultiplier = Math.max(0.2, distance / slowDownThreshold);
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
    puckSpeed = 0;
    aiVelocity = { x: 0, y: 0 };
    centerIdleTime = 0;
    stoppedPuckTimer = 0;
    isChargingHit = false;
    hitPreparationPhase = false;
    hitExecutionPhase = false;
    hitTarget = null;
}

export {
    initAI,
    updateAI,
    resetAI
};