// Main game class - coordinates all systems

import { GameState, GameStates } from './GameState.js';
import { MapGenerator } from '../map/MapGenerator.js';
import { WaveManager } from '../systems/WaveManager.js';
import { EconomySystem } from '../systems/EconomySystem.js';
import { CombatSystem } from '../systems/CombatSystem.js';
import { UpgradeSystem } from '../systems/UpgradeSystem.js';
import { Renderer } from '../rendering/Renderer.js';
import { UIManager } from '../ui/UIManager.js';
import { createTower, getTowerCost } from '../entities/TowerTypes.js';
import { worldToGrid } from '../utils/Math.js';
import { CONFIG } from '../utils/Config.js';
import { eventBus, GameEvents } from './EventBus.js';
import { audioSystem } from '../utils/Audio.js';
import { Storage } from '../utils/Storage.js';

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.state = new GameState();
        this.renderer = new Renderer(canvas, this.state);
        this.uiManager = new UIManager(this.state);

        // Systems (initialized when game starts)
        this.waveManager = null;
        this.economySystem = null;
        this.combatSystem = null;
        this.upgradeSystem = null;

        // Game loop
        this.lastTime = 0;
        this.running = false;

        // Input handling
        this.setupInputHandlers();
        this.setupEventHandlers();

        // Initialize audio on first user interaction
        document.addEventListener('click', () => audioSystem.init(), { once: true });
    }

    setupInputHandlers() {
        // Mouse move - for hovering
        this.canvas.addEventListener('mousemove', (e) => {
            this.handleMouseMove(e);
        });

        // Mouse click - for placing towers and selecting
        this.canvas.addEventListener('click', (e) => {
            this.handleMouseClick(e);
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyPress(e);
        });
    }

    setupEventHandlers() {
        // UI events
        window.addEventListener('startNewGame', (e) => {
            this.startNewGame(e.detail.seed, e.detail.size);
        });

        window.addEventListener('startWave', () => {
            this.startNextWave();
        });

        window.addEventListener('pauseGame', () => {
            this.pauseGame();
        });

        window.addEventListener('resumeGame', () => {
            this.resumeGame();
        });

        window.addEventListener('saveGame', () => {
            this.saveGame();
        });

        window.addEventListener('returnToMenu', () => {
            this.returnToMenu();
        });

        window.addEventListener('retryGame', () => {
            this.retryGame();
        });

        window.addEventListener('upgradeTower', (e) => {
            this.upgradeTower(e.detail.tower);
        });

        window.addEventListener('sellTower', (e) => {
            this.sellTower(e.detail.tower);
        });

        // Game events
        eventBus.on(GameEvents.ENEMY_DIED, (enemy) => {
            this.renderer.emitEnemyDeath(enemy);
        });

        eventBus.on(GameEvents.TOWER_UPGRADED, (tower) => {
            this.renderer.emitUpgrade(tower);
        });

        eventBus.on('tower_fired', (data) => {
            this.renderer.particles.emitMuzzleFlash(
                data.position.x,
                data.position.y,
                data.angle,
                data.tower.color
            );
        });
    }

    handleMouseMove(e) {
        if (this.state.current !== GameStates.PLAYING) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const gridPos = worldToGrid(x, y, CONFIG.GAME.GRID_SIZE);

        if (this.state.map && this.state.map.grid.isValid(gridPos.x, gridPos.y)) {
            this.state.hoveredCell = gridPos;
        } else {
            this.state.hoveredCell = null;
        }
    }

    handleMouseClick(e) {
        if (this.state.current !== GameStates.PLAYING) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const gridPos = worldToGrid(x, y, CONFIG.GAME.GRID_SIZE);

        if (!this.state.map || !this.state.map.grid.isValid(gridPos.x, gridPos.y)) {
            return;
        }

        // Check if clicking on existing tower
        const existingTower = this.state.getTowerAt(gridPos.x, gridPos.y);

        if (existingTower) {
            this.state.selectTower(existingTower);
            return;
        }

        // Try to place new tower
        if (this.state.selectedTowerType) {
            this.placeTower(gridPos.x, gridPos.y);
        }
    }

    handleKeyPress(e) {
        switch (e.key) {
            case 'Escape':
                if (this.state.current === GameStates.PLAYING) {
                    this.pauseGame();
                } else if (this.state.current === GameStates.PAUSED) {
                    this.resumeGame();
                }
                break;

            case ' ':
                if (this.state.current === GameStates.PLAYING) {
                    this.startNextWave();
                }
                e.preventDefault();
                break;

            case '1':
                this.state.setGameSpeed(1);
                this.uiManager.hud.setSpeed(1);
                break;

            case '2':
                this.state.setGameSpeed(2);
                this.uiManager.hud.setSpeed(2);
                break;

            case '3':
            case '4':
                this.state.setGameSpeed(4);
                this.uiManager.hud.setSpeed(4);
                break;
        }
    }

    async startNewGame(seedString = null, mapSize = 'medium') {
        this.state.changeState(GameStates.GENERATING);
        this.state.reset();
        this.state.mapSize = mapSize;

        // Generate map
        await this.generateMap(seedString, mapSize);

        // Initialize systems
        this.economySystem = new EconomySystem(this.state);
        this.combatSystem = new CombatSystem(this.state);
        this.upgradeSystem = new UpgradeSystem(this.state, this.economySystem);
        this.waveManager = new WaveManager(this.state, this.state.map);

        // Setup renderer
        this.renderer.setupCanvas(this.state.map);

        // Start game
        this.state.changeState(GameStates.PLAYING);

        // 🎸 START THE METAL! 🎸
        audioSystem.startMusic();

        this.start();
    }

    async generateMap(seedString, mapSize) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const map = MapGenerator.generateFromSeed(seedString, mapSize);
                this.state.map = map;
                this.state.mapSeed = map.seed;
                eventBus.emit(GameEvents.MAP_GENERATED, map);
                resolve();
            }, 100);
        });
    }

    placeTower(gridX, gridY) {
        // Check if valid placement
        if (!this.state.map.isBuildable(gridX, gridY)) {
            audioSystem.playError();
            return false;
        }

        // Check if already a tower there
        if (this.state.getTowerAt(gridX, gridY)) {
            audioSystem.playError();
            return false;
        }

        // Check if can afford
        const towerType = this.state.selectedTowerType;
        const cost = getTowerCost(towerType);

        if (!this.economySystem.purchaseTower(towerType)) {
            return false;
        }

        // Create and place tower
        const tower = createTower(towerType, gridX, gridY, CONFIG.GAME.GRID_SIZE);
        this.state.addTower(tower);

        return true;
    }

    upgradeTower(tower) {
        if (this.upgradeSystem.upgradeTower(tower)) {
            // Refresh the tower info display
            this.state.selectTower(tower);
        }
    }

    sellTower(tower) {
        this.upgradeSystem.sellTower(tower);
        this.state.deselectTower();
    }

    startNextWave() {
        if (this.waveManager && !this.waveManager.isWaveInProgress()) {
            this.waveManager.startWave();
            this.uiManager.hud.updateStartWaveButton(true);
        }
    }

    pauseGame() {
        if (this.state.current === GameStates.PLAYING) {
            this.state.changeState(GameStates.PAUSED);
            audioSystem.stopMusic();
        }
    }

    resumeGame() {
        if (this.state.current === GameStates.PAUSED) {
            this.state.changeState(GameStates.PLAYING);
            audioSystem.startMusic();
        }
    }

    saveGame() {
        Storage.saveGame(this.state);
        alert('Game saved successfully!');
    }

    returnToMenu() {
        this.stop();
        audioSystem.stopMusic();
        this.state.changeState(GameStates.MENU);
        this.state.reset();
    }

    retryGame() {
        const seed = this.state.mapSeed;
        const size = this.state.mapSize;
        this.startNewGame(seed, size);
    }

    start() {
        if (this.running) return;

        this.running = true;
        this.lastTime = performance.now();
        this.loop();
    }

    stop() {
        this.running = false;
    }

    loop(timestamp) {
        if (!this.running) return;

        // Calculate delta time
        const deltaTime = timestamp - this.lastTime;
        const adjustedDelta = Math.min(deltaTime * this.state.gameSpeed, 100); // Cap at 100ms to prevent huge jumps

        this.lastTime = timestamp;

        // Debug: Log loop status occasionally
        if (!this._loopCount) this._loopCount = 0;
        this._loopCount++;
        if (this._loopCount % 60 === 0) {
            console.log(`Game loop: state=${this.state.current}, deltaTime=${deltaTime.toFixed(2)}ms, enemies=${this.state.enemies.length}`);
        }

        // Update game
        if (this.state.current === GameStates.PLAYING) {
            this.update(adjustedDelta);
        }

        // Render
        this.render(adjustedDelta);

        // Continue loop
        requestAnimationFrame((t) => this.loop(t));
    }

    update(deltaTime) {
        // Update systems
        if (this.waveManager) {
            this.waveManager.update(deltaTime);

            // Update HUD
            const waveInProgress = this.waveManager.isWaveInProgress();
            this.uiManager.hud.updateStartWaveButton(waveInProgress);
        }

        if (this.combatSystem) {
            this.combatSystem.update(deltaTime);
        }

        // Update UI
        this.uiManager.update();
    }

    render(deltaTime) {
        this.renderer.render(deltaTime);
    }
}

export default Game;
