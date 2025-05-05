// js/game/main.js - The entry point of the application

// Import modules
import * as gameCore from './gameCore.js';
import * as physics from './physics.js';
import * as input from './input.js';
import * as renderer from './renderer.js';
import { getOpponentConfig } from './classicOpponents.js';
import { getDefaultAIDifficulty } from './ai.js';
import { VictoryScreen } from './victoryScreen.js';

// Expose gameCore to window to solve circular dependency
window.gameCore = gameCore;

// Flag to track if game has been initialized
let gameInitialized = false;
let victoryScreen = null;

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
    let aiConfig = null;
    let opponentName = null;
    
    // Determine AI configuration based on game mode
    if (params.mode && ['barGame', 'arcade', 'tournament', 'space'].includes(params.mode)) {
        // Classic mode: use the named opponent's config
        if (params.opponentName) {
            opponentName = params.opponentName;
            aiConfig = getOpponentConfig(params.opponentName);
        } else {
            // Fallback: get opponent config based on level if name isn't provided
            opponentName = getDefaultOpponentName(params.mode, params.level);
            aiConfig = getOpponentConfig(opponentName);
        }
    } else if (params.mode === "1vAI") {
        // Use difficulty-based AI for 1vAI mode
        aiConfig = getDefaultAIDifficulty(params.difficulty || 'medium');
    }
    // For 1v1 mode, aiConfig remains null

    // Get menuManager reference from the lobby system if available
    const menuManager = window.lobbySystem?.menuManager || null;
    
    // Initialize the victory screen if not already done
    if (!victoryScreen) {
        victoryScreen = new VictoryScreen(gameCore, menuManager);
    }
    
    if (gameInitialized) {
        gameCore.resetGame();
        if (params.mode) {
            // Reinitialize with new game mode and parameters
            gameCore.init(canvas, { 
                ...params, 
                aiConfig, 
                opponentName,
                menuManager
            });
        }
        return;
    }
    
    // Initialize the game with parameters and pass menuManager
    const gameObjects = gameCore.init(canvas, { 
        ...params, 
        aiConfig, 
        opponentName,
        menuManager
    });
    
    // Set up window resize event handling
    window.addEventListener('resize', () => {
        gameCore.resizeCanvas(window.innerWidth, window.innerHeight);
    });
    
    // Initial resize to fit the screen
    gameCore.resizeCanvas(window.innerWidth, window.innerHeight);
    
    gameInitialized = true;
    console.log(`Air Hockey game initialized successfully! Mode: ${params.mode || '1v1'}${params.difficulty ? ', Difficulty: ' + params.difficulty : ''}${opponentName ? ', Opponent: ' + opponentName : ''}`);
}

// Helper function to get default opponent name if not provided
function getDefaultOpponentName(mode, level) {
    const opponents = {
        barGame: ['Lightning Larry', 'The Puck Slayer', 'Defense Dio'],
        arcade: ['Tiny Tornado', 'Zippy the Striker', 'Prince Pucks-a-Lot'],
        tournament: ['Colin Cummings', 'Jacob Weissman', 'Danny Hynes'],
        space: ['Lunar', 'Mars', 'Zero-G']
    };
    
    return opponents[mode]?.[level - 1] || 'Default Opponent';
}

// Export the initialize function for the lobby system
export { initializeGame };