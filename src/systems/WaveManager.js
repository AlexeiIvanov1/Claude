// Wave management system for enemy spawning

import { createEnemy, EnemyType } from '../entities/EnemyTypes.js';
import { CONFIG } from '../utils/Config.js';
import { eventBus, GameEvents } from '../core/EventBus.js';
import { audioSystem } from '../utils/Audio.js';

export class WaveManager {
    constructor(gameState, map) {
        this.gameState = gameState;
        this.map = map;

        this.currentWave = 0;
        this.waveInProgress = false;
        this.spawnQueue = [];
        this.spawnTimer = 0;
        this.spawnDelay = 1000; // ms between spawns

        // Generate wave configurations
        this.waves = this.generateWaveConfigs();
    }

    generateWaveConfigs() {
        const waves = [];

        for (let i = 0; i < CONFIG.WAVES.TOTAL; i++) {
            const waveNumber = i + 1;
            const isBoss = waveNumber % CONFIG.WAVES.BOSS_INTERVAL === 0;

            const waveConfig = {
                number: waveNumber,
                enemies: this.generateEnemyComposition(waveNumber, isBoss),
                reward: CONFIG.WAVES.BASE_REWARD + (waveNumber * CONFIG.WAVES.REWARD_PER_WAVE),
                spawnDelay: this.calculateSpawnDelay(waveNumber)
            };

            waves.push(waveConfig);
        }

        return waves;
    }

    generateEnemyComposition(waveNumber, isBoss) {
        const enemies = [];

        // Base count increases with wave number
        const baseCount = Math.floor(5 + waveNumber * 1.5);

        if (isBoss) {
            // Boss wave
            enemies.push({ type: EnemyType.BOSS, count: 1 });

            // Add some support enemies
            const supportCount = Math.floor(waveNumber / 2);
            enemies.push({ type: EnemyType.TANK, count: Math.floor(supportCount / 2) });
            enemies.push({ type: EnemyType.BASIC, count: Math.ceil(supportCount / 2) });
        } else {
            // Regular wave - mix of enemy types
            // Unlock enemy types progressively
            const availableTypes = [EnemyType.BASIC];

            if (waveNumber >= 2) availableTypes.push(EnemyType.FAST);
            if (waveNumber >= 4) availableTypes.push(EnemyType.TANK);
            if (waveNumber >= 6) availableTypes.push(EnemyType.FLYING);

            // Distribution based on wave number
            if (waveNumber <= 5) {
                // Early waves: mostly basic
                enemies.push({ type: EnemyType.BASIC, count: baseCount });
                if (availableTypes.includes(EnemyType.FAST)) {
                    enemies.push({ type: EnemyType.FAST, count: Math.floor(baseCount * 0.3) });
                }
            } else if (waveNumber <= 10) {
                // Mid waves: balanced mix
                const basicCount = Math.floor(baseCount * 0.4);
                const fastCount = Math.floor(baseCount * 0.3);
                const tankCount = Math.floor(baseCount * 0.2);
                const flyingCount = Math.floor(baseCount * 0.1);

                enemies.push({ type: EnemyType.BASIC, count: basicCount });
                enemies.push({ type: EnemyType.FAST, count: fastCount });
                if (availableTypes.includes(EnemyType.TANK)) {
                    enemies.push({ type: EnemyType.TANK, count: tankCount });
                }
                if (availableTypes.includes(EnemyType.FLYING)) {
                    enemies.push({ type: EnemyType.FLYING, count: flyingCount });
                }
            } else {
                // Late waves: more difficult enemies
                const basicCount = Math.floor(baseCount * 0.2);
                const fastCount = Math.floor(baseCount * 0.3);
                const tankCount = Math.floor(baseCount * 0.3);
                const flyingCount = Math.floor(baseCount * 0.2);

                enemies.push({ type: EnemyType.BASIC, count: basicCount });
                enemies.push({ type: EnemyType.FAST, count: fastCount });
                enemies.push({ type: EnemyType.TANK, count: tankCount });
                enemies.push({ type: EnemyType.FLYING, count: flyingCount });
            }
        }

        return enemies.filter(e => e.count > 0);
    }

    calculateSpawnDelay(waveNumber) {
        // Spawn delay decreases as waves progress, but has a minimum
        const baseDelay = 1000;
        const reduction = waveNumber * 20;
        return Math.max(300, baseDelay - reduction);
    }

    startWave() {
        if (this.waveInProgress) return false;
        if (this.currentWave >= CONFIG.WAVES.TOTAL) return false;

        this.currentWave++;
        this.waveInProgress = true;

        // Get wave config
        const waveConfig = this.waves[this.currentWave - 1];
        this.spawnDelay = waveConfig.spawnDelay;

        // Build spawn queue
        this.spawnQueue = [];
        for (const enemyGroup of waveConfig.enemies) {
            for (let i = 0; i < enemyGroup.count; i++) {
                this.spawnQueue.push(enemyGroup.type);
            }
        }

        // Shuffle queue for variety
        this.shuffleArray(this.spawnQueue);

        // Reset timer
        this.spawnTimer = 0;

        // Notify game
        this.gameState.startWave(this.currentWave);
        audioSystem.playWaveStart();

        return true;
    }

    update(deltaTime) {
        if (!this.waveInProgress) return;

        // Update spawn timer
        this.spawnTimer += deltaTime;

        // Spawn enemies
        while (this.spawnTimer >= this.spawnDelay && this.spawnQueue.length > 0) {
            this.spawnTimer -= this.spawnDelay;
            this.spawnEnemy();
        }

        // Check if wave is complete
        if (this.spawnQueue.length === 0 && this.gameState.enemies.length === 0) {
            console.log(`Wave ${this.currentWave} complete! Spawn queue: ${this.spawnQueue.length}, Enemies: ${this.gameState.enemies.length}`);
            this.completeWave();
        }
    }

    spawnEnemy() {
        if (this.spawnQueue.length === 0) return;

        const enemyType = this.spawnQueue.shift();
        const enemy = createEnemy(enemyType, this.map.path, this.map.gridSize);

        this.gameState.addEnemy(enemy);
    }

    completeWave() {
        if (!this.waveInProgress) {
            console.log('completeWave called but wave not in progress');
            return;
        }

        console.log(`Completing wave ${this.currentWave}, setting waveInProgress to false`);
        this.waveInProgress = false;

        // Award money
        const waveConfig = this.waves[this.currentWave - 1];
        this.gameState.addMoney(waveConfig.reward);
        this.gameState.addScore(waveConfig.reward * 2);

        // Notify game
        this.gameState.completeWave();
        audioSystem.playWaveComplete();

        console.log(`Wave ${this.currentWave} completed successfully`);
    }

    getCurrentWave() {
        return this.currentWave;
    }

    getTotalWaves() {
        return CONFIG.WAVES.TOTAL;
    }

    isWaveInProgress() {
        return this.waveInProgress;
    }

    getNextWaveInfo() {
        if (this.currentWave >= CONFIG.WAVES.TOTAL) return null;

        const nextWave = this.waves[this.currentWave];
        return {
            number: nextWave.number,
            enemies: nextWave.enemies,
            reward: nextWave.reward
        };
    }

    getRemainingEnemies() {
        return this.spawnQueue.length + this.gameState.enemies.length;
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
}

export default WaveManager;
