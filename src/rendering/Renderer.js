// Main rendering system

import { CONFIG } from '../utils/Config.js';
import { TerrainType } from '../map/Terrain.js';
import { gridToWorld } from '../utils/Math.js';
import { ParticleSystem } from './ParticleSystem.js';
import { AnimationEngine } from './AnimationEngine.js';
import { getTowerInfo } from '../entities/TowerTypes.js';

export class Renderer {
    constructor(canvas, gameState) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.gameState = gameState;

        this.particles = new ParticleSystem();
        this.animations = new AnimationEngine();

        // Rendering options
        this.showGrid = true;
        this.showRanges = true;
        this.showHealthBars = true;

        // Camera
        this.cameraX = 0;
        this.cameraY = 0;
    }

    setCanvasSize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
    }

    setupCanvas(map) {
        const width = map.width * map.gridSize;
        const height = map.height * map.gridSize;
        this.setCanvasSize(width, height);
    }

    clear() {
        this.ctx.fillStyle = CONFIG.COLORS.BACKGROUND;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    render(deltaTime) {
        this.clear();

        if (!this.gameState.map) return;

        // Update animations and particles
        this.particles.update(deltaTime);
        this.animations.update(deltaTime);

        // Draw in layers
        this.drawGrid();
        this.drawPath();
        this.drawStartEnd();
        this.drawRangeIndicators();
        this.drawTowers();
        this.drawEnemies();
        this.drawProjectiles();
        this.particles.render(this.ctx);
        this.drawSelectionHighlight();
    }

    drawGrid() {
        if (!this.showGrid) return;

        const map = this.gameState.map;
        const gridSize = map.gridSize;

        this.ctx.strokeStyle = CONFIG.COLORS.GRID;
        this.ctx.lineWidth = 1;

        // Draw vertical lines
        for (let x = 0; x <= map.width; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * gridSize, 0);
            this.ctx.lineTo(x * gridSize, map.height * gridSize);
            this.ctx.stroke();
        }

        // Draw horizontal lines
        for (let y = 0; y <= map.height; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * gridSize);
            this.ctx.lineTo(map.width * gridSize, y * gridSize);
            this.ctx.stroke();
        }
    }

    drawPath() {
        const map = this.gameState.map;
        const gridSize = map.gridSize;

        this.ctx.fillStyle = CONFIG.COLORS.PATH;

        for (let y = 0; y < map.height; y++) {
            for (let x = 0; x < map.width; x++) {
                const cell = map.getCell(x, y);

                if (cell && cell.isPath()) {
                    this.ctx.fillRect(
                        x * gridSize,
                        y * gridSize,
                        gridSize,
                        gridSize
                    );
                }
            }
        }
    }

    drawStartEnd() {
        const map = this.gameState.map;
        const gridSize = map.gridSize;

        // Draw start
        const startWorld = gridToWorld(map.startPos.x, map.startPos.y, gridSize);
        this.ctx.fillStyle = CONFIG.COLORS.START;
        this.ctx.beginPath();
        this.ctx.arc(startWorld.x, startWorld.y, gridSize * 0.4, 0, Math.PI * 2);
        this.ctx.fill();

        // Draw label
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('START', startWorld.x, startWorld.y);

        // Draw end (base)
        const endWorld = gridToWorld(map.endPos.x, map.endPos.y, gridSize);
        this.ctx.fillStyle = CONFIG.COLORS.END;
        this.ctx.beginPath();
        this.ctx.arc(endWorld.x, endWorld.y, gridSize * 0.4, 0, Math.PI * 2);
        this.ctx.fill();

        // Draw label
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillText('BASE', endWorld.x, endWorld.y);
    }

    drawTowers() {
        for (const tower of this.gameState.towers) {
            this.drawTower(tower);
        }
    }

    drawTower(tower) {
        const size = CONFIG.GAME.GRID_SIZE * 0.6;

        // Tower body
        this.ctx.fillStyle = tower.color;
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 2;

        this.ctx.beginPath();
        this.ctx.arc(tower.position.x, tower.position.y, size / 2, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();

        // Draw level indicators
        this.drawTowerLevel(tower);

        // Draw shooting indicator if has target
        if (tower.target && tower.cooldown < 100) {
            this.ctx.strokeStyle = '#FFFF00';
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.moveTo(tower.position.x, tower.position.y);
            this.ctx.lineTo(tower.target.position.x, tower.target.position.y);
            this.ctx.stroke();
        }
    }

    drawTowerLevel(tower) {
        const size = CONFIG.GAME.GRID_SIZE * 0.6;
        const radius = size / 2;

        // Draw level stars
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = 'bold 10px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        for (let i = 0; i < tower.level; i++) {
            const angle = (Math.PI * 2 / 3) * i - Math.PI / 2;
            const x = tower.position.x + Math.cos(angle) * radius * 0.6;
            const y = tower.position.y + Math.sin(angle) * radius * 0.6;

            this.ctx.fillText('★', x, y);
        }
    }

    drawEnemies() {
        for (const enemy of this.gameState.enemies) {
            this.drawEnemy(enemy);
        }
    }

    drawEnemy(enemy) {
        this.ctx.save();

        // Draw enemy based on type with Fallout theme
        switch (enemy.type) {
            case 'BASIC':
                this.drawRaider(enemy);
                break;
            case 'FAST':
                this.drawFeralGhoul(enemy);
                break;
            case 'TANK':
                this.drawSuperMutant(enemy);
                break;
            case 'FLYING':
                this.drawBloodbug(enemy);
                break;
            case 'BOSS':
                this.drawDeathclaw(enemy);
                break;
            default:
                this.drawGenericEnemy(enemy);
        }

        // Draw slow effect indicator
        if (enemy.isSlowed()) {
            this.ctx.strokeStyle = '#06b6d4';
            this.ctx.lineWidth = 2;
            this.ctx.setLineDash([3, 3]);
            this.ctx.beginPath();
            this.ctx.arc(enemy.position.x, enemy.position.y, enemy.size + 4, 0, Math.PI * 2);
            this.ctx.stroke();
            this.ctx.setLineDash([]);

            // Add frost particles
            for (let i = 0; i < 3; i++) {
                const angle = Math.random() * Math.PI * 2;
                const dist = enemy.size + Math.random() * 5;
                const px = enemy.position.x + Math.cos(angle) * dist;
                const py = enemy.position.y + Math.sin(angle) * dist;
                this.ctx.fillStyle = '#a5f3fc';
                this.ctx.beginPath();
                this.ctx.arc(px, py, 1, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }

        // Draw health bar
        if (this.showHealthBars && enemy.hp < enemy.maxHp) {
            this.drawHealthBar(enemy);
        }

        this.ctx.restore();
    }

    drawRaider(enemy) {
        const x = enemy.position.x;
        const y = enemy.position.y;
        const size = enemy.size;

        // Body - brown/leather armor
        this.ctx.fillStyle = '#92400e';
        this.ctx.beginPath();
        this.ctx.ellipse(x, y, size * 0.6, size * 0.9, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.strokeStyle = '#451a03';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();

        // Head
        this.ctx.fillStyle = '#d97706';
        this.ctx.beginPath();
        this.ctx.arc(x, y - size * 0.7, size * 0.4, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();

        // Mohawk
        this.ctx.fillStyle = '#dc2626';
        this.ctx.fillRect(x - size * 0.15, y - size * 1.1, size * 0.3, size * 0.5);

        // Weapon silhouette
        this.ctx.strokeStyle = '#57534e';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(x + size * 0.5, y);
        this.ctx.lineTo(x + size * 1.2, y - size * 0.3);
        this.ctx.stroke();
    }

    drawFeralGhoul(enemy) {
        const x = enemy.position.x;
        const y = enemy.position.y;
        const size = enemy.size;
        const wobble = Math.sin(Date.now() * 0.01) * 0.1;

        // Hunched body - sickly green
        this.ctx.fillStyle = '#84cc16';
        this.ctx.beginPath();
        this.ctx.ellipse(x, y, size * 0.7, size * 0.8, wobble, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.strokeStyle = '#365314';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();

        // Decayed head
        this.ctx.fillStyle = '#a3e635';
        this.ctx.beginPath();
        this.ctx.arc(x - size * 0.3, y - size * 0.5, size * 0.35, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();

        // Glowing eyes
        this.ctx.fillStyle = '#fbbf24';
        this.ctx.shadowBlur = 5;
        this.ctx.shadowColor = '#fbbf24';
        this.ctx.beginPath();
        this.ctx.arc(x - size * 0.4, y - size * 0.5, size * 0.1, 0, Math.PI * 2);
        this.ctx.arc(x - size * 0.2, y - size * 0.5, size * 0.1, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.shadowBlur = 0;

        // Radiation symbol
        this.ctx.fillStyle = '#facc15';
        this.ctx.font = `${size * 0.6}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('☢', x, y + size * 0.3);
    }

    drawSuperMutant(enemy) {
        const x = enemy.position.x;
        const y = enemy.position.y;
        const size = enemy.size;

        // Large muscular body - olive green
        this.ctx.fillStyle = '#65a30d';
        this.ctx.beginPath();
        this.ctx.ellipse(x, y, size * 0.9, size * 1.1, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.strokeStyle = '#3f6212';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        // Armor plates
        this.ctx.fillStyle = '#78716c';
        this.ctx.fillRect(x - size * 0.5, y - size * 0.3, size * 1, size * 0.6);
        this.ctx.strokeStyle = '#292524';
        this.ctx.strokeRect(x - size * 0.5, y - size * 0.3, size * 1, size * 0.6);

        // Large head
        this.ctx.fillStyle = '#84cc16';
        this.ctx.beginPath();
        this.ctx.arc(x, y - size * 0.8, size * 0.5, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.strokeStyle = '#3f6212';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        // Angry eyes
        this.ctx.fillStyle = '#dc2626';
        this.ctx.fillRect(x - size * 0.3, y - size * 0.8, size * 0.2, size * 0.15);
        this.ctx.fillRect(x + size * 0.1, y - size * 0.8, size * 0.2, size * 0.15);

        // Weapon
        this.ctx.fillStyle = '#292524';
        this.ctx.fillRect(x + size * 0.7, y - size * 0.5, size * 0.4, size * 1.5);
    }

    drawBloodbug(enemy) {
        const x = enemy.position.x;
        const y = enemy.position.y;
        const size = enemy.size;
        const time = Date.now() * 0.01;
        const wingFlap = Math.sin(time * 2) * 0.3;

        // Body - red/brown insect
        this.ctx.fillStyle = '#dc2626';
        this.ctx.beginPath();
        this.ctx.ellipse(x, y, size * 0.4, size * 0.8, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.strokeStyle = '#991b1b';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();

        // Head/Proboscis
        this.ctx.fillStyle = '#7f1d1d';
        this.ctx.beginPath();
        this.ctx.arc(x, y - size * 0.6, size * 0.3, 0, Math.PI * 2);
        this.ctx.fill();

        // Stinger
        this.ctx.strokeStyle = '#450a0a';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(x, y - size * 0.8);
        this.ctx.lineTo(x, y - size * 1.3);
        this.ctx.stroke();

        // Wings with flapping animation
        this.ctx.fillStyle = 'rgba(220, 38, 38, 0.3)';
        this.ctx.beginPath();
        this.ctx.ellipse(x - size * 0.3, y, size * 0.8, size * 0.4, -0.5 + wingFlap, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.strokeStyle = '#991b1b';
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.ellipse(x + size * 0.3, y, size * 0.8, size * 0.4, 0.5 - wingFlap, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();

        // Compound eyes
        this.ctx.fillStyle = '#000000';
        this.ctx.beginPath();
        this.ctx.arc(x - size * 0.15, y - size * 0.65, size * 0.12, 0, Math.PI * 2);
        this.ctx.arc(x + size * 0.15, y - size * 0.65, size * 0.12, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawDeathclaw(enemy) {
        const x = enemy.position.x;
        const y = enemy.position.y;
        const size = enemy.size;
        const breathe = Math.sin(Date.now() * 0.003) * 0.05;

        // Massive body - dark brown/tan
        this.ctx.fillStyle = '#78350f';
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = '#dc2626';
        this.ctx.beginPath();
        this.ctx.ellipse(x, y, size * (0.9 + breathe), size * 1.2, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
        this.ctx.strokeStyle = '#451a03';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();

        // Muscular definition
        this.ctx.strokeStyle = '#451a03';
        this.ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
            this.ctx.beginPath();
            this.ctx.arc(x, y - size * 0.4 + i * size * 0.4, size * 0.6, 0, Math.PI);
            this.ctx.stroke();
        }

        // Head with horns
        this.ctx.fillStyle = '#92400e';
        this.ctx.beginPath();
        this.ctx.arc(x, y - size * 1, size * 0.6, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.strokeStyle = '#451a03';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        // Horns
        this.ctx.fillStyle = '#57534e';
        this.ctx.beginPath();
        this.ctx.moveTo(x - size * 0.5, y - size * 0.9);
        this.ctx.lineTo(x - size * 0.9, y - size * 1.5);
        this.ctx.lineTo(x - size * 0.4, y - size * 1.1);
        this.ctx.closePath();
        this.ctx.fill();

        this.ctx.beginPath();
        this.ctx.moveTo(x + size * 0.5, y - size * 0.9);
        this.ctx.lineTo(x + size * 0.9, y - size * 1.5);
        this.ctx.lineTo(x + size * 0.4, y - size * 1.1);
        this.ctx.closePath();
        this.ctx.fill();

        // Glowing red eyes
        this.ctx.fillStyle = '#dc2626';
        this.ctx.shadowBlur = 8;
        this.ctx.shadowColor = '#dc2626';
        this.ctx.beginPath();
        this.ctx.arc(x - size * 0.25, y - size * 1, size * 0.15, 0, Math.PI * 2);
        this.ctx.arc(x + size * 0.25, y - size * 1, size * 0.15, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.shadowBlur = 0;

        // Massive claws
        this.ctx.strokeStyle = '#292524';
        this.ctx.lineWidth = 3;
        this.ctx.lineCap = 'round';

        // Left claw
        for (let i = 0; i < 3; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x - size * 0.8, y + size * 0.3);
            this.ctx.lineTo(x - size * 1.3 + i * 0.2, y + size * 0.8);
            this.ctx.stroke();
        }

        // Right claw
        for (let i = 0; i < 3; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x + size * 0.8, y + size * 0.3);
            this.ctx.lineTo(x + size * 1.3 - i * 0.2, y + size * 0.8);
            this.ctx.stroke();
        }

        // Radiation warning symbol
        this.ctx.fillStyle = '#facc15';
        this.ctx.font = `bold ${size * 0.5}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('☢', x, y + size * 0.5);
    }

    drawGenericEnemy(enemy) {
        // Fallback for any undefined enemy types
        this.ctx.fillStyle = enemy.color;
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.arc(enemy.position.x, enemy.position.y, enemy.size, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
    }

    drawTriangle(x, y, size) {
        this.ctx.beginPath();
        this.ctx.moveTo(x, y - size);
        this.ctx.lineTo(x - size, y + size);
        this.ctx.lineTo(x + size, y + size);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
    }

    drawHealthBar(enemy) {
        const barWidth = enemy.size * 2;
        const barHeight = 4;
        const x = enemy.position.x - barWidth / 2;
        const y = enemy.position.y - enemy.size - 8;

        // Background
        this.ctx.fillStyle = CONFIG.COLORS.HEALTH_BAR_BG;
        this.ctx.fillRect(x, y, barWidth, barHeight);

        // Health
        const healthWidth = barWidth * enemy.getHealthPercentage();
        this.ctx.fillStyle = enemy.getHealthBarColor();
        this.ctx.fillRect(x, y, healthWidth, barHeight);

        // Border
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x, y, barWidth, barHeight);
    }

    drawProjectiles() {
        for (const projectile of this.gameState.projectiles) {
            this.drawProjectile(projectile);

            // Add trail effect based on type
            const trailChance = projectile.visualType === 'rocket' ? 0.8 : 0.3;
            if (Math.random() < trailChance) {
                this.particles.emitProjectileTrail(
                    projectile.position.x,
                    projectile.position.y,
                    projectile.color,
                    projectile.visualType
                );
            }
        }
    }

    drawProjectile(projectile) {
        this.ctx.save();
        this.ctx.translate(projectile.position.x, projectile.position.y);
        this.ctx.rotate(projectile.angle);

        switch (projectile.visualType) {
            case 'bullet':
                this.drawBullet(projectile);
                break;
            case 'rocket':
                this.drawRocket(projectile);
                break;
            case 'laser':
                this.drawLaser(projectile);
                break;
            default:
                this.drawBullet(projectile);
        }

        this.ctx.restore();
    }

    drawBullet(projectile) {
        const length = projectile.size * 3;
        const width = projectile.size;

        // Bullet body
        this.ctx.fillStyle = projectile.color;
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, length, width, 0, 0, Math.PI * 2);
        this.ctx.fill();

        // Metallic shine
        const gradient = this.ctx.createLinearGradient(0, -width, 0, width);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, length, width, 0, 0, Math.PI * 2);
        this.ctx.fill();

        // Glow
        const glowGradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, length * 2);
        glowGradient.addColorStop(0, projectile.color.replace(')', ', 0.6)').replace('rgb', 'rgba'));
        glowGradient.addColorStop(1, 'transparent');
        this.ctx.fillStyle = glowGradient;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, length * 2, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawRocket(projectile) {
        const length = projectile.size * 4;
        const width = projectile.size * 1.5;

        // Rocket body
        this.ctx.fillStyle = '#888888';
        this.ctx.fillRect(-length / 2, -width / 2, length, width);

        // Rocket nose cone
        this.ctx.fillStyle = '#666666';
        this.ctx.beginPath();
        this.ctx.moveTo(length / 2, 0);
        this.ctx.lineTo(length / 2 - width, -width / 2);
        this.ctx.lineTo(length / 2 - width, width / 2);
        this.ctx.closePath();
        this.ctx.fill();

        // Fins
        this.ctx.fillStyle = '#555555';
        this.ctx.beginPath();
        this.ctx.moveTo(-length / 2, -width / 2);
        this.ctx.lineTo(-length / 2 - width / 2, -width);
        this.ctx.lineTo(-length / 2, 0);
        this.ctx.closePath();
        this.ctx.fill();

        this.ctx.beginPath();
        this.ctx.moveTo(-length / 2, width / 2);
        this.ctx.lineTo(-length / 2 - width / 2, width);
        this.ctx.lineTo(-length / 2, 0);
        this.ctx.closePath();
        this.ctx.fill();

        // Exhaust flame
        const flameGradient = this.ctx.createRadialGradient(-length / 2, 0, 0, -length / 2 - width, 0, width * 2);
        flameGradient.addColorStop(0, '#FFFFFF');
        flameGradient.addColorStop(0.3, '#FFFF00');
        flameGradient.addColorStop(0.6, '#FF6600');
        flameGradient.addColorStop(1, 'transparent');
        this.ctx.fillStyle = flameGradient;
        this.ctx.beginPath();
        this.ctx.arc(-length / 2, 0, width * 2, 0, Math.PI * 2);
        this.ctx.fill();

        // Metallic highlight
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.fillRect(-length / 4, -width / 2, length / 3, width / 4);
    }

    drawLaser(projectile) {
        const length = projectile.size * 5;
        const width = projectile.size;

        // Core beam
        this.ctx.strokeStyle = projectile.color;
        this.ctx.lineWidth = width;
        this.ctx.lineCap = 'round';
        this.ctx.beginPath();
        this.ctx.moveTo(-length / 2, 0);
        this.ctx.lineTo(length / 2, 0);
        this.ctx.stroke();

        // Inner bright core
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = width / 2;
        this.ctx.beginPath();
        this.ctx.moveTo(-length / 2, 0);
        this.ctx.lineTo(length / 2, 0);
        this.ctx.stroke();

        // Outer glow
        const glowGradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, width * 3);
        glowGradient.addColorStop(0, projectile.color.replace(')', ', 0.8)').replace('rgb', 'rgba'));
        glowGradient.addColorStop(0.5, projectile.color.replace(')', ', 0.4)').replace('rgb', 'rgba'));
        glowGradient.addColorStop(1, 'transparent');
        this.ctx.fillStyle = glowGradient;
        this.ctx.fillRect(-length / 2, -width * 3, length, width * 6);

        // Energy particles along beam
        for (let i = 0; i < 5; i++) {
            const x = (Math.random() - 0.5) * length;
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.beginPath();
            this.ctx.arc(x, 0, width / 3, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    drawRangeIndicators() {
        if (!this.showRanges) return;

        // Draw range for selected tower
        if (this.gameState.selectedTower) {
            this.drawRange(
                this.gameState.selectedTower.position.x,
                this.gameState.selectedTower.position.y,
                this.gameState.selectedTower.getRange(),
                this.gameState.selectedTower.color
            );
        }

        // Draw range for tower being placed
        if (this.gameState.selectedTowerType && this.gameState.hoveredCell) {
            const towerInfo = getTowerInfo(this.gameState.selectedTowerType);
            const worldPos = gridToWorld(
                this.gameState.hoveredCell.x,
                this.gameState.hoveredCell.y,
                CONFIG.GAME.GRID_SIZE
            );

            this.drawRange(worldPos.x, worldPos.y, towerInfo.stats.range, towerInfo.color);
        }
    }

    drawRange(x, y, range, color) {
        this.ctx.strokeStyle = color;
        this.ctx.fillStyle = CONFIG.COLORS.RANGE_INDICATOR;
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);

        this.ctx.beginPath();
        this.ctx.arc(x, y, range, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();

        this.ctx.setLineDash([]);
    }

    drawSelectionHighlight() {
        if (!this.gameState.hoveredCell) return;

        const map = this.gameState.map;
        const gridSize = map.gridSize;
        const cell = this.gameState.hoveredCell;

        const isValid = map.isBuildable(cell.x, cell.y) &&
                       !this.gameState.getTowerAt(cell.x, cell.y);

        this.ctx.fillStyle = isValid ?
            CONFIG.COLORS.VALID_PLACEMENT :
            CONFIG.COLORS.INVALID_PLACEMENT;

        this.ctx.fillRect(
            cell.x * gridSize,
            cell.y * gridSize,
            gridSize,
            gridSize
        );

        this.ctx.strokeStyle = isValid ? '#4CAF50' : '#F44336';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(
            cell.x * gridSize,
            cell.y * gridSize,
            gridSize,
            gridSize
        );
    }

    // Particle effects
    emitExplosion(x, y, color) {
        this.particles.emitExplosion(x, y, color);
    }

    emitEnemyDeath(enemy) {
        this.particles.emitEnemyDeath(enemy.position.x, enemy.position.y, enemy.color);
        this.particles.emitReward(enemy.position.x, enemy.position.y);
    }

    emitUpgrade(tower) {
        this.particles.emitUpgrade(tower.position.x, tower.position.y, tower.color);
    }

    // Settings
    setShowGrid(show) {
        this.showGrid = show;
    }

    setShowRanges(show) {
        this.showRanges = show;
    }

    setShowHealthBars(show) {
        this.showHealthBars = show;
    }
}

export default Renderer;
