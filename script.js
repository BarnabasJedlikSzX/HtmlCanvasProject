import { Item, Hook, Particle } from './classes.js';

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
var time = 90;
var gameOver = false;
var betweenLevels = false;
var tntCount = 0;
var purchaseParticles = [];
var tntButtonGlow = 0;
var hookButtonGlow = 0;
var continueButtonPulse = 0;
var hookUpgradePrices = [100, 350, 750];

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

    var stoneCount = Math.floor(Math.random() * 2) + 3;
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
        var rubyCount = Math.floor(Math.random() * 2) + 1;
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

    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.arc(50, 30, 20, 0, Math.PI * 2);
    ctx.arc(70, 30, 25, 0, Math.PI * 2);
    ctx.arc(90, 30, 20, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(200, 50, 15, 0, Math.PI * 2);
    ctx.arc(220, 50, 20, 0, Math.PI * 2);
    ctx.arc(240, 50, 15, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(350, 20, 25, 0, Math.PI * 2);
    ctx.arc(370, 20, 30, 0, Math.PI * 2);
    ctx.arc(390, 20, 25, 0, Math.PI * 2);
    ctx.arc(410, 20, 20, 0, Math.PI * 2);
    ctx.fill();

    var gradient = ctx.createLinearGradient(0, platformY, 0, canvas.height);
    gradient.addColorStop(0, '#D2B48C');
    gradient.addColorStop(1, '#8B5A2B');
    ctx.fillStyle = gradient;
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

            if (Mine[row][col]) {
                var scale = Mine[row][col].size === 'small' ? 1.0 : Mine[row][col].size === 'medium' ? 1.5 : 2.0;
                ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                ctx.beginPath();
                ctx.ellipse(x + 12.5 * scale, y + 25 * scale, 10 * scale, 4 * scale, 0, 0, Math.PI * 2);
                ctx.fill();
            }

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

    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(minerX + 12.5, minerY + 35, 10, 4, 0, 0, Math.PI * 2);
    ctx.fill();

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

    ctx.fillStyle = hook.getColor();
    ctx.fillRect(hookEndX - 5, hookEndY, 10, 4);
    ctx.fillStyle = hook.upgradeLevel === 0 ? '#A9A9A9' : hook.getColor();
    ctx.fillRect(hookEndX - 5, hookEndY + 4, 3, 4);
    ctx.fillRect(hookEndX + 2, hookEndY + 4, 3, 4);
    ctx.fillStyle = '#FF4500';
    ctx.fillRect(hookEndX - 2, hookEndY + 1, 4, 2);

    hook.particles.forEach(p => p.draw(ctx));

    if (hook.state === 2 && hook.caughtItem) {
        var x = hookEndX - (tileSize / 2);
        var y = hookEndY;
        var scale = hook.caughtItem.size === 'small' ? 1.0 : hook.caughtItem.size === 'medium' ? 1.5 : 2.0;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(x + 12.5 * scale, y + 25 * scale, 10 * scale, 4 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

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

function checkAllItemsCollected() {
    for (var row = 0; row < rows; row++) {
        for (var col = 0; col < cols; col++) {
            if (Mine[row][col] !== null) {
                return false;
            }
        }
    }
    return true;
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

        var closestItem = null;
        var closestRow = -1;
        var closestCol = -1;

        for (var row = 0; row < rows; row++) {
            for (var col = 0; col < cols; col++) {
                if (Mine[row][col]) {
                    var item = Mine[row][col];
                    var scale = item.size === 'small' ? 1.0 : item.size === 'medium' ? 1.5 : 2.0;
                    var itemX = col * tileSize;
                    var itemY = row * tileSize;
                    var hitboxWidth, hitboxHeight, hitboxX, hitboxY;

                    if (item.type === 'stone') {
                        hitboxX = itemX + 3 * scale;
                        hitboxY = itemY + 5 * scale;
                        hitboxWidth = (22 * scale) - (3 * scale);
                        hitboxHeight = (20 * scale) - (5 * scale);
                    } else if (item.type === 'gold') {
                        hitboxX = itemX + 5 * scale;
                        hitboxY = itemY + 5 * scale;
                        hitboxWidth = (20 * scale) - (5 * scale);
                        hitboxHeight = (15 * scale) - (5 * scale);
                    } else if (item.type === 'ruby') {
                        hitboxX = itemX + 7;
                        hitboxY = itemY + 5;
                        hitboxWidth = 17 - 7;
                        hitboxHeight = 20 - 5;
                    }

                    if (
                        hookEndX >= hitboxX &&
                        hookEndX <= hitboxX + hitboxWidth &&
                        hookEndY >= hitboxY &&
                        hookEndY <= hitboxY + hitboxHeight
                    ) {
                        closestItem = item;
                        closestRow = row;
                        closestCol = col;
                        break;
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

    if (hook.state === 2 && hook.caughtItem) {
        var hookEnd = hook.getHookEnd();
        var particleColor = hook.caughtItem.type === 'gold' ? '#FFD700' : hook.caughtItem.type === 'stone' ? '#808080' : '#FF4040';
        if (Math.random() < 0.3) {
            for (var i = 0; i < 3; i++) {
                hook.particles.push(new Particle(hookEnd.x, hookEnd.y, particleColor));
            }
        }
    }

    if (checkAllItemsCollected() && !betweenLevels && !gameOver) {
        betweenLevels = true;
    }
}

function updateTime() {
    if (gameOver === false && !betweenLevels) {
        time = time - (1 / 90);
        if (time <= 0 || checkAllItemsCollected() == true) {
            if (score >= targetScore) {
                betweenLevels = true;
            } else {
                gameOver = true;
            }
        }
    }
}

function drawLevelEndScreen() {
    var gradient = ctx.createLinearGradient(50, 50, 50, 400);
    gradient.addColorStop(0, '#8B4513');
    gradient.addColorStop(1, '#5A2E0F');
    ctx.fillStyle = gradient;
    ctx.fillRect(50, 50, 400, 350);

    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 5;
    ctx.strokeRect(50, 50, 400, 350);

    ctx.font = '30px Arial';
    ctx.fillStyle = '#FFD700';
    ctx.textAlign = 'center';
    ctx.fillText('Level ' + (level) + ' Complete!', canvas.width/2, 100);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillText('Level ' + (level) + ' Complete!', canvas.width/2 + 2, 102);

    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(200, 140, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFE0';
    ctx.fillRect(198, 138, 4, 4);
    ctx.font = '20px Arial';
    ctx.fillStyle = '#FFD700';
    ctx.fillText('Money: ' + score, 250, 145);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillText('Money: ' + score, 252, 147);

    ctx.fillStyle = '#808080';
    ctx.fillRect(70, 70, 20, 5);
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(80, 65, 5, 15);

    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.moveTo(420, 70);
    ctx.lineTo(430, 70);
    ctx.lineTo(435, 80);
    ctx.lineTo(425, 85);
    ctx.lineTo(415, 80);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(410, 90);
    ctx.lineTo(420, 90);
    ctx.lineTo(425, 100);
    ctx.lineTo(415, 105);
    ctx.lineTo(405, 100);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#808080';
    ctx.fillRect(60, 350, 15, 20);
    ctx.fillStyle = '#FFFF00';
    ctx.fillRect(62, 352, 11, 10);
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.moveTo(60, 350);
    ctx.lineTo(67, 340);
    ctx.lineTo(75, 350);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#FF4040';
    ctx.beginPath();
    ctx.moveTo(420, 360);
    ctx.lineTo(430, 360);
    ctx.lineTo(435, 370);
    ctx.lineTo(425, 375);
    ctx.lineTo(415, 370);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#00FFFF';
    ctx.beginPath();
    ctx.moveTo(410, 370);
    ctx.lineTo(420, 370);
    ctx.lineTo(425, 380);
    ctx.lineTo(415, 385);
    ctx.lineTo(405, 380);
    ctx.closePath();
    ctx.fill();

    var tntGradient = ctx.createLinearGradient(75, 180, 75, 230);
    tntGradient.addColorStop(0, '#FF4500');
    tntGradient.addColorStop(1, '#CC3700');
    ctx.fillStyle = tntGradient;
    ctx.fillRect(75, 180, 150, 50);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(80, 185, 140, 40);
    ctx.fillStyle = '#FF4500';
    ctx.fillRect(85, 190, 15, 20);
    ctx.fillStyle = '#808080';
    ctx.fillRect(88, 185, 9, 5);
    ctx.fillStyle = '#FFFF00';
    ctx.fillRect(90, 186, 5, 3);
    if (tntButtonGlow > 0) {
        ctx.strokeStyle = `rgba(255, 215, 0, ${tntButtonGlow})`;
        ctx.lineWidth = 3;
        ctx.strokeRect(75, 180, 150, 50);
        tntButtonGlow -= 0.05;
    }
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Buy TNT', 110, 195);
    ctx.fillText('(50)', 110, 210);
    ctx.font = '12px Arial';
    ctx.fillText('TNT: ' + tntCount, 110, 225);

    var hookGradient = ctx.createLinearGradient(275, 180, 275, 230);
    hookGradient.addColorStop(0, '#C0C0C0');
    hookGradient.addColorStop(1, '#A9A9A9');
    ctx.fillStyle = hookGradient;
    ctx.fillRect(275, 180, 150, 50);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(280, 185, 140, 40);
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(285, 195);
    ctx.lineTo(295, 205);
    ctx.stroke();
    ctx.fillStyle = hook.getColor();
    ctx.fillRect(293, 205, 10, 4);
    ctx.fillStyle = hook.upgradeLevel === 0 ? '#A9A9A9' : hook.getColor();
    ctx.fillRect(293, 209, 3, 4);
    ctx.fillRect(300, 209, 3, 4);
    if (hookButtonGlow > 0) {
        ctx.strokeStyle = `rgba(255, 215, 0, ${hookButtonGlow})`;
        ctx.lineWidth = 3;
        ctx.strokeRect(275, 180, 150, 50);
        hookButtonGlow -= 0.05;
    }
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '14px Arial';
    if (hook.upgradeLevel < hook.maxUpgradeLevel) {
        var nextPrice = hookUpgradePrices[hook.upgradeLevel];
        ctx.fillText('Upgrade Hook', 310, 195);
        ctx.fillText('(' + nextPrice + ')', 310, 210);
    } else {
        ctx.fillText('Max Level', 310, 202);
    }
    ctx.font = '12px Arial';
    ctx.fillText('Level: ' + hook.upgradeLevel, 310, 225);

    continueButtonPulse += 0.02;
    var pulseAlpha = 0.5 + Math.sin(continueButtonPulse) * 0.2;
    var continueGradient = ctx.createLinearGradient(200, 300, 200, 350);
    continueGradient.addColorStop(0, '#FFD700');
    continueGradient.addColorStop(1, '#DAA520');
    ctx.fillStyle = continueGradient;
    ctx.fillRect(200, 300, 100, 50);
    ctx.strokeStyle = `rgba(255, 255, 255, ${pulseAlpha})`;
    ctx.lineWidth = 3;
    ctx.strokeRect(200, 300, 100, 50);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(205, 305, 90, 40);
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.font = '16px Arial';
    ctx.fillText('Continue', 250, 330);
    ctx.textAlign = 'start';

    purchaseParticles = purchaseParticles.filter(p => p.life > 0);
    purchaseParticles.forEach(p => {
        p.update();
        p.draw(ctx);
    });
}

function drawGameOverScreen() {
    ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'white';
    ctx.font = '40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', canvas.width/2, canvas.height/2 - 40);
    ctx.font = '20px Arial';
    ctx.fillText('Score: ' + score, canvas.width/2, canvas.height/2);
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(canvas.width/2 - 50, canvas.height/2 + 60, 100, 40);
    ctx.fillStyle = 'black';
    ctx.fillText('Restart', canvas.width/2, canvas.height/2 + 85);
    ctx.textAlign = 'start';
}

function restartGame() {
    playerX = cols / 2;
    hook = new Hook();
    score = 0;
    targetScore = 100;
    level = 1;
    time = 90;
    gameOver = false;
    betweenLevels = false;
    tntCount = 0;
    purchaseParticles = [];
    tntButtonGlow = 0;
    hookButtonGlow = 0;
    continueButtonPulse = 0;
    generateMine();
}

document.addEventListener('click', function(e) {
    var rect = canvas.getBoundingClientRect();
    var clickX = e.clientX - rect.left;
    var clickY = e.clientY - rect.top;

    if (betweenLevels) {
        if (
            clickX >= 75 &&
            clickX <= 225 &&
            clickY >= 180 &&
            clickY <= 230
        ) {
            if (score >= 50) {
                tntCount += 1;
                score -= 50;
                tntButtonGlow = 1;
                for (var i = 0; i < 10; i++) {
                    purchaseParticles.push(new Particle(150, 205, '#FFD700', true, 'tnt'));
                }
            }
        }

        if (
            clickX >= 275 &&
            clickX <= 425 &&
            clickY >= 180 &&
            clickY <= 230
        ) {
            if (hook.upgradeLevel < hook.maxUpgradeLevel) {
                var price = hookUpgradePrices[hook.upgradeLevel];
                if (score >= price) {
                    hook.upgrade();
                    score -= price;
                    hookButtonGlow = 1;
                    for (var i = 0; i < 10; i++) {
                        purchaseParticles.push(new Particle(350, 205, '#C0C0C0', true, 'hook'));
                    }
                }
            }
        }

        if (
            clickX >= 200 &&
            clickX <= 300 &&
            clickY >= 300 &&
            clickY <= 350
        ) {
            level += 1;
            targetScore += 50;
            time = 60;
            generateMine();
            betweenLevels = false;
        }
    } else if (gameOver) {
        if (
            clickX >= canvas.width/2 - 50 &&
            clickX <= canvas.width/2 + 50 &&
            clickY >= canvas.height/2 + 60 &&
            clickY <= canvas.height/2 + 100
        ) {
            restartGame();
        }
    } else {
        if (hook.state === 0) {
            hook.shoot();
        } else if (hook.state === 2 && tntCount > 0 && hook.caughtItem) {
            tntCount -= 1;
            hook.detonateTNT();
        }
    }
});

document.addEventListener('keydown', function(e) {
    if (gameOver || betweenLevels) return;

    if (e.code === 'ArrowLeft' && playerX > 0) {
        playerX = playerX - 1;
    } else if (e.code === 'ArrowRight' && playerX < cols - 1) {
        playerX = playerX + 1;
    } else if (e.code === 'Space') {
        if (hook.state === 0) {
            hook.shoot();
        } else if (hook.state === 2 && tntCount > 0 && hook.caughtItem) {
            tntCount -= 1;
            hook.detonateTNT();
        }
    }
});

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    drawMine();

    if (!betweenLevels) {
        updateHook();
        updateTime();
    }

    drawPlayer();

    if (betweenLevels) {
        drawLevelEndScreen();
    }

    ctx.fillStyle = '#FFD700';
    ctx.fillRect(0, 0, canvas.width, 30);
    ctx.fillStyle = 'black';
    ctx.font = '16px Arial';
    ctx.fillText('Money: ' + score, 10, 20);
    ctx.fillText('Target: ' + targetScore, 150, 20);
    ctx.fillText('Level: ' + level, 300, 20);
    ctx.fillText('Time: ' + Math.floor(time), 400, 20);

    if (gameOver) {
        drawGameOverScreen();
    }
}

generateMine();
setInterval(gameLoop, 1000 / 60);