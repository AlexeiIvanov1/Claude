// Math utilities for game calculations

export class Vector2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    add(v) {
        return new Vector2(this.x + v.x, this.y + v.y);
    }

    subtract(v) {
        return new Vector2(this.x - v.x, this.y - v.y);
    }

    multiply(scalar) {
        return new Vector2(this.x * scalar, this.y * scalar);
    }

    divide(scalar) {
        return new Vector2(this.x / scalar, this.y / scalar);
    }

    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    normalize() {
        const mag = this.magnitude();
        if (mag === 0) return new Vector2(0, 0);
        return this.divide(mag);
    }

    distanceTo(v) {
        const dx = this.x - v.x;
        const dy = this.y - v.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    clone() {
        return new Vector2(this.x, this.y);
    }

    static distance(v1, v2) {
        return v1.distanceTo(v2);
    }

    static lerp(v1, v2, t) {
        return new Vector2(
            v1.x + (v2.x - v1.x) * t,
            v1.y + (v2.y - v1.y) * t
        );
    }
}

export function distance(p1, p2) {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
}

export function manhattanDistance(p1, p2) {
    return Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y);
}

export function lerp(a, b, t) {
    return a + (b - a) * t;
}

export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

export function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}

export function randomInt(min, max) {
    return Math.floor(randomRange(min, max + 1));
}

export function randomChoice(array) {
    return array[randomInt(0, array.length - 1)];
}

// Seeded random number generator (Mulberry32)
export class SeededRandom {
    constructor(seed) {
        this.seed = seed;
    }

    next() {
        let t = this.seed += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }

    range(min, max) {
        return this.next() * (max - min) + min;
    }

    int(min, max) {
        return Math.floor(this.range(min, max + 1));
    }

    choice(array) {
        return array[this.int(0, array.length - 1)];
    }
}

export function generateSeed(str = null) {
    if (str) {
        // Convert string to seed
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash);
    }
    // Generate random seed
    return Math.floor(Math.random() * 2147483647);
}

export function degreesToRadians(degrees) {
    return degrees * (Math.PI / 180);
}

export function radiansToDegrees(radians) {
    return radians * (180 / Math.PI);
}

export function angleBetween(p1, p2) {
    return Math.atan2(p2.y - p1.y, p2.x - p1.x);
}

export function rotatePoint(point, center, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const dx = point.x - center.x;
    const dy = point.y - center.y;

    return new Vector2(
        cos * dx - sin * dy + center.x,
        sin * dx + cos * dy + center.y
    );
}

// Grid coordinate helpers
export function gridToWorld(gridX, gridY, gridSize) {
    return new Vector2(
        gridX * gridSize + gridSize / 2,
        gridY * gridSize + gridSize / 2
    );
}

export function worldToGrid(worldX, worldY, gridSize) {
    return {
        x: Math.floor(worldX / gridSize),
        y: Math.floor(worldY / gridSize)
    };
}

export function isValidGridPosition(x, y, width, height) {
    return x >= 0 && x < width && y >= 0 && y < height;
}

// Collision detection
export function circleIntersectsCircle(c1, r1, c2, r2) {
    return distance(c1, c2) <= (r1 + r2);
}

export function pointInCircle(point, center, radius) {
    return distance(point, center) <= radius;
}

export function pointInRect(point, rect) {
    return point.x >= rect.x &&
           point.x <= rect.x + rect.width &&
           point.y >= rect.y &&
           point.y <= rect.y + rect.height;
}

// Easing functions for animations
export const Easing = {
    linear: t => t,
    easeInQuad: t => t * t,
    easeOutQuad: t => t * (2 - t),
    easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    easeInCubic: t => t * t * t,
    easeOutCubic: t => (--t) * t * t + 1,
    easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
};

export default {
    Vector2,
    distance,
    manhattanDistance,
    lerp,
    clamp,
    randomRange,
    randomInt,
    randomChoice,
    SeededRandom,
    generateSeed,
    degreesToRadians,
    radiansToDegrees,
    angleBetween,
    rotatePoint,
    gridToWorld,
    worldToGrid,
    isValidGridPosition,
    circleIntersectsCircle,
    pointInCircle,
    pointInRect,
    Easing
};
