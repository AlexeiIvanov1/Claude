// Menu UI component

export class Menu {
    constructor(gameState) {
        this.gameState = gameState;

        // Get DOM elements
        this.mapSeedInput = document.getElementById('map-seed');
        this.mapSizeSelect = document.getElementById('map-size');
        this.startGameBtn = document.getElementById('start-game-btn');
        this.instructionsBtn = document.getElementById('instructions-btn');
        this.highScoresBtn = document.getElementById('high-scores-btn');

        // Instructions screen
        this.backToMenuBtn = document.getElementById('back-to-menu-btn');

        // Pause screen
        this.resumeBtn = document.getElementById('resume-btn');
        this.saveGameBtn = document.getElementById('save-game-btn');
        this.settingsBtn = document.getElementById('settings-btn');
        this.quitBtn = document.getElementById('quit-btn');

        // Victory/Defeat screens
        this.victoryMenuBtn = document.getElementById('victory-menu-btn');
        this.defeatMenuBtn = document.getElementById('defeat-menu-btn');
        this.retryBtn = document.getElementById('retry-btn');

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Main menu
        if (this.startGameBtn) {
            this.startGameBtn.addEventListener('click', () => {
                this.onStartGame();
            });
        }

        if (this.instructionsBtn) {
            this.instructionsBtn.addEventListener('click', () => {
                this.showInstructions();
            });
        }

        if (this.highScoresBtn) {
            this.highScoresBtn.addEventListener('click', () => {
                this.showHighScores();
            });
        }

        // Instructions
        if (this.backToMenuBtn) {
            this.backToMenuBtn.addEventListener('click', () => {
                this.hideInstructions();
            });
        }

        // Pause menu
        if (this.resumeBtn) {
            this.resumeBtn.addEventListener('click', () => {
                this.onResume();
            });
        }

        if (this.saveGameBtn) {
            this.saveGameBtn.addEventListener('click', () => {
                this.onSaveGame();
            });
        }

        if (this.settingsBtn) {
            this.settingsBtn.addEventListener('click', () => {
                this.onSettings();
            });
        }

        if (this.quitBtn) {
            this.quitBtn.addEventListener('click', () => {
                this.onQuit();
            });
        }

        // Victory/Defeat
        if (this.victoryMenuBtn) {
            this.victoryMenuBtn.addEventListener('click', () => {
                this.returnToMenu();
            });
        }

        if (this.defeatMenuBtn) {
            this.defeatMenuBtn.addEventListener('click', () => {
                this.returnToMenu();
            });
        }

        if (this.retryBtn) {
            this.retryBtn.addEventListener('click', () => {
                this.onRetry();
            });
        }
    }

    onStartGame() {
        const seed = this.mapSeedInput.value.trim() || null;
        const size = this.mapSizeSelect.value;

        const event = new CustomEvent('startNewGame', {
            detail: { seed, size }
        });
        window.dispatchEvent(event);
    }

    showInstructions() {
        document.getElementById('menu-screen').classList.add('hidden');
        document.getElementById('instructions-screen').classList.remove('hidden');
    }

    hideInstructions() {
        document.getElementById('instructions-screen').classList.add('hidden');
        document.getElementById('menu-screen').classList.remove('hidden');
    }

    showHighScores() {
        // TODO: Implement high scores display
        alert('High scores feature coming soon!');
    }

    onResume() {
        const event = new CustomEvent('resumeGame');
        window.dispatchEvent(event);
    }

    onSaveGame() {
        const event = new CustomEvent('saveGame');
        window.dispatchEvent(event);
    }

    onSettings() {
        // TODO: Implement settings menu
        alert('Settings feature coming soon!');
    }

    onQuit() {
        if (confirm('Are you sure you want to quit? Unsaved progress will be lost.')) {
            this.returnToMenu();
        }
    }

    returnToMenu() {
        const event = new CustomEvent('returnToMenu');
        window.dispatchEvent(event);
    }

    onRetry() {
        const event = new CustomEvent('retryGame');
        window.dispatchEvent(event);
    }
}

export default Menu;
