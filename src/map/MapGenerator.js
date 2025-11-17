// Procedural map generation with seeded randomness

import { TerrainGrid, TerrainType } from './Terrain.js';
import { Pathfinder } from './Pathfinder.js';
import { SeededRandom, generateSeed } from '../utils/Math.js';
import { CONFIG } from '../utils/Config.js';

export class GameMap {
    constructor(grid, path, startPos, endPos, seed) {
        this.grid = grid;
        this.path = path;
        this.startPos = startPos;
        this.endPos = endPos;
        this.seed = seed;
        this.gridSize = CONFIG.GAME.GRID_SIZE;
        this.width = grid.width;
        this.height = grid.height;
    }

    getCell(x, y) {
        return this.grid.getCell(x, y);
    }

    isBuildable(x, y) {
        return this.grid.isBuildable(x, y);
    }

    worldToGrid(worldX, worldY) {
        return {
            x: Math.floor(worldX / this.gridSize),
            y: Math.floor(worldY / this.gridSize)
        };
    }

    gridToWorld(gridX, gridY) {
        return {
            x: gridX * this.gridSize + this.gridSize / 2,
            y: gridY * this.gridSize + this.gridSize / 2
        };
    }
}

export class MapGenerator {
    constructor(seed = null) {
        this.seed = seed || generateSeed();
        this.random = new SeededRandom(this.seed);
    }

    generate(sizeKey = 'medium') {
        const size = CONFIG.GAME.MAP_SIZES[sizeKey];
        const grid = new TerrainGrid(size.width, size.height);

        // Generate start and end positions
        const { start, end } = this.generateStartEnd(size.width, size.height);

        // Generate path
        const path = this.generatePath(grid, start, end);

        if (!path) {
            console.error('Failed to generate valid path, retrying...');
            // Retry with a slightly different configuration
            return this.generate(sizeKey);
        }

        // Apply path to grid
        this.applyPathToGrid(grid, path, start, end);

        // Add some blocked areas for variety (optional)
        this.addBlockedAreas(grid, path);

        // Create map object
        const map = new GameMap(grid, path, start, end, this.seed);

        return map;
    }

    generateStartEnd(width, height) {
        // Choose random edges for start and end
        const edges = ['top', 'right', 'bottom', 'left'];
        const startEdge = this.random.choice(edges);

        // Ensure end is on a different edge (preferably opposite)
        const oppositeEdges = {
            'top': 'bottom',
            'bottom': 'top',
            'left': 'right',
            'right': 'left'
        };

        const endEdge = oppositeEdges[startEdge];

        const start = this.getPositionOnEdge(startEdge, width, height);
        const end = this.getPositionOnEdge(endEdge, width, height);

        return { start, end };
    }

    getPositionOnEdge(edge, width, height) {
        const margin = 2; // Keep away from corners

        switch (edge) {
            case 'top':
                return {
                    x: this.random.int(margin, width - margin - 1),
                    y: 0
                };
            case 'bottom':
                return {
                    x: this.random.int(margin, width - margin - 1),
                    y: height - 1
                };
            case 'left':
                return {
                    x: 0,
                    y: this.random.int(margin, height - margin - 1)
                };
            case 'right':
                return {
                    x: width - 1,
                    y: this.random.int(margin, height - margin - 1)
                };
        }
    }

    generatePath(grid, start, end) {
        const pathfinder = new Pathfinder(grid);

        // Calculate preferred path length (longer paths are more interesting)
        const straightDistance = Math.abs(end.x - start.x) + Math.abs(end.y - start.y);
        const preferredLength = Math.floor(straightDistance * 1.5);

        // Try to find a path with variation
        let path = pathfinder.findPathWithVariation(start, end, preferredLength);

        if (!path) {
            // Fallback to straight path
            path = pathfinder.findPath(start, end);
        }

        if (!path) {
            return null;
        }

        // Add curves and smoothing
        path = this.addCurvesToPath(path, grid);
        path = pathfinder.smoothPath(path);

        // Ensure path is long enough
        if (path.length < straightDistance * 0.8) {
            // Path too short, regenerate
            return null;
        }

        return path;
    }

    addCurvesToPath(path, grid) {
        // Add random offsets to create more interesting curves
        const curved = [path[0]];

        for (let i = 1; i < path.length - 1; i++) {
            const current = path[i];

            // Randomly add variation
            if (this.random.next() < 0.3) {
                // Try to offset perpendicular to direction
                const prev = path[i - 1];
                const dx = current.x - prev.x;
                const dy = current.y - prev.y;

                // Perpendicular offset
                const offsetX = dy !== 0 ? (this.random.next() < 0.5 ? 1 : -1) : 0;
                const offsetY = dx !== 0 ? (this.random.next() < 0.5 ? 1 : -1) : 0;

                const newX = current.x + offsetX;
                const newY = current.y + offsetY;

                if (grid.isValid(newX, newY)) {
                    curved.push({ x: newX, y: newY });
                }
            }

            curved.push(current);
        }

        curved.push(path[path.length - 1]);
        return curved;
    }

    applyPathToGrid(grid, path, start, end) {
        // Mark start and end
        grid.setCell(start.x, start.y, TerrainType.START);
        grid.setCell(end.x, end.y, TerrainType.END);

        // Mark path with some width variation
        for (let i = 1; i < path.length - 1; i++) {
            const point = path[i];
            grid.setCell(point.x, point.y, TerrainType.PATH);

            // Randomly widen the path in some places
            if (this.random.next() < 0.2) {
                const neighbors = grid.getNeighbors(point.x, point.y, false);
                const widthPoint = this.random.choice(neighbors);
                if (widthPoint && !widthPoint.cell.isPath()) {
                    grid.setCell(widthPoint.x, widthPoint.y, TerrainType.PATH);
                }
            }
        }

        // Ensure path connectivity
        this.ensurePathConnectivity(grid, path);
    }

    ensurePathConnectivity(grid, path) {
        // Fill gaps between path segments
        for (let i = 0; i < path.length - 1; i++) {
            const current = path[i];
            const next = path[i + 1];

            const dx = Math.abs(next.x - current.x);
            const dy = Math.abs(next.y - current.y);

            // If gap is too large, fill it
            if (dx > 1 || dy > 1) {
                const steps = Math.max(dx, dy);
                for (let step = 1; step < steps; step++) {
                    const t = step / steps;
                    const x = Math.round(current.x + (next.x - current.x) * t);
                    const y = Math.round(current.y + (next.y - current.y) * t);

                    if (grid.isValid(x, y)) {
                        const cell = grid.getCell(x, y);
                        if (!cell.isPath()) {
                            grid.setCell(x, y, TerrainType.PATH);
                        }
                    }
                }
            }
        }
    }

    addBlockedAreas(grid, path) {
        // Add a few blocked areas to make tower placement more strategic
        const blockedCount = Math.floor((grid.width * grid.height) * 0.05); // 5% blocked

        let attempts = 0;
        let placed = 0;

        while (placed < blockedCount && attempts < blockedCount * 3) {
            attempts++;

            const x = this.random.int(1, grid.width - 2);
            const y = this.random.int(1, grid.height - 2);

            const cell = grid.getCell(x, y);

            // Don't block path or adjacent to path
            if (cell.isPath()) continue;

            // Check if adjacent to path (we want some distance)
            const neighbors = grid.getNeighbors(x, y, true);
            const adjacentToPath = neighbors.some(n => n.cell.isPath());

            if (!adjacentToPath) {
                grid.setCell(x, y, TerrainType.BLOCKED);
                placed++;
            }
        }
    }

    // Static method to generate from string seed
    static generateFromSeed(seedString, sizeKey = 'medium') {
        const numericSeed = generateSeed(seedString);
        const generator = new MapGenerator(numericSeed);
        return generator.generate(sizeKey);
    }
}

export default MapGenerator;
