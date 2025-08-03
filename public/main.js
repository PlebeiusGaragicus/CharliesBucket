class CharliesBucketGame {
    constructor() {
        this.currentLevel = 1;
        this.waterLevel = 0;
        this.maxWaterLevel = 1;
        this.bucketFillSpeed = 0.02;
        this.gameState = 'playing'; // 'playing', 'levelComplete', 'gameComplete'
        this.animationFrame = 0;
    }
    
    init() {
        this.canvas = document.getElementById('gameCanvas');
        
        if (!this.canvas) {
            console.error('Canvas element not found!');
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        this.initializeBucket();
        this.initializeRaindrops();
        this.setupEventListeners();
        
        this.gameLoop();
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        if (this.bucket) {
            this.bucket.y = this.canvas.height - 100;
        }
    }
    
    initializeBucket() {
        this.bucket = {
            width: 150,
            height: 80,
            x: this.canvas.width / 2 - 75,
            y: this.canvas.height - 100,
            color: '#8B4513',
            rimColor: '#5D2906',
            waterColor: 'rgba(30, 144, 255, 0.8)'
        };
        
        this.mouseX = this.canvas.width / 2;
        this.mouseY = this.canvas.height - 100;
    }
    
    initializeRaindrops() {
        this.raindrops = [];
        this.raindropSpeed = 8;
        this.raindropSize = 75;
    }
    
    setupEventListeners() {
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });
        
        document.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.mouseX = e.touches[0].clientX;
            this.mouseY = e.touches[0].clientY;
        }, { passive: false });
        
        // Click handler for level progression
        document.addEventListener('click', (e) => {
            if (this.gameState === 'levelComplete') {
                this.startNextLevel();
            }
        });
        
        document.addEventListener('touchstart', (e) => {
            if (this.gameState === 'levelComplete') {
                this.startNextLevel();
            }
        });
    }
    
    updateBucketPosition() {
        if (this.gameState !== 'playing') return;
        
        this.bucket.x = this.mouseX - this.bucket.width / 2;
        this.bucket.y = this.mouseY - this.bucket.height / 2;
        
        // Keep bucket within canvas bounds
        this.bucket.x = Math.max(0, Math.min(this.bucket.x, this.canvas.width - this.bucket.width));
        this.bucket.y = Math.max(0, Math.min(this.bucket.y, this.canvas.height - this.bucket.height));
    }
    
    createRaindrop() {
        if (this.gameState !== 'playing') return;
        
        const raindrop = {
            x: Math.random() * this.canvas.width,
            y: -this.raindropSize,
            size: this.raindropSize + Math.random() * 50,
            speed: this.raindropSpeed + Math.random() * 5,
            color: 'rgba(0, 100, 255, 0.9)'
        };
        
        this.raindrops.push(raindrop);
    }
    
    updateRaindrops() {
        if (this.gameState !== 'playing') return;
        
        for (let i = this.raindrops.length - 1; i >= 0; i--) {
            const drop = this.raindrops[i];
            drop.y += drop.speed;
            
            if (drop.y > this.canvas.height) {
                this.raindrops.splice(i, 1);
                continue;
            }
            
            if (this.isColliding(drop)) {
                this.raindrops.splice(i, 1);
                this.waterLevel = Math.min(this.waterLevel + this.bucketFillSpeed, this.maxWaterLevel);
                
                if (this.waterLevel >= this.maxWaterLevel) {
                    this.completeLevel();
                }
            }
        }
    }
    
    isColliding(raindrop) {
        const points = [
            { x: this.bucket.x, y: this.bucket.y },
            { x: this.bucket.x + this.bucket.width, y: this.bucket.y },
            { x: this.bucket.x + this.bucket.width - 20, y: this.bucket.y + this.bucket.height },
            { x: this.bucket.x + 20, y: this.bucket.y + this.bucket.height }
        ];
        
        const centerX = raindrop.x;
        const centerY = raindrop.y + raindrop.size / 2;
        
        // Bounding box check
        const minX = Math.min(...points.map(p => p.x));
        const maxX = Math.max(...points.map(p => p.x));
        const minY = Math.min(...points.map(p => p.y));
        const maxY = Math.max(...points.map(p => p.y));
        
        if (centerX < minX || centerX > maxX || centerY < minY || centerY > maxY) {
            return false;
        }
        
        // Point-in-polygon test
        let inside = false;
        for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
            if (((points[i].y > centerY) !== (points[j].y > centerY)) &&
                (centerX < (points[j].x - points[i].x) * (centerY - points[i].y) / (points[j].y - points[i].y) + points[i].x)) {
                inside = !inside;
            }
        }
        
        return inside;
    }
    
    drawBucket() {
        const points = [
            { x: this.bucket.x, y: this.bucket.y },
            { x: this.bucket.x + this.bucket.width, y: this.bucket.y },
            { x: this.bucket.x + this.bucket.width - 20, y: this.bucket.y + this.bucket.height },
            { x: this.bucket.x + 20, y: this.bucket.y + this.bucket.height }
        ];
        
        // Draw bucket outline
        this.ctx.beginPath();
        this.ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            this.ctx.lineTo(points[i].x, points[i].y);
        }
        this.ctx.closePath();
        
        this.ctx.fillStyle = this.bucket.color;
        this.ctx.fill();
        this.ctx.strokeStyle = this.bucket.rimColor;
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
        
        // Draw animated water fill
        this.drawWaterFill();
    }
    
    drawWaterFill() {
        if (this.waterLevel <= 0) return;
        
        // Calculate water dimensions
        const waterHeight = this.bucket.height * this.waterLevel;
        const waterY = this.bucket.y + this.bucket.height - waterHeight;
        const waterWidth = this.bucket.width - (40 * (1 - this.waterLevel)); // Trapezoid effect
        const waterX = this.bucket.x + (20 * (1 - this.waterLevel));
        
        // Draw water with animated surface
        this.ctx.fillStyle = this.bucket.waterColor;
        
        // Create trapezoid water shape
        this.ctx.beginPath();
        this.ctx.moveTo(waterX, waterY + this.getWaveOffset(0));
        this.ctx.lineTo(waterX + waterWidth, waterY + this.getWaveOffset(waterWidth));
        this.ctx.lineTo(this.bucket.x + this.bucket.width - 20, this.bucket.y + this.bucket.height);
        this.ctx.lineTo(this.bucket.x + 20, this.bucket.y + this.bucket.height);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Add animated water surface waves
        this.drawWaterSurface(waterX, waterY, waterWidth);
    }
    
    getWaveOffset(x) {
        const time = this.animationFrame * 0.1;
        return Math.sin(time + x * 0.02) * 3;
    }
    
    drawWaterSurface(x, y, width) {
        this.ctx.strokeStyle = 'rgba(100, 180, 255, 0.6)';
        this.ctx.lineWidth = 2;
        
        this.ctx.beginPath();
        for (let i = 0; i <= width; i += 5) {
            const waveY = y + this.getWaveOffset(i);
            if (i === 0) {
                this.ctx.moveTo(x + i, waveY);
            } else {
                this.ctx.lineTo(x + i, waveY);
            }
        }
        this.ctx.stroke();
    }
    
    drawRaindrops() {
        for (const drop of this.raindrops) {
            this.ctx.beginPath();
            this.ctx.moveTo(drop.x, drop.y);
            this.ctx.lineTo(drop.x, drop.y + drop.size);
            this.ctx.strokeStyle = drop.color;
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        }
    }
    
    completeLevel() {
        this.gameState = 'levelComplete';
        this.raindrops = []; // Clear remaining raindrops
    }
    
    startNextLevel() {
        if (this.currentLevel < 2) {
            this.currentLevel++;
            this.waterLevel = 0;
            this.gameState = 'playing';
            this.raindrops = [];
        } else {
            this.gameState = 'gameComplete';
        }
    }
    
    drawLevelCompleteScreen() {
        // Semi-transparent overlay
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Main message
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        
        if (this.currentLevel === 1) {
            this.ctx.fillText('You Filled the Bucket!', this.canvas.width / 2, this.canvas.height / 2 - 50);
            this.ctx.font = '24px Arial';
            this.ctx.fillText('Click to start Level 2', this.canvas.width / 2, this.canvas.height / 2 + 20);
        } else {
            this.ctx.fillText('Level 2 Complete!', this.canvas.width / 2, this.canvas.height / 2 - 50);
            this.ctx.font = '24px Arial';
            this.ctx.fillText('You filled both buckets!', this.canvas.width / 2, this.canvas.height / 2 + 20);
        }
        
        // Add pulsing effect
        const pulse = Math.sin(this.animationFrame * 0.1) * 0.3 + 0.7;
        this.ctx.globalAlpha = pulse;
        this.ctx.font = '18px Arial';
        this.ctx.fillText('Click anywhere to continue', this.canvas.width / 2, this.canvas.height / 2 + 80);
        this.ctx.globalAlpha = 1;
    }
    
    gameLoop() {
        this.animationFrame++;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.gameState === 'playing') {
            // Update game state
            this.updateBucketPosition();
            this.updateRaindrops();
            
            // Create new raindrops
            if (Math.random() < 0.05) {
                this.createRaindrop();
            }
            
            // Draw game elements
            this.drawRaindrops();
            this.drawBucket();
        } else if (this.gameState === 'levelComplete') {
            // Still draw the bucket with full water for visual effect
            this.drawBucket();
            this.drawLevelCompleteScreen();
        }
        
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Start the game when page loads
window.addEventListener('load', () => {
    const game = new CharliesBucketGame();
    game.init();
});
