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
        // Enemy body
        this.ctx.fillStyle = enemy.color;
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 1;

        if (enemy.flying) {
            // Draw flying enemies as triangles
            this.drawTriangle(enemy.position.x, enemy.position.y, enemy.size);
        } else {
            // Draw ground enemies as circles
            this.ctx.beginPath();
            this.ctx.arc(enemy.position.x, enemy.position.y, enemy.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.stroke();
        }

        // Draw slow effect indicator
        if (enemy.isSlowed()) {
            this.ctx.strokeStyle = '#9C27B0';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(enemy.position.x, enemy.position.y, enemy.size + 3, 0, Math.PI * 2);
            this.ctx.stroke();
        }

        // Draw health bar
        if (this.showHealthBars && enemy.hp < enemy.maxHp) {
            this.drawHealthBar(enemy);
        }
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

            // Add trail effect
            if (Math.random() < 0.5) {
                this.particles.emitProjectileTrail(
                    projectile.position.x,
                    projectile.position.y,
                    projectile.color
                );
            }
        }
    }

    drawProjectile(projectile) {
        this.ctx.fillStyle = projectile.color;
        this.ctx.beginPath();
        this.ctx.arc(
            projectile.position.x,
            projectile.position.y,
            projectile.size,
            0,
            Math.PI * 2
        );
        this.ctx.fill();

        // Glow effect
        const gradient = this.ctx.createRadialGradient(
            projectile.position.x,
            projectile.position.y,
            0,
            projectile.position.x,
            projectile.position.y,
            projectile.size * 2
        );
        gradient.addColorStop(0, projectile.color);
        gradient.addColorStop(1, 'transparent');

        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(
            projectile.position.x,
            projectile.position.y,
            projectile.size * 2,
            0,
            Math.PI * 2
        );
        this.ctx.fill();
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
