export class Item {
    constructor(type, size, mass, value) {
        this.type = type;
        this.size = size;
        this.mass = mass;
        this.value = value;
    }
}

export class Particle {
    constructor(x, y, color, isPurchaseEffect = false, purchaseType = null) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.isPurchaseEffect = isPurchaseEffect;
        if (isPurchaseEffect) {
            this.radius = Math.random() * 5 + 3;
            this.velocityX = (Math.random() - 0.5) * 4;
            this.velocityY = (Math.random() - 0.5) * 4;
            this.life = 1;
            this.lifeDecrease = 0.03;
            if (purchaseType === 'tnt') {
                this.color = Math.random() < 0.5 ? '#FF4500' : '#FFD700';
            } else if (purchaseType === 'hook') {
                this.color = Math.random() < 0.5 ? '#C0C0C0' : '#4169E1';
            }
        } else {
            this.radius = Math.random() * 3 + 1;
            this.velocityX = (Math.random() - 0.5) * 2;
            this.velocityY = (Math.random() - 0.5) * 2;
            this.life = 1;
            this.lifeDecrease = 0.05;
        }
    }

    update() {
        this.x += this.velocityX;
        this.y += this.velocityY;
        this.life -= this.lifeDecrease;
    }

    draw(ctx) {
        if (this.life <= 0) return;
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.life;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

export class Hook {
    constructor() {
        this.angle = 0;
        this.length = 40;
        this.maxSwingLength = 40;
        this.speed = 2;
        this.swinging = true;
        this.state = 0;
        this.swingSpeed = 0.03;
        this.caughtItem = null;
        this.hookEndX = 0;
        this.hookEndY = 0;
        this.particles = [];
        this.upgradeLevel = 0;
        this.maxUpgradeLevel = 3;
        this.colors = [
            '#C0C0C0',
            '#FFD700',
            '#FF4040',
            '#00FFFF'
        ];
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
            this.particles = [];
        }
    }

    upgrade() {
        if (this.upgradeLevel < this.maxUpgradeLevel) {
            this.upgradeLevel += 1;
        }
    }

    getColor() {
        return this.colors[this.upgradeLevel];
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
            var massPenalty = this.caughtItem ? (this.caughtItem.mass * 0.5) / (1 + this.upgradeLevel * 0.5) : 1;
            var retractSpeed = this.caughtItem ? this.speed / massPenalty : this.speed;
            this.length = this.length - retractSpeed;
            this.hookEndX = startX + Math.sin(this.angle) * this.length;
            this.hookEndY = startY + Math.cos(this.angle) * this.length;
            if (this.length <= this.maxSwingLength) {
                this.swinging = true;
                this.state = 0;
                this.caughtItem = null;
                this.length = this.maxSwingLength;
                this.particles = [];
            }
        } else {
            this.hookEndX = startX + Math.sin(this.angle) * this.length;
            this.hookEndY = startY + Math.cos(this.angle) * this.length;
        }

        this.particles = this.particles.filter(p => p.life > 0);
        this.particles.forEach(p => p.update());
    }

    getHookEnd() {
        return { x: this.hookEndX, y: this.hookEndY };
    }
}