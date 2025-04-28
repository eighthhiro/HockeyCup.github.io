// js/game/classicOpponents.js - Configuration for classic mode AI opponents

// Base AI configurations for classic mode opponents
const CLASSIC_OPPONENTS = {
    // Bar Game Opponents
    "Lightning Larry": {
        reactionTime: 100,      // ms to react to puck movement
        maxSpeed: 0.75,         // percentage of player speed
        accuracy: 0.7,          // accuracy of prediction (0-1)
        aggressiveness: 0.8,    // how likely to move toward puck vs defend
        smoothing: 0.18,        // lower = smoother movement
        positionNoise: 0.06,    // random position variation (0-1)
        defensivePosition: 0.12, // how far down from top (percentage of canvas)
        centerActivityThreshold: 0.7, // speed threshold for center puck activity
        offensiveReach: 0.6,    // how far AI will reach into opponent's half (0-1)
        slowPuckThreshold: 0.4, // speed threshold for "slow" approaching pucks
        goalDefenseOffset: 0.05, // distance from goal line for defensive positioning
        stoppedPuckThreshold: 0.03, // threshold to consider puck stopped
        stoppedPuckReactionTime: 600, // ms to wait before reacting to stopped puck
        hitForce: 0.9,          // multiplier for hit force (0-1)
        hitPrepDistance: 85     // how far to move back to prepare for a hit
    },
    "The Puck Slayer": {
        reactionTime: 80,
        maxSpeed: 0.82,
        accuracy: 0.75,
        aggressiveness: 0.9,
        smoothing: 0.2,
        positionNoise: 0.05,
        defensivePosition: 0.1,
        centerActivityThreshold: 0.6,
        offensiveReach: 0.7,
        slowPuckThreshold: 0.45,
        goalDefenseOffset: 0.04,
        stoppedPuckThreshold: 0.025,
        stoppedPuckReactionTime: 500,
        hitForce: 1.0,
        hitPrepDistance: 90
    },
    "Defense Dio": {
        reactionTime: 60,
        maxSpeed: 0.7,
        accuracy: 0.85,
        aggressiveness: 0.5, // Less aggressive, more defensive
        smoothing: 0.22,
        positionNoise: 0.04,
        defensivePosition: 0.08, // Stays closer to goal
        centerActivityThreshold: 0.5,
        offensiveReach: 0.4,
        slowPuckThreshold: 0.5,
        goalDefenseOffset: 0.03, // Very close to goal line
        stoppedPuckThreshold: 0.02,
        stoppedPuckReactionTime: 450,
        hitForce: 0.95,
        hitPrepDistance: 95
    },
    
    // Arcade Opponents
    "Tiny Tornado": {
        reactionTime: 120,
        maxSpeed: 0.9, // Fast but less accurate
        accuracy: 0.6,
        aggressiveness: 0.85,
        smoothing: 0.15,
        positionNoise: 0.1, // More erratic movement
        defensivePosition: 0.13,
        centerActivityThreshold: 0.75,
        offensiveReach: 0.65,
        slowPuckThreshold: 0.4,
        goalDefenseOffset: 0.07,
        stoppedPuckThreshold: 0.04,
        stoppedPuckReactionTime: 650,
        hitForce: 0.85,
        hitPrepDistance: 75
    },
    "Zippy the Striker": {
        reactionTime: 90,
        maxSpeed: 0.85,
        accuracy: 0.7,
        aggressiveness: 0.95, // Very aggressive
        smoothing: 0.18,
        positionNoise: 0.07,
        defensivePosition: 0.14, // Plays further from goal
        centerActivityThreshold: 0.65,
        offensiveReach: 0.75, // Reaches far into opponent's field
        slowPuckThreshold: 0.42,
        goalDefenseOffset: 0.06,
        stoppedPuckThreshold: 0.035,
        stoppedPuckReactionTime: 550,
        hitForce: 1.0,
        hitPrepDistance: 85
    },
    "Prince Pucks-a-Lot": {
        reactionTime: 70,
        maxSpeed: 0.8,
        accuracy: 0.8,
        aggressiveness: 0.7,
        smoothing: 0.19,
        positionNoise: 0.05,
        defensivePosition: 0.11,
        centerActivityThreshold: 0.6,
        offensiveReach: 0.6,
        slowPuckThreshold: 0.45,
        goalDefenseOffset: 0.05,
        stoppedPuckThreshold: 0.03,
        stoppedPuckReactionTime: 500,
        hitForce: 0.9,
        hitPrepDistance: 90
    },
    
    // Tournament Opponents
    "Colin Cummings": {
        reactionTime: 60,
        maxSpeed: 0.8,
        accuracy: 0.85,
        aggressiveness: 0.7,
        smoothing: 0.22,
        positionNoise: 0.04,
        defensivePosition: 0.1,
        centerActivityThreshold: 0.55,
        offensiveReach: 0.6,
        slowPuckThreshold: 0.45,
        goalDefenseOffset: 0.045,
        stoppedPuckThreshold: 0.025,
        stoppedPuckReactionTime: 450,
        hitForce: 0.95,
        hitPrepDistance: 95
    },
    "Jacob Weissman": {
        reactionTime: 50,
        maxSpeed: 0.85,
        accuracy: 0.9,
        aggressiveness: 0.75,
        smoothing: 0.25,
        positionNoise: 0.03,
        defensivePosition: 0.09,
        centerActivityThreshold: 0.5,
        offensiveReach: 0.65,
        slowPuckThreshold: 0.5,
        goalDefenseOffset: 0.04,
        stoppedPuckThreshold: 0.02,
        stoppedPuckReactionTime: 400,
        hitForce: 1.0,
        hitPrepDistance: 100
    },
    "Danny Hynes": {
        reactionTime: 40,
        maxSpeed: 0.9,
        accuracy: 0.95,
        aggressiveness: 0.8,
        smoothing: 0.28,
        positionNoise: 0.02,
        defensivePosition: 0.08,
        centerActivityThreshold: 0.45,
        offensiveReach: 0.7,
        slowPuckThreshold: 0.55,
        goalDefenseOffset: 0.035,
        stoppedPuckThreshold: 0.015,
        stoppedPuckReactionTime: 350,
        hitForce: 1.0,
        hitPrepDistance: 110
    },
    
    // Space Opponents
    "Lunar": {
        reactionTime: 100,
        maxSpeed: 0.7,
        accuracy: 0.75,
        aggressiveness: 0.65,
        smoothing: 0.12, // Extra smooth due to low gravity
        positionNoise: 0.06,
        defensivePosition: 0.12,
        centerActivityThreshold: 0.65,
        offensiveReach: 0.55,
        slowPuckThreshold: 0.4,
        goalDefenseOffset: 0.05,
        stoppedPuckThreshold: 0.035,
        stoppedPuckReactionTime: 550,
        hitForce: 0.85,
        hitPrepDistance: 80
    },
    "Mars": {
        reactionTime: 80,
        maxSpeed: 0.75,
        accuracy: 0.8,
        aggressiveness: 0.7,
        smoothing: 0.15,
        positionNoise: 0.05,
        defensivePosition: 0.1,
        centerActivityThreshold: 0.6,
        offensiveReach: 0.6,
        slowPuckThreshold: 0.45,
        goalDefenseOffset: 0.045,
        stoppedPuckThreshold: 0.03,
        stoppedPuckReactionTime: 500,
        hitForce: 0.9,
        hitPrepDistance: 90
    },
    "Zero-G": {
        reactionTime: 60,
        maxSpeed: 0.8,
        accuracy: 0.85,
        aggressiveness: 0.75,
        smoothing: 0.1, // Extremely smooth due to zero gravity
        positionNoise: 0.04,
        defensivePosition: 0.09,
        centerActivityThreshold: 0.55,
        offensiveReach: 0.65,
        slowPuckThreshold: 0.5,
        goalDefenseOffset: 0.04,
        stoppedPuckThreshold: 0.025,
        stoppedPuckReactionTime: 450,
        hitForce: 0.95,
        hitPrepDistance: 95
    }
};

// Get AI configuration by opponent name
function getOpponentConfig(opponentName) {
    if (CLASSIC_OPPONENTS[opponentName]) {
        return CLASSIC_OPPONENTS[opponentName];
    }
    
    // Default to medium difficulty if opponent not found
    console.warn(`Opponent "${opponentName}" not found. Using default medium difficulty.`);
    return CLASSIC_OPPONENTS["Prince Pucks-a-Lot"]; // Using one of the medium difficulty opponents as default
}

export {
    CLASSIC_OPPONENTS,
    getOpponentConfig
};