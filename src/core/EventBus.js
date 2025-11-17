// Simple event bus for decoupled communication between game systems

export class EventBus {
    constructor() {
        this.listeners = new Map();
    }

    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    off(event, callback) {
        if (!this.listeners.has(event)) return;

        const callbacks = this.listeners.get(event);
        const index = callbacks.indexOf(callback);
        if (index > -1) {
            callbacks.splice(index, 1);
        }
    }

    emit(event, data = null) {
        if (!this.listeners.has(event)) return;

        const callbacks = this.listeners.get(event);
        callbacks.forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`Error in event listener for ${event}:`, error);
            }
        });
    }

    clear() {
        this.listeners.clear();
    }
}

// Game events
export const GameEvents = {
    // Game state
    STATE_CHANGED: 'state_changed',
    GAME_STARTED: 'game_started',
    GAME_PAUSED: 'game_paused',
    GAME_RESUMED: 'game_resumed',
    GAME_OVER: 'game_over',
    VICTORY: 'victory',

    // Wave events
    WAVE_STARTED: 'wave_started',
    WAVE_COMPLETED: 'wave_completed',
    ENEMY_SPAWNED: 'enemy_spawned',
    ENEMY_DIED: 'enemy_died',
    ENEMY_REACHED_BASE: 'enemy_reached_base',

    // Tower events
    TOWER_PLACED: 'tower_placed',
    TOWER_UPGRADED: 'tower_upgraded',
    TOWER_SOLD: 'tower_sold',
    TOWER_SELECTED: 'tower_selected',
    TOWER_FIRED: 'tower_fired',

    // Economy events
    MONEY_CHANGED: 'money_changed',
    LIVES_CHANGED: 'lives_changed',
    SCORE_CHANGED: 'score_changed',

    // UI events
    SHOW_RANGE: 'show_range',
    HIDE_RANGE: 'hide_range',

    // Map events
    MAP_GENERATED: 'map_generated'
};

// Create singleton instance
export const eventBus = new EventBus();

export default eventBus;
