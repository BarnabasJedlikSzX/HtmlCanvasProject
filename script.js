const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const tileSize = 25;
const cols = canvas.width / tileSize;
const rows = canvas.height / tileSize;

let mine = [];
let player = { x: 2, y: 0, color: 'blue', width: tileSize, height: tileSize };
let score = 0;
let gameOver = false;

function generateMine() {
    for (let row = 0; row < rows; row++) {
        Mine[row] = [];
        for (let col = 0; col < cols; col++) {
            if (row === rows - 1) {
                Mine[row][col] = 'stone';
            } else {
                Mine[row][col] = Math.random() < 0.1 ? 'gold' : Math.random() < 0.1 ? 'stone' : 'empty';
            }
        }
    }
}

function drawMine() {
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            let x = col * tileSize;
            let y = row * tileSize;
            if (Mine[row][col] === 'stone') {
                ctx.fillStyle = 'gray';
            } else if (Mine[row][col] === 'gold') {
                ctx.fillStyle = 'gold';
            } else {
                ctx.fillStyle = 'lightgray';
            }
            ctx.fillRect(x, y, tileSize, tileSize);
            ctx.strokeRect(x, y, tileSize, tileSize);
        }
    }
}

function drawPlayer() {
    let x = player.x * tileSize;
    let y = player.y * tileSize;
    ctx.fillStyle = player.color;
    ctx.fillRect(x, y, player.width, player.height);
    ctx.strokeRect(x, y, player.width, player.height);
}

function movePlayer(dx, dy) {
    if (gameOver) return;
    
    let newX = player.x + dx;
    let newY = player.y + dy;

    if (newX >= 0 && newX < cols && newY >= 0 && newY < rows) {
        player.x = newX;
        player.y = newY;

        if (Mine[player.y][player.x] === 'gold') {
            score += 10;
            Mine[player.y][player.x] = 'empty';
        }

        if (Mine[player.y][player.x] === 'stone') {
            gameOver = true;
            alert('Game Over! Score: ' + score);
        }
    }
}

document.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowLeft') {
        movePlayer(-1, 0);
    } else if (e.code === 'ArrowRight') {
        movePlayer(1, 0);
    } else if (e.code === 'ArrowDown') {
        movePlayer(0, 1);
    }
});

function gameLoop() {
    if (gameOver) return;
    
    drawMine();
    drawPlayer();
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText('Score: ' + score, 10, 30);
    
    requestAnimationFrame(gameLoop);
}

// Inicializálás
generateMine();
gameLoop();
