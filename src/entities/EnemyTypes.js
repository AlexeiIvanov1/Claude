// Enemy type definitions and factory

import { Enemy } from './Enemy.js';
import { CONFIG } from '../utils/Config.js';

export const EnemyType = {
    BASIC: 'BASIC',
    FAST: 'FAST',
    TANK: 'TANK',
    FLYING: 'FLYING',
    BOSS: 'BOSS'
};

export function createEnemy(type, path, gridSize) {
    return new Enemy(type, path, gridSize);
}

export function getEnemyInfo(type) {
    return CONFIG.ENEMIES[type];
}

export function getAllEnemyTypes() {
    return Object.keys(EnemyType);
}

export default {
    EnemyType,
    createEnemy,
    getEnemyInfo,
    getAllEnemyTypes
};
