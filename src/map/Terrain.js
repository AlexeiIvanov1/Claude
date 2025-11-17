// Terrain types and grid cell management

export const TerrainType = {
    EMPTY: 0,
    PATH: 1,
    START: 2,
    END: 3,
    BLOCKED: 4
};

export class GridCell {
    constructor(x, y, type = TerrainType.EMPTY) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.buildable = type === TerrainType.EMPTY;
    }

    isPath() {
        return this.type === TerrainType.PATH ||
               this.type === TerrainType.START ||
               this.type === TerrainType.END;
    }

    isBuildable() {
        return this.buildable && this.type === TerrainType.EMPTY;
    }
}

export class TerrainGrid {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.cells = [];

        // Initialize grid
        for (let y = 0; y < height; y++) {
            this.cells[y] = [];
            for (let x = 0; x < width; x++) {
                this.cells[y][x] = new GridCell(x, y);
            }
        }
    }

    getCell(x, y) {
        if (!this.isValid(x, y)) return null;
        return this.cells[y][x];
    }

    setCell(x, y, type) {
        if (!this.isValid(x, y)) return false;
        this.cells[y][x].type = type;
        this.cells[y][x].buildable = type === TerrainType.EMPTY;
        return true;
    }

    isValid(x, y) {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }

    isBuildable(x, y) {
        const cell = this.getCell(x, y);
        return cell && cell.isBuildable();
    }

    isPath(x, y) {
        const cell = this.getCell(x, y);
        return cell && cell.isPath();
    }

    getNeighbors(x, y, diagonal = false) {
        const neighbors = [];
        const directions = [
            { dx: 0, dy: -1 },  // North
            { dx: 1, dy: 0 },   // East
            { dx: 0, dy: 1 },   // South
            { dx: -1, dy: 0 }   // West
        ];

        if (diagonal) {
            directions.push(
                { dx: -1, dy: -1 }, // NW
                { dx: 1, dy: -1 },  // NE
                { dx: -1, dy: 1 },  // SW
                { dx: 1, dy: 1 }    // SE
            );
        }

        for (const dir of directions) {
            const nx = x + dir.dx;
            const ny = y + dir.dy;
            if (this.isValid(nx, ny)) {
                neighbors.push({ x: nx, y: ny, cell: this.cells[ny][nx] });
            }
        }

        return neighbors;
    }

    // Count path neighbors for path generation
    countPathNeighbors(x, y) {
        let count = 0;
        const neighbors = this.getNeighbors(x, y, false);

        for (const neighbor of neighbors) {
            if (neighbor.cell.isPath()) {
                count++;
            }
        }

        return count;
    }

    // Clone the grid
    clone() {
        const newGrid = new TerrainGrid(this.width, this.height);
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                newGrid.cells[y][x].type = this.cells[y][x].type;
                newGrid.cells[y][x].buildable = this.cells[y][x].buildable;
            }
        }
        return newGrid;
    }
}

export default {
    TerrainType,
    GridCell,
    TerrainGrid
};
