// Base entity class for game objects

import { Vector2 } from '../utils/Math.js';

let nextEntityId = 0;

export class Entity {
    constructor(x, y) {
        this.id = nextEntityId++;
        this.position = new Vector2(x, y);
        this.alive = true;
        this.components = new Map();
    }

    addComponent(name, data) {
        this.components.set(name, data);
    }

    getComponent(name) {
        return this.components.get(name);
    }

    hasComponent(name) {
        return this.components.has(name);
    }

    update(deltaTime) {
        // Override in subclasses
    }

    destroy() {
        this.alive = false;
    }

    serialize() {
        return {
            id: this.id,
            x: this.position.x,
            y: this.position.y
        };
    }
}

export default Entity;
