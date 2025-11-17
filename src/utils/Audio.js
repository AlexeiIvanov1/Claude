// Web Audio API wrapper for sound effects

export class AudioSystem {
    constructor() {
        this.context = null;
        this.enabled = true;
        this.volume = 0.7;
        this.sounds = new Map();

        // Initialize audio context on user interaction
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;

        try {
            this.context = new (window.AudioContext || window.webkitAudioContext)();
            this.initialized = true;
            console.log('Audio system initialized');
        } catch (error) {
            console.warn('Web Audio API not supported:', error);
            this.enabled = false;
        }
    }

    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
    }

    setEnabled(enabled) {
        this.enabled = enabled;
    }

    // Generate procedural sound effects
    playShoot(towerType) {
        if (!this.enabled || !this.initialized) return;

        const ctx = this.context;
        const now = ctx.currentTime;

        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        // Different sounds for different tower types
        switch(towerType) {
            case 'BASIC':
                oscillator.frequency.setValueAtTime(800, now);
                oscillator.frequency.exponentialRampToValueAtTime(400, now + 0.1);
                gainNode.gain.setValueAtTime(this.volume * 0.1, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                break;

            case 'SNIPER':
                oscillator.frequency.setValueAtTime(1200, now);
                oscillator.frequency.exponentialRampToValueAtTime(300, now + 0.15);
                gainNode.gain.setValueAtTime(this.volume * 0.15, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
                break;

            case 'SPLASH':
                oscillator.frequency.setValueAtTime(600, now);
                oscillator.frequency.exponentialRampToValueAtTime(200, now + 0.2);
                gainNode.gain.setValueAtTime(this.volume * 0.12, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
                break;

            case 'SLOW':
                oscillator.frequency.setValueAtTime(400, now);
                oscillator.frequency.exponentialRampToValueAtTime(600, now + 0.15);
                gainNode.gain.setValueAtTime(this.volume * 0.1, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
                break;
        }

        oscillator.type = 'triangle';
        oscillator.start(now);
        oscillator.stop(now + 0.2);
    }

    playHit() {
        if (!this.enabled || !this.initialized) return;

        const ctx = this.context;
        const now = ctx.currentTime;

        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.frequency.setValueAtTime(200, now);
        oscillator.frequency.exponentialRampToValueAtTime(50, now + 0.05);

        gainNode.gain.setValueAtTime(this.volume * 0.15, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

        oscillator.type = 'sawtooth';
        oscillator.start(now);
        oscillator.stop(now + 0.05);
    }

    playExplosion() {
        if (!this.enabled || !this.initialized) return;

        const ctx = this.context;
        const now = ctx.currentTime;

        // Create noise
        const bufferSize = ctx.sampleRate * 0.3;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'lowpass';
        noiseFilter.frequency.setValueAtTime(1000, now);
        noiseFilter.frequency.exponentialRampToValueAtTime(100, now + 0.3);

        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(this.volume * 0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

        noise.connect(noiseFilter);
        noiseFilter.connect(gainNode);
        gainNode.connect(ctx.destination);

        noise.start(now);
        noise.stop(now + 0.3);
    }

    playEnemyDeath() {
        if (!this.enabled || !this.initialized) return;

        const ctx = this.context;
        const now = ctx.currentTime;

        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.frequency.setValueAtTime(300, now);
        oscillator.frequency.exponentialRampToValueAtTime(100, now + 0.2);

        gainNode.gain.setValueAtTime(this.volume * 0.2, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

        oscillator.type = 'square';
        oscillator.start(now);
        oscillator.stop(now + 0.2);
    }

    playWaveStart() {
        if (!this.enabled || !this.initialized) return;

        const ctx = this.context;
        const now = ctx.currentTime;

        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.frequency.setValueAtTime(400, now);
        oscillator.frequency.linearRampToValueAtTime(800, now + 0.1);
        oscillator.frequency.linearRampToValueAtTime(600, now + 0.2);

        gainNode.gain.setValueAtTime(this.volume * 0.2, now);
        gainNode.gain.linearRampToValueAtTime(this.volume * 0.1, now + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

        oscillator.type = 'sine';
        oscillator.start(now);
        oscillator.stop(now + 0.2);
    }

    playWaveComplete() {
        if (!this.enabled || !this.initialized) return;

        const ctx = this.context;
        const now = ctx.currentTime;

        // Play a pleasant chord
        const frequencies = [523.25, 659.25, 783.99]; // C, E, G

        frequencies.forEach((freq, index) => {
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            oscillator.frequency.setValueAtTime(freq, now);

            const delay = index * 0.05;
            gainNode.gain.setValueAtTime(0, now + delay);
            gainNode.gain.linearRampToValueAtTime(this.volume * 0.1, now + delay + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.4);

            oscillator.type = 'sine';
            oscillator.start(now + delay);
            oscillator.stop(now + delay + 0.4);
        });
    }

    playPlaceTower() {
        if (!this.enabled || !this.initialized) return;

        const ctx = this.context;
        const now = ctx.currentTime;

        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.frequency.setValueAtTime(600, now);
        oscillator.frequency.linearRampToValueAtTime(800, now + 0.08);

        gainNode.gain.setValueAtTime(this.volume * 0.15, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

        oscillator.type = 'square';
        oscillator.start(now);
        oscillator.stop(now + 0.08);
    }

    playUpgrade() {
        if (!this.enabled || !this.initialized) return;

        const ctx = this.context;
        const now = ctx.currentTime;

        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.frequency.setValueAtTime(800, now);
        oscillator.frequency.linearRampToValueAtTime(1200, now + 0.15);

        gainNode.gain.setValueAtTime(this.volume * 0.15, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

        oscillator.type = 'sine';
        oscillator.start(now);
        oscillator.stop(now + 0.15);
    }

    playError() {
        if (!this.enabled || !this.initialized) return;

        const ctx = this.context;
        const now = ctx.currentTime;

        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.frequency.setValueAtTime(200, now);
        oscillator.frequency.linearRampToValueAtTime(150, now + 0.1);

        gainNode.gain.setValueAtTime(this.volume * 0.2, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

        oscillator.type = 'sawtooth';
        oscillator.start(now);
        oscillator.stop(now + 0.1);
    }

    playGameOver() {
        if (!this.enabled || !this.initialized) return;

        const ctx = this.context;
        const now = ctx.currentTime;

        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.frequency.setValueAtTime(400, now);
        oscillator.frequency.exponentialRampToValueAtTime(100, now + 0.5);

        gainNode.gain.setValueAtTime(this.volume * 0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

        oscillator.type = 'square';
        oscillator.start(now);
        oscillator.stop(now + 0.5);
    }

    playVictory() {
        if (!this.enabled || !this.initialized) return;

        const ctx = this.context;
        const now = ctx.currentTime;

        // Play ascending arpeggio
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C, E, G, C

        notes.forEach((freq, index) => {
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            oscillator.frequency.setValueAtTime(freq, now);

            const delay = index * 0.1;
            gainNode.gain.setValueAtTime(this.volume * 0.2, now + delay);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.3);

            oscillator.type = 'sine';
            oscillator.start(now + delay);
            oscillator.stop(now + delay + 0.3);
        });
    }
}

// Create singleton instance
export const audioSystem = new AudioSystem();

export default audioSystem;
