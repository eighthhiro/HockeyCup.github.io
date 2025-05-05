// js/game/victoryScreen.js - Handles victory screen and round completion

export class VictoryScreen {
    constructor(gameCore, menuManager) {
        this.gameCore = gameCore;
        this.menuManager = menuManager;
        this.isActive = false;
        this.victoryType = null; // 'round' or 'match'
        this.winner = null; // 1 or 2
        this.victoryElement = null;
        this.stars = 0; // Number of stars earned (for classic mode)
        this.opponentName = null;
        this.transitionTimer = null; // Timer for handling transitions
        
        // Initialize the victory screen element
        this.createVictoryElement();
    }
    
    createVictoryElement() {
        // Create the victory screen if it doesn't exist
        if (!this.victoryElement) {
            this.victoryElement = document.createElement('div');
            this.victoryElement.className = 'victory-screen';
            this.victoryElement.style.display = 'none';
            document.body.appendChild(this.victoryElement);
            
            // Add CSS for the victory screen
            const style = document.createElement('style');
            style.textContent = `
                .victory-screen {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.85);
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                    color: white;
                    font-family: 'Orbitron', sans-serif;
                    animation: fadeIn 0.5s ease-in-out;
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                .victory-title {
                    font-size: 3rem;
                    margin-bottom: 1rem;
                    text-align: center;
                    text-shadow: 0 0 10px rgba(255, 255, 255, 0.7);
                }
                
                .victory-subtitle {
                    font-size: 2rem;
                    margin-bottom: 2rem;
                    text-align: center;
                }
                
                .victory-stars {
                    display: flex;
                    justify-content: center;
                    margin-bottom: 2rem;
                }
                
                .victory-star {
                    width: 50px;
                    height: 50px;
                    margin: 0 10px;
                    background-image: url('./assets/star-empty.png');
                    background-size: contain;
                    background-repeat: no-repeat;
                    transition: all 0.3s ease;
                }
                
                .victory-star.earned {
                    background-image: url('./assets/star-filled.png');
                    transform: scale(1.2);
                    filter: brightness(1.5);
                }
                
                .victory-buttons {
                    display: flex;
                    justify-content: center;
                    gap: 20px;
                }
                
                .victory-button {
                    padding: 15px 30px;
                    font-size: 1.2rem;
                    background: linear-gradient(to bottom, #444, #222);
                    border: 2px solid #666;
                    color: white;
                    border-radius: 5px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                
                .victory-button:hover {
                    background: linear-gradient(to bottom, #666, #444);
                    transform: translateY(-2px);
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
                }
                
                .victory-score {
                    font-size: 2.5rem;
                    margin: 1rem 0;
                    text-align: center;
                }
                
                .player-name {
                    color: #ff4d4d;
                }
                
                .opponent-name {
                    color: #4d4dff;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    showVictory(victoryType, winner, playerScore, opponentScore, stars = 0, opponentName = null) {
        // Clear any existing transition timer
        if (this.transitionTimer) {
            clearTimeout(this.transitionTimer);
            this.transitionTimer = null;
        }
        
        this.isActive = true;
        this.victoryType = victoryType;
        this.winner = winner;
        this.stars = stars;
        this.opponentName = opponentName;
        
        // Clear previous content
        this.victoryElement.innerHTML = '';
        
        // Create victory title
        const title = document.createElement('div');
        title.className = 'victory-title';
        
        // Different messages based on victory type and winner
        if (victoryType === 'round') {
            title.textContent = winner === 1 ? 'You Win!' : 'Opponent Wins!';
        } else { // match
            title.textContent = winner === 1 ? 'Match Complete! You Win!' : 'Match Complete! Opponent Wins!';
        }
        this.victoryElement.appendChild(title);
        
        // Show opponent name if available (for classic mode)
        if (opponentName) {
            const subtitle = document.createElement('div');
            subtitle.className = 'victory-subtitle';
            subtitle.innerHTML = `You vs <span class="opponent-name">${opponentName}</span>`;
            this.victoryElement.appendChild(subtitle);
        }
        
        // Show score
        const score = document.createElement('div');
        score.className = 'victory-score';
        score.innerHTML = `<span class="player-name">${playerScore}</span> - <span class="opponent-name">${opponentScore}</span>`;
        this.victoryElement.appendChild(score);
        
        // Show stars for classic mode
        if (victoryType === 'match' && winner === 1) {
            const starsContainer = document.createElement('div');
            starsContainer.className = 'victory-stars';
            
            // Create 3 stars
            for (let i = 0; i < 3; i++) {
                const star = document.createElement('div');
                star.className = 'victory-star';
                if (i < stars) {
                    // Delay the animation for each star
                    setTimeout(() => {
                        star.classList.add('earned');
                    }, 500 + 300 * i);
                }
                starsContainer.appendChild(star);
            }
            this.victoryElement.appendChild(starsContainer);
        }
        
        // Create buttons
        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'victory-buttons';
        
        // Different buttons based on victory type
        if (victoryType === 'round' && this.isClassicMode()) {
            // For classic mode rounds, just continue to next opponent but with delay
            const continueButton = document.createElement('button');
            continueButton.className = 'victory-button';
            continueButton.textContent = 'Continue';
            continueButton.addEventListener('click', () => {
                this.hide();
                // Return to classic selection screen
                this.returnToClassicSelection();
            });
            buttonsContainer.appendChild(continueButton);
            
            // Auto-transition after 3 seconds for classic mode
            this.transitionTimer = setTimeout(() => {
                if (this.isActive) {
                    this.hide();
                    this.returnToClassicSelection();
                }
            }, 3000);
        } else {
            // For match victories or non-classic modes
            const rematchButton = document.createElement('button');
            rematchButton.className = 'victory-button';
            rematchButton.textContent = 'Rematch';
            rematchButton.addEventListener('click', () => {
                this.hide();
                this.gameCore.resetGame();
            });
            buttonsContainer.appendChild(rematchButton);
            
            const menuButton = document.createElement('button');
            menuButton.className = 'victory-button';
            menuButton.textContent = 'Main Menu';
            menuButton.addEventListener('click', () => {
                this.hide();
                this.returnToMainMenu();
            });
            buttonsContainer.appendChild(menuButton);
        }
        
        this.victoryElement.appendChild(buttonsContainer);
        
        // Show the victory screen
        this.victoryElement.style.display = 'flex';
        
        // Save progress immediately if player won in classic mode
        if (winner === 1 && this.isClassicMode()) {
            this.saveClassicProgress();
        }
    }
    
    hide() {
        // Clear any transition timer when manually hiding
        if (this.transitionTimer) {
            clearTimeout(this.transitionTimer);
            this.transitionTimer = null;
        }
        
        this.isActive = false;
        this.victoryElement.style.display = 'none';
    }
    
    isClassicMode() {
        const gameMode = this.gameCore.getGameMode();
        return ['barGame', 'arcade', 'tournament', 'space'].includes(gameMode);
    }
    
    returnToClassicSelection() {
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
        
        // Request game exit
        this.gameCore.requestExit();
        
        // Return to classic menu
        if (this.menuManager) {
            setTimeout(() => {
                this.menuManager.openSubmenu('classic');
            }, 100);
        }
    }
    
    returnToMainMenu() {
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
        
        // Request game exit from the game core
        this.gameCore.requestExit();
        
        // If we have a menu manager, reset to main menu
        if (this.menuManager && window.lobbySystem) {
            // Hide any open submenus first
            const submenu = document.getElementById('submenu');
            if (submenu) {
                submenu.classList.add('hidden');
            }
            
            // Reset menu state by forcing reload from localStorage
            setTimeout(() => {
                window.lobbySystem.loadSavedProgress();
            }, 200);
        }
    }
    
    saveClassicProgress() {
        // Get current game mode and opponent name
        const gameMode = this.gameCore.getGameMode();
        const opponentName = this.opponentName;
        
        if (gameMode && opponentName && this.winner === 1) {
            // Calculate progress data
            const progressData = this.getProgressData();
            
            try {
                // Save to local storage
                this.saveToLocalStorage(gameMode, opponentName, this.stars);
                
                // Update the UI immediately if menuManager is available
                if (this.menuManager && window.lobbySystem) {
                    // Find the opponent in the menu config
                    const levelBlocks = this.menuManager.menuConfig.classic.filter(block => block.levels);
                    
                    let opponentFound = false;
                    for (const block of levelBlocks) {
                        const levelIndex = block.levels.findIndex(level => level.name === opponentName);
                        if (levelIndex !== -1) {
                            // Update the earned stars
                            block.levels[levelIndex].earned = Math.max(
                                block.levels[levelIndex].earned || 0,
                                this.stars
                            );
                            
                            console.log(`Updated stars for ${opponentName}: ${this.stars}`);
                            opponentFound = true;
                            break;
                        }
                    }
                    
                    // Force reload of progress data to update UI
                    if (opponentFound && window.lobbySystem.loadSavedProgress) {
                        setTimeout(() => {
                            window.lobbySystem.loadSavedProgress();
                        }, 100);
                    }
                }
            } catch (error) {
                console.error('Error saving progress:', error);
            }
        }
    }
    
    getProgressData() {
        // Calculate stars based on score difference
        const player1Score = this.gameCore.getPlayer1Score();
        const player2Score = this.gameCore.getPlayer2Score();
        const scoreDiff = player1Score - player2Score;
        
        // Calculate stars: 1 for win, 2 for good win, 3 for perfect win
        let stars = 1;
        if (scoreDiff >= 5) {
            stars = 3; // Perfect win
        } else if (scoreDiff >= 3) {
            stars = 2; // Good win
        }
        
        return {
            stars: stars,
            scorePlayer: player1Score,
            scoreOpponent: player2Score
        };
    }
    
    saveToLocalStorage(gameMode, opponentName, stars) {
        try {
            // Get existing progress
            const progressKey = 'airHockeyProgress';
            const existingProgress = JSON.parse(localStorage.getItem(progressKey) || '{}');
            
            // Initialize the game mode object if needed
            if (!existingProgress[gameMode]) {
                existingProgress[gameMode] = {};
            }
            
            // Update progress for this opponent, keeping the highest star count
            existingProgress[gameMode][opponentName] = Math.max(
                existingProgress[gameMode][opponentName] || 0,
                stars
            );
            
            // Save updated progress
            localStorage.setItem(progressKey, JSON.stringify(existingProgress));
            console.log(`Progress saved for ${gameMode}/${opponentName}: ${stars} stars`);
            
            // Debug: log the entire progress object
            console.log('Current progress:', JSON.stringify(existingProgress));
        } catch (error) {
            console.error('Error saving progress:', error);
        }
    }
}

// Export a function to create the victory screen
export function createVictoryScreen(gameCore, menuManager) {
    return new VictoryScreen(gameCore, menuManager);
}