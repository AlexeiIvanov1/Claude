// Tower upgrade and management system

import { eventBus, GameEvents } from '../core/EventBus.js';

export class UpgradeSystem {
    constructor(gameState, economySystem) {
        this.gameState = gameState;
        this.economySystem = economySystem;
    }

    upgradeTower(tower) {
        return this.economySystem.upgradeTower(tower);
    }

    sellTower(tower) {
        return this.economySystem.sellTower(tower);
    }

    getTowerInfo(tower) {
        return tower.getInfo();
    }

    canUpgrade(tower) {
        return this.economySystem.canAffordUpgrade(tower);
    }

    getUpgradePreview(tower) {
        if (!tower.canUpgrade()) return null;

        const currentStats = tower.stats;
        const nextLevel = tower.level + 1;
        const nextStats = tower.config.levels[nextLevel - 1];

        return {
            currentLevel: tower.level,
            nextLevel: nextLevel,
            cost: currentStats.upgradeCost,
            improvements: {
                damage: {
                    current: currentStats.damage,
                    next: nextStats.damage,
                    increase: nextStats.damage - currentStats.damage
                },
                range: {
                    current: currentStats.range,
                    next: nextStats.range,
                    increase: nextStats.range - currentStats.range
                },
                fireRate: {
                    current: currentStats.fireRate,
                    next: nextStats.fireRate,
                    increase: nextStats.fireRate - currentStats.fireRate
                }
            }
        };
    }
}

export default UpgradeSystem;
