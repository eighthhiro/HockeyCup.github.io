// lobby.js - Handles the lobby system and navigation

// Define the submenu options for each main menu item
const menuOptions = {
    classic: [
        { name: "Bar Game", action: "comingSoon", comingSoon: true },
        { name: "Arcade", action: "comingSoon", comingSoon: true },
        { name: "Tournament", action: "comingSoon", comingSoon: true }
    ],
    duels: [
        { name: "1 vs 1", action: "startGame", params: { mode: "1v1" } },
        { name: "1 vs AI", action: "showAIDifficulty"}
    ],
    stats: [], // Will be handled differently - direct page
    settings: [] // Will be handled differently - direct page
};

function showAIDifficulty() {
    // Clear existing options
    submenuOptions.innerHTML = '';
    
    // Set submenu title
    submenuTitle.textContent = "SELECT DIFFICULTY";
    
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
            startGame({ mode: "1vAI", difficulty: option.difficulty });
        });
        
        submenuOptions.appendChild(button);
    });
}

// Cache DOM elements
const lobby = document.getElementById('lobby');
const submenu = document.getElementById('submenu');
const gameContainer = document.getElementById('game-container');
const submenuTitle = document.getElementById('submenu-title');
const submenuOptions = document.getElementById('submenu-options');
const canvas = document.getElementById('gameCanvas');
const exitGameBtn = document.getElementById('exit-game');

// Add event listeners for menu buttons
document.querySelectorAll('.menu-btn').forEach(button => {
    button.addEventListener('click', () => {
        const menuType = button.getAttribute('data-menu');
        openSubmenu(menuType);
    });
});

// Add event listener for back button
document.querySelector('.back-btn').addEventListener('click', () => {
    showLobby();
});

// Add event listener for exit game button
exitGameBtn.addEventListener('click', () => {
    exitGame();
});

// Function to handle opening a submenu
function openSubmenu(menuType) {
    submenuTitle.textContent = menuType.toUpperCase();
    
    if (menuType === 'stats') {
        showStatsPage();
        return;
    }
    
    if (menuType === 'settings') {
        showSettingsPage();
        return;
    }
    
    // Clear existing options
    submenuOptions.innerHTML = '';
    
    // Add options based on the selected menu
    const options = menuOptions[menuType];
    options.forEach(option => {
        const button = document.createElement('button');
        button.className = option.comingSoon ? 'submenu-btn coming-soon-btn' : 'submenu-btn';
        button.textContent = option.name;
        
        if (option.comingSoon) {
            button.innerHTML += ' <span class="coming-soon">Coming Soon</span>';
        } else {
            button.addEventListener('click', () => {
                handleAction(option.action, option.params);
            });
        }
        
        submenuOptions.appendChild(button);
    });
    
    // Show submenu, hide lobby
    lobby.classList.remove('visible');
    lobby.classList.add('hidden');
    submenu.classList.remove('hidden');
    submenu.classList.add('visible');
}

// Function to handle actions from submenu options
function handleAction(action, params) {
    switch (action) {
        case 'startGame':
            startGame(params);
            break;
        case 'showAIDifficulty':
            showAIDifficulty();
            break;
        case 'comingSoon':
            // Do nothing, the button is already styled as coming soon
            break;
        default:
            console.error('Unknown action:', action);
    }
}

// Function to start the game
function startGame(params) {
    // Hide submenu and show game container
    submenu.classList.remove('visible');
    submenu.classList.add('hidden');
    gameContainer.classList.remove('hidden');
    gameContainer.classList.add('visible');
    
    // Initialize the game module
    initGame(params);
}

// Function to exit the game
function exitGame() {
    // Check if gameCore is available and request exit
    if (window.gameCore && typeof window.gameCore.requestExit === 'function') {
        window.gameCore.requestExit();
    }
    
    // Hide game container and show lobby
    gameContainer.classList.remove('visible');
    gameContainer.classList.add('hidden');
    showLobby();
}

// Function to show the lobby
function showLobby() {
    submenu.classList.remove('visible');
    submenu.classList.add('hidden');
    lobby.classList.remove('hidden');
    lobby.classList.add('visible');
    
    // Clear submenu options
    submenuOptions.innerHTML = '';
}

// Function to show the stats page
function showStatsPage() {
    // Clear existing options
    submenuOptions.innerHTML = '';
    
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
    submenuOptions.appendChild(statsContent);
    
    // Show submenu, hide lobby
    lobby.classList.remove('visible');
    lobby.classList.add('hidden');
    submenu.classList.remove('hidden');
    submenu.classList.add('visible');
}

// Function to show the settings page
function showSettingsPage() {
    // Clear existing options
    submenuOptions.innerHTML = '';
    
    // Create settings page content
    const settingsContent = document.createElement('div');
    settingsContent.className = 'page-content';
    
    const settingsContainer = document.createElement('div');
    settingsContainer.className = 'settings-container';
    
    // Add some settings options (removed difficulty option)
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
    submenuOptions.appendChild(settingsContent);
    
    // Show submenu, hide lobby
    lobby.classList.remove('visible');
    lobby.classList.add('hidden');
    submenu.classList.remove('hidden');
    submenu.classList.add('visible');
}

// Function to initialize the game with specific parameters
function initGame(params) {
    // Grab the canvas element
    const canvas = document.getElementById('gameCanvas');
    
    // This function will initialize your existing game code
    // It dynamically imports the game module to start the game
    import('./game/main.js').then(module => {
        // Call the initializeGame function from the module
        if (typeof module.initializeGame === 'function') {
            module.initializeGame(canvas, params);
            console.log(`Starting game with mode: ${params.mode}${params.difficulty ? ', difficulty: ' + params.difficulty : ''}`);
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

// Initialize the lobby system
function init() {
    // Any additional initialization for the lobby can go here
    console.log('Lobby system initialized');
}

// Start the lobby
init();