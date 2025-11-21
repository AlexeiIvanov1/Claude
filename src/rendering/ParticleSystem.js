// Advanced particle system for realistic visual effects

import { Vector2, randomRange, randomInt } from '../utils/Math.js';

// Helper function to convert hex/rgb colors to rgba
function colorToRGBA(color, alpha) {
    // If it's already an rgba or rgb, try to modify it
    if (color.startsWith('rgba')) {
        return color.replace(/[\d.]+\)$/g, alpha + ')');
    }
    if (color.startsWith('rgb')) {
        return color.replace('rgb', 'rgba').replace(')', `, ${alpha})`);
    }
    // If it's a hex color, convert it
    if (color.startsWith('#')) {
        const hex = color.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    // Fallback
    return `rgba(255, 255, 255, ${alpha})`;
}

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
        this.rotation = options.rotation || 0;
        this.rotationSpeed = options.rotationSpeed || 0;
        this.type = options.type || 'circle'; // circle, square, spark, smoke, fire
        this.shrink = options.shrink || false;
        this.startSize = this.size;
        this.glow = options.glow || false;
        this.glowColor = options.glowColor || this.color;
        this.friction = options.friction || 0;
    }

    update(deltaTime) {
        const dt = deltaTime / 1000;

        // Update position
        this.position.x += this.velocity.x * dt;
        this.position.y += this.velocity.y * dt;

        // Apply gravity
        this.velocity.y += this.gravity * dt;

        // Apply friction
        if (this.friction > 0) {
            this.velocity.x *= (1 - this.friction * dt);
            this.velocity.y *= (1 - this.friction * dt);
        }

        // Update rotation
        this.rotation += this.rotationSpeed * dt;

        // Update life
        this.life -= deltaTime;

        // Update alpha
        if (this.fade) {
            this.alpha = this.life / this.maxLife;
        }

        // Update size (shrink)
        if (this.shrink) {
            this.size = this.startSize * (this.life / this.maxLife);
        }
    }

    isAlive() {
        return this.life > 0;
    }

    render(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.rotation);

        switch (this.type) {
            case 'circle':
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(0, 0, this.size, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 'square':
                ctx.fillStyle = this.color;
                ctx.fillRect(-this.size, -this.size, this.size * 2, this.size * 2);
                break;

            case 'spark':
                // Draw elongated spark
                ctx.strokeStyle = this.color;
                ctx.lineWidth = this.size;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(this.size * 3, 0);
                ctx.stroke();
                break;

            case 'smoke':
                // Draw soft smoke with gradient
                const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
                gradient.addColorStop(0, this.color);
                gradient.addColorStop(0.5, colorToRGBA(this.color, 0.5));
                gradient.addColorStop(1, 'transparent');
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(0, 0, this.size, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 'fire':
                // Draw fire with multiple layers
                const fireGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
                fireGradient.addColorStop(0, '#FFFFFF');
                fireGradient.addColorStop(0.3, this.color);
                fireGradient.addColorStop(0.7, '#FF6600');
                fireGradient.addColorStop(1, 'transparent');
                ctx.fillStyle = fireGradient;
                ctx.beginPath();
                ctx.arc(0, 0, this.size, 0, Math.PI * 2);
                ctx.fill();
                break;
        }

        // Add glow effect
        if (this.glow) {
            const glowGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size * 2);
            glowGradient.addColorStop(0, colorToRGBA(this.glowColor, 0.8));
            glowGradient.addColorStop(0.5, colorToRGBA(this.glowColor, 0.3));
            glowGradient.addColorStop(1, 'transparent');
            ctx.fillStyle = glowGradient;
            ctx.beginPath();
            ctx.arc(0, 0, this.size * 2, 0, Math.PI * 2);
            ctx.fill();
        }

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

    // REALISTIC EXPLOSION - Multi-stage with fire, smoke, shockwave, and debris
    emitExplosion(x, y, color = '#FF6600', intensity = 1) {
        const count = Math.floor(50 * intensity);

        // Stage 1: Flash/Shockwave
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8;
            const speed = randomRange(300, 400) * intensity;

            this.particles.push(new Particle(x, y, {
                velocity: new Vector2(Math.cos(angle) * speed, Math.sin(angle) * speed),
                color: '#FFFFFF',
                size: randomRange(15, 25) * intensity,
                life: randomRange(100, 200),
                type: 'circle',
                fade: true,
                shrink: true,
                glow: true,
                glowColor: '#FFFF00'
            }));
        }

        // Stage 2: Fire burst
        for (let i = 0; i < count * 0.4; i++) {
            const angle = randomRange(0, Math.PI * 2);
            const speed = randomRange(100, 250) * intensity;

            this.particles.push(new Particle(x, y, {
                velocity: new Vector2(Math.cos(angle) * speed, Math.sin(angle) * speed),
                color: i % 2 === 0 ? '#FF6600' : '#FF3300',
                size: randomRange(8, 15) * intensity,
                life: randomRange(400, 700),
                type: 'fire',
                gravity: -50,
                fade: true,
                shrink: true,
                glow: true
            }));
        }

        // Stage 3: Sparks and debris
        for (let i = 0; i < count * 0.4; i++) {
            const angle = randomRange(0, Math.PI * 2);
            const speed = randomRange(150, 300) * intensity;

            this.particles.push(new Particle(x, y, {
                velocity: new Vector2(Math.cos(angle) * speed, Math.sin(angle) * speed),
                color: randomInt(0, 1) === 0 ? '#FFFF00' : '#FFA500',
                size: randomRange(2, 4),
                life: randomRange(300, 600),
                type: 'spark',
                gravity: 200,
                rotation: angle,
                rotationSpeed: randomRange(-10, 10),
                fade: true,
                glow: true
            }));
        }

        // Stage 4: Black smoke
        for (let i = 0; i < count * 0.2; i++) {
            const angle = randomRange(0, Math.PI * 2);
            const speed = randomRange(50, 120) * intensity;

            this.particles.push(new Particle(x, y, {
                velocity: new Vector2(Math.cos(angle) * speed, Math.sin(angle) * speed - 30),
                color: 'rgba(40, 40, 40, 0.6)',
                size: randomRange(10, 20) * intensity,
                life: randomRange(800, 1200),
                type: 'smoke',
                gravity: -30,
                fade: true,
                friction: 0.5
            }));
        }
    }

    // Projectile trail effect
    emitProjectileTrail(x, y, color = '#FFFF00', type = 'basic') {
        switch (type) {
            case 'basic':
                this.particles.push(new Particle(x, y, {
                    velocity: new Vector2(randomRange(-15, 15), randomRange(-15, 15)),
                    color: color,
                    size: randomRange(2, 4),
                    life: 300,
                    fade: true,
                    glow: true
                }));
                break;

            case 'rocket':
                // Rocket smoke trail
                this.particles.push(new Particle(x, y, {
                    velocity: new Vector2(randomRange(-20, 20), randomRange(-20, 20)),
                    color: 'rgba(200, 200, 200, 0.8)',
                    size: randomRange(5, 8),
                    life: 500,
                    type: 'smoke',
                    fade: true,
                    friction: 0.3
                }));
                // Fire trail
                if (Math.random() < 0.3) {
                    this.particles.push(new Particle(x, y, {
                        velocity: new Vector2(randomRange(-10, 10), randomRange(-10, 10)),
                        color: '#FF6600',
                        size: randomRange(4, 7),
                        life: 200,
                        type: 'fire',
                        fade: true,
                        glow: true
                    }));
                }
                break;

            case 'laser':
                // Energy particles
                this.particles.push(new Particle(x, y, {
                    velocity: new Vector2(randomRange(-5, 5), randomRange(-5, 5)),
                    color: color,
                    size: randomRange(3, 5),
                    life: 200,
                    type: 'circle',
                    fade: true,
                    glow: true,
                    glowColor: color
                }));
                break;
        }
    }

    // Enemy death effect with gore and debris
    emitEnemyDeath(x, y, color = '#FF0000', count = 30) {
        // Blood splatter
        for (let i = 0; i < count * 0.5; i++) {
            const angle = randomRange(0, Math.PI * 2);
            const speed = randomRange(80, 180);

            this.particles.push(new Particle(x, y, {
                velocity: new Vector2(Math.cos(angle) * speed, Math.sin(angle) * speed),
                color: color,
                size: randomRange(4, 8),
                life: randomRange(500, 900),
                type: 'circle',
                gravity: 250,
                fade: true
            }));
        }

        // Debris chunks
        for (let i = 0; i < count * 0.3; i++) {
            const angle = randomRange(0, Math.PI * 2);
            const speed = randomRange(100, 200);

            this.particles.push(new Particle(x, y, {
                velocity: new Vector2(Math.cos(angle) * speed, Math.sin(angle) * speed),
                color: '#333333',
                size: randomRange(3, 6),
                life: randomRange(600, 1000),
                type: 'square',
                gravity: 300,
                rotation: randomRange(0, Math.PI * 2),
                rotationSpeed: randomRange(-15, 15),
                fade: true
            }));
        }

        // Impact sparks
        for (let i = 0; i < count * 0.2; i++) {
            const angle = randomRange(0, Math.PI * 2);
            const speed = randomRange(120, 250);

            this.particles.push(new Particle(x, y, {
                velocity: new Vector2(Math.cos(angle) * speed, Math.sin(angle) * speed),
                color: '#FFA500',
                size: randomRange(2, 4),
                life: randomRange(200, 400),
                type: 'spark',
                gravity: 150,
                rotation: angle,
                fade: true,
                glow: true
            }));
        }
    }

    // Tower upgrade effect - energy burst
    emitUpgrade(x, y, color = '#4CAF50') {
        // Energy rings
        for (let ring = 0; ring < 3; ring++) {
            setTimeout(() => {
                for (let i = 0; i < 40; i++) {
                    const angle = (Math.PI * 2 * i) / 40;
                    const speed = 150;

                    this.particles.push(new Particle(x, y, {
                        velocity: new Vector2(Math.cos(angle) * speed, Math.sin(angle) * speed),
                        color: color,
                        size: randomRange(3, 6),
                        life: 600,
                        type: 'circle',
                        gravity: -80,
                        fade: true,
                        glow: true,
                        glowColor: color
                    }));
                }
            }, ring * 100);
        }

        // Upward energy stream
        for (let i = 0; i < 30; i++) {
            const angle = randomRange(-Math.PI / 4, Math.PI / 4) - Math.PI / 2;
            const speed = randomRange(100, 200);

            this.particles.push(new Particle(x, y, {
                velocity: new Vector2(Math.cos(angle) * speed, Math.sin(angle) * speed),
                color: color,
                size: randomRange(4, 8),
                life: randomRange(800, 1200),
                type: 'fire',
                gravity: -100,
                fade: true,
                shrink: true,
                glow: true
            }));
        }
    }

    // Money/reward effect
    emitReward(x, y) {
        for (let i = 0; i < 15; i++) {
            const angle = randomRange(0, Math.PI * 2);
            const speed = randomRange(50, 100);

            this.particles.push(new Particle(x, y, {
                velocity: new Vector2(Math.cos(angle) * speed, Math.sin(angle) * speed - 100),
                color: '#FFD700',
                size: randomRange(4, 7),
                life: randomRange(800, 1200),
                type: 'circle',
                gravity: -50,
                fade: true,
                glow: true,
                glowColor: '#FFFF00'
            }));
        }

        // Dollar sign sparkles
        for (let i = 0; i < 10; i++) {
            const angle = randomRange(0, Math.PI * 2);
            const speed = randomRange(40, 80);

            this.particles.push(new Particle(x, y, {
                velocity: new Vector2(Math.cos(angle) * speed, Math.sin(angle) * speed - 80),
                color: '#FFFF00',
                size: 3,
                life: randomRange(600, 1000),
                type: 'spark',
                gravity: -30,
                rotation: randomRange(0, Math.PI * 2),
                rotationSpeed: randomRange(-10, 10),
                fade: true,
                glow: true
            }));
        }
    }

    // Muzzle flash effect
    emitMuzzleFlash(x, y, angle, color = '#FFFF00') {
        // Bright flash
        for (let i = 0; i < 5; i++) {
            const spread = randomRange(-0.3, 0.3);
            const flashAngle = angle + spread;

            this.particles.push(new Particle(x, y, {
                velocity: new Vector2(Math.cos(flashAngle) * 100, Math.sin(flashAngle) * 100),
                color: '#FFFFFF',
                size: randomRange(8, 12),
                life: 100,
                type: 'fire',
                fade: true,
                shrink: true,
                glow: true,
                glowColor: color
            }));
        }

        // Smoke puff
        for (let i = 0; i < 3; i++) {
            const spread = randomRange(-0.5, 0.5);
            const smokeAngle = angle + spread;

            this.particles.push(new Particle(x, y, {
                velocity: new Vector2(Math.cos(smokeAngle) * 50, Math.sin(smokeAngle) * 50),
                color: 'rgba(150, 150, 150, 0.6)',
                size: randomRange(6, 10),
                life: 300,
                type: 'smoke',
                fade: true,
                friction: 0.5
            }));
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
