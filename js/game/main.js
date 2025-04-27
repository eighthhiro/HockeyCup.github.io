// js/game/main.js - The entry point of the application

// Import modules
import * as gameCore from './gameCore.js';
import * as physics from './physics.js';
import * as input from './input.js';
import * as renderer from './renderer.js';

// Expose gameCore to window to solve circular dependency
window.gameCore = gameCore;

// Flag to track if game has been initialized
let gameInitialized = false;

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Get the canvas element
    const canvas = document.getElementById('gameCanvas');
    
    if (!canvas) {
        console.error('Canvas element not found!');
        return;
    }
    
    // Check if the page was loaded directly or through the lobby system
    const directAccess = !document.getElementById('lobby') || 
                        window.location.hash === '#directPlay';
    
    if (directAccess) {
        // Initialize the game immediately if accessed directly
        initializeGame(canvas);
    }
    // Otherwise, the lobby system will call initializeGame when needed
    
    console.log('Air Hockey game module loaded successfully!');
});

// Function to initialize the game
function initializeGame(canvas, params = {}) {
    if (gameInitialized) {
        gameCore.resetGame();
        if (params.mode) {
            // Reinitialize with new game mode and parameters
            gameCore.init(canvas, params);
        }
        return;
    }
    
    // Initialize the game with parameters
    const gameObjects = gameCore.init(canvas, params);
    
    // Set up window resize event handling
    window.addEventListener('resize', () => {
        gameCore.resizeCanvas(window.innerWidth, window.innerHeight);
    });
    
    // Initial resize to fit the screen
    gameCore.resizeCanvas(window.innerWidth, window.innerHeight);
    
    // REMOVED: Don't add gameMode directly to window.gameCore
    // Instead, use the getGameMode function that's already exported
    
    gameInitialized = true;
    console.log(`Air Hockey game initialized successfully! Mode: ${params.mode || '1v1'}${params.difficulty ? ', Difficulty: ' + params.difficulty : ''}`);
}

// Export the initialize function for the lobby system
export { initializeGame };