import { Item, Hook } from './classes.js';

var canvas = document.getElementById('gameCanvas');
var ctx = canvas.getContext('2d');

var tileSize = 25;
var cols = canvas.width / tileSize;
var rows = canvas.height / tileSize;

var Mine = [];
var playerX = cols / 2;
var platformY = 100;
var hook = new Hook();
var score = 0;
var targetScore = 100;
var level = 1;
var time = 60;
var gameOver = false;
var tntCount = 0; // Track number of TNT
var betweenLevels = false; // Flag for level transition

// Initialize the Mine array
for (var row = 0; row < rows; row++) {
    Mine[row] = [];
    for (var col = 0; col < cols; col++) {
        Mine[row][col] = null;
    }
}

function generateMine() {
    // Clear the mine
    for (var row = 0; row < rows; row++) {
        for (var col = 0; col < cols; col++) {
            Mine[row][col] = null;
        }
    }

    var startCol = 2;
    var endCol = cols - 2;
    var startRow = Math.floor(platformY / tileSize) + 1;
    var endRow = rows - 2;

    // Create a list of available positions
    var positions = [];
    var positionCount = 0;
    for (var row = startRow; row <= endRow; row++) {
        for (var col = startCol; col <= endCol; col++) {
            positions[positionCount] = { row: row, col: col };
            positionCount = positionCount + 1;
        }
    }

    // Shuffle the positions
    for (var i = positionCount - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tempRow = positions[i].row;
        var tempCol = positions[i].col;
        positions[i].row = positions[j].row;
        positions[i].col = positions[j].col;
        positions[j].row = tempRow;
        positions[j].col = tempCol;
    }

    // Place 6-8 gold items
    var goldCount = Math.floor(Math.random() * 3) + 6; // 6, 7, or 8
    for (var i = 0; i < goldCount; i++) {
        if (i >= positionCount) break;
        var posRow = positions[i].row;
        var posCol = positions[i].col;
        var sizeRand = Math.random();
        var size = '';
        var mass = 0;
        var value = 0;
        if (sizeRand < 0.3) {
            size = 'small';
            mass = 1;
            value = 15; // Increased from 10
        } else if (sizeRand < 0.6) {
            size = 'medium';
            mass = 2;
            value = 30; // Increased from 20
        } else {
            size = 'large';
            mass = 4;
            value = 60; // Increased from 40
        }
        Mine[posRow][posCol] = new Item('gold', size, mass, value);
    }

    // Place 3-4 stone items
    var stoneCount = Math.floor(Math.random() * 2) + 3; // 3 or 4
    for (var i = goldCount; i < goldCount + stoneCount; i++) {
        if (i >= positionCount) break;
        var posRow = positions[i].row;
        var posCol = positions[i].col;
        var sizeRand = Math.random();
        var size = '';
        var mass = 0;
        var value = 0;
        if (sizeRand < 0.3) {
            size = 'small';
            mass = 3;
            value = 1;
        } else if (sizeRand < 0.6) {
            size = 'medium';
            mass = 5;
            value = 2;
        } else {
            size = 'large';
            mass = 8;
            value = 3;
        }
        Mine[posRow][posCol] = new Item('stone', size, mass, value);
    }

    // Place 1-2 rubies starting from level 2
    if (level > 1) {
        var rubyCount = Math.floor(Math.random() * 2) + 1; // 1 or 2
        for (var i = goldCount + stoneCount; i < goldCount + stoneCount + rubyCount; i++) {
            if (i >= positionCount) break;
            var posRow = positions[i].row;
            var posCol = positions[i].col;
            Mine[posRow][posCol] = new Item('ruby', 'small', 1, 50);
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

            if (Mine[row][col] && Mine[row][col].type === 'stone') {
                var scale = Mine[row][col].size === 'small' ? 1.0 : Mine[row][col].size === 'medium' ? 1.5 : 2.0;
                ctx.fillStyle = '#808080';
                ctx.beginPath();
                ctx.moveTo(x + 5 * scale, y + 5 * scale);
                ctx.lineTo(x + 20 * scale, y + 5 * scale);
                ctx.lineTo(x + 22 * scale, y + 10 * scale);
                ctx.lineTo(x + 15 * scale, y + 20 * scale);
                ctx.lineTo(x + 8 * scale, y + 18 * scale);
                ctx.lineTo(x + 3 * scale, y + 10 * scale);
                ctx.closePath();
                ctx.fill();
                ctx.strokeStyle = '#666';
                ctx.stroke();
            } else if (Mine[row][col] && Mine[row][col].type === 'gold') {
                var scale = Mine[row][col].size === 'small' ? 1.0 : Mine[row][col].size === 'medium' ? 1.5 : 2.0;
                ctx.fillStyle = '#FFD700';
                ctx.beginPath();
                ctx.moveTo(x + 8 * scale, y + 5 * scale);
                ctx.lineTo(x + 17 * scale, y + 5 * scale);
                ctx.lineTo(x + 20 * scale, y + 10 * scale);
                ctx.lineTo(x + 15 * scale, y + 15 * scale);
                ctx.lineTo(x + 10 * scale, y + 15 * scale);
                ctx.lineTo(x + 5 * scale, y + 10 * scale);
                ctx.closePath();
                ctx.fill();
                ctx.strokeStyle = '#DAA520';
                ctx.stroke();
                ctx.fillStyle = '#FFFFE0';
                ctx.fillRect(x + 10 * scale, y + 7 * scale, 3 * scale, 3 * scale);
            } else if (Mine[row][col] && Mine[row][col].type === 'ruby') {
                ctx.fillStyle = '#FF4040';
                ctx.beginPath();
                ctx.moveTo(x + 12, y + 5);
                ctx.lineTo(x + 17, y + 12);
                ctx.lineTo(x + 12, y + 20);
                ctx.lineTo(x + 7, y + 12);
                ctx.closePath();
                ctx.fill();
                ctx.strokeStyle = '#CC0000';
                ctx.stroke();
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(x + 11, y + 9, 2, 2);
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

    // Draw TNT icons next to the house
    for (var i = 0; i < tntCount; i++) {
        var tntX = houseX + 50 + (i * 15);
        var tntY = houseY + 20;
        ctx.fillStyle = '#FF4500';
        ctx.fillRect(tntX, tntY, 10, 15);
        ctx.fillStyle = '#808080';
        ctx.fillRect(tntX + 3, tntY - 5, 4, 5);
        ctx.fillStyle = '#FFFF00';
        ctx.fillRect(tntX + 4, tntY - 3, 2, 3);
    }
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

    var hookStartX = minerX + 12.5;
    var hookStartY = platformY;
    var hookEndX = hookStartX + Math.sin(hook.angle) * hook.length;
    var hookEndY = hookStartY + Math.cos(hook.angle) * hook.length;

    ctx.beginPath();
    ctx.moveTo(hookStartX, hookStartY);
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

function updateHook() {
    hook.swing();

    var hookStartX = playerX * tileSize + 12.5;
    var hookStartY = platformY;
    hook.update(hookStartX, hookStartY, canvas.width, canvas.height);

    if (hook.state === 1 || hook.state === 2) {
        var hookEndX = hookStartX + Math.sin(hook.angle) * hook.length;
        var hookEndY = hookStartY + Math.cos(hook.angle) * hook.length;
        var hookX = hookEndX / tileSize;
        var hookY = hookEndY / tileSize;
        var gridX = Math.floor(hookX);
        var gridY = Math.floor(hookY);

        if (gridX >= 0 && gridX < cols && gridY >= 0 && gridY < rows && Mine[gridY][gridX]) {
            hook.caughtItem = Mine[gridY][gridX];
            score = score + hook.caughtItem.value;
            Mine[gridY][gridX] = null;
            hook.state = 2;
        }
    }
}

function updateTime() {
    if (gameOver === false && !betweenLevels) {
        time = time - (1 / 60);
        if (time <= 0) {
            if (score >= targetScore) {
                betweenLevels = true;
                // Prompt to buy TNT
                var tntToBuy = 0;
                var canBuyMore = true;
                while (canBuyMore) {
                    var response = prompt('Level complete! You have ' + score + ' money. Buy TNT? (50 money each, type number of TNT to buy, 0 to continue):');
                    tntToBuy = parseInt(response);
                    if (isNaN(tntToBuy) || tntToBuy < 0) {
                        alert('Please enter a valid number.');
                        continue;
                    }
                    var totalCost = tntToBuy * 50;
                    if (totalCost > score) {
                        alert('Not enough money! You can buy up to ' + Math.floor(score / 50) + ' TNT.');
                    } else {
                        tntCount = tntCount + tntToBuy;
                        score = score - totalCost;
                        canBuyMore = false;
                    }
                }
                // Proceed to next level
                level = level + 1;
                targetScore = targetScore + 50;
                time = 60;
                generateMine();
                betweenLevels = false;
            } else {
                gameOver = true;
                alert('Time Up! Score: ' + score);
            }
        }
    }
}

document.addEventListener('keydown', function(e) {
    if (gameOver || betweenLevels) return;

    if (e.code === 'ArrowLeft' && playerX > 0) {
        playerX = playerX - 1;
    } else if (e.code === 'ArrowRight' && playerX < cols - 1) {
        playerX = playerX + 1;
    }
});

document.addEventListener('click', function(e) {
    if (gameOver || betweenLevels) return;
    if (hook.state === 0) {
        hook.shoot();
    } else if (hook.state === 2 && tntCount > 0) {
        tntCount = tntCount - 1;
        hook.detonateTNT();
    }
});

document.addEventListener('keydown', function(e) {
    if (gameOver || betweenLevels) return;
    if (e.code === 'Space') {
        if (hook.state === 0) {
            hook.shoot();
        } else if (hook.state === 2 && tntCount > 0) {
            tntCount = tntCount - 1;
            hook.detonateTNT();
        }
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

    if (betweenLevels) {
        ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '30px Arial';
        ctx.fillText('Level ' + (level - 1) + ' Complete!', canvas.width/2 - 100, canvas.height/2 - 20);
        ctx.fillText('Money: ' + score, canvas.width/2 - 50, canvas.height/2 + 20);
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
    ctx.fillText('TNT: ' + tntCount, 450, 20);
}

generateMine();
setInterval(gameLoop, 1000 / 60);