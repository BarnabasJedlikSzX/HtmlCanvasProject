export class Item {
    constructor(type, size, mass, value) {
        this.type = type;
        this.size = size;
        this.mass = mass;
        this.value = value;
        this.caught = false;
    }
}

export class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = Math.random() * 3 + 2;
        this.speedX = Math.random() * 4 - 2;
        this.speedY = Math.random() * 4 - 2;
        this.life = 30;
    }
    
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life--;
    }
    
    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.life / 30;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

export class Hook {
    constructor() {
        this.angle = 0;
        this.length = 40;
        this.maxSwingLength = 40;
        this.speed = 2.5;
        this.swinging = true;
        this.state = 0; // 0: swinging, 1: shooting, 2: retracting
        this.swingSpeed = 0.04;
        this.caughtItem = null;
        this.hookEndX = 0;
        this.hookEndY = 0;
        this.strength = 1; // Upgradeable
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

    shoot(angle) {
        if (this.state === 0) {
            if (angle !== undefined) {
                this.angle = angle;
            }
            this.swinging = false;
            this.state = 1;
        }
    }

    detonateTNT() {
        if (this.state === 2 && this.caughtItem && this.caughtItem.type === 'tnt') {
            this.caughtItem = null;
            this.swinging = true;
            this.state = 0;
            this.length = this.maxSwingLength;
            return true;
        }
        return false;
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
            const retractSpeed = this.caughtItem ? this.speed / (this.caughtItem.mass * (0.5 / this.strength)) : this.speed;
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