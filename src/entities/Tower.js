// Tower entity

import { Entity } from './Entity.js';
import { distance, gridToWorld } from '../utils/Math.js';
import { CONFIG } from '../utils/Config.js';
import { Projectile } from './Projectile.js';
import { eventBus } from '../core/EventBus.js';

export class Tower extends Entity {
    constructor(type, gridX, gridY, gridSize) {
        const worldPos = gridToWorld(gridX, gridY, gridSize);
        super(worldPos.x, worldPos.y);

        this.type = type;
        this.gridX = gridX;
        this.gridY = gridY;
        this.gridSize = gridSize;
        this.level = 1;

        this.config = CONFIG.TOWERS[type];
        this.stats = this.config.levels[this.level - 1];

        this.color = this.config.color;
        this.name = this.config.name;
        this.description = this.config.description;

        // Combat
        this.target = null;
        this.cooldown = 0;
        this.cooldownTime = 1000 / this.stats.fireRate; // Convert to milliseconds

        // Upgrade tracking
        this.totalInvestment = this.config.cost;
    }

    update(deltaTime, enemies, gameState) {
        if (!this.alive) return;

        // Update cooldown
        if (this.cooldown > 0) {
            this.cooldown -= deltaTime;
        }

        // Try to acquire target if we don't have one
        if (!this.target || !this.target.alive) {
            this.target = this.findTarget(enemies);
        }

        // Check if current target is out of range
        if (this.target && !this.isInRange(this.target)) {
            this.target = null;
        }

        // Fire if ready and have target
        if (this.cooldown <= 0 && this.target) {
            this.fire(gameState);
            this.cooldown = this.cooldownTime;
        }
    }

    findTarget(enemies) {
        // Find enemies in range
        const inRange = enemies.filter(enemy => this.isInRange(enemy));

        if (inRange.length === 0) return null;

        // Targeting strategy: prioritize by path progress (furthest along)
        inRange.sort((a, b) => b.pathProgress - a.pathProgress);

        return inRange[0];
    }

    isInRange(enemy) {
        const dist = distance(this.position, enemy.position);
        return dist <= this.stats.range;
    }

    fire(gameState) {
        if (!this.target) return;

        // Create projectile
        const projectileOptions = {
            color: this.color,
            size: CONFIG.PROJECTILE.SIZE,
            towerType: this.type
        };

        // Add special effects based on tower type
        if (this.stats.splashRadius) {
            projectileOptions.splashRadius = this.stats.splashRadius;
        }

        if (this.stats.slowAmount) {
            projectileOptions.slowAmount = this.stats.slowAmount;
            projectileOptions.slowDuration = this.stats.slowDuration;
        }

        // Sniper has homing projectiles
        if (this.type === 'SNIPER') {
            projectileOptions.homing = true;
        }

        const projectile = new Projectile(
            this.position.x,
            this.position.y,
            this.target,
            this.stats.damage,
            CONFIG.PROJECTILE.SPEED,
            projectileOptions
        );

        gameState.addProjectile(projectile);

        // Emit fire event
        eventBus.emit('tower_fired', { tower: this, target: this.target });
    }

    canUpgrade() {
        return this.level < 3 && this.stats.upgradeCost !== null;
    }

    getUpgradeCost() {
        if (!this.canUpgrade()) return null;
        return this.stats.upgradeCost;
    }

    upgrade() {
        if (!this.canUpgrade()) return false;

        const cost = this.getUpgradeCost();
        this.level++;
        this.stats = this.config.levels[this.level - 1];
        this.cooldownTime = 1000 / this.stats.fireRate;
        this.totalInvestment += cost;

        return true;
    }

    getSellValue() {
        return this.stats.sellValue;
    }

    getRange() {
        return this.stats.range;
    }

    getDamage() {
        return this.stats.damage;
    }

    getFireRate() {
        return this.stats.fireRate;
    }

    getInfo() {
        return {
            name: this.name,
            type: this.type,
            level: this.level,
            damage: this.stats.damage,
            range: this.stats.range,
            fireRate: this.stats.fireRate,
            splashRadius: this.stats.splashRadius,
            slowAmount: this.stats.slowAmount,
            slowDuration: this.stats.slowDuration,
            upgradeCost: this.getUpgradeCost(),
            sellValue: this.getSellValue(),
            canUpgrade: this.canUpgrade()
        };
    }

    serialize() {
        return {
            ...super.serialize(),
            type: this.type,
            gridX: this.gridX,
            gridY: this.gridY,
            level: this.level,
            totalInvestment: this.totalInvestment
        };
    }
}

export default Tower;
