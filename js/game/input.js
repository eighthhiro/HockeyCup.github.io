// input.js - Handles user input and controls

// Set up event listeners for keyboard input
function setupEventListeners(player1, player2, gameControlCallback) {
    window.addEventListener("keydown", (e) => {
        // First, check if it's a game control (space or pause)
        const isGameControl = gameControlCallback(e.key, true);
        if (!isGameControl) {
            handleKeyPress(e.key, true, player1, player2);
        }
    });

    window.addEventListener("keyup", (e) => {
        // First, check if it's a game control (space or pause)
        const isGameControl = gameControlCallback(e.key, false);
        if (!isGameControl) {
            handleKeyPress(e.key, false, player1, player2);
        }
    });

    // Listen for window resize
    window.addEventListener("resize", () => {
        // Import the resizeCanvas function from the window object
        // This avoids the circular dependency issue
        if (window.gameCore && typeof window.gameCore.resizeCanvas === 'function') {
            window.gameCore.resizeCanvas(window.innerWidth, window.innerHeight);
        }
    });
}

function handleKeyPress(key, isPressed, player1, player2) {
    // Player 1 controls
    if (key.toLowerCase() === player1.controls.up.toLowerCase()) player1.keys.up = isPressed;
    if (key.toLowerCase() === player1.controls.down.toLowerCase()) player1.keys.down = isPressed;
    if (key.toLowerCase() === player1.controls.left.toLowerCase()) player1.keys.left = isPressed;
    if (key.toLowerCase() === player1.controls.right.toLowerCase()) player1.keys.right = isPressed;
    
    // Player 2 controls - only process if not in AI mode
    if (window.gameCore && window.gameCore.gameMode !== "1vAI") {
        if (key === player2.controls.up) player2.keys.up = isPressed;
        if (key === player2.controls.down) player2.keys.down = isPressed;
        if (key === player2.controls.left) player2.keys.left = isPressed;
        if (key === player2.controls.right) player2.keys.right = isPressed;
    }
}

export {
    setupEventListeners,
    handleKeyPress
};