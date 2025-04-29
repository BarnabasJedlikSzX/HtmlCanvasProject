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
var betweenLevels = false;

for (var row = 0; row < rows; row++) {
    Mine[row] = [];
    for (var col = 0; col < cols; col++) {
        Mine[row][col] = null;
    }
}

function generateMine() {
    for (var row = 0; row < rows; row++) {
        for (var col = 0; col < cols; col++) {
            Mine[row][col] = null;
        }
    }

    var startCol = 2;
    var endCol = cols - 2;
    var startRow = Math.floor(platformY / tileSize) + 1;
    var endRow = rows - 2;

    var positions = [];
    var positionCount = 0;
    for (var row = startRow; row <= endRow; row++) {
        for (var col = startCol; col <= endCol; col++) {
            positions[positionCount] = { row: row, col: col };
            positionCount = positionCount + 1;
        }
    }

    for (var i = positionCount - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tempRow = positions[i].row;
        var tempCol = positions[i].col;
        positions[i].row = positions[j].row;
        positions[i].col = positions[j].col;
        positions[j].row = tempRow;
        positions[j].col = tempCol;
    }

    var goldCount = Math.floor(Math.random() * 3) + 6;
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
            value = 15;
        } else if (sizeRand < 0.6) {
            size = 'medium';
            mass = 2;
            value = 30;
        } else {
            size = 'large';
            mass = 4;
            value = 60;
        }
        Mine[posRow][posCol] = new Item('gold', size, mass, value);
    }

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
    hook.update(hookStartX, hookStartY, canvas.width, canvas.height);
    var hookEnd = hook.getHookEnd();
    var hookEndX = hookEnd.x;
    var hookEndY = hookEnd.y;

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

    if (hook.state === 2 && hook.caughtItem) {
        var x = hookEndX - (tileSize / 2);
        var y = hookEndY;
        if (hook.caughtItem.type === 'stone') {
            var scale = hook.caughtItem.size === 'small' ? 1.0 : hook.caughtItem.size === 'medium' ? 1.5 : 2.0;
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
        } else if (hook.caughtItem.type === 'gold') {
            var scale = hook.caughtItem.size === 'small' ? 1.0 : hook.caughtItem.size === 'medium' ? 1.5 : 2.0;
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
        } else if (hook.caughtItem.type === 'ruby') {
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

function updateHook() {
    hook.swing();

    var hookStartX = playerX * tileSize + 12.5;
    var hookStartY = platformY;
    hook.update(hookStartX, hookStartY, canvas.width, canvas.height);

    if (hook.state === 1) {
        var hookEnd = hook.getHookEnd();
        var hookEndX = hookEnd.x;
        var hookEndY = hookEnd.y;
        var hookX = hookEndX / tileSize;
        var hookY = hookEndY / tileSize;
        var gridX = Math.floor(hookX);
        var gridY = Math.floor(hookY);

        var closestItem = null;
        var closestDistance = Infinity;
        var closestRow = -1;
        var closestCol = -1;

        for (var dy = -1; dy <= 1; dy++) {
            for (var dx = -1; dx <= 1; dx++) {
                var checkX = gridX + dx;
                var checkY = gridY + dy;
                if (checkX >= 0 && checkX < cols && checkY >= 0 && checkY < rows && Mine[checkY][checkX]) {
                    var itemCenterX = (checkX + 0.5) * tileSize;
                    var itemCenterY = (checkY + 0.5) * tileSize;
                    var distance = Math.sqrt(
                        Math.pow(hookEndX - itemCenterX, 2) + Math.pow(hookEndY - itemCenterY, 2)
                    );
                    if (distance < closestDistance) {
                        closestDistance = distance;
                        closestItem = Mine[checkY][checkX];
                        closestRow = checkY;
                        closestCol = checkX;
                    }
                }
            }
        }

        if (closestItem) {
            hook.caughtItem = closestItem;
            score = score + hook.caughtItem.value;
            Mine[closestRow][closestCol] = null;
            hook.state = 2;
        }
    }
}

function updateTime() {
    if (gameOver === false && !betweenLevels) {
        time = time - (1 / 60);
        if (time <= 0 || Mine.length === 0) {
            if (score >= targetScore) {
                betweenLevels = true;
                while (betweenLevels) {
                    alert('Level complete!');
                    betweenLevels = false;
                }
                if (!betweenLevels){
                    level = level + 1;
                    targetScore = targetScore + 50;
                    time = 60;
                    generateMine();
                }
            } else {
                gameOver = true;
                alert('Time Up!');
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
    }
});

document.addEventListener('keydown', function(e) {
    if (gameOver || betweenLevels) return;
    if (e.code === 'Space') {
        if (hook.state === 0) {
            hook.shoot();
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
    ctx.fillText('Score: ' + score, 10, 20);
    ctx.fillText('Target: ' + targetScore, 150, 20);
    ctx.fillText('Level: ' + level, 300, 20);
    ctx.fillText('Time: ' + Math.floor(time), 400, 20);
}

generateMine();
setInterval(gameLoop, 1000 / 60);