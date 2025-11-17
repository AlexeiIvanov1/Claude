// Combat system for handling projectiles and damage

import { distance } from '../utils/Math.js';
import { audioSystem } from '../utils/Audio.js';
import { eventBus, GameEvents } from '../core/EventBus.js';

export class CombatSystem {
    constructor(gameState) {
        this.gameState = gameState;
    }

    update(deltaTime) {
        // Update all projectiles
        this.updateProjectiles(deltaTime);

        // Update all towers
        this.updateTowers(deltaTime);

        // Update all enemies
        this.updateEnemies(deltaTime);

        // Clean up dead entities
        this.cleanupEntities();
    }

    updateProjectiles(deltaTime) {
        for (const projectile of this.gameState.projectiles) {
            projectile.update(deltaTime);

            // Check if hit target
            if (projectile.hasHitTarget()) {
                this.handleProjectileHit(projectile);
                projectile.destroy();
            }
        }
    }

    updateTowers(deltaTime) {
        for (const tower of this.gameState.towers) {
            tower.update(deltaTime, this.gameState.enemies, this.gameState);
        }
    }

    updateEnemies(deltaTime) {
        for (const enemy of this.gameState.enemies) {
            enemy.update(deltaTime);

            // Check if reached end
            if (enemy.hasReachedEnd()) {
                this.handleEnemyReachedBase(enemy);
            }
        }
    }

    handleProjectileHit(projectile) {
        if (!projectile.target || !projectile.target.alive) return;

        if (projectile.isSplash()) {
            // Splash damage
            this.applySplashDamage(projectile);
            audioSystem.playExplosion();
        } else {
            // Single target damage
            this.applyDamage(projectile.target, projectile.damage);

            // Apply slow effect if applicable
            if (projectile.appliesSlowEffect()) {
                projectile.target.applySlow(projectile.slowAmount, projectile.slowDuration);
            }

            audioSystem.playHit();
        }
    }

    applySplashDamage(projectile) {
        const hitPosition = projectile.target.position;

        for (const enemy of this.gameState.enemies) {
            if (!enemy.alive) continue;
            if (enemy.flying) continue; // Flying enemies immune to splash

            const dist = distance(enemy.position, hitPosition);

            if (dist <= projectile.splashRadius) {
                // Full damage at center, reduced at edges
                const damageMultiplier = 1 - (dist / projectile.splashRadius) * 0.5;
                const damage = projectile.damage * damageMultiplier;

                this.applyDamage(enemy, damage);
            }
        }
    }

    applyDamage(enemy, damage) {
        enemy.takeDamage(damage);

        if (!enemy.alive && enemy.wasKilled()) {
            audioSystem.playEnemyDeath();
        }
    }

    handleEnemyReachedBase(enemy) {
        // Enemy reached the base, lose life
        this.gameState.loseLife(1);
        enemy.destroy();
    }

    cleanupEntities() {
        // Remove dead projectiles
        this.gameState.projectiles = this.gameState.projectiles.filter(p => p.alive);

        // Remove dead/finished enemies
        const deadEnemies = this.gameState.enemies.filter(e => !e.alive);

        for (const enemy of deadEnemies) {
            this.gameState.removeEnemy(enemy, enemy.hasReachedEnd());
        }
    }
}

export default CombatSystem;
