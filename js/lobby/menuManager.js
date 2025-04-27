// js/lobby/menuManager.js - Updated to include map slider functionality
export class MenuManager {
    constructor(uiManager, gameManager, menuConfig) {
        this.uiManager = uiManager;
        this.gameManager = gameManager;
        this.menuConfig = menuConfig;
        this.currentSlideIndex = 0;
        this.totalSlides = 0;
        this.initializeBackgrounds();
    }

    // Initialize video background for lobby
    initializeBackgrounds() {
        // Ensure video autoplays on user interaction
        document.addEventListener('click', () => {
            const video = document.getElementById('lobby-video');
            if (video && video.paused) {
                video.play();
            }
        }, { once: true });
    }

    openSubmenu(menuType) {
        this.uiManager.setSubmenuTitle(menuType.toUpperCase());
        
        // Hide navigation elements by default
        this.hideSliderNavigation();
        
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
        
        // Check if we have level blocks that should go in the slider
        const levelBlocks = options.filter(option => option.levels);
        const regularOptions = options.filter(option => !option.levels);
        
        // If we're in classic mode and have level blocks, show the slider navigation
        if (menuType === 'classic' && levelBlocks.length > 0) {
            this.showSliderNavigation();
            this.createMapSlider(levelBlocks);
        }
        
        // Add regular options after the slider
        regularOptions.forEach(option => {
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
        });
        
        this.uiManager.showSubmenu();
    }
    
    // Add these new helper methods to MenuManager
    showSliderNavigation() {
        const arrowsContainer = document.querySelector('.slider-arrows-container');
        const dotsContainer = document.querySelector('.slider-dots-container');
        
        if (arrowsContainer) arrowsContainer.classList.remove('hidden');
        if (dotsContainer) dotsContainer.classList.remove('hidden');
    }
    
    hideSliderNavigation() {
        const arrowsContainer = document.querySelector('.slider-arrows-container');
        const dotsContainer = document.querySelector('.slider-dots-container');
        
        if (arrowsContainer) arrowsContainer.classList.add('hidden');
        if (dotsContainer) dotsContainer.classList.add('hidden');
    }
    
    createMapSlider(levelBlocks) {
        // Create the main slider container
        const sliderContainer = document.createElement('div');
        sliderContainer.className = 'map-slider-container';
        
        // Create the slider track
        const slider = document.createElement('div');
        slider.className = 'map-slider';
        
        // Get references to the existing containers
        const dotsContainer = document.querySelector('.slider-dots-container');
        
        // Clear any existing dots
        dotsContainer.innerHTML = '';
        
        // Reset current slide index
        this.currentSlideIndex = 0;
        this.totalSlides = levelBlocks.length;
        
        // Create slides for each level block
        levelBlocks.forEach((option, index) => {
            // Create a slide
            const slide = document.createElement('div');
            slide.className = 'map-slide';
            slide.dataset.index = index;
            
            // Create level block container
            const levelBlockContainer = document.createElement('div');
            levelBlockContainer.className = 'level-block-container';
            
            // Create banner area
            const bannerContainer = document.createElement('div');
            bannerContainer.className = 'level-banner-container';
            
            // If there's a banner image, add it
            if (option.banner) {
                const bannerImg = document.createElement('img');
                bannerImg.src = option.banner;
                bannerImg.alt = `${option.name} banner`;
                bannerContainer.appendChild(bannerImg);
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
            
            // Add the level block to the slide
            slide.appendChild(levelBlockContainer);
            
            // Add the slide to the slider
            slider.appendChild(slide);
            
            // Create a dot for this slide
            const dot = document.createElement('div');
            dot.className = index === 0 ? 'map-dot active' : 'map-dot';
            dot.dataset.index = index;
            dot.addEventListener('click', () => this.goToSlide(index));
            dotsContainer.appendChild(dot);
        });

        
        // Add slider to the container
        sliderContainer.appendChild(slider);
        
        // Add slider to the submenu options
        this.uiManager.submenuOptions.appendChild(sliderContainer);
        
        // Set up arrow event listeners if they haven't been set up already
        const prevArrow = document.querySelector('.map-arrow-prev');
        const nextArrow = document.querySelector('.map-arrow-next');
        
        if (prevArrow && !prevArrow._hasListener) {
            prevArrow.addEventListener('click', () => this.navigateSlider('prev'));
            prevArrow._hasListener = true;
        }
        
        if (nextArrow && !nextArrow._hasListener) {
            nextArrow.addEventListener('click', () => this.navigateSlider('next'));
            nextArrow._hasListener = true;
        }
    }
    
    navigateSlider(direction) {
        if (direction === 'prev') {
            this.currentSlideIndex = (this.currentSlideIndex - 1 + this.totalSlides) % this.totalSlides;
        } else {
            this.currentSlideIndex = (this.currentSlideIndex + 1) % this.totalSlides;
        }
        
        this.goToSlide(this.currentSlideIndex);
    }
    
    goToSlide(index) {
        // Update the slider position
        const slider = document.querySelector('.map-slider');
        if (slider) {
            slider.style.transform = `translateX(-${index * 100}%)`;
        }
        
        // Update the active dot
        const dots = document.querySelectorAll('.map-dot');
        dots.forEach((dot, i) => {
            if (i === index) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
        
        this.currentSlideIndex = index;
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