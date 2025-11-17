// Particle system for visual effects

import { Vector2, randomRange } from '../utils/Math.js';

class Particle {
    constructor(x, y, options = {}) {
        this.position = new Vector2(x, y);
        this.velocity = options.velocity || new Vector2(0, 0);
        this.color = options.color || '#FFFFFF';
        this.size = options.size || 3;
        this.life = options.life || 1000;
        this.maxLife = this.life;
        this.alpha = 1;
        this.gravity = options.gravity || 0;
        this.fade = options.fade !== false;
    }

    update(deltaTime) {
        const dt = deltaTime / 1000;

        // Update position
        this.position.x += this.velocity.x * dt;
        this.position.y += this.velocity.y * dt;

        // Apply gravity
        this.velocity.y += this.gravity * dt;

        // Update life
        this.life -= deltaTime;

        // Update alpha
        if (this.fade) {
            this.alpha = this.life / this.maxLife;
        }
    }

    isAlive() {
        return this.life > 0;
    }

    render(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

export class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    update(deltaTime) {
        // Update all particles
        for (const particle of this.particles) {
            particle.update(deltaTime);
        }

        // Remove dead particles
        this.particles = this.particles.filter(p => p.isAlive());
    }

    render(ctx) {
        for (const particle of this.particles) {
            particle.render(ctx);
        }
    }

    // Emit an explosion effect
    emitExplosion(x, y, color = '#FF6600', count = 20) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const speed = randomRange(50, 150);

            const particle = new Particle(x, y, {
                velocity: new Vector2(
                    Math.cos(angle) * speed,
                    Math.sin(angle) * speed
                ),
                color: color,
                size: randomRange(2, 5),
                life: randomRange(300, 600),
                gravity: 100
            });

            this.particles.push(particle);
        }
    }

    // Emit a projectile trail
    emitProjectileTrail(x, y, color = '#FFFF00') {
        const particle = new Particle(x, y, {
            velocity: new Vector2(
                randomRange(-10, 10),
                randomRange(-10, 10)
            ),
            color: color,
            size: 2,
            life: 200,
            fade: true
        });

        this.particles.push(particle);
    }

    // Emit death effect
    emitEnemyDeath(x, y, color = '#FF0000', count = 15) {
        for (let i = 0; i < count; i++) {
            const angle = randomRange(0, Math.PI * 2);
            const speed = randomRange(30, 100);

            const particle = new Particle(x, y, {
                velocity: new Vector2(
                    Math.cos(angle) * speed,
                    Math.sin(angle) * speed
                ),
                color: color,
                size: randomRange(3, 6),
                life: randomRange(400, 800),
                gravity: 150
            });

            this.particles.push(particle);
        }
    }

    // Emit upgrade effect
    emitUpgrade(x, y, color = '#4CAF50') {
        for (let i = 0; i < 30; i++) {
            const angle = (Math.PI * 2 * i) / 30;
            const speed = randomRange(80, 120);

            const particle = new Particle(x, y, {
                velocity: new Vector2(
                    Math.cos(angle) * speed,
                    Math.sin(angle) * speed - 50 // Bias upward
                ),
                color: color,
                size: randomRange(2, 4),
                life: randomRange(500, 1000),
                gravity: -50 // Float upward
            });

            this.particles.push(particle);
        }
    }

    // Emit money/reward effect
    emitReward(x, y) {
        for (let i = 0; i < 10; i++) {
            const angle = randomRange(0, Math.PI * 2);
            const speed = randomRange(40, 80);

            const particle = new Particle(x, y, {
                velocity: new Vector2(
                    Math.cos(angle) * speed,
                    Math.sin(angle) * speed - 80 // Float up
                ),
                color: '#FFD700',
                size: randomRange(3, 5),
                life: randomRange(600, 1000),
                gravity: -30
            });

            this.particles.push(particle);
        }
    }

    clear() {
        this.particles = [];
    }

    getParticleCount() {
        return this.particles.length;
    }
}

export default ParticleSystem;
