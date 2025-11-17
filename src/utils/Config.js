// Game configuration constants
export const CONFIG = {
    GAME: {
        FPS: 60,
        GRID_SIZE: 40,
        MAP_SIZES: {
            small: { width: 15, height: 12 },
            medium: { width: 20, height: 16 },
            large: { width: 25, height: 20 }
        }
    },

    PLAYER: {
        START_MONEY: 500,
        START_LIVES: 20
    },

    TOWERS: {
        BASIC: {
            name: 'Basic Tower',
            description: 'Fast fire rate, balanced damage',
            cost: 100,
            color: '#4CAF50',
            levels: [
                {
                    damage: 10,
                    range: 120,
                    fireRate: 2, // shots per second
                    upgradeCost: 75,
                    sellValue: 50
                },
                {
                    damage: 20,
                    range: 140,
                    fireRate: 2.5,
                    upgradeCost: 150,
                    sellValue: 125
                },
                {
                    damage: 35,
                    range: 160,
                    fireRate: 3,
                    upgradeCost: null, // max level
                    sellValue: 250
                }
            ]
        },
        SNIPER: {
            name: 'Sniper Tower',
            description: 'Long range, high damage, slow fire',
            cost: 150,
            color: '#2196F3',
            levels: [
                {
                    damage: 50,
                    range: 250,
                    fireRate: 0.5,
                    upgradeCost: 100,
                    sellValue: 75
                },
                {
                    damage: 100,
                    range: 300,
                    fireRate: 0.75,
                    upgradeCost: 200,
                    sellValue: 175
                },
                {
                    damage: 200,
                    range: 350,
                    fireRate: 1,
                    upgradeCost: null,
                    sellValue: 375
                }
            ]
        },
        SPLASH: {
            name: 'Splash Tower',
            description: 'Area damage, great for groups',
            cost: 200,
            color: '#FF5722',
            levels: [
                {
                    damage: 15,
                    range: 100,
                    fireRate: 1,
                    splashRadius: 60,
                    upgradeCost: 125,
                    sellValue: 100
                },
                {
                    damage: 30,
                    range: 120,
                    fireRate: 1.25,
                    splashRadius: 80,
                    upgradeCost: 250,
                    sellValue: 225
                },
                {
                    damage: 60,
                    range: 140,
                    fireRate: 1.5,
                    splashRadius: 100,
                    upgradeCost: null,
                    sellValue: 475
                }
            ]
        },
        SLOW: {
            name: 'Slow Tower',
            description: 'Slows enemies, moderate damage',
            cost: 125,
            color: '#9C27B0',
            levels: [
                {
                    damage: 5,
                    range: 110,
                    fireRate: 1.5,
                    slowAmount: 0.5, // 50% slow
                    slowDuration: 2000, // 2 seconds
                    upgradeCost: 90,
                    sellValue: 65
                },
                {
                    damage: 10,
                    range: 130,
                    fireRate: 2,
                    slowAmount: 0.6,
                    slowDuration: 2500,
                    upgradeCost: 180,
                    sellValue: 155
                },
                {
                    damage: 20,
                    range: 150,
                    fireRate: 2.5,
                    slowAmount: 0.75,
                    slowDuration: 3000,
                    upgradeCost: null,
                    sellValue: 335
                }
            ]
        }
    },

    ENEMIES: {
        BASIC: {
            name: 'Basic Enemy',
            hp: 50,
            speed: 50, // pixels per second
            reward: 10,
            color: '#FF6B6B',
            size: 12
        },
        FAST: {
            name: 'Fast Enemy',
            hp: 30,
            speed: 90,
            reward: 15,
            color: '#4ECDC4',
            size: 10
        },
        TANK: {
            name: 'Tank',
            hp: 200,
            speed: 30,
            reward: 25,
            color: '#95E1D3',
            size: 16
        },
        FLYING: {
            name: 'Flying Enemy',
            hp: 40,
            speed: 70,
            reward: 20,
            color: '#F38181',
            size: 11,
            flying: true // immune to splash damage
        },
        BOSS: {
            name: 'Boss',
            hp: 1000,
            speed: 20,
            reward: 100,
            color: '#AA96DA',
            size: 24
        }
    },

    WAVES: {
        TOTAL: 20,
        BOSS_INTERVAL: 5, // boss every 5 waves
        BASE_REWARD: 50,
        REWARD_PER_WAVE: 10
    },

    PROJECTILE: {
        SPEED: 200, // pixels per second
        SIZE: 5
    },

    COLORS: {
        BACKGROUND: '#1a1a1a',
        GRID: '#2d2d2d',
        PATH: '#3d3d3d',
        START: '#4CAF50',
        END: '#F44336',
        VALID_PLACEMENT: 'rgba(76, 175, 80, 0.3)',
        INVALID_PLACEMENT: 'rgba(244, 67, 54, 0.3)',
        RANGE_INDICATOR: 'rgba(255, 255, 255, 0.1)',
        HEALTH_BAR_BG: 'rgba(0, 0, 0, 0.5)',
        HEALTH_BAR_FG: '#4CAF50',
        HEALTH_BAR_WARN: '#FFC107',
        HEALTH_BAR_CRITICAL: '#F44336'
    },

    UI: {
        TOWER_PANEL_WIDTH: 250,
        HUD_HEIGHT: 120
    }
};

export default CONFIG;
