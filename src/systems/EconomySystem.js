// Economy system for managing money and transactions

import { audioSystem } from '../utils/Audio.js';
import { eventBus, GameEvents } from '../core/EventBus.js';
import { CONFIG } from '../utils/Config.js';

export class EconomySystem {
    constructor(gameState) {
        this.gameState = gameState;

        // Listen for enemy deaths to award money
        eventBus.on(GameEvents.ENEMY_DIED, (enemy) => {
            this.awardKillReward(enemy);
        });
    }

    awardKillReward(enemy) {
        const reward = enemy.reward;
        this.gameState.addMoney(reward);
        this.gameState.addScore(reward);
    }

    canAffordTower(towerType) {
        const cost = this.getTowerCost(towerType);
        return this.gameState.canAfford(cost);
    }

    purchaseTower(towerType) {
        const cost = this.getTowerCost(towerType);

        if (!this.gameState.canAfford(cost)) {
            audioSystem.playError();
            return false;
        }

        if (this.gameState.subtractMoney(cost)) {
            audioSystem.playPlaceTower();
            return true;
        }

        return false;
    }

    canAffordUpgrade(tower) {
        if (!tower.canUpgrade()) return false;

        const cost = tower.getUpgradeCost();
        return this.gameState.canAfford(cost);
    }

    upgradeTower(tower) {
        if (!tower.canUpgrade()) {
            audioSystem.playError();
            return false;
        }

        const cost = tower.getUpgradeCost();

        if (!this.gameState.canAfford(cost)) {
            audioSystem.playError();
            return false;
        }

        if (this.gameState.subtractMoney(cost)) {
            tower.upgrade();
            audioSystem.playUpgrade();
            eventBus.emit(GameEvents.TOWER_UPGRADED, tower);
            return true;
        }

        return false;
    }

    sellTower(tower) {
        const sellValue = tower.getSellValue();
        this.gameState.addMoney(sellValue);
        this.gameState.removeTower(tower);
        return true;
    }

    getTowerCost(towerType) {
        return CONFIG.TOWERS[towerType].cost;
    }

    getMoney() {
        return this.gameState.money;
    }
}

export default EconomySystem;
