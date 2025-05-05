// js/lobby.js - Main entry point, initializes application
import { UIManager } from './lobby/uiManager.js';
import { GameManager } from './lobby/gameManager.js';
import { MenuManager } from './lobby/menuManager.js';
import { menuConfig } from './lobby/menuConfig.js';

class LobbySystem {
    constructor() {
        // Initialize UI manager
        this.uiManager = new UIManager();
        
        // Initialize game manager
        this.gameManager = new GameManager(this.uiManager);
        
        // Initialize menu manager with proper references
        this.menuManager = new MenuManager(this.uiManager, this.gameManager, menuConfig);
        
        // Make the menuManager available to the game core for victory screen
        if (window.gameCore) {
            window.gameCore.menuManager = this.menuManager;
        }
        
        // Setup proxy methods to handle menu selection
        document.querySelectorAll('.menu-btn').forEach(button => {
            button.addEventListener('click', () => {
                const menuType = button.getAttribute('data-menu');
                this.menuManager.openSubmenu(menuType);
            });
        });
        
        // Add event listener for the exit button
        const exitButton = document.getElementById('exit-game');
        if (exitButton) {
            exitButton.addEventListener('click', this.handleExitGame.bind(this));
        }
        
        // Load saved progress from localStorage
        this.loadSavedProgress();
        
        console.log('Lobby system initialized');
    }
    
    loadSavedProgress() {
        try {
            // Get progress from localStorage
            const progressKey = 'airHockeyProgress';
            const savedProgress = JSON.parse(localStorage.getItem(progressKey) || '{}');
            
            // Update menu config with saved progress
            if (Object.keys(savedProgress).length > 0) {
                this.updateMenuConfigWithProgress(savedProgress);
            }
        } catch (error) {
            console.error('Error loading saved progress:', error);
        }
    }
    
    updateMenuConfigWithProgress(savedProgress) {
        // Update each game mode's progress
        Object.keys(savedProgress).forEach(gameMode => {
            const modeProgress = savedProgress[gameMode];
            
            // Find corresponding block in menu config
            const levelBlocks = this.menuManager.menuConfig.classic.filter(block => block.levels);
            
            levelBlocks.forEach(block => {
                block.levels.forEach(level => {
                    // If we have progress for this opponent/level
                    if (modeProgress[level.name]) {
                        // Update the earned stars
                        level.earned = Math.max(level.earned || 0, modeProgress[level.name]);
                    }
                });
            });
        });
        
        // Refresh menu display if needed
        if (this.menuManager.currentSubmenu === 'classic') {
            this.menuManager.openSubmenu('classic');
        }
        
        console.log('Game progress loaded from localStorage');
    }
    
    handleExitGame() {
        // Hide the game canvas container
        const gameContainer = document.getElementById('game-container');
        if (gameContainer) {
            gameContainer.classList.add('hidden');
        }
        
        // Show the lobby
        const lobby = document.getElementById('lobby');
        if (lobby) {
            lobby.classList.add('visible');
            lobby.classList.remove('hidden');
        }
        
        // Request exit from game core
        if (window.gameCore) {
            window.gameCore.requestExit();
        }
    }
}

// Initialize the lobby system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.lobbySystem = new LobbySystem();
});