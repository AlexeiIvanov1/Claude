// Web Audio API wrapper for sound effects

export class AudioSystem {
    constructor() {
        this.context = null;
        this.enabled = true;
        this.volume = 0.7;
        this.sounds = new Map();

        // Initialize audio context on user interaction
        this.initialized = false;

        // Music system
        this.musicEnabled = true;
        this.musicVolume = 0.3;
        this.musicNodes = [];
        this.musicPlaying = false;
        this.currentBPM = 180; // Speed metal tempo
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

    setMusicEnabled(enabled) {
        this.musicEnabled = enabled;
        if (!enabled && this.musicPlaying) {
            this.stopMusic();
        }
    }

    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
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

    // ===== SPEED METAL MUSIC GENERATOR =====

    startMusic() {
        if (!this.musicEnabled || !this.initialized || this.musicPlaying) return;

        this.musicPlaying = true;
        console.log('🎸 STARTING SPEED METAL! 🎸');

        // Start the continuous music loop
        this.scheduleNextMusicalPhrase();
    }

    stopMusic() {
        this.musicPlaying = false;

        // Stop all active music nodes
        this.musicNodes.forEach(node => {
            try {
                if (node.stop) node.stop();
                if (node.disconnect) node.disconnect();
            } catch (e) {
                // Node may already be stopped
            }
        });
        this.musicNodes = [];

        console.log('🎸 METAL PAUSED 🎸');
    }

    scheduleNextMusicalPhrase() {
        if (!this.musicPlaying) return;

        const ctx = this.context;
        const now = ctx.currentTime;
        const beatDuration = 60 / this.currentBPM; // Duration of one beat

        // Schedule 4 bars of music (16 beats)
        const phraseDuration = beatDuration * 16;

        // Play drums
        this.playDrumPattern(now, phraseDuration, beatDuration);

        // Play bass guitar
        this.playBassLine(now, phraseDuration, beatDuration);

        // Play rhythm guitar (power chords)
        this.playRhythmGuitar(now, phraseDuration, beatDuration);

        // Play lead guitar riff
        if (Math.random() < 0.4) {
            this.playLeadGuitarRiff(now, phraseDuration, beatDuration);
        }

        // Schedule next phrase
        setTimeout(() => {
            this.scheduleNextMusicalPhrase();
        }, phraseDuration * 1000);
    }

    playDrumPattern(startTime, duration, beatDuration) {
        const ctx = this.context;
        const beats = Math.floor(duration / beatDuration);

        for (let beat = 0; beat < beats; beat++) {
            const time = startTime + beat * beatDuration;

            // Kick drum on 1 and 3
            if (beat % 4 === 0 || beat % 4 === 2) {
                this.playKickDrum(time);
            }

            // Snare on 2 and 4
            if (beat % 4 === 1 || beat % 4 === 3) {
                this.playSnare(time);
            }

            // Hi-hat every 8th note (double-time)
            for (let i = 0; i < 2; i++) {
                this.playHiHat(time + i * (beatDuration / 2));
            }

            // Occasional double bass drum (speed metal signature)
            if (Math.random() < 0.3 && beat % 4 === 0) {
                this.playKickDrum(time + beatDuration / 4);
            }
        }
    }

    playKickDrum(time) {
        const ctx = this.context;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.frequency.setValueAtTime(150, time);
        osc.frequency.exponentialRampToValueAtTime(40, time + 0.05);

        gain.gain.setValueAtTime(this.musicVolume * 0.8, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);

        osc.start(time);
        osc.stop(time + 0.1);

        this.musicNodes.push(osc);
    }

    playSnare(time) {
        const ctx = this.context;

        // White noise for snare
        const bufferSize = ctx.sampleRate * 0.1;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 1000;

        const gain = ctx.createGain();

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        gain.gain.setValueAtTime(this.musicVolume * 0.5, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);

        noise.start(time);
        noise.stop(time + 0.1);

        this.musicNodes.push(noise);
    }

    playHiHat(time) {
        const ctx = this.context;

        const bufferSize = ctx.sampleRate * 0.03;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 7000;

        const gain = ctx.createGain();

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        gain.gain.setValueAtTime(this.musicVolume * 0.15, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.03);

        noise.start(time);
        noise.stop(time + 0.03);

        this.musicNodes.push(noise);
    }

    playBassLine(startTime, duration, beatDuration) {
        const ctx = this.context;

        // Power chord root notes (E minor pentatonic scale)
        const bassNotes = [82.41, 110, 123.47, 146.83]; // E2, A2, B2, D3

        const beats = Math.floor(duration / beatDuration);

        for (let beat = 0; beat < beats; beat++) {
            const time = startTime + beat * beatDuration;
            const note = bassNotes[beat % bassNotes.length];

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const distortion = ctx.createWaveShaper();

            // Create distortion curve
            const curve = new Float32Array(256);
            for (let i = 0; i < 256; i++) {
                const x = (i - 128) / 128;
                curve[i] = Math.tanh(x * 3);
            }
            distortion.curve = curve;

            osc.connect(distortion);
            distortion.connect(gain);
            gain.connect(ctx.destination);

            osc.type = 'sawtooth';
            osc.frequency.value = note;

            gain.gain.setValueAtTime(this.musicVolume * 0.4, time);
            gain.gain.exponentialRampToValueAtTime(0.01, time + beatDuration * 0.9);

            osc.start(time);
            osc.stop(time + beatDuration);

            this.musicNodes.push(osc);
        }
    }

    playRhythmGuitar(startTime, duration, beatDuration) {
        const ctx = this.context;

        // Power chords (E5, A5, B5, D5)
        const powerChords = [
            [82.41, 123.47], // E5
            [110, 164.81],   // A5
            [123.47, 185],   // B5
            [146.83, 220]    // D5
        ];

        const beats = Math.floor(duration / beatDuration);

        for (let beat = 0; beat < beats; beat += 2) {
            const time = startTime + beat * beatDuration;
            const chord = powerChords[Math.floor(beat / 2) % powerChords.length];

            chord.forEach(freq => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                const distortion = ctx.createWaveShaper();
                const filter = ctx.createBiquadFilter();

                // Heavy distortion for metal guitar
                const curve = new Float32Array(256);
                for (let i = 0; i < 256; i++) {
                    const x = (i - 128) / 128;
                    curve[i] = Math.tanh(x * 5); // Heavy distortion
                }
                distortion.curve = curve;

                filter.type = 'bandpass';
                filter.frequency.value = 2000;
                filter.Q.value = 2;

                osc.connect(distortion);
                distortion.connect(filter);
                filter.connect(gain);
                gain.connect(ctx.destination);

                osc.type = 'sawtooth';
                osc.frequency.value = freq;

                // Palm-muted chugging rhythm
                gain.gain.setValueAtTime(this.musicVolume * 0.3, time);
                gain.gain.exponentialRampToValueAtTime(0.01, time + beatDuration * 0.4);

                osc.start(time);
                osc.stop(time + beatDuration);

                this.musicNodes.push(osc);
            });
        }
    }

    playLeadGuitarRiff(startTime, duration, beatDuration) {
        const ctx = this.context;

        // Fast shred riff in E minor pentatonic
        const riffNotes = [659.25, 739.99, 783.99, 880, 987.77, 1174.66];

        const noteDuration = beatDuration / 4; // 16th notes for speed

        for (let i = 0; i < 16; i++) {
            const time = startTime + i * noteDuration;
            const note = riffNotes[Math.floor(Math.random() * riffNotes.length)];

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const distortion = ctx.createWaveShaper();
            const filter = ctx.createBiquadFilter();

            const curve = new Float32Array(256);
            for (let j = 0; j < 256; j++) {
                const x = (j - 128) / 128;
                curve[j] = Math.tanh(x * 4);
            }
            distortion.curve = curve;

            filter.type = 'bandpass';
            filter.frequency.value = 3000;
            filter.Q.value = 3;

            osc.connect(distortion);
            distortion.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);

            osc.type = 'sawtooth';
            osc.frequency.value = note;

            // Add vibrato for expressiveness
            const vibrato = ctx.createOscillator();
            const vibratoGain = ctx.createGain();
            vibrato.frequency.value = 5;
            vibratoGain.gain.value = 10;
            vibrato.connect(vibratoGain);
            vibratoGain.connect(osc.frequency);
            vibrato.start(time);
            vibrato.stop(time + noteDuration);

            gain.gain.setValueAtTime(this.musicVolume * 0.25, time);
            gain.gain.exponentialRampToValueAtTime(0.01, time + noteDuration * 0.8);

            osc.start(time);
            osc.stop(time + noteDuration);

            this.musicNodes.push(osc, vibrato);
        }
    }
}

// Create singleton instance
export const audioSystem = new AudioSystem();

export default audioSystem;
