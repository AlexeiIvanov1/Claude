// Enemy entity

import { Entity } from './Entity.js';
import { Vector2, distance, gridToWorld } from '../utils/Math.js';
import { CONFIG } from '../utils/Config.js';

export class Enemy extends Entity {
    constructor(type, path, gridSize) {
        // Start at the first point of the path (in world coordinates)
        const startWorld = gridToWorld(path[0].x, path[0].y, gridSize);
        super(startWorld.x, startWorld.y);

        this.type = type;
        this.config = CONFIG.ENEMIES[type];

        // Stats
        this.maxHp = this.config.hp;
        this.hp = this.maxHp;
        this.baseSpeed = this.config.speed;
        this.speed = this.baseSpeed;
        this.reward = this.config.reward;
        this.color = this.config.color;
        this.size = this.config.size;
        this.flying = this.config.flying || false;

        // Path following
        this.path = path;
        this.gridSize = gridSize;
        this.currentWaypoint = 0;
        this.targetPosition = this.getNextTargetPosition();

        // Status effects
        this.slowEffects = [];

        // Progress along path (0 to 1)
        this.pathProgress = 0;
    }

    getNextTargetPosition() {
        if (this.currentWaypoint >= this.path.length) {
            return null;
        }

        const waypoint = this.path[this.currentWaypoint];
        return gridToWorld(waypoint.x, waypoint.y, this.gridSize);
    }

    update(deltaTime) {
        if (!this.alive) return;

        // Update slow effects
        this.updateSlowEffects(deltaTime);

        // Move towards target
        if (this.targetPosition) {
            this.moveTowardsTarget(deltaTime);
        }
    }

    moveTowardsTarget(deltaTime) {
        const dt = deltaTime / 1000; // Convert to seconds

        // Calculate direction to target
        const dx = this.targetPosition.x - this.position.x;
        const dy = this.targetPosition.y - this.position.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 2) {
            // Reached waypoint, move to next
            this.currentWaypoint++;
            this.targetPosition = this.getNextTargetPosition();

            if (!this.targetPosition) {
                // Reached the end
                this.reachedEnd = true;
            }

            return;
        }

        // Move towards target
        const moveDistance = this.speed * dt;
        const moveX = (dx / dist) * moveDistance;
        const moveY = (dy / dist) * moveDistance;

        this.position.x += moveX;
        this.position.y += moveY;

        // Update path progress
        this.pathProgress = this.currentWaypoint / this.path.length;
    }

    takeDamage(amount) {
        this.hp -= amount;

        if (this.hp <= 0) {
            this.hp = 0;
            this.die();
        }
    }

    die() {
        this.alive = false;
        this.killed = true;
    }

    hasReachedEnd() {
        return this.reachedEnd === true;
    }

    wasKilled() {
        return this.killed === true;
    }

    applySlow(amount, duration) {
        this.slowEffects.push({
            amount: amount,
            duration: duration,
            remainingTime: duration
        });

        this.updateSpeed();
    }

    updateSlowEffects(deltaTime) {
        // Update slow effect timers
        this.slowEffects = this.slowEffects.filter(effect => {
            effect.remainingTime -= deltaTime;
            return effect.remainingTime > 0;
        });

        this.updateSpeed();
    }

    updateSpeed() {
        // Calculate current speed based on slow effects
        let slowMultiplier = 1.0;

        if (this.slowEffects.length > 0) {
            // Use the strongest slow effect
            const strongestSlow = Math.max(...this.slowEffects.map(e => e.amount));
            slowMultiplier = 1.0 - strongestSlow;
        }

        this.speed = this.baseSpeed * slowMultiplier;
    }

    isSlowed() {
        return this.slowEffects.length > 0;
    }

    getHealthPercentage() {
        return this.hp / this.maxHp;
    }

    getHealthBarColor() {
        const percentage = this.getHealthPercentage();

        if (percentage > 0.6) {
            return CONFIG.COLORS.HEALTH_BAR_FG;
        } else if (percentage > 0.3) {
            return CONFIG.COLORS.HEALTH_BAR_WARN;
        } else {
            return CONFIG.COLORS.HEALTH_BAR_CRITICAL;
        }
    }
}

export default Enemy;
