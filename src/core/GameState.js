// Game state management
import { CONFIG } from '../utils/Config.js';
import { eventBus, GameEvents } from './EventBus.js';

export const GameStates = {
    MENU: 'menu',
    GENERATING: 'generating',
    PLAYING: 'playing',
    PAUSED: 'paused',
    WAVE_PREPARING: 'wave_preparing',
    VICTORY: 'victory',
    DEFEAT: 'defeat'
};

export class GameState {
    constructor() {
        this.current = GameStates.MENU;
        this.previous = null;

        // Game data
        this.money = CONFIG.PLAYER.START_MONEY;
        this.lives = CONFIG.PLAYER.START_LIVES;
        this.wave = 0;
        this.score = 0;
        this.gameSpeed = 1;

        // Map data
        this.map = null;
        this.mapSeed = null;
        this.mapSize = 'medium';

        // Entities
        this.towers = [];
        this.enemies = [];
        this.projectiles = [];

        // UI state
        this.selectedTower = null;
        this.selectedTowerType = null;
        this.hoveredCell = null;

        // Systems
        this.waveManager = null;
        this.economySystem = null;
        this.combatSystem = null;
    }

    changeState(newState) {
        if (this.current === newState) return;

        this.previous = this.current;
        this.current = newState;

        eventBus.emit(GameEvents.STATE_CHANGED, {
            from: this.previous,
            to: this.current
        });
    }

    reset() {
        this.money = CONFIG.PLAYER.START_MONEY;
        this.lives = CONFIG.PLAYER.START_LIVES;
        this.wave = 0;
        this.score = 0;
        this.gameSpeed = 1;

        this.towers = [];
        this.enemies = [];
        this.projectiles = [];

        this.selectedTower = null;
        this.selectedTowerType = null;
        this.hoveredCell = null;
    }

    // Money management
    addMoney(amount) {
        this.money += amount;
        eventBus.emit(GameEvents.MONEY_CHANGED, this.money);
    }

    subtractMoney(amount) {
        if (this.money >= amount) {
            this.money -= amount;
            eventBus.emit(GameEvents.MONEY_CHANGED, this.money);
            return true;
        }
        return false;
    }

    canAfford(amount) {
        return this.money >= amount;
    }

    // Lives management
    loseLife(amount = 1) {
        this.lives -= amount;
        eventBus.emit(GameEvents.LIVES_CHANGED, this.lives);

        if (this.lives <= 0) {
            this.lives = 0;
            this.changeState(GameStates.DEFEAT);
            eventBus.emit(GameEvents.GAME_OVER, {
                wave: this.wave,
                score: this.score
            });
        }
    }

    // Score management
    addScore(points) {
        this.score += points;
        eventBus.emit(GameEvents.SCORE_CHANGED, this.score);
    }

    // Tower management
    addTower(tower) {
        this.towers.push(tower);
        eventBus.emit(GameEvents.TOWER_PLACED, tower);
    }

    removeTower(tower) {
        const index = this.towers.indexOf(tower);
        if (index > -1) {
            this.towers.splice(index, 1);
            eventBus.emit(GameEvents.TOWER_SOLD, tower);
        }
    }

    getTowerAt(gridX, gridY) {
        return this.towers.find(t => t.gridX === gridX && t.gridY === gridY);
    }

    selectTower(tower) {
        this.selectedTower = tower;
        this.selectedTowerType = null;
        eventBus.emit(GameEvents.TOWER_SELECTED, tower);
    }

    deselectTower() {
        this.selectedTower = null;
        eventBus.emit(GameEvents.TOWER_SELECTED, null);
    }

    // Enemy management
    addEnemy(enemy) {
        this.enemies.push(enemy);
        eventBus.emit(GameEvents.ENEMY_SPAWNED, enemy);
    }

    removeEnemy(enemy, reachedBase = false) {
        const index = this.enemies.indexOf(enemy);
        if (index > -1) {
            this.enemies.splice(index, 1);

            if (reachedBase) {
                eventBus.emit(GameEvents.ENEMY_REACHED_BASE, enemy);
            } else {
                eventBus.emit(GameEvents.ENEMY_DIED, enemy);
            }
        }
    }

    // Projectile management
    addProjectile(projectile) {
        this.projectiles.push(projectile);
    }

    removeProjectile(projectile) {
        const index = this.projectiles.indexOf(projectile);
        if (index > -1) {
            this.projectiles.splice(index, 1);
        }
    }

    // Wave management
    startWave(waveNumber) {
        this.wave = waveNumber;
        eventBus.emit(GameEvents.WAVE_STARTED, waveNumber);
    }

    completeWave() {
        eventBus.emit(GameEvents.WAVE_COMPLETED, this.wave);

        if (this.wave >= CONFIG.WAVES.TOTAL) {
            this.changeState(GameStates.VICTORY);
            eventBus.emit(GameEvents.VICTORY, {
                wave: this.wave,
                score: this.score
            });
        }
    }

    // Speed control
    setGameSpeed(speed) {
        this.gameSpeed = speed;
    }

    // Serialization for save/load
    serialize() {
        return {
            money: this.money,
            lives: this.lives,
            wave: this.wave,
            score: this.score,
            mapSeed: this.mapSeed,
            mapSize: this.mapSize,
            towers: this.towers.map(t => t.serialize()),
            timestamp: Date.now()
        };
    }

    deserialize(data) {
        this.money = data.money;
        this.lives = data.lives;
        this.wave = data.wave;
        this.score = data.score;
        this.mapSeed = data.mapSeed;
        this.mapSize = data.mapSize;
        // Towers will be reconstructed by the game
    }
}

export default GameState;
