import { Item, Hook, Particle } from './classes.js';

// Game setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const shop = document.getElementById('shop');
const shopLevel = document.getElementById('shopLevel');
const speedLevel = document.getElementById('speedLevel');
const strengthLevel = document.getElementById('strengthLevel');
const valueLevel = document.getElementById('valueLevel');
const speedCost = document.getElementById('speedCost');
const strengthCost = document.getElementById('strengthCost');
const valueCost = document.getElementById('valueCost');
const buySpeed = document.getElementById('buySpeed');
const buyStrength = document.getElementById('buyStrength');
const buyValue = document.getElementById('buyValue');
const nextLevel = document.getElementById('nextLevel');

// Sound effects
const goldSound = document.getElementById('goldSound');
const stoneSound = document.getElementById('stoneSound');
const gemSound = document.getElementById('gemSound');
const tntSound = document.getElementById('tntSound');

// Game constants
const tileSize = 25;
const cols = canvas.width / tileSize;
const rows = canvas.height / tileSize;

// Game variables
let Mine = [];
let playerX = cols / 2;
let platformY = 100;
let hook = new Hook();
let score = 0;
let targetScore = 150;
let level = 1;
let time = 90;
let gameOver = false;
let betweenLevels = false;
let particles = [];
let floatingTexts = [];
let upgrades = {
    speed: 1,
    speedCost: 100,
    strength: 1,
    strengthCost: 150,
    value: 1,
    valueCost: 200
};

// Initialize mine
for (let row = 0; row < rows; row++) {
    Mine[row] = [];
    for (let col = 0; col < cols; col++) {
        Mine[row][col] = null;
    }
}

function generateMine() {
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            Mine[row][col] = null;
        }
    }

    const startCol = 2;
    const endCol = cols - 2;
    const startRow = Math.floor(platformY / tileSize) + 1;
    const endRow = rows - 2;

    let positions = [];
    for (let row = startRow; row <= endRow; row++) {
        for (let col = startCol; col <= endCol; col++) {
            positions.push({ row, col });
        }
    }

    for (let i = positions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [positions[i], positions[j]] = [positions[j], positions[i]];
    }

    const baseGoldCount = 8;
    const goldCount = baseGoldCount + Math.floor(level * 1.5);
    for (let i = 0; i < goldCount && i < positions.length; i++) {
        const { row, col } = positions[i];
        const sizeRand = Math.random();
        let size, mass, value;
        
        if (sizeRand < 0.4) {
            size = 'small';
            mass = 1;
            value = 25 * upgrades.value;
        } else if (sizeRand < 0.8) {
            size = 'medium';
            mass = 2;
            value = 50 * upgrades.value;
        } else {
            size = 'large';
            mass = 4;
            value = 100 * upgrades.value;
        }
        Mine[row][col] = new Item('gold', size, mass, value);
    }

    const stoneCount = Math.max(3, 6 - Math.floor(level/2));
    for (let i = goldCount; i < goldCount + stoneCount && i < positions.length; i++) {
        const { row, col } = positions[i];
        const sizeRand = Math.random();
        let size, mass, value;
        
        if (sizeRand < 0.5) {
            size = 'small';
            mass = 3;
            value = 5;
        } else {
            size = 'medium';
            mass = 5;
            value = 10;
        }
        Mine[row][col] = new Item('stone', size, mass, value);
    }

    if (level > 1) {
        const rubyCount = Math.min(1 + Math.floor(level/2), 3);
        for (let i = goldCount + stoneCount; i < goldCount + stoneCount + rubyCount && i < positions.length; i++) {
            const { row, col } = positions[i];
            Mine[row][col] = new Item('ruby', 'small', 1, 150 * upgrades.value);
        }
    }

    if (level > 3 && Math.random() < 0.3) {
        const diamondPos = positions[goldCount + stoneCount + Math.floor(Math.random() * 5)];
        if (diamondPos) {
            Mine[diamondPos.row][diamondPos.col] = new Item('diamond', 'small', 1, 300 * upgrades.value);
        }
    }

    if (Math.random() < 0.2 + (level * 0.03)) {
        const tntPos = positions[goldCount + stoneCount + Math.floor(Math.random() * 5)];
        if (tntPos) {
            Mine[tntPos.row][tntPos.col] = new Item('tnt', 'medium', 2, 0);
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
    for (let i = 0; i < canvas.width; i += 10) {
        ctx.fillRect(i, platformY - 10, 2, 10);
    }
    ctx.fillRect(0, platformY - 10, canvas.width, 2);
    ctx.fillRect(0, platformY - 2, canvas.width, 2);
    ctx.fillStyle = '#4A2C2A';
    for (let i = 20; i < canvas.width - 20; i += 50) {
        ctx.fillRect(i, platformY, 5, 10);
    }
}

function drawMine() {
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const x = col * tileSize;
            const y = row * tileSize;
            if (y < platformY) continue;

            const item = Mine[row][col];
            if (!item) continue;

            ctx.fillStyle = 'rgba(0,0,0,0.2)';
            ctx.beginPath();
            if (item.type === 'stone' || item.type === 'gold') {
                const scale = getScale(item.size);
                ctx.ellipse(x + 12.5 * scale, y + 22 * scale, 10 * scale, 3 * scale, 0, 0, Math.PI * 2);
            } else {
                ctx.ellipse(x + 12.5, y + 22, 10, 3, 0, 0, Math.PI * 2);
            }
            ctx.fill();

            switch (item.type) {
                case 'stone':
                    drawStone(x, y, item.size);
                    break;
                case 'gold':
                    drawGold(x, y, item.size);
                    break;
                case 'ruby':
                    drawRuby(x, y);
                    break;
                case 'diamond':
                    drawDiamond(x, y);
                    break;
                case 'tnt':
                    drawTNT(x, y);
                    break;
            }
        }
    }
}

function getScale(size) {
    switch (size) {
        case 'small': return 1.0;
        case 'medium': return 1.5;
        default: return 2.0;
    }
}

function drawStone(x, y, size) {
    const scale = getScale(size);
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
}

function drawGold(x, y, size) {
    const scale = getScale(size);
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
}

function drawRuby(x, y) {
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

function drawDiamond(x, y) {
    ctx.fillStyle = '#00BFFF';
    ctx.beginPath();
    ctx.moveTo(x + 12, y + 5);
    ctx.lineTo(x + 19, y + 12);
    ctx.lineTo(x + 12, y + 20);
    ctx.lineTo(x + 5, y + 12);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#0077BE';
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.beginPath();
    ctx.moveTo(x + 12, y + 5);
    ctx.lineTo(x + 12, y + 20);
    ctx.moveTo(x + 5, y + 12);
    ctx.lineTo(x + 19, y + 12);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.beginPath();
    ctx.moveTo(x + 12, y + 8);
    ctx.lineTo(x + 15, y + 12);
    ctx.lineTo(x + 12, y + 16);
    ctx.lineTo(x + 9, y + 12);
    ctx.closePath();
    ctx.fill();
}

function drawTNT(x, y) {
    ctx.fillStyle = '#FF4500';
    ctx.fillRect(x + 5, y + 5, 15, 15);
    ctx.strokeStyle = '#8B0000';
    ctx.strokeRect(x + 5, y + 5, 15, 15);
    ctx.fillStyle = '#000';
    ctx.font = 'bold 10px Arial';
    ctx.fillText('TNT', x + 7, y + 15);
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.moveTo(x + 20, y + 5);
    ctx.lineTo(x + 25, y);
    ctx.lineTo(x + 23, y);
    ctx.lineTo(x + 20, y + 3);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#FFFF00';
    ctx.beginPath();
    ctx.moveTo(x + 25, y);
    ctx.lineTo(x + 27, y - 3);
    ctx.lineTo(x + 26, y - 1);
    ctx.lineTo(x + 28, y - 2);
    ctx.closePath();
    ctx.fill();
}

function drawDecorations() {
    const houseX = canvas.width - 100;
    const houseY = platformY - 60;
    ctx.fillStyle = '#DEB887';
    ctx.fillRect(houseX, houseY + 20, 40, 30);
    ctx.fillStyle = '#8B0000';
    ctx.fillRect(houseX - 5, houseY, 50, 20);
    ctx.fillStyle = '#4A2C2A';
    ctx.fillRect(houseX + 18, houseY + 30, 10, 20);
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(houseX + 5, houseY + 25, 8, 8);
    ctx.strokeStyle = '#000';
    ctx.strokeRect(houseX + 5, houseY + 25, 8, 8);
    ctx.fillStyle = '#808080';
    ctx.fillRect(houseX + 35, houseY - 5, 5, 5);
}

function drawPlayer() {
    const minerX = playerX * tileSize;
    const minerY = platformY - 35;

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

    const hookStartX = minerX + 12.5;
    const hookStartY = platformY;
    hook.update(hookStartX, hookStartY, canvas.width, canvas.height);
    const hookEnd = hook.getHookEnd();
    const hookEndX = hookEnd.x;
    const hookEndY = hookEnd.y;

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
        const x = hookEndX - (tileSize / 2);
        const y = hookEndY;
        const item = hook.caughtItem;
        
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath();
        if (item.type === 'stone' || item.type === 'gold') {
            const scale = getScale(item.size);
            ctx.ellipse(x + 12.5 * scale, y + 22 * scale, 10 * scale, 3 * scale, 0, 0, Math.PI * 2);
        } else {
            ctx.ellipse(x + 12.5, y + 22, 10, 3, 0, 0, Math.PI * 2);
        }
        ctx.fill();

        switch (item.type) {
            case 'stone':
                drawStone(x, y, item.size);
                break;
            case 'gold':
                drawGold(x, y, item.size);
                break;
            case 'ruby':
                drawRuby(x, y);
                break;
            case 'diamond':
                drawDiamond(x, y);
                break;
            case 'tnt':
                drawTNT(x, y);
                break;
        }
    }
}

function updateHook() {
    hook.swing();

    const hookStartX = playerX * tileSize + 12.5;
    const hookStartY = platformY;
    hook.update(hookStartX, hookStartY, canvas.width, canvas.height);

    if (hook.state === 1) {
        const hookEnd = hook.getHookEnd();
        const hookEndX = hookEnd.x;
        const hookEndY = hookEnd.y;
        const hookX = hookEndX / tileSize;
        const hookY = hookEndY / tileSize;
        const gridX = Math.floor(hookX);
        const gridY = Math.floor(hookY);

        let closestItem = null;
        let closestDistance = Infinity;
        let closestRow = -1;
        let closestCol = -1;

        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                const checkX = gridX + dx;
                const checkY = gridY + dy;
                if (checkX >= 0 && checkX < cols && checkY >= 0 && checkY < rows && Mine[checkY][checkX]) {
                    const itemCenterX = (checkX + 0.5) * tileSize;
                    const itemCenterY = (checkY + 0.5) * tileSize;
                    const distance = Math.sqrt(
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

        if (closestItem && closestDistance < 20) {
            hook.caughtItem = closestItem;
            Mine[closestRow][closestCol] = null;
            hook.state = 2;
            
            switch (closestItem.type) {
                case 'gold':
                    goldSound.currentTime = 0;
                    goldSound.play();
                    createParticles(hookEndX, hookEndY, '#FFD700');
                    break;
                case 'stone':
                    stoneSound.currentTime = 0;
                    stoneSound.play();
                    createParticles(hookEndX, hookEndY, '#808080');
                    break;
                case 'ruby':
                case 'diamond':
                    gemSound.currentTime = 0;
                    gemSound.play();
                    createParticles(hookEndX, hookEndY, closestItem.type === 'ruby' ? '#FF4040' : '#00BFFF');
                    break;
                case 'tnt':
                    tntSound.currentTime = 0;
                    tntSound.play();
                    createParticles(hookEndX, hookEndY, '#FF4500', 30);
                    break;
            }
        }
    } else if (hook.state === 2 && hook.caughtItem) {
        if (hook.length <= hook.maxSwingLength) {
            if (hook.caughtItem.type !== 'tnt') {
                const value = hook.caughtItem.value;
                score += value;
                createFloatingText(`+${value}`, hook.hookEndX, hook.hookEndY,
                                 hook.caughtItem.type === 'gold' ? '#FFD700' :
                                 hook.caughtItem.type === 'ruby' ? '#FF4040' :
                                 hook.caughtItem.type === 'diamond' ? '#00BFFF' : '#808080');
            } else {
                createFloatingText('TNT eltávolítva', hook.hookEndX, hook.hookEndY, '#FF4500');
            }
            hook.caughtItem = null;
        }
    }
}

function detonateTNT(explosionX, explosionY) {
    const explosionRadius = 3;
    const gridX = Math.floor(explosionX / tileSize);
    const gridY = Math.floor(explosionY / tileSize);
    
    let destroyedItems = 0;
    
    for (let dy = -explosionRadius; dy <= explosionRadius; dy++) {
        for (let dx = -explosionRadius; dx <= explosionRadius; dx++) {
            const checkX = gridX + dx;
            const checkY = gridY + dy;
            
            if (Math.sqrt(dx*dx + dy*dy) > explosionRadius) continue;
            
            if (checkX >= 0 && checkX < cols && checkY >= 0 && checkY < rows && Mine[checkY][checkX]) {
                const itemX = (checkX + 0.5) * tileSize;
                const itemY = (checkY + 0.5) * tileSize;
                createParticles(itemX, itemY, '#FF4500', 15);
                
                const distance = Math.sqrt(dx*dx + dy*dy);
                if (distance < explosionRadius - 1 || Math.random() > 0.5) {
                    Mine[checkY][checkX] = null;
                    destroyedItems++;
                }
            }
        }
    }
    
    if (destroyedItems > 0) {
        score += destroyedItems * 5;
    }
}

function createParticles(x, y, color, count = 15) {
    for (let i = 0; i < count; i++) {
        particles.push(new Particle(x, y, color));
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        if (particles[i].life <= 0) {
            particles.splice(i, 1);
        }
    }
}

function drawParticles() {
    for (const particle of particles) {
        particle.draw(ctx);
    }
}

function createFloatingText(text, x, y, color) {
    floatingTexts.push({
        text: text,
        x: x,
        y: y,
        color: color,
        life: 60
    });
}

function updateTime() {
    if (!gameOver && !betweenLevels) {
        time -= 1 / 60;
        if (time <= 0) {
            if (score >= targetScore) {
                showShop();
            } else {
                gameOver = true;
            }
        }
    }
}

