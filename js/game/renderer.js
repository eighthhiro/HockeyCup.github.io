// renderer.js - Handles all drawing and rendering

// Main drawing function that calls all other drawing functions
function draw(gameState) {
    const {
        ctx,
        canvas,
        puck,
        player1,
        player2,
        walls,
        logoLoaded,
        logo,
        player1Score,
        player2Score,
        gameStarted,
        isPaused,
        goalFlashTimer,
        lastScorer,
        GOAL_X,
        GOAL_WIDTH,
        GOAL_HEIGHT,
        GOAL_FLASH_DURATION
    } = gameState;

    drawTable(ctx, canvas, walls, logoLoaded, logo, GOAL_X, GOAL_WIDTH);
    drawGoals(ctx, GOAL_X, GOAL_WIDTH, GOAL_HEIGHT, canvas, goalFlashTimer, lastScorer, GOAL_FLASH_DURATION);
    
    // Draw game elements
    drawPuck(ctx, puck);
    drawPaddle(ctx, player1);
    drawPaddle(ctx, player2);
    drawScores(ctx, canvas, player1Score, player2Score, player1, player2);
    
    // Draw overlays if needed
    if (!gameStarted) {
        drawStartScreen(ctx, canvas, gameState.gameMode, gameState.aiDifficulty);
    } else if (isPaused) {
        drawPauseScreen(ctx, canvas);
    }
}

function drawTable(ctx, canvas, walls, logoLoaded, logo, GOAL_X, GOAL_WIDTH) {
    // Draw main background
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw playing surface
    ctx.fillStyle = "#222";
    ctx.fillRect(walls.thickness, walls.thickness, 
               canvas.width - walls.thickness * 2, 
               canvas.height - walls.thickness * 2);
    
    // Draw walls
    ctx.fillStyle = walls.color;
    
    // Left wall
    ctx.fillRect(0, 0, walls.thickness, canvas.height);
    
    // Right wall
    ctx.fillRect(canvas.width - walls.thickness, 0, walls.thickness, canvas.height);
    
    // Top wall (with goal cutout)
    ctx.fillRect(0, 0, GOAL_X, walls.thickness);
    ctx.fillRect(GOAL_X + GOAL_WIDTH, 0, canvas.width - GOAL_X - GOAL_WIDTH, walls.thickness);
    
    // Bottom wall (with goal cutout)
    ctx.fillRect(0, canvas.height - walls.thickness, GOAL_X, walls.thickness);
    ctx.fillRect(GOAL_X + GOAL_WIDTH, canvas.height - walls.thickness, 
               canvas.width - GOAL_X - GOAL_WIDTH, walls.thickness);
               
    // Draw center line and circle
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = canvas.width * 0.004;
    
    // Center line
    ctx.beginPath();
    ctx.moveTo(walls.thickness, canvas.height / 2);
    ctx.lineTo(canvas.width - walls.thickness, canvas.height / 2);
    ctx.stroke();
    
    // Center circle
    const circleRadius = canvas.width * 0.12;
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, circleRadius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Extend parallel lines to the full table width
    const lineOffset = circleRadius * 1.3; // Distance of lines from center
    
    if (logoLoaded) {
        // Calculate logo size to fit within the circle (80% of circle radius)
        const logoSize = circleRadius * 1.6;
        
        // Draw the logo centered in the circle
        ctx.save();
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, circleRadius * 0.8, 0, Math.PI * 2);
        ctx.clip();
        ctx.globalAlpha = 0.7;
        ctx.drawImage(
            logo, 
            canvas.width / 2 - logoSize / 2, 
            canvas.height / 2 - logoSize / 2, 
            logoSize, 
            logoSize
        );
        ctx.restore();
    }

    // Top parallel line - now extends to walls
    ctx.beginPath();
    ctx.moveTo(walls.thickness, canvas.height / 2 - lineOffset);
    ctx.lineTo(canvas.width - walls.thickness, canvas.height / 2 - lineOffset);
    ctx.stroke();
    
    // Bottom parallel line - now extends to walls
    ctx.beginPath();
    ctx.moveTo(walls.thickness, canvas.height / 2 + lineOffset);
    ctx.lineTo(canvas.width - walls.thickness, canvas.height / 2 + lineOffset);
    ctx.stroke();
    
    // Corner circles now closer to the middle
    const cornerRadius = canvas.width * 0.08;
    const cornerOffset = walls.thickness + canvas.width * 0.2;
    
    // Top-left corner circle
    ctx.beginPath();
    ctx.arc(cornerOffset, cornerOffset, cornerRadius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Top-right corner circle
    ctx.beginPath();
    ctx.arc(canvas.width - cornerOffset, cornerOffset, cornerRadius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Bottom-left corner circle
    ctx.beginPath();
    ctx.arc(cornerOffset, canvas.height - cornerOffset, cornerRadius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Bottom-right corner circle
    ctx.beginPath();
    ctx.arc(canvas.width - cornerOffset, canvas.height - cornerOffset, cornerRadius, 0, Math.PI * 2);
    ctx.stroke();
}

function drawGoals(ctx, GOAL_X, GOAL_WIDTH, GOAL_HEIGHT, canvas, goalFlashTimer, lastScorer, GOAL_FLASH_DURATION) {
    // Draw top goal (Player 2's goal)
    if (goalFlashTimer > 0 && lastScorer === 1) {
        // Flash green when Player 1 scores
        ctx.fillStyle = `rgba(0, 255, 0, ${goalFlashTimer/GOAL_FLASH_DURATION})`;
    } else {
        ctx.fillStyle = "rgba(255, 0, 0, 0.2)";
    }
    ctx.fillRect(GOAL_X, 0, GOAL_WIDTH, GOAL_HEIGHT);
    
    // Draw bottom goal (Player 1's goal)
    if (goalFlashTimer > 0 && lastScorer === 2) {
        // Flash green when Player 2 scores
        ctx.fillStyle = `rgba(0, 255, 0, ${goalFlashTimer/GOAL_FLASH_DURATION})`;
    } else {
        ctx.fillStyle = "rgba(0, 0, 255, 0.2)";
    }
    ctx.fillRect(GOAL_X, canvas.height - GOAL_HEIGHT, GOAL_WIDTH, GOAL_HEIGHT);
}

function drawPuck(ctx, puck) {
    // Draw puck shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.beginPath();
    ctx.arc(puck.x + 3, puck.y + 3, puck.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw puck
    ctx.fillStyle = puck.color;
    ctx.beginPath();
    ctx.arc(puck.x, puck.y, puck.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw puck detail rings
    ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
    ctx.lineWidth = puck.radius * 0.1;
    ctx.beginPath();
    ctx.arc(puck.x, puck.y, puck.radius * 0.7, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
    ctx.lineWidth = puck.radius * 0.05;
    ctx.beginPath();
    ctx.arc(puck.x, puck.y, puck.radius * 0.3, 0, Math.PI * 2);
    ctx.stroke();
}

function drawPaddle(ctx, player) {
    // Draw paddle shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.beginPath();
    ctx.arc(player.x + 3, player.y + 3, player.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw paddle base
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw paddle details
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius * 0.7, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw handle grip
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius * 0.3, 0, Math.PI * 2);
    ctx.fill();
}

function drawScores(ctx, canvas, player1Score, player2Score, player1, player2) {
    // Calculate font size based on canvas width
    const fontSize = canvas.width * 0.056;
    
    // Draw scores with shadow effect
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.textAlign = "center";
    
    // Draw shadows
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillText(`${player1Score}`, canvas.width / 4 + 2, canvas.height / 2 + fontSize/3);
    ctx.fillText(`${player2Score}`, (canvas.width / 4) * 3 + 2, canvas.height / 2 + fontSize/3);
    
    // Draw actual scores
    ctx.fillStyle = player1.color;
    ctx.fillText(`${player1Score}`, canvas.width / 4, canvas.height / 2 + fontSize/3);
    
    ctx.fillStyle = player2.color;
    ctx.fillText(`${player2Score}`, (canvas.width / 4) * 3, canvas.height / 2 + fontSize/3);
}

function drawStartScreen(ctx, canvas, gameMode, aiDifficulty) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const titleSize = canvas.width * 0.06;
    const textSize = canvas.width * 0.04;
    const smallTextSize = canvas.width * 0.032;
    
    ctx.fillStyle = "#fff";
    ctx.font = `${titleSize}px Arial`;
    ctx.textAlign = "center";
    ctx.fillText("AIR HOCKEY", canvas.width/2, canvas.height/2 - titleSize*1.5);
    
    ctx.font = `${textSize}px Arial`;
    ctx.fillText("Press SPACE to start", canvas.width/2, canvas.height/2);
    
    ctx.font = `${smallTextSize}px Arial`;
    ctx.fillText("Player 1: WASD keys", canvas.width/2, canvas.height/2 + textSize*1.5);
    
    if (gameMode === "1vAI") {
        ctx.fillText(`Player 2: AI (${aiDifficulty})`, canvas.width/2, canvas.height/2 + textSize*2.5);
    } else {
        ctx.fillText("Player 2: Arrow keys", canvas.width/2, canvas.height/2 + textSize*2.5);
    }
    
    ctx.fillText("Press P to pause", canvas.width/2, canvas.height/2 + textSize*3.5);
}

function drawPauseScreen(ctx, canvas) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const titleSize = canvas.width * 0.06;
    const textSize = canvas.width * 0.04;
    
    ctx.fillStyle = "#fff";
    ctx.font = `${titleSize}px Arial`;
    ctx.textAlign = "center";
    ctx.fillText("PAUSED", canvas.width/2, canvas.height/2);
    
    ctx.font = `${textSize}px Arial`;
    ctx.fillText("Press P to resume", canvas.width/2, canvas.height/2 + titleSize);
}

export {
    draw,
    drawTable,
    drawGoals,
    drawPuck,
    drawPaddle,
    drawScores,
    drawStartScreen,
    drawPauseScreen
};