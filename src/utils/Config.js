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
            name: 'MG Turret',
            description: 'Rapid-fire ballistic weapon',
            cost: 100,
            color: '#10b981',
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
            name: 'Laser Turret',
            description: 'High-energy beam weapon, precision targeting',
            cost: 150,
            color: '#ef4444',
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
            name: 'Missile Launcher',
            description: 'Explosive ordnance, devastates groups',
            cost: 200,
            color: '#f59e0b',
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
            name: 'Cryo Turret',
            description: 'Freezing projectiles slow targets',
            cost: 125,
            color: '#06b6d4',
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
            name: 'Raider',
            hp: 50,
            speed: 50, // pixels per second
            reward: 10,
            color: '#92400e',
            size: 12
        },
        FAST: {
            name: 'Feral Ghoul',
            hp: 30,
            speed: 90,
            reward: 15,
            color: '#84cc16',
            size: 10
        },
        TANK: {
            name: 'Super Mutant',
            hp: 200,
            speed: 30,
            reward: 25,
            color: '#65a30d',
            size: 16
        },
        FLYING: {
            name: 'Bloodbug',
            hp: 40,
            speed: 70,
            reward: 20,
            color: '#dc2626',
            size: 11,
            flying: true // immune to splash damage
        },
        BOSS: {
            name: 'Deathclaw',
            hp: 1000,
            speed: 20,
            reward: 100,
            color: '#78350f',
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
        BACKGROUND: '#0a0a0a',
        GRID: '#1a1a1a',
        PATH: '#374151',
        START: '#10b981',
        END: '#dc2626',
        VALID_PLACEMENT: 'rgba(16, 185, 129, 0.3)',
        INVALID_PLACEMENT: 'rgba(220, 38, 38, 0.3)',
        RANGE_INDICATOR: 'rgba(16, 185, 129, 0.15)',
        HEALTH_BAR_BG: 'rgba(0, 0, 0, 0.7)',
        HEALTH_BAR_FG: '#10b981',
        HEALTH_BAR_WARN: '#fbbf24',
        HEALTH_BAR_CRITICAL: '#dc2626'
    },

    UI: {
        TOWER_PANEL_WIDTH: 250,
        HUD_HEIGHT: 120
    }
};

export default CONFIG;
