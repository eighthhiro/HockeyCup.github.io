// js/game/classicOpponents.js - Configuration for classic mode AI opponents with proper progression

// Base AI configurations for classic mode opponents - Ordered from easiest to hardest
const CLASSIC_OPPONENTS = {
    // Bar Game Opponents - EASY TIER
    "Lightning Larry": {
        reactionTime: 150,      // ms to react to puck movement (higher = easier)
        maxSpeed: 0.35,         // percentage of player speed
        accuracy: 0.6,          // accuracy of prediction (0-1)
        aggressiveness: 0.6,    // how likely to move toward puck vs defend
        smoothing: 0.25,        // higher = less smooth movement
        positionNoise: 0.08,    // random position variation (0-1)
        defensivePosition: 0.15, // how far down from top (percentage of canvas)
        centerActivityThreshold: 0.75, // speed threshold for center puck activity
        offensiveReach: 0.4,    // how far AI will reach into opponent's half (0-1)
        slowPuckThreshold: 0.35, // speed threshold for "slow" approaching pucks
        goalDefenseOffset: 0.07, // distance from goal line for defensive positioning
        stoppedPuckThreshold: 0.04, // threshold to consider puck stopped
        stoppedPuckReactionTime: 700, // ms to wait before reacting to stopped puck
        hitForce: 0.8,          // multiplier for hit force (0-1)
        hitPrepDistance: 70,    // how far to move back to prepare for a hit
        personality: "Quick and flashy but not very consistent. Occasionally makes brilliant fast moves but often leaves defense wide open."
    },
    "Defense Dio": {
        reactionTime: 130,
        maxSpeed: 0.5,
        accuracy: 0.65,
        aggressiveness: 0.4,    // Very defensive
        smoothing: 0.22,
        positionNoise: 0.07,
        defensivePosition: 0.09, // Stays very close to goal
        centerActivityThreshold: 0.7,
        offensiveReach: 0.35,   // Doesn't venture far from home
        slowPuckThreshold: 0.4,
        goalDefenseOffset: 0.04, // Very close to goal line
        stoppedPuckThreshold: 0.038,
        stoppedPuckReactionTime: 650,
        hitForce: 0.85,
        hitPrepDistance: 75,
        personality: "A wall of defense that rarely attacks. Frustrating to score against but predictable in strategy."
    },
    "The Puck Slayer": {
        reactionTime: 120,
        maxSpeed: 0.4,
        accuracy: 0.7,
        aggressiveness: 0.85,   // Very aggressive
        smoothing: 0.2,
        positionNoise: 0.07,
        defensivePosition: 0.16, // Plays far from goal
        centerActivityThreshold: 0.65,
        offensiveReach: 0.6,    // Very offensive
        slowPuckThreshold: 0.42,
        goalDefenseOffset: 0.08, // Doesn't care much about goal defense
        stoppedPuckThreshold: 0.035,
        stoppedPuckReactionTime: 600,
        hitForce: 0.95,
        hitPrepDistance: 85,
        personality: "All offense, minimal defense. Hits hard but often leaves the goal exposed. Dangerous but beatable."
    },
    
    // Arcade Opponents - MEDIUM TIER
    "Tiny Tornado": {
        reactionTime: 110,
        maxSpeed: 0.75,         // Faster but erratic
        accuracy: 0.65,
        aggressiveness: 0.7,
        smoothing: 0.18,
        positionNoise: 0.1,     // Very erratic movement
        defensivePosition: 0.13,
        centerActivityThreshold: 0.6,
        offensiveReach: 0.55,
        slowPuckThreshold: 0.43,
        goalDefenseOffset: 0.06,
        stoppedPuckThreshold: 0.033,
        stoppedPuckReactionTime: 550,
        hitForce: 0.85,
        hitPrepDistance: 80,
        personality: "Small but mighty! Moves unpredictably with quick changes in direction. Hard to anticipate but occasionally spins out of control."
    },
    "Zippy the Striker": {
        reactionTime: 100,
        maxSpeed: 0.78,
        accuracy: 0.72,
        aggressiveness: 0.8,    // Highly aggressive
        smoothing: 0.16,
        positionNoise: 0.06,
        defensivePosition: 0.14,
        centerActivityThreshold: 0.58,
        offensiveReach: 0.65,   // Reaches deep into opponent territory
        slowPuckThreshold: 0.44,
        goalDefenseOffset: 0.065,
        stoppedPuckThreshold: 0.03,
        stoppedPuckReactionTime: 525,
        hitForce: 0.9,
        hitPrepDistance: 85,
        personality: "Quick and striker-focused. Always looking for an opening to score rather than defend."
    },
    "Prince Pucks-a-Lot": {
        reactionTime: 90,
        maxSpeed: 0.75,
        accuracy: 0.75,
        aggressiveness: 0.65,
        smoothing: 0.15,
        positionNoise: 0.05,
        defensivePosition: 0.12,
        centerActivityThreshold: 0.55,
        offensiveReach: 0.55,
        slowPuckThreshold: 0.45,
        goalDefenseOffset: 0.055,
        stoppedPuckThreshold: 0.028,
        stoppedPuckReactionTime: 500,
        hitForce: 0.92,
        hitPrepDistance: 88,
        personality: "Well-balanced and royal in style. Methodical in approach with disciplined positioning and calculated strikes."
    },
    
    // Tournament Opponents - HARD TIER
    "Colin Cummings": {
        reactionTime: 80,
        maxSpeed: 0.8,
        accuracy: 0.8,
        aggressiveness: 0.7,
        smoothing: 0.14,
        positionNoise: 0.045,
        defensivePosition: 0.11,
        centerActivityThreshold: 0.5,
        offensiveReach: 0.6,
        slowPuckThreshold: 0.47,
        goalDefenseOffset: 0.05,
        stoppedPuckThreshold: 0.025,
        stoppedPuckReactionTime: 450,
        hitForce: 0.95,
        hitPrepDistance: 90,
        personality: "Professional-level play with excellent fundamentals. Adapts to opponent playstyle and capitalizes on mistakes."
    },
    "Jacob Weissman": {
        reactionTime: 70,
        maxSpeed: 0.82,
        accuracy: 0.85,
        aggressiveness: 0.72,
        smoothing: 0.12,
        positionNoise: 0.035,
        defensivePosition: 0.1,
        centerActivityThreshold: 0.48,
        offensiveReach: 0.62,
        slowPuckThreshold: 0.49,
        goalDefenseOffset: 0.045,
        stoppedPuckThreshold: 0.022,
        stoppedPuckReactionTime: 425,
        hitForce: 0.97,
        hitPrepDistance: 95,
        personality: "Technical master with precise positioning. Strategically balanced between offense and defense with few weaknesses."
    },
    "Danny Hynes": {
        reactionTime: 60,
        maxSpeed: 0.85,
        accuracy: 0.9,
        aggressiveness: 0.75,
        smoothing: 0.1,
        positionNoise: 0.03,
        defensivePosition: 0.09,
        centerActivityThreshold: 0.45,
        offensiveReach: 0.65,
        slowPuckThreshold: 0.5,
        goalDefenseOffset: 0.04,
        stoppedPuckThreshold: 0.02,
        stoppedPuckReactionTime: 400,
        hitForce: 1.0,
        hitPrepDistance: 100,
        personality: "Championship-level player with lightning reflexes and perfect positioning. Ruthlessly efficient with no exploitable patterns."
    },
    
    // Space Opponents - EXPERT TIER (Hardest)
    "Lunar": {
        reactionTime: 75,
        maxSpeed: 0.88,
        accuracy: 0.8,
        aggressiveness: 0.7,
        smoothing: 0.12,        // Extra smooth due to low gravity
        positionNoise: 0.04,
        defensivePosition: 0.1,
        centerActivityThreshold: 0.5,
        offensiveReach: 0.6,
        slowPuckThreshold: 0.48,
        goalDefenseOffset: 0.045,
        stoppedPuckThreshold: 0.023,
        stoppedPuckReactionTime: 425,
        hitForce: 0.95,
        hitPrepDistance: 95,
        personality: "Graceful and floating with unpredictable bounce physics. Uses lunar gravity to make impossible-seeming curved shots."
    },
    "Mars": {
        reactionTime: 50,
        maxSpeed: 0.92,
        accuracy: 0.9,
        aggressiveness: 0.78,
        smoothing: 0.09,
        positionNoise: 0.025,
        defensivePosition: 0.085,
        centerActivityThreshold: 0.42,
        offensiveReach: 0.7,
        slowPuckThreshold: 0.52,
        goalDefenseOffset: 0.038,
        stoppedPuckThreshold: 0.018,
        stoppedPuckReactionTime: 375,
        hitForce: 1.0,
        hitPrepDistance: 105,
        personality: "Aggressive and powerful with high-impact strikes. Takes advantage of Martian physics for devastating bank shots."
    },
    "Zero-G": {
        reactionTime: 40,
        maxSpeed: 0.98,
        accuracy: 0.95,
        aggressiveness: 0.8,
        smoothing: 0.07,        // Extremely smooth due to zero gravity
        positionNoise: 0.02,
        defensivePosition: 0.08,
        centerActivityThreshold: 0.4,
        offensiveReach: 0.75,
        slowPuckThreshold: 0.55,
        goalDefenseOffset: 0.035,
        stoppedPuckThreshold: 0.015,
        stoppedPuckReactionTime: 350,
        hitForce: 1.0,
        hitPrepDistance: 110,
        personality: "Master of three-dimensional thinking. Executes perfect angles in zero-gravity conditions that seem to defy physics."
    }
};

// Get AI configuration by opponent name
function getOpponentConfig(opponentName) {
    if (CLASSIC_OPPONENTS[opponentName]) {
        return CLASSIC_OPPONENTS[opponentName];
    }
    
    // Default to medium difficulty if opponent not found
    console.warn(`Opponent "${opponentName}" not found. Using default medium difficulty.`);
    return CLASSIC_OPPONENTS["Prince Pucks-a-Lot"]; // Using middle difficulty opponent as default
}

// Helper function to get opponents by difficulty tier
function getOpponentsByTier(tier) {
    const tiers = {
        "easy": ["Lightning Larry", "Defense Dio", "The Puck Slayer"],
        "medium": ["Tiny Tornado", "Zippy the Striker", "Prince Pucks-a-Lot"],
        "hard": ["Colin Cummings", "Jacob Weissman", "Danny Hynes"],
        "expert": ["Lunar", "Mars", "Zero-G"]
    };
    
    return tiers[tier.toLowerCase()] || tiers.medium;
}

export {
    CLASSIC_OPPONENTS,
    getOpponentConfig,
    getOpponentsByTier
};