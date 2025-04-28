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
        this.speed = 5;
        this.swinging = true;
        this.state = 0; // 0: swinging, 1: shooting, 2: retracting
        this.swingSpeed = 0.06;
        this.caughtItem = null;
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

    update(startX, startY, canvasWidth, canvasHeight) {
        if (this.state === 1) {
            this.length = this.length + this.speed;
            var hookEndX = startX + Math.sin(this.angle) * this.length;
            var hookEndY = startY + Math.cos(this.angle) * this.length;

            if (hookEndX < 0 || hookEndX > canvasWidth || hookEndY < 0 || hookEndY > canvasHeight) {
                this.state = 2;
            }
        } else if (this.state === 2) {
            var retractSpeed = this.caughtItem ? this.speed / (this.caughtItem.mass * 0.5) : this.speed;
            this.length = this.length - retractSpeed;
            if (this.length <= this.maxSwingLength) {
                this.swinging = true;
                this.state = 0;
                this.caughtItem = null;
                this.length = this.maxSwingLength;
            }
        }
    }
}