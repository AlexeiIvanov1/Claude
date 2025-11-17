// Tower type definitions and factory

import { Tower } from './Tower.js';
import { CONFIG } from '../utils/Config.js';

export const TowerType = {
    BASIC: 'BASIC',
    SNIPER: 'SNIPER',
    SPLASH: 'SPLASH',
    SLOW: 'SLOW'
};

export function createTower(type, gridX, gridY, gridSize) {
    return new Tower(type, gridX, gridY, gridSize);
}

export function getTowerCost(type) {
    return CONFIG.TOWERS[type].cost;
}

export function getTowerInfo(type) {
    const config = CONFIG.TOWERS[type];
    return {
        name: config.name,
        description: config.description,
        cost: config.cost,
        color: config.color,
        stats: config.levels[0]
    };
}

export function getAllTowerTypes() {
    return Object.keys(TowerType);
}

export default {
    TowerType,
    createTower,
    getTowerCost,
    getTowerInfo,
    getAllTowerTypes
};
