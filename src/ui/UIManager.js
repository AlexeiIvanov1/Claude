// UI Manager - coordinates all UI components

import { HUD } from './HUD.js';
import { Menu } from './Menu.js';
import { TowerPanel } from './TowerPanel.js';
import { eventBus, GameEvents } from '../core/EventBus.js';
import { GameStates } from '../core/GameState.js';

export class UIManager {
    constructor(gameState) {
        this.gameState = gameState;

        // Initialize UI components
        this.hud = new HUD(gameState);
        this.menu = new Menu(gameState);
        this.towerPanel = new TowerPanel(gameState);

        // UI state
        this.currentScreen = 'menu';

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Listen for game state changes
        eventBus.on(GameEvents.STATE_CHANGED, (data) => {
            this.handleStateChange(data.to);
        });

        // Listen for game events to update UI
        eventBus.on(GameEvents.MONEY_CHANGED, (money) => {
            this.hud.updateMoney(money);
        });

        eventBus.on(GameEvents.LIVES_CHANGED, (lives) => {
            this.hud.updateLives(lives);
        });

        eventBus.on(GameEvents.SCORE_CHANGED, (score) => {
            this.hud.updateScore(score);
        });

        eventBus.on(GameEvents.WAVE_STARTED, (wave) => {
            this.hud.updateWave(wave);
        });

        eventBus.on(GameEvents.TOWER_SELECTED, (tower) => {
            this.towerPanel.showTowerInfo(tower);
        });
    }

    handleStateChange(newState) {
        this.hideAllScreens();

        switch (newState) {
            case GameStates.MENU:
                this.showScreen('menu-screen');
                this.hideHUD();
                break;

            case GameStates.GENERATING:
                this.showScreen('loading-screen');
                break;

            case GameStates.PLAYING:
                this.showHUD();
                this.towerPanel.show();
                break;

            case GameStates.PAUSED:
                this.showScreen('pause-screen');
                break;

            case GameStates.VICTORY:
                this.showVictoryScreen();
                break;

            case GameStates.DEFEAT:
                this.showDefeatScreen();
                break;
        }
    }

    hideAllScreens() {
        const screens = [
            'menu-screen',
            'loading-screen',
            'pause-screen',
            'victory-screen',
            'defeat-screen',
            'instructions-screen'
        ];

        screens.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.classList.add('hidden');
            }
        });
    }

    showScreen(screenId) {
        this.currentScreen = screenId;
        const element = document.getElementById(screenId);
        if (element) {
            element.classList.remove('hidden');
        }
    }

    hideScreen(screenId) {
        const element = document.getElementById(screenId);
        if (element) {
            element.classList.add('hidden');
        }
    }

    showHUD() {
        this.hud.show();
    }

    hideHUD() {
        this.hud.hide();
    }

    showVictoryScreen() {
        this.showScreen('victory-screen');

        const statsDiv = document.getElementById('victory-stats');
        if (statsDiv) {
            statsDiv.innerHTML = `
                <div class="stat-row">
                    <span class="stat-label">Total XP:</span>
                    <span class="stat-value">${this.gameState.score}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Assaults Repelled:</span>
                    <span class="stat-value">${this.gameState.wave}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Settlement HP:</span>
                    <span class="stat-value">${this.gameState.lives}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Location Seed:</span>
                    <span class="stat-value">${this.gameState.mapSeed}</span>
                </div>
            `;
        }
    }

    showDefeatScreen() {
        this.showScreen('defeat-screen');

        const statsDiv = document.getElementById('defeat-stats');
        if (statsDiv) {
            statsDiv.innerHTML = `
                <div class="stat-row">
                    <span class="stat-label">Total XP:</span>
                    <span class="stat-value">${this.gameState.score}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Assaults Survived:</span>
                    <span class="stat-value">${this.gameState.wave}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Location Seed:</span>
                    <span class="stat-value">${this.gameState.mapSeed}</span>
                </div>
            `;
        }
    }

    update() {
        this.hud.update();
        this.towerPanel.update();
    }
}

export default UIManager;
