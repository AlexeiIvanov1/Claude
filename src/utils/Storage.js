// LocalStorage wrapper for save/load functionality

const STORAGE_KEYS = {
    HIGH_SCORES: 'td_high_scores',
    SAVED_GAME: 'td_saved_game',
    SETTINGS: 'td_settings',
    LAST_SEED: 'td_last_seed'
};

export class Storage {
    static save(key, data) {
        try {
            const jsonData = JSON.stringify(data);
            localStorage.setItem(key, jsonData);
            return true;
        } catch (error) {
            console.error('Failed to save data:', error);
            return false;
        }
    }

    static load(key) {
        try {
            const jsonData = localStorage.getItem(key);
            return jsonData ? JSON.parse(jsonData) : null;
        } catch (error) {
            console.error('Failed to load data:', error);
            return null;
        }
    }

    static remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Failed to remove data:', error);
            return false;
        }
    }

    static clear() {
        try {
            Object.values(STORAGE_KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
            return true;
        } catch (error) {
            console.error('Failed to clear data:', error);
            return false;
        }
    }

    // High Scores
    static saveHighScore(score, wave, mapSeed) {
        const scores = this.getHighScores();
        scores.push({
            score,
            wave,
            mapSeed,
            date: new Date().toISOString()
        });

        // Sort by score descending and keep top 10
        scores.sort((a, b) => b.score - a.score);
        const topScores = scores.slice(0, 10);

        return this.save(STORAGE_KEYS.HIGH_SCORES, topScores);
    }

    static getHighScores() {
        return this.load(STORAGE_KEYS.HIGH_SCORES) || [];
    }

    // Game State
    static saveGame(gameState) {
        const saveData = {
            money: gameState.money,
            lives: gameState.lives,
            wave: gameState.wave,
            score: gameState.score,
            mapSeed: gameState.mapSeed,
            mapSize: gameState.mapSize,
            towers: gameState.towers.map(tower => ({
                type: tower.type,
                x: tower.position.x,
                y: tower.position.y,
                gridX: tower.gridX,
                gridY: tower.gridY,
                level: tower.level
            })),
            timestamp: Date.now()
        };

        return this.save(STORAGE_KEYS.SAVED_GAME, saveData);
    }

    static loadGame() {
        const saveData = this.load(STORAGE_KEYS.SAVED_GAME);
        if (!saveData) return null;

        // Check if save is not too old (7 days)
        const age = Date.now() - saveData.timestamp;
        const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

        if (age > maxAge) {
            this.remove(STORAGE_KEYS.SAVED_GAME);
            return null;
        }

        return saveData;
    }

    static hasSavedGame() {
        return this.loadGame() !== null;
    }

    static deleteSavedGame() {
        return this.remove(STORAGE_KEYS.SAVED_GAME);
    }

    // Settings
    static saveSettings(settings) {
        return this.save(STORAGE_KEYS.SETTINGS, settings);
    }

    static getSettings() {
        return this.load(STORAGE_KEYS.SETTINGS) || {
            soundEnabled: true,
            musicEnabled: true,
            soundVolume: 0.7,
            musicVolume: 0.5,
            showRanges: true,
            showGrid: true,
            particleEffects: true
        };
    }

    // Last used seed
    static saveLastSeed(seed) {
        return this.save(STORAGE_KEYS.LAST_SEED, seed);
    }

    static getLastSeed() {
        return this.load(STORAGE_KEYS.LAST_SEED);
    }
}

export default Storage;
