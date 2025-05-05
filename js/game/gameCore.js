// js/game/gameCore.js - Contains game state, scoring and core game loop
let isExitRequested = false;
import * as ai from './ai.js';
import { getOpponentConfig } from './classicOpponents.js';
import { VictoryScreen } from './victoryScreen.js';

// Game state
let player1Score = 0;
let player2Score = 0;
let lastScorer = null; // 1 for player1, 2 for player2
let gameStarted = false;
let isPaused = false;
let goalFlashTimer = 0;
let lastUpdateTime = performance.now();
let gameMode = "1v1";
let aiConfig = null; // Will store opponent configuration
let currentOpponentName = null;
let victoryScreen = null;
let menuManager = null;

// Game objects and constants
let canvas, ctx;
let GOAL_WIDTH, GOAL_X, GOAL_HEIGHT;
let GOAL_FLASH_DURATION = 45;
let puck, player1, player2, walls;
let logo = new Image();
let logoLoaded = false;

// Import other modules
import * as physics from './physics.js';
import * as input from './input.js';
import * as renderer from './renderer.js';

// Initialize game objects and constants
function init(canvasElement, params = {}) {
    canvas = canvasElement;
    ctx = canvas.getContext("2d");
    
    logo.src = "./assets/logo.png";
    logo.onload = function() {
        logoLoaded = true;
    };
    
    if (params.mode) {
        gameMode = params.mode;
    }
    
    // Store menu manager reference if provided
    if (params.menuManager) {
        menuManager = params.menuManager;
    }

    // Set up AI configuration based on game mode
    if (params.aiConfig) {
        // Direct AI config passed (likely from classic mode)
        aiConfig = params.aiConfig;
        currentOpponentName = params.opponentName || null;
    } else if (gameMode === "1vAI") {
        // Standard 1vAI mode with difficulty
        aiConfig = {
            difficulty: params.difficulty || "medium",
            reactionTime: params.difficulty === "easy" ? 150 : 
                         params.difficulty === "hard" ? 60 : 100,
            maxSpeed: params.difficulty === "easy" ? 0.6 : 
                     params.difficulty === "hard" ? 0.9 : 0.75,
            accuracy: params.difficulty === "easy" ? 0.6 : 
                     params.difficulty === "hard" ? 0.9 : 0.75
        };
    }

    // Initialize AI with the configuration
    if (aiConfig) {
        ai.initAI(aiConfig);
    }

    // Create game objects
    puck = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        radius: canvas.width * 0.03,
        dx: 0,
        dy: 0,
        mass: 1,
        color: "#fff"
    };

    player1 = {
        x: canvas.width / 2,
        y: canvas.height - 100,
        radius: canvas.width * 0.05,
        speed: 10,
        mass: 5,
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

    player2 = {
        x: canvas.width / 2,
        y: 100,
        radius: canvas.width * 0.05,
        speed: 10,
        mass: 5,
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

    walls = {
        thickness: canvas.width * 0.04,
        color: "#555"
    };
    
    // Initialize dimensions
    updateGameDimensions();
    
    // Set up event listeners
    input.setupEventListeners(player1, player2, handleGameControls);
    
    // Initialize victory screen if not already created
    if (!victoryScreen) {
        victoryScreen = new VictoryScreen(window.gameCore, menuManager);
    }
    
    // Start game loop
    requestAnimationFrame(gameLoop);
    
    // Return objects that other modules might need
    return {
        canvas,
        ctx,
        puck,
        player1,
        player2,
        walls,
        logo,
        getLogoLoaded: () => logoLoaded,
        gameMode,
        currentOpponentName,
        aiConfig
    };
}

function handleGameControls(key, isPressed) {
    // Skip handling if victory screen is showing
    if (victoryScreen && victoryScreen.isActive) {
        return false;
    }
    
    // Handle space key for game start
    if (key === " " && !gameStarted && !isPressed) {
        gameStarted = true;
        resetPuck();
        return true;
    }
    
    // Handle P key for pause toggle
    if ((key === "p" || key === "P") && !isPressed) {
        isPaused = !isPaused;
        return true;
    }
    
    return false;
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

    if (gameMode === "1vAI" || ['barGame', 'arcade', 'tournament', 'space'].includes(gameMode)) {
        ai.resetAI();
    }
}

function goalScored(player) {
    // Determine max score based on game mode
    const maxScore = (gameMode === "barGame" || 
                      gameMode === "arcade" || 
                      gameMode === "tournament" || 
                      gameMode === "space") ? 3 : 10;
    
    if (player === 1) {
        player1Score++;
        lastScorer = 1;
        
        // Check for game end
        if (player1Score >= maxScore) {
            // Handle game win for player 1
            showGameEnd(1);
        } else {
            resetPuck();
        }
    } else {
        player2Score++;
        lastScorer = 2;
        
        // Check for game end
        if (player2Score >= maxScore) {
            // Handle game win for player 2
            showGameEnd(2);
        } else {
            resetPuck();
        }
    }
}

function showGameEnd(winner) {
    // Calculate stars based on performance (for classic mode)
    let stars = 0;
    if (winner === 1) {
        const scoreDiff = player1Score - player2Score;
        if (scoreDiff >= 3) {
            stars = 3; // Perfect win
        } else if (scoreDiff >= 2) {
            stars = 2; // Good win
        } else {
            stars = 1; // Win
        }
    }
    
    // Pause the game
    isPaused = true;
    
    // Show victory screen with appropriate message
    if (victoryScreen) {
        // For classic mode games
        if (['barGame', 'arcade', 'tournament', 'space'].includes(gameMode)) {
            // Don't set automatic return to selection - let the victory screen handle it
            victoryScreen.showVictory('match', winner, player1Score, player2Score, stars, currentOpponentName);
        } else {
            // For regular versus games
            victoryScreen.showVictory('match', winner, player1Score, player2Score);
        }
    }
}

function gameLoop(timestamp) {
    if (isExitRequested) {
        isExitRequested = false;
        return;
    }

    const deltaTime = Math.min(timestamp - lastUpdateTime, 50);
    lastUpdateTime = timestamp;
    
    if (gameStarted && !isPaused) {
        if (goalFlashTimer > 0) {
            goalFlashTimer--;
        }
        
        // Always update player 1
        physics.updatePlayer(player1, deltaTime, canvas, walls);
        
        // Update player 2 or AI based on game mode
        if (gameMode === "1vAI" || gameMode === "barGame" || 
            gameMode === "arcade" || gameMode === "tournament" || 
            gameMode === "space") {
            ai.updateAI(puck, player2, canvas, walls, deltaTime);
        } else {
            physics.updatePlayer(player2, deltaTime, canvas, walls);
        }
        
        physics.updatePuck(puck, player1, player2, deltaTime, canvas, walls, {
            GOAL_X,
            GOAL_WIDTH,
            goalScored
        });
    }
    
    // Enhanced renderer call with opponent info
    renderer.draw({
        ctx,
        canvas,
        puck,
        player1,
        player2,
        walls,
        logoLoaded,
        logo,
        player1Score,
        player2Score,
        gameStarted,
        isPaused,
        goalFlashTimer,
        lastScorer,
        GOAL_X,
        GOAL_WIDTH,
        GOAL_HEIGHT,
        GOAL_FLASH_DURATION,
        gameMode,
        aiConfig,
        currentOpponentName
    });
    
    requestAnimationFrame(gameLoop);
}

function requestExit() {
    isExitRequested = true;
    resetGame();
}

// Add this function to fully reset the game state
function resetGame() {
    player1Score = 0;
    player2Score = 0;
    lastScorer = null;
    gameStarted = false;
    isPaused = false;
    goalFlashTimer = 0;
    resetPositions();
    
    // Reset AI state if in AI mode
    if (gameMode === "1vAI" || ['barGame', 'arcade', 'tournament', 'space'].includes(gameMode)) {
        ai.resetAI();
    }
}

// Resize canvas function
function resizeCanvas(windowWidth, windowHeight) {
    const padding = 10;
    
    const maxHeight = windowHeight - padding * 2;
    const maxWidth = windowWidth - padding * 2;
    
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

// Export function to get game mode
function getGameMode() {
    return gameMode;
}

// Export functions to get scores
function getPlayer1Score() {
    return player1Score;
}

function getPlayer2Score() {
    return player2Score;
}

// Export functions that will be used by other modules
export {
    init,
    resetPuck,
    resetPositions,
    resizeCanvas,
    gameLoop,
    goalScored,
    updateGameDimensions,
    requestExit,
    resetGame,
    getGameMode,
    getPlayer1Score,
    getPlayer2Score
};