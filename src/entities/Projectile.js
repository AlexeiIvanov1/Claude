// Projectile entity for tower attacks

import { Entity } from './Entity.js';
import { Vector2, distance } from '../utils/Math.js';
import { CONFIG } from '../utils/Config.js';

export class Projectile extends Entity {
    constructor(x, y, target, damage, speed, options = {}) {
        super(x, y);

        this.target = target;
        this.damage = damage;
        this.speed = speed || CONFIG.PROJECTILE.SPEED;

        // Optional properties
        this.splashRadius = options.splashRadius || 0;
        this.slowAmount = options.slowAmount || 0;
        this.slowDuration = options.slowDuration || 0;
        this.color = options.color || '#FFFF00';
        this.size = options.size || CONFIG.PROJECTILE.SIZE;
        this.towerType = options.towerType || 'BASIC';

        // Calculate direction to target
        this.updateDirection();

        // For homing projectiles
        this.homing = options.homing || false;
        this.maxDistance = options.maxDistance || Infinity;
        this.traveledDistance = 0;
    }

    updateDirection() {
        if (!this.target || !this.target.alive) return;

        const dx = this.target.position.x - this.position.x;
        const dy = this.target.position.y - this.position.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 0) {
            this.velocity = new Vector2(
                (dx / dist) * this.speed,
                (dy / dist) * this.speed
            );
        } else {
            this.velocity = new Vector2(0, 0);
        }
    }

    update(deltaTime) {
        if (!this.alive) return;

        // Update direction if homing
        if (this.homing && this.target && this.target.alive) {
            this.updateDirection();
        }

        // Move projectile
        const dt = deltaTime / 1000; // Convert to seconds
        const moveX = this.velocity.x * dt;
        const moveY = this.velocity.y * dt;

        this.position.x += moveX;
        this.position.y += moveY;

        // Track distance
        const moveDist = Math.sqrt(moveX * moveX + moveY * moveY);
        this.traveledDistance += moveDist;

        // Check if max distance exceeded
        if (this.traveledDistance > this.maxDistance) {
            this.destroy();
            return;
        }

        // Check if target is still valid
        if (!this.target || !this.target.alive) {
            this.destroy();
            return;
        }

        // Check if hit target
        const distToTarget = distance(this.position, this.target.position);

        if (distToTarget <= this.target.size) {
            this.hitTarget = true;
        }
    }

    hasHitTarget() {
        return this.hitTarget === true;
    }

    isSplash() {
        return this.splashRadius > 0;
    }

    appliesSlowEffect() {
        return this.slowAmount > 0 && this.slowDuration > 0;
    }
}

export default Projectile;
