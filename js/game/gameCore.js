// gameCore.js - Contains game state, scoring and core game loop
let isExitRequested = false;
import * as ai from './ai.js';

// Game state
let player1Score = 0;
let player2Score = 0;
let lastScorer = null; // 1 for player1, 2 for player2
let gameStarted = false;
let isPaused = false;
let goalFlashTimer = 0;
let lastUpdateTime = performance.now();
let gameMode = "1v1";
let aiDifficulty = "medium";

// Game objects and constants that will be initialized in init()
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

    if (gameMode === "1vAI" && params.difficulty) {
        aiDifficulty = params.difficulty;
        ai.initAI(aiDifficulty);
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
        gameMode
    };
}

function handleGameControls(key, isPressed) {
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

    if (gameMode === "1vAI") {
        ai.resetAI();
    }
}

function goalScored(player) {
    if (player === 1) {
        player1Score++;
        lastScorer = 1;
    } else {
        player2Score++;
        lastScorer = 2;
    }
    resetPuck();
}

function gameLoop(timestamp) {
    // Check if exit was requested from the lobby
    if (isExitRequested) {
        isExitRequested = false;
        return; // Stop the game loop
    }

    const deltaTime = Math.min(timestamp - lastUpdateTime, 50); // Cap delta time to prevent jumps
    lastUpdateTime = timestamp;
    
    if (gameStarted && !isPaused) {
        if (goalFlashTimer > 0) {
            goalFlashTimer--;
        }
        
        // Always update player 1
        physics.updatePlayer(player1, deltaTime, canvas, walls);
        
        // Update player 2 or AI based on game mode
        if (gameMode === "1vAI") {
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
        aiDifficulty
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
    if (gameMode === "1vAI") {
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
    getGameMode
};