// js/lobby/gameManager.js - Handles game initialization and management
export class GameManager {
    constructor(uiManager) {
        this.uiManager = uiManager;
    }

    startGame(params) {
        this.uiManager.showGameContainer();
        
        // Initialize the game module
        this.initGame(params);
    }

    initGame(params) {
        // Grab the canvas element
        const canvas = document.getElementById('gameCanvas');
        
        // This function will initialize your existing game code
        // It dynamically imports the game module to start the game
        import('../game/main.js').then(module => {
            // Call the initializeGame function from the module
            if (typeof module.initializeGame === 'function') {
                module.initializeGame(canvas, params);
                console.log(`Starting game with mode: ${params.mode}${params.difficulty ? ', difficulty: ' + params.difficulty : ''}${params.level ? ', level: ' + params.level : ''}`);
            } else {
                console.error('Game initialization function not found!');
            }
            
            // Ensure the canvas is properly sized
            setTimeout(() => {
                if (window.gameCore && typeof window.gameCore.resizeCanvas === 'function') {
                    window.gameCore.resizeCanvas(window.innerWidth, window.innerHeight);
                }
            }, 100);
        }).catch(error => {
            console.error('Error loading game module:', error);
        });
    }
}