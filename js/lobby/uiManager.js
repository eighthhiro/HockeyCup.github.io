// js/lobby/uiManager.js - Handles UI-related functions
export class UIManager {
    constructor() {
        // Cache DOM elements
        this.lobby = document.getElementById('lobby');
        this.submenu = document.getElementById('submenu');
        this.gameContainer = document.getElementById('game-container');
        this.submenuTitle = document.getElementById('submenu-title');
        this.submenuOptions = document.getElementById('submenu-options');
        this.canvas = document.getElementById('gameCanvas');
        this.exitGameBtn = document.getElementById('exit-game');
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Add event listeners for menu buttons
        document.querySelectorAll('.menu-btn').forEach(button => {
            button.addEventListener('click', () => {
                const menuType = button.getAttribute('data-menu');
                this.openSubmenu(menuType);
            });
        });

        // Add event listener for back button
        document.querySelector('.back-btn').addEventListener('click', () => {
            this.showLobby();
        });

        // Add event listener for exit game button
        this.exitGameBtn.addEventListener('click', () => {
            this.exitGame();
        });
    }

    showLobby() {
        this.submenu.classList.remove('visible');
        this.submenu.classList.add('hidden');
        this.lobby.classList.remove('hidden');
        this.lobby.classList.add('visible');
        
        // Clear submenu options
        this.submenuOptions.innerHTML = '';
        
        // Remove any background images
        this.submenu.style.backgroundImage = '';
    }

    showSubmenu() {
        this.lobby.classList.remove('visible');
        this.lobby.classList.add('hidden');
        this.submenu.classList.remove('hidden');
        this.submenu.classList.add('visible');
    }

    showGameContainer() {
        this.submenu.classList.remove('visible');
        this.submenu.classList.add('hidden');
        this.gameContainer.classList.remove('hidden');
        this.gameContainer.classList.add('visible');
    }

    exitGame() {
        // Check if gameCore is available and request exit
        if (window.gameCore && typeof window.gameCore.requestExit === 'function') {
            window.gameCore.requestExit();
        }
        
        // Hide game container and show lobby
        this.gameContainer.classList.remove('visible');
        this.gameContainer.classList.add('hidden');
        this.showLobby();
    }

    clearSubmenuOptions() {
        this.submenuOptions.innerHTML = '';
    }

    setSubmenuTitle(title) {
        this.submenuTitle.textContent = title;
    }

    setSubmenuBackground(imageUrl) {
        if (imageUrl) {
            this.submenu.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${imageUrl})`;
            this.submenu.style.backgroundSize = 'cover';
            this.submenu.style.backgroundPosition = 'center';
        } else {
            this.submenu.style.backgroundImage = '';
        }
    }
}