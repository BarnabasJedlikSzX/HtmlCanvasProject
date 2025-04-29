export class Item {
    constructor(type, size, mass, value) {
        this.type = type;
        this.size = size;
        this.mass = mass;
        this.value = value;
    }
}

export class Hook {
    constructor() {
        this.angle = 0;
        this.length = 40;
        this.maxSwingLength = 40;
        this.baseSpeed = 5; // Base speed
        this.speed = this.baseSpeed; // Current speed, can be upgraded
        this.speedUpgradeLevel = 0; // Track upgrade level
        this.swinging = true;
        this.state = 0; // 0: swinging, 1: shooting, 2: retracting
        this.swingSpeed = 0.06;
        this.caughtItem = null;
        this.hookEndX = 0;
        this.hookEndY = 0;
    }

    swing() {
        if (this.swinging && this.state === 0) {
            this.angle = this.angle + this.swingSpeed;
            if (this.angle > Math.PI / 2) {
                this.angle = Math.PI / 2;
                this.swingSpeed = -this.swingSpeed;
            } else if (this.angle < -Math.PI / 2) {
                this.angle = -Math.PI / 2;
                this.swingSpeed = -this.swingSpeed;
            }
            this.length = this.maxSwingLength;
        }
    }

    shoot() {
        if (this.state === 0) {
            this.swinging = false;
            this.state = 1;
        }
    }

    detonateTNT() {
        if (this.state === 2 && this.caughtItem) {
            this.caughtItem = null;
            this.swinging = true;
            this.state = 0;
            this.length = this.maxSwingLength;
        }
    }

    upgradeSpeed() {
        this.speedUpgradeLevel += 1;
        this.speed = this.baseSpeed + (this.speedUpgradeLevel * 0.5); // Increase speed by 0.5 per upgrade
    }

    update(startX, startY, canvasWidth, canvasHeight) {
        if (this.state === 1) {
            this.length = this.length + this.speed;
            this.hookEndX = startX + Math.sin(this.angle) * this.length;
            this.hookEndY = startY + Math.cos(this.angle) * this.length;

            if (this.hookEndX < 0 || this.hookEndX > canvasWidth || this.hookEndY < 0 || this.hookEndY > canvasHeight) {
                this.state = 2;
            }
        } else if (this.state === 2) {
            var retractSpeed = this.caughtItem ? this.speed / (this.caughtItem.mass * 0.5) : this.speed;
            this.length = this.length - retractSpeed;
            this.hookEndX = startX + Math.sin(this.angle) * this.length;
            this.hookEndY = startY + Math.cos(this.angle) * this.length;
            if (this.length <= this.maxSwingLength) {
                this.swinging = true;
                this.state = 0;
                this.caughtItem = null;
                this.length = this.maxSwingLength;
            }
        } else {
            this.hookEndX = startX + Math.sin(this.angle) * this.length;
            this.hookEndY = startY + Math.cos(this.angle) * this.length;
        }
    }

    getHookEnd() {
        return { x: this.hookEndX, y: this.hookEndY };
    }
}

export class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 2; // Random velocity X
        this.vy = (Math.random() - 0.5) * 2; // Random velocity Y
        this.life = 1; // Life starts at 1
        this.size = Math.random() * 3 + 1; // Size between 1 and 4
        this.color = `hsl(${Math.random() * 360}, 70%, 50%)`; // Random color
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= 0.05; // Fade out over time
    }

    draw(ctx) {
        if (this.life <= 0) return;
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.life;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.globalAlpha = 1; // Reset alpha
    }
}