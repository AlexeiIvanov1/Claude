// HUD (Heads-Up Display) component

import { CONFIG } from '../utils/Config.js';

export class HUD {
    constructor(gameState) {
        this.gameState = gameState;

        // Get DOM elements
        this.element = document.getElementById('hud');
        this.moneyDisplay = document.getElementById('money-display');
        this.livesDisplay = document.getElementById('lives-display');
        this.waveDisplay = document.getElementById('wave-display');
        this.scoreDisplay = document.getElementById('score-display');
        this.startWaveBtn = document.getElementById('start-wave-btn');
        this.pauseBtn = document.getElementById('pause-btn');

        // Speed control buttons
        this.speed1xBtn = document.getElementById('speed-1x');
        this.speed2xBtn = document.getElementById('speed-2x');
        this.speed4xBtn = document.getElementById('speed-4x');

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Start wave button
        if (this.startWaveBtn) {
            this.startWaveBtn.addEventListener('click', () => {
                this.onStartWaveClick();
            });
        }

        // Pause button
        if (this.pauseBtn) {
            this.pauseBtn.addEventListener('click', () => {
                this.onPauseClick();
            });
        }

        // Speed control buttons
        if (this.speed1xBtn) {
            this.speed1xBtn.addEventListener('click', () => this.setSpeed(1));
        }
        if (this.speed2xBtn) {
            this.speed2xBtn.addEventListener('click', () => this.setSpeed(2));
        }
        if (this.speed4xBtn) {
            this.speed4xBtn.addEventListener('click', () => this.setSpeed(4));
        }
    }

    onStartWaveClick() {
        const event = new CustomEvent('startWave');
        window.dispatchEvent(event);
    }

    onPauseClick() {
        const event = new CustomEvent('pauseGame');
        window.dispatchEvent(event);
    }

    setSpeed(speed) {
        this.gameState.setGameSpeed(speed);

        // Update button states
        [this.speed1xBtn, this.speed2xBtn, this.speed4xBtn].forEach(btn => {
            btn.classList.remove('active');
        });

        const activeBtn = document.getElementById(`speed-${speed}x`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
    }

    updateMoney(money) {
        if (this.moneyDisplay) {
            this.moneyDisplay.textContent = money;
        }
    }

    updateLives(lives) {
        if (this.livesDisplay) {
            this.livesDisplay.textContent = lives;

            // Change color based on lives (Fallout theme)
            if (lives <= 5) {
                this.livesDisplay.style.color = '#dc2626'; // Critical red
            } else if (lives <= 10) {
                this.livesDisplay.style.color = '#fbbf24'; // Warning yellow
            } else {
                this.livesDisplay.style.color = '#10b981'; // Pip-Boy green
            }
        }
    }

    updateWave(wave) {
        if (this.waveDisplay) {
            this.waveDisplay.textContent = `${wave}/${CONFIG.WAVES.TOTAL}`;
        }
    }

    updateScore(score) {
        if (this.scoreDisplay) {
            this.scoreDisplay.textContent = score;
        }
    }

    updateStartWaveButton(waveInProgress) {
        if (this.startWaveBtn) {
            if (waveInProgress) {
                this.startWaveBtn.disabled = true;
                this.startWaveBtn.textContent = 'Assault in Progress...';
            } else {
                this.startWaveBtn.disabled = false;
                this.startWaveBtn.textContent = 'Begin Assault';
            }
        }
    }

    show() {
        if (this.element) {
            this.element.classList.remove('hidden');
        }

        // Initialize displays
        this.updateMoney(this.gameState.money);
        this.updateLives(this.gameState.lives);
        this.updateWave(this.gameState.wave);
        this.updateScore(this.gameState.score);
    }

    hide() {
        if (this.element) {
            this.element.classList.add('hidden');
        }
    }

    update() {
        // Update any dynamic elements here
        // (Most updates are event-driven)
    }
}

export default HUD;
