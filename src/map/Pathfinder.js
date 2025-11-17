// A* pathfinding algorithm

import { manhattanDistance } from '../utils/Math.js';

class PathNode {
    constructor(x, y, g = 0, h = 0, parent = null) {
        this.x = x;
        this.y = y;
        this.g = g; // Cost from start
        this.h = h; // Heuristic to goal
        this.f = g + h; // Total cost
        this.parent = parent;
    }

    get key() {
        return `${this.x},${this.y}`;
    }
}

class PriorityQueue {
    constructor() {
        this.elements = [];
    }

    enqueue(item) {
        this.elements.push(item);
        this.elements.sort((a, b) => a.f - b.f);
    }

    dequeue() {
        return this.elements.shift();
    }

    isEmpty() {
        return this.elements.length === 0;
    }

    contains(x, y) {
        return this.elements.some(node => node.x === x && node.y === y);
    }
}

export class Pathfinder {
    constructor(grid) {
        this.grid = grid;
    }

    // A* algorithm to find path from start to goal
    findPath(start, goal, allowDiagonal = false) {
        const openSet = new PriorityQueue();
        const closedSet = new Set();
        const startNode = new PathNode(
            start.x,
            start.y,
            0,
            this.heuristic(start, goal)
        );

        openSet.enqueue(startNode);
        const cameFrom = new Map();
        const gScore = new Map();
        gScore.set(startNode.key, 0);

        while (!openSet.isEmpty()) {
            const current = openSet.dequeue();

            // Reached goal
            if (current.x === goal.x && current.y === goal.y) {
                return this.reconstructPath(current);
            }

            closedSet.add(current.key);

            // Check all neighbors
            const neighbors = this.getWalkableNeighbors(current.x, current.y, allowDiagonal);

            for (const neighbor of neighbors) {
                const neighborKey = `${neighbor.x},${neighbor.y}`;

                if (closedSet.has(neighborKey)) {
                    continue;
                }

                // Calculate tentative g score
                const tentativeG = current.g + neighbor.cost;
                const currentG = gScore.get(neighborKey) ?? Infinity;

                if (tentativeG < currentG) {
                    // This path to neighbor is better
                    const neighborNode = new PathNode(
                        neighbor.x,
                        neighbor.y,
                        tentativeG,
                        this.heuristic(neighbor, goal),
                        current
                    );

                    gScore.set(neighborKey, tentativeG);
                    cameFrom.set(neighborKey, current);

                    if (!openSet.contains(neighbor.x, neighbor.y)) {
                        openSet.enqueue(neighborNode);
                    }
                }
            }
        }

        // No path found
        return null;
    }

    getWalkableNeighbors(x, y, allowDiagonal = false) {
        const neighbors = [];
        const directions = [
            { dx: 0, dy: -1, cost: 1 },  // North
            { dx: 1, dy: 0, cost: 1 },   // East
            { dx: 0, dy: 1, cost: 1 },   // South
            { dx: -1, dy: 0, cost: 1 }   // West
        ];

        if (allowDiagonal) {
            directions.push(
                { dx: -1, dy: -1, cost: 1.414 }, // NW
                { dx: 1, dy: -1, cost: 1.414 },  // NE
                { dx: -1, dy: 1, cost: 1.414 },  // SW
                { dx: 1, dy: 1, cost: 1.414 }    // SE
            );
        }

        for (const dir of directions) {
            const nx = x + dir.dx;
            const ny = y + dir.dy;

            if (this.isWalkable(nx, ny)) {
                neighbors.push({
                    x: nx,
                    y: ny,
                    cost: dir.cost
                });
            }
        }

        return neighbors;
    }

    isWalkable(x, y) {
        if (!this.grid.isValid(x, y)) {
            return false;
        }

        const cell = this.grid.getCell(x, y);
        // Can walk on empty cells or path cells
        return cell && (cell.type === 0 || cell.isPath());
    }

    heuristic(a, b) {
        // Manhattan distance
        return manhattanDistance(a, b);
    }

    reconstructPath(endNode) {
        const path = [];
        let current = endNode;

        while (current) {
            path.unshift({ x: current.x, y: current.y });
            current = current.parent;
        }

        return path;
    }

    // Find path that tries to create interesting curves
    findPathWithVariation(start, goal, preferredLength = null) {
        const straightPath = this.findPath(start, goal);
        if (!straightPath) return null;

        // If we want a longer path, add waypoints
        if (preferredLength && straightPath.length < preferredLength) {
            return this.addWaypoints(straightPath, start, goal, preferredLength);
        }

        return straightPath;
    }

    addWaypoints(path, start, goal, targetLength) {
        // Try to add intermediate waypoints to make path longer
        const midX = Math.floor((start.x + goal.x) / 2);
        const midY = Math.floor((start.y + goal.y) / 2);

        // Offset the midpoint to create curves
        const offsetX = Math.floor(this.grid.width * 0.2);
        const offsetY = Math.floor(this.grid.height * 0.2);

        const waypoints = [
            { x: midX + offsetX, y: midY },
            { x: midX, y: midY + offsetY },
            { x: midX - offsetX, y: midY }
        ];

        // Try each waypoint and pick the one that creates the longest valid path
        let bestPath = path;

        for (const waypoint of waypoints) {
            if (!this.isWalkable(waypoint.x, waypoint.y)) continue;

            const path1 = this.findPath(start, waypoint);
            const path2 = this.findPath(waypoint, goal);

            if (path1 && path2) {
                const combinedPath = [...path1, ...path2.slice(1)];
                if (combinedPath.length > bestPath.length && combinedPath.length <= targetLength * 1.5) {
                    bestPath = combinedPath;
                }
            }
        }

        return bestPath;
    }

    // Smooth path by removing unnecessary points
    smoothPath(path) {
        if (path.length <= 2) return path;

        const smoothed = [path[0]];

        for (let i = 1; i < path.length - 1; i++) {
            const prev = path[i - 1];
            const current = path[i];
            const next = path[i + 1];

            // Keep point if it changes direction
            const dx1 = current.x - prev.x;
            const dy1 = current.y - prev.y;
            const dx2 = next.x - current.x;
            const dy2 = next.y - current.y;

            if (dx1 !== dx2 || dy1 !== dy2) {
                smoothed.push(current);
            }
        }

        smoothed.push(path[path.length - 1]);
        return smoothed;
    }
}

export default Pathfinder;
