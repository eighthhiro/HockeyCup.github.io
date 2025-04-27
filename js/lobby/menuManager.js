// js/lobby/menuManager.js - Handles menu options and actions
export class MenuManager {
    constructor(uiManager, gameManager, menuConfig) {
        this.uiManager = uiManager;
        this.gameManager = gameManager;
        this.menuConfig = menuConfig;
    }

    openSubmenu(menuType) {
        this.uiManager.setSubmenuTitle(menuType.toUpperCase());
        
        if (menuType === 'stats') {
            this.showStatsPage();
            return;
        }
        
        if (menuType === 'settings') {
            this.showSettingsPage();
            return;
        }
        
        // Clear existing options
        this.uiManager.clearSubmenuOptions();
        
        // Clear any background image
        this.uiManager.setSubmenuBackground('');
        
        // Add options based on the selected menu
        const options = this.menuConfig[menuType];
        options.forEach(option => {
            if (option.levels) {
                // Create a container for the option with banner and levels
                const levelBlockContainer = document.createElement('div');
                levelBlockContainer.className = 'level-block-container';
                
                // Create banner area
                const bannerContainer = document.createElement('div');
                bannerContainer.className = 'level-banner-container';
                
                // If there's a banner image, add it
                if (option.banner) {
                    bannerContainer.style.backgroundImage = `url(${option.banner})`;
                }
                
                // Add title overlay to the banner
                const bannerTitle = document.createElement('div');
                bannerTitle.className = 'banner-title';
                bannerTitle.textContent = option.name;
                bannerContainer.appendChild(bannerTitle);
                
                // Create the levels list
                const levelsList = document.createElement('div');
                levelsList.className = 'levels-list';
                
                // Add level options to the list
                option.levels.forEach(level => {
                    const levelItem = document.createElement('button');
                    levelItem.className = 'level-item';
                    levelItem.textContent = level.name;
                    
                    levelItem.addEventListener('click', () => {
                        this.handleAction(level.action, level.params);
                    });
                    
                    levelsList.appendChild(levelItem);
                });
                
                // Add banner and levels to the container
                levelBlockContainer.appendChild(bannerContainer);
                levelBlockContainer.appendChild(levelsList);
                this.uiManager.submenuOptions.appendChild(levelBlockContainer);
                
            } else {
                // For regular options without levels
                const button = document.createElement('button');
                button.className = option.comingSoon ? 'submenu-btn coming-soon-btn' : 'submenu-btn';
                button.textContent = option.name;
                
                if (option.comingSoon) {
                    button.innerHTML += ' <span class="coming-soon">Coming Soon</span>';
                } else {
                    button.addEventListener('click', () => {
                        this.handleAction(option.action, option.params, option);
                    });
                }
                
                this.uiManager.submenuOptions.appendChild(button);
            }
        });
        
        this.uiManager.showSubmenu();
    }

    handleAction(action, params, option) {
        switch (action) {
            case 'startGame':
                this.gameManager.startGame(params);
                break;
            case 'showAIDifficulty':
                this.showAIDifficulty();
                break;
            case 'showLevels':
                this.showLevels(option);
                break;
            case 'comingSoon':
                // Do nothing, the button is already styled as coming soon
                break;
            default:
                console.error('Unknown action:', action);
        }
    }

    showAIDifficulty() {
        // Clear existing options
        this.uiManager.clearSubmenuOptions();
        
        // Set submenu title
        this.uiManager.setSubmenuTitle("SELECT DIFFICULTY");
        
        // Add difficulty options
        const difficulties = [
            { name: "Easy", difficulty: "easy" },
            { name: "Medium", difficulty: "medium" },
            { name: "Hard", difficulty: "hard" }
        ];
        
        difficulties.forEach(option => {
            const button = document.createElement('button');
            button.className = 'submenu-btn';
            button.textContent = option.name;
            
            button.addEventListener('click', () => {
                this.gameManager.startGame({ mode: "1vAI", difficulty: option.difficulty });
            });
            
            this.uiManager.submenuOptions.appendChild(button);
        });
    }

    showLevels(option) {
        // Clear existing options
        this.uiManager.clearSubmenuOptions();
        
        // Set submenu title
        this.uiManager.setSubmenuTitle(`${option.name.toUpperCase()} - SELECT LEVEL`);
        
        // Set background image if available
        if (option.banner) {
            this.uiManager.setSubmenuBackground(option.banner);
        }
        
        // Create level selection container
        const levelContainer = document.createElement('div');
        levelContainer.className = 'level-selection-container';
        
        // Add level options
        option.levels.forEach(level => {
            const levelButton = document.createElement('button');
            levelButton.className = 'level-btn';
            levelButton.textContent = level.name;
            
            levelButton.addEventListener('click', () => {
                this.handleAction(level.action, level.params);
            });
            
            levelContainer.appendChild(levelButton);
        });
        
        this.uiManager.submenuOptions.appendChild(levelContainer);
    }

    showStatsPage() {
        // Clear existing options
        this.uiManager.clearSubmenuOptions();
        
        // Create stats page content
        const statsContent = document.createElement('div');
        statsContent.className = 'page-content';
        
        const statsContainer = document.createElement('div');
        statsContainer.className = 'stats-container';
        
        // Add some placeholder stats
        const stats = [
            { label: "Games Played", value: "0" },
            { label: "Wins", value: "0" },
            { label: "Losses", value: "0" },
            { label: "Win Rate", value: "0%" },
            { label: "Average Score", value: "0" },
            { label: "Highest Score", value: "0" }
        ];
        
        stats.forEach(stat => {
            const statBox = document.createElement('div');
            statBox.className = 'stat-box';
            
            const statLabel = document.createElement('div');
            statLabel.className = 'stat-label';
            statLabel.textContent = stat.label;
            
            const statValue = document.createElement('div');
            statValue.className = 'stat-value';
            statValue.textContent = stat.value;
            
            statBox.appendChild(statLabel);
            statBox.appendChild(statValue);
            statsContainer.appendChild(statBox);
        });
        
        statsContent.appendChild(statsContainer);
        this.uiManager.submenuOptions.appendChild(statsContent);
        
        this.uiManager.showSubmenu();
    }

    showSettingsPage() {
        // Clear existing options
        this.uiManager.clearSubmenuOptions();
        
        // Create settings page content
        const settingsContent = document.createElement('div');
        settingsContent.className = 'page-content';
        
        const settingsContainer = document.createElement('div');
        settingsContainer.className = 'settings-container';
        
        // Add some settings options
        const settings = [
            { label: "Sound Effects", type: "toggle", value: true },
            { label: "Music", type: "toggle", value: true },
            { label: "Sound Volume", type: "slider", value: 80, min: 0, max: 100 },
            { label: "Music Volume", type: "slider", value: 60, min: 0, max: 100 }
        ];
        
        settings.forEach(setting => {
            const settingItem = document.createElement('div');
            settingItem.className = 'setting-item';
            
            const settingLabel = document.createElement('div');
            settingLabel.className = 'settings-label';
            settingLabel.textContent = setting.label;
            
            const settingControl = document.createElement('div');
            settingControl.className = 'settings-control';
            
            if (setting.type === 'toggle') {
                const toggleSwitch = document.createElement('label');
                toggleSwitch.className = 'toggle-switch';
                
                const input = document.createElement('input');
                input.type = 'checkbox';
                input.checked = setting.value;
                
                const sliderElement = document.createElement('span');
                sliderElement.className = 'slider-toggle';
                
                toggleSwitch.appendChild(input);
                toggleSwitch.appendChild(sliderElement);
                settingControl.appendChild(toggleSwitch);
            } else if (setting.type === 'slider') {
                const slider = document.createElement('input');
                slider.type = 'range';
                slider.className = 'slider';
                slider.min = setting.min;
                slider.max = setting.max;
                slider.value = setting.value;
                
                const valueDisplay = document.createElement('span');
                valueDisplay.textContent = setting.value;
                
                slider.addEventListener('input', () => {
                    valueDisplay.textContent = slider.value;
                });
                
                settingControl.appendChild(slider);
                settingControl.appendChild(valueDisplay);
            }
            
            settingItem.appendChild(settingLabel);
            settingItem.appendChild(settingControl);
            settingsContainer.appendChild(settingItem);
        });
        
        settingsContent.appendChild(settingsContainer);
        this.uiManager.submenuOptions.appendChild(settingsContent);
        
        this.uiManager.showSubmenu();
    }
}