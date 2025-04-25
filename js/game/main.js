// main.js - The entry point of the application

// Import modules
import * as gameCore from './gameCore.js';
import * as physics from './physics.js';
import * as input from './input.js';
import * as renderer from './renderer.js';

// Expose gameCore to window to solve circular dependency
window.gameCore = gameCore;

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Get the canvas element
    const canvas = document.getElementById('gameCanvas');
    
    if (!canvas) {
        console.error('Canvas element not found!');
        return;
    }
    
    // Initialize the game
    const gameObjects = gameCore.init(canvas);
    
    // Set up window resize event handling
    window.addEventListener('resize', () => {
        gameCore.resizeCanvas(window.innerWidth, window.innerHeight);
    });
    
    // Initial resize to fit the screen
    gameCore.resizeCanvas(window.innerWidth, window.innerHeight);
    
    console.log('Air Hockey game initialized successfully!');
});