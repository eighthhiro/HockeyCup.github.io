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
        this.videoBackground = document.getElementById('video-background');
        
        // Cache slider navigation elements
        this.sliderArrowsContainer = document.querySelector('.slider-arrows-container');
        this.sliderDotsContainer = document.querySelector('.slider-dots-container');
        
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
        this.hideSubmenu();
        this.lobby.classList.remove('hidden');
        this.lobby.classList.add('visible');
        
        // Show video background when returning to lobby
        this.videoBackground.classList.remove('hidden');
        
        // Clear submenu options
        this.clearSubmenuOptions();
        
        // Remove any background images
        this.setSubmenuBackground('');
        
        // Reset submenu classes
        this.submenu.classList.remove('classic-background');
        
        // Hide slider navigation
        this.hideSliderNavigation();
    }

    showSubmenu() {
        this.lobby.classList.remove('visible');
        this.lobby.classList.add('hidden');
        this.submenu.classList.remove('hidden');
        this.submenu.classList.add('visible');
    }

    hideSubmenu() {
        this.submenu.classList.remove('visible');
        this.submenu.classList.add('hidden');
    }

    showGameContainer() {
        this.hideSubmenu();
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
    
    // Methods for slider navigation
    showSliderNavigation() {
        if (this.sliderArrowsContainer) {
            this.sliderArrowsContainer.classList.remove('hidden');
            this.sliderArrowsContainer.classList.add('visible');
        }
        if (this.sliderDotsContainer) {
            this.sliderDotsContainer.classList.remove('hidden');
            this.sliderDotsContainer.classList.add('visible');
        }
    }
    
    hideSliderNavigation() {
        if (this.sliderArrowsContainer) {
            this.sliderArrowsContainer.classList.add('hidden');
            this.sliderArrowsContainer.classList.remove('visible');
        }
        if (this.sliderDotsContainer) {
            this.sliderDotsContainer.classList.add('hidden');
            this.sliderDotsContainer.classList.remove('visible');
        }
    }
    
    clearSliderDots() {
        if (this.sliderDotsContainer) {
            this.sliderDotsContainer.innerHTML = '';
        }
    }
    
    // Method to be called when opening a submenu
    openSubmenu(menuType) {
        this.setSubmenuTitle(menuType.toUpperCase());
        this.clearSubmenuOptions();
        this.setSubmenuBackground('');
        
        // Hide slider navigation by default (will be shown for classic mode)
        this.hideSliderNavigation();
        this.clearSliderDots();
        
        this.showSubmenu();
    }
}