// Game initialization

import { Game } from './core/Game.js';

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game-canvas');

    if (!canvas) {
        console.error('Canvas element not found!');
        return;
    }

    // Create game instance
    const game = new Game(canvas);

    console.log('Tower Defense game initialized!');
    console.log('Press SPACE to start wave, ESC to pause');

    // Make game accessible globally for debugging
    window.game = game;
});
