export class MenuManager {
    constructor(uiManager, gameManager, menuConfig) {
        this.uiManager = uiManager;
        this.gameManager = gameManager;
        this.menuConfig = menuConfig;
        this.currentSlideIndex = 0;
        this.totalSlides = 0;
        this.initializeBackgrounds();
    }

    initializeBackgrounds() {
        document.addEventListener('click', () => {
            const video = document.getElementById('lobby-video');
            if (video && video.paused) {
                video.play();
            }
        }, { once: true });
    }

    openSubmenu(menuType) {
        this.uiManager.setSubmenuTitle(menuType.toUpperCase());
        this.hideSliderNavigation();

        // Remove classic mode class if present
        document.body.classList.remove('classic-mode-submenu');

        if (menuType === 'stats') {
            this.showStatsPage();
            return;
        }
        if (menuType === 'settings') {
            this.showSettingsPage();
            return;
        }

        this.uiManager.clearSubmenuOptions();
        this.uiManager.setSubmenuBackground('');

        const options = this.menuConfig[menuType];
        const availableOptions = options.filter(option => !option.comingSoon);
        const levelBlocks = availableOptions.filter(option => option.levels);
        const regularOptions = availableOptions.filter(option => !option.levels);

        if (menuType === 'classic' && levelBlocks.length > 0) {
            // Hide global arrows, add classic mode class
            this.hideSliderNavigation();
            document.body.classList.add('classic-mode-submenu');
            this.createMapSlider(levelBlocks, true);
        } else if (levelBlocks.length > 0) {
            this.showSliderNavigation();
            this.createMapSlider(levelBlocks, false);
        }

        regularOptions.forEach(option => {
            const button = document.createElement('button');
            button.className = 'submenu-btn';
            button.textContent = option.name;
            button.addEventListener('click', () => {
                this.handleAction(option.action, option.params, option);
            });
            this.uiManager.submenuOptions.appendChild(button);
        });

        this.uiManager.showSubmenu();
    }

    showSliderNavigation() {
        const arrowsContainer = document.querySelector('.slider-arrows-container');
        if (arrowsContainer) arrowsContainer.classList.remove('hidden');
    }

    hideSliderNavigation() {
        const arrowsContainer = document.querySelector('.slider-arrows-container');
        if (arrowsContainer) arrowsContainer.classList.add('hidden');
    }

    createMapSlider(levelBlocks, isClassicMode = false) {
        const sliderContainer = document.createElement('div');
        sliderContainer.className = 'map-slider-container';

        const slider = document.createElement('div');
        slider.className = 'map-slider';

        this.currentSlideIndex = 0;
        this.totalSlides = levelBlocks.length;
        this.isTransitioning = false;

        levelBlocks.forEach((option, index) => {
            const slide = document.createElement('div');
            slide.className = index === 0 ? 'map-slide active' : 'map-slide';
            slide.dataset.index = index;

            const levelBlockContainer = document.createElement('div');
            levelBlockContainer.className = 'level-block-container';

            // --- Banner Container ---
            const bannerContainer = document.createElement('div');
            bannerContainer.className = 'level-banner-container';

            if (isClassicMode) {
                // Set background image for banner
                if (option.banner) {
                    bannerContainer.style.backgroundImage = `url('${option.banner}')`;
                }
                // Banner row: [arrow][title][arrow]
                const bannerRow = document.createElement('div');
                bannerRow.className = 'banner-row';

                // Left arrow
                const leftArrow = document.createElement('button');
                leftArrow.className = 'banner-arrow banner-arrow-prev';
                leftArrow.innerHTML = '&#10094;';
                leftArrow.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.navigateSlider('prev');
                });

                // Banner title
                const bannerTitle = document.createElement('div');
                bannerTitle.className = 'banner-title';
                bannerTitle.textContent = option.name;

                // Right arrow
                const rightArrow = document.createElement('button');
                rightArrow.className = 'banner-arrow banner-arrow-next';
                rightArrow.innerHTML = '&#10095;';
                rightArrow.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.navigateSlider('next');
                });

                bannerRow.appendChild(leftArrow);
                bannerRow.appendChild(bannerTitle);
                bannerRow.appendChild(rightArrow);
                bannerContainer.appendChild(bannerRow);
            } else {
                // Non-classic: keep old structure
                if (option.banner) {
                    const bannerImg = document.createElement('img');
                    bannerImg.src = option.banner;
                    bannerImg.alt = `${option.name} banner`;
                    bannerContainer.appendChild(bannerImg);
                }
                const bannerTitle = document.createElement('div');
                bannerTitle.className = 'banner-title';
                bannerTitle.textContent = option.name;
                bannerContainer.appendChild(bannerTitle);
            }

            // --- Levels List ---
            const levelsList = document.createElement('div');
            levelsList.className = 'levels-list';
            const levelCards = [];

            option.levels.forEach((level, idx) => {
                const levelItem = document.createElement('button');
                levelItem.className = 'level-item';
                
                // Set character background image
                if (level.img) {
                    // Extract the character name or ID from the image path
                    const imgPath = level.img;
                    // Use the full background image from assets/character folder
                    levelItem.style.backgroundImage = `url('./assets/character/${imgPath.split('/').pop()}')`;
                }

                // Level content (name)
                const levelContent = document.createElement('div');
                levelContent.className = 'level-content';
                levelContent.textContent = level.name;
                levelItem.appendChild(levelContent);

                // Completion pucks/stars
                const completionContainer = document.createElement('div');
                completionContainer.className = 'level-completion';
                for (let i = 0; i < 3; i++) {
                    const puck = document.createElement('div');
                    puck.className = 'puck-star';
                    if (level.earned && level.earned > i) {
                        puck.classList.add('earned');
                    }
                    completionContainer.appendChild(puck);
                }
                levelItem.appendChild(completionContainer);

                levelItem.addEventListener('click', () => {
                    this.handleAction(level.action, level.params);
                });

                // Add highlight effect for classic mode
                if (isClassicMode) {
                    levelItem.addEventListener('mouseenter', () => {
                        levelCards.forEach((card, cardIdx) => {
                            if (cardIdx !== idx) {
                                card.classList.remove('highlighted');
                            } else {
                                card.classList.add('highlighted');
                            }
                        });
                    });
                    levelItem.addEventListener('mouseleave', () => {
                        levelCards.forEach(card => {
                            card.classList.remove('highlighted');
                        });
                    });
                }

                levelsList.appendChild(levelItem);
                levelCards.push(levelItem);
            });

            levelBlockContainer.appendChild(bannerContainer);
            levelBlockContainer.appendChild(levelsList);
            slide.appendChild(levelBlockContainer);
            slider.appendChild(slide);
        });

        sliderContainer.appendChild(slider);
        this.uiManager.submenuOptions.appendChild(sliderContainer);

        // Only add global arrows for non-classic mode
        if (!isClassicMode) {
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
    }

    navigateSlider(direction) {
        if (this.isTransitioning) return;
        this.isTransitioning = true;

        const transitionOverlay = document.querySelector('.transition-overlay');
        transitionOverlay.classList.add('active');

        setTimeout(() => {
            const newIndex = direction === 'prev'
                ? (this.currentSlideIndex - 1 + this.totalSlides) % this.totalSlides
                : (this.currentSlideIndex + 1) % this.totalSlides;
                
            this.goToSlide(newIndex);
            setTimeout(() => {
                transitionOverlay.classList.remove('active');
                this.isTransitioning = false;
            }, 600);
        }, 400);
    }

    goToSlide(index) {
        const slides = document.querySelectorAll('.map-slide');
        slides.forEach((slide, i) => {
            if (i === index) {
                slide.classList.add('active');
            } else {
                slide.classList.remove('active');
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
            default:
                console.error('Unknown action:', action);
        }
    }

    showAIDifficulty() {
        this.uiManager.clearSubmenuOptions();
        this.uiManager.setSubmenuTitle("SELECT DIFFICULTY");
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
        this.uiManager.clearSubmenuOptions();
        this.uiManager.setSubmenuTitle(`${option.name.toUpperCase()} - SELECT LEVEL`);
        if (option.banner) {
            this.uiManager.setSubmenuBackground(option.banner);
        }
        const levelContainer = document.createElement('div');
        levelContainer.className = 'level-selection-container';
        option.levels.forEach(level => {
            const levelButton = document.createElement('button');
            levelButton.className = 'level-btn';

            // Character image
            if (level.img) {
                const img = document.createElement('img');
                img.src = level.img;
                img.alt = level.name;
                img.className = 'level-character-img';
                levelButton.appendChild(img);
            }

            levelButton.textContent += level.name;
            levelButton.addEventListener('click', () => {
                this.handleAction(level.action, level.params);
            });
            levelContainer.appendChild(levelButton);
        });
        this.uiManager.submenuOptions.appendChild(levelContainer);
    }

    showStatsPage() {
        this.uiManager.clearSubmenuOptions();
        const statsContent = document.createElement('div');
        statsContent.className = 'page-content';
        const statsContainer = document.createElement('div');
        statsContainer.className = 'stats-container';
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
        this.uiManager.clearSubmenuOptions();
        const settingsContent = document.createElement('div');
        settingsContent.className = 'page-content';
        const settingsContainer = document.createElement('div');
        settingsContainer.className = 'settings-container';
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