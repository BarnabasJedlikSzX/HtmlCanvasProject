var canvas = document.getElementById('gameCanvas');
var ctx = canvas.getContext('2d');

var tileSize = 25;
var cols = canvas.width / tileSize;
var rows = canvas.height / tileSize;

var Mine = [];
var playerX = cols / 2;
var platformY = 100;
var hookLength = 0;
var hookSpeed = 3;
var isSwinging = false;
var hookState = 0;
var score = 0;
var targetScore = 100;
var level = 1;
var time = 60;
var gameOver = false;

function generateMine() {
    for (var row = 0; row < rows; row++) {
        Mine[row] = [];
        for (var col = 0; col < cols; col++) {
            if (row * tileSize < platformY) {
                Mine[row][col] = 'empty';
            } else {
                var rand = Math.random();
                if (rand < 0.05) {
                    Mine[row][col] = 'gold';
                } else if (rand < 0.10) {
                    Mine[row][col] = 'stone';
                } else if (rand < 0.12) {
                    Mine[row][col] = 'skull';
                } else if (rand < 0.13) {
                    Mine[row][col] = 'mystery';
                } else {
                    Mine[row][col] = 'empty';
                }
            }
        }
    }
}

function drawBackground() {
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, platformY);

    ctx.fillStyle = '#D2B48C';
    ctx.fillRect(0, platformY, canvas.width, canvas.height - platformY);

    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, platformY - 10, canvas.width, 10);

    ctx.fillStyle = '#6B4E31';
    for (var i = 0; i < canvas.width; i = i + 10) {
        ctx.fillRect(i, platformY - 10, 2, 10);
    }
    ctx.fillRect(0, platformY - 10, canvas.width, 2);
    ctx.fillRect(0, platformY - 2, canvas.width, 2);

    ctx.fillStyle = '#4A2C2A';
    for (var i = 20; i < canvas.width - 20; i = i + 50) {
        ctx.fillRect(i, platformY, 5, 10);
    }
}

function drawMine() {
    for (var row = 0; row < rows; row++) {
        for (var col = 0; col < cols; col++) {
            var x = col * tileSize;
            var y = row * tileSize;
            if (y < platformY) continue;

            if (Mine[row][col] === 'stone') {
                ctx.fillStyle = '#808080';
                ctx.beginPath();
                ctx.arc(x + tileSize/2, y + tileSize/2, tileSize/2 - 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#666';
                ctx.stroke();
            } else if (Mine[row][col] === 'gold') {
                ctx.fillStyle = '#FFD700';
                ctx.beginPath();
                ctx.arc(x + tileSize/2, y + tileSize/2, tileSize/2 - 5, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#DAA520';
                ctx.stroke();
            } else if (Mine[row][col] === 'skull') {
                ctx.fillStyle = '#FFF';
                ctx.beginPath();
                ctx.arc(x + tileSize/2, y + tileSize/2, tileSize/2 - 5, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#000';
                ctx.beginPath();
                ctx.arc(x + tileSize/2 - 5, y + tileSize/2 - 3, 3, 0, Math.PI * 2);
                ctx.arc(x + tileSize/2 + 5, y + tileSize/2 - 3, 3, 0, Math.PI * 2);
                ctx.fill();
            } else if (Mine[row][col] === 'mystery') {
                ctx.fillStyle = '#FF69B4';
                ctx.beginPath();
                ctx.arc(x + tileSize/2, y + tileSize/2, tileSize/2 - 5, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#FFF';
                ctx.font = '12px Arial';
                ctx.fillText('?', x + tileSize/2 - 3, y + tileSize/2 + 4);
            }
        }
    }
}

function drawDecorations() {
    var houseX = canvas.width - 100;
    var houseY = platformY - 60;

    ctx.fillStyle = '#DEB887';
    ctx.fillRect(houseX, houseY + 20, 40, 30);

    ctx.fillStyle = '#8B0000';
    ctx.fillRect(houseX - 5, houseY, 50, 20);

    ctx.fillStyle = '#4A2C2A';
    ctx.fillRect(houseX + 18, houseY + 30, 10, 20);

    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(houseX + 5, houseY + 25, 8, 8);
    ctx.fillStyle = '#000';
    ctx.strokeRect(houseX + 5, houseY + 25, 8, 8);

    ctx.fillStyle = '#808080';
    ctx.fillRect(houseX + 35, houseY - 5, 5, 5);
}

function drawPlayer() {
    var minerX = playerX * tileSize;
    var minerY = platformY - 35;

    drawDecorations();

    ctx.fillStyle = '#FFD700';
    ctx.fillRect(minerX + 3, minerY - 7, 19, 7);
    ctx.fillStyle = '#DAA520';
    ctx.fillRect(minerX + 1, minerY, 23, 4);

    ctx.fillStyle = '#FFDAB9';
    ctx.fillRect(minerX + 5, minerY + 4, 15, 9);
    ctx.fillStyle = '#000';
    ctx.fillRect(minerX + 7, minerY + 6, 3, 3);
    ctx.fillRect(minerX + 15, minerY + 6, 3, 3);

    ctx.fillStyle = '#4169E1';
    ctx.fillRect(minerX + 3, minerY + 13, 19, 13);
    ctx.fillStyle = '#000080';
    ctx.fillRect(minerX + 3, minerY + 13, 4, 13);
    ctx.fillRect(minerX + 18, minerY + 13, 4, 13);

    ctx.fillStyle = '#FFDAB9';
    ctx.fillRect(minerX + 1, minerY + 13, 4, 7);
    ctx.fillRect(minerX + 20, minerY + 13, 4, 7);
    ctx.fillStyle = '#4169E1';
    ctx.fillRect(minerX + 1, minerY + 13, 4, 4);
    ctx.fillRect(minerX + 20, minerY + 13, 4, 4);

    ctx.fillStyle = '#8B4513';
    ctx.fillRect(minerX + 5, minerY + 26, 6, 7);
    ctx.fillRect(minerX + 14, minerY + 26, 6, 7);

    if (isSwinging) {
        var hookEndX = minerX + 12.5;
        var hookEndY = platformY + hookLength;

        ctx.beginPath();
        ctx.moveTo(minerX + 12.5, platformY);
        ctx.lineTo(hookEndX, hookEndY);
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#C0C0C0';
        ctx.fillRect(hookEndX - 5, hookEndY, 10, 4);
        ctx.fillStyle = '#A9A9A9';
        ctx.fillRect(hookEndX - 5, hookEndY + 4, 3, 4);
        ctx.fillRect(hookEndX + 2, hookEndY + 4, 3, 4);
        ctx.fillStyle = '#FF4500';
        ctx.fillRect(hookEndX - 2, hookEndY + 1, 4, 2);
    }
}

function updateHook() {
    if (isSwinging) {
        if (hookState === 1) {
            hookLength = hookLength + hookSpeed;
            if (hookLength > canvas.height - platformY - 20) {
                hookState = 2;
            }
        } else if (hookState === 2) {
            hookLength = hookLength - hookSpeed;
            if (hookLength <= 0) {
                isSwinging = false;
                hookState = 0;
            }
        }

        var hookX = playerX;
        var hookY = (platformY + hookLength) / tileSize;
        var gridX = Math.floor(hookX);
        var gridY = Math.floor(hookY);

        if (gridX >= 0 && gridX < cols && gridY >= 0 && gridY < rows) {
            if (Mine[gridY][gridX] === 'gold') {
                score = score + 10;
                Mine[gridY][gridX] = 'empty';
                hookState = 2;
            } else if (Mine[gridY][gridX] === 'stone') {
                hookState = 2;
            } else if (Mine[gridY][gridX] === 'skull') {
                score = score - 5;
                Mine[gridY][gridX] = 'empty';
                hookState = 2;
            } else if (Mine[gridY][gridX] === 'mystery') {
                var rand = Math.random();
                if (rand > 0.5) {
                    score = score + 20;
                } else {
                    score = score - 10;
                }
                Mine[gridY][gridX] = 'empty';
                hookState = 2;
            }
        }
    }
}

function updateTime() {
    if (gameOver === false) {
        time = time - (1 / 60);
        if (time <= 0) {
            gameOver = true;
            alert('Time Up! Score: ' + score);
        }
    }
}

document.addEventListener('keydown', function(e) {
    if (gameOver) return;

    if (e.code === 'ArrowLeft' && playerX > 0) {
        playerX = playerX - 1;
    } else if (e.code === 'ArrowRight' && playerX < cols - 1) {
        playerX = playerX + 1;
    } else if (e.code === 'Space' && !isSwinging) {
        isSwinging = true;
        hookState = 1;
        hookLength = 0;
    }
});

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    drawMine();

    if (gameOver) {
        ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '40px Arial';
        ctx.fillText('Game Over', canvas.width/2 - 80, canvas.height/2);
        return;
    }

    updateHook();
    updateTime();
    drawPlayer();

    ctx.fillStyle = '#FFD700';
    ctx.fillRect(0, 0, canvas.width, 30);
    ctx.fillStyle = 'black';
    ctx.font = '16px Arial';
    ctx.fillText('Money: ' + score, 10, 20);
    ctx.fillText('Target: ' + targetScore, 150, 20);
    ctx.fillText('Level: ' + level, 300, 20);
    ctx.fillText('Time: ' + Math.floor(time), 400, 20);
}

generateMine();
setInterval(gameLoop, 1000 / 60);