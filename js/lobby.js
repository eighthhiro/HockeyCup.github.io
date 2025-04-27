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
        
        // Initialize menu manager
        this.menuManager = new MenuManager(this.uiManager, this.gameManager, menuConfig);
        
        // Setup proxy methods to handle menu selection
        document.querySelectorAll('.menu-btn').forEach(button => {
            const originalClickHandler = button.onclick;
            button.onclick = null;
            
            button.addEventListener('click', () => {
                const menuType = button.getAttribute('data-menu');
                this.menuManager.openSubmenu(menuType);
            });
        });
        
        console.log('Lobby system initialized');
    }
}

// Initialize the lobby system
window.lobbySystem = new LobbySystem();