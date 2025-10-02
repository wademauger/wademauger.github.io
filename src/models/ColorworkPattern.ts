/**
 * ColorworkPattern - Core model for representing colorwork patterns
 * Reuses the existing colorwork grid structure from knitting-designer
 */
export class ColorworkPattern {
    constructor(width = 0, height = 0, grid = null, colors = {}, metadata = {}, fillColor = 'MC') {
        if (grid) {
            this.grid = grid; // 2D array of color IDs
        } else {
            // Initialize empty grid
            this.grid = [];
            for (let row = 0; row < height; row++) {
                this.grid.push(new Array(width).fill(fillColor));
            }
        }
        this.colors = colors; // Map of colorId -> { id, label, color }
        this.metadata = metadata; // Pattern name, description, etc.
    }

    static fromJSON(json) {
        return new ColorworkPattern(
            0, 0,
            json.grid || [],
            json.colors || {},
            json.metadata || {}
        );
    }

    toJSON() {
        return {
            grid: this.grid,
            colors: this.colors,
            metadata: this.metadata
        };
    }

    // Set a color definition
    setColor(colorId, hexColor, label) {
        this.colors[colorId] = {
            id: colorId,
            color: hexColor,
            label: label || colorId
        };
    }

    // Set a stitch color
    setStitch(row, col, colorId) {
        if (row >= 0 && row < this.grid.length && col >= 0 && col < this.grid[row].length) {
            this.grid[row][col] = colorId;
        }
    }

    getRowCount() {
        return this.grid.length;
    }

    getStitchCount() {
        return this.grid.length > 0 ? this.grid[0].length : 0;
    }

    getColorsUsed() {
        const usedColorIds = new Set();
        this.grid.forEach(row => {
            row.forEach(colorId => {
                if (colorId) usedColorIds.add(colorId);
            });
        });
        return Array.from(usedColorIds).map(id => this.colors[id]).filter(Boolean);
    }

    // Get the color instructions for a specific row
    getRowInstructions(rowIndex) {
        if (rowIndex < 0 || rowIndex >= this.grid.length) return [];
        
        const row = this.grid[rowIndex];
        const instructions = [];
        let currentColor = null;
        let stitchCount = 0;

        for (let i = 0; i < row.length; i++) {
            const colorId = row[i];
            if (colorId === currentColor) {
                stitchCount++;
            } else {
                if (currentColor !== null) {
                    instructions.push({
                        colorId: currentColor,
                        color: this.colors[currentColor],
                        stitchCount: stitchCount
                    });
                }
                currentColor = colorId;
                stitchCount = 1;
            }
        }

        // Add the last color run
        if (currentColor !== null) {
            instructions.push({
                colorId: currentColor,
                color: this.colors[currentColor],
                stitchCount: stitchCount
            });
        }

        return instructions;
    }

    // Resize pattern to fit specific dimensions
    resizeToFit(targetStitches, targetRows, fillColor = 'MC') {
        const currentStitches = this.getStitchCount();
        const currentRows = this.getRowCount();

        if (currentStitches === 0 || currentRows === 0) return;

        const newGrid = [];
        for (let row = 0; row < targetRows; row++) {
            const newRow = [];
            const sourceRow = Math.floor((row * currentRows) / targetRows);
            
                for (let col = 0; col < targetStitches; col++) {
                const sourceCol = Math.floor((col * currentStitches) / targetStitches);
                newRow.push(this.grid[sourceRow] ? this.grid[sourceRow][sourceCol] : fillColor);
            }
            newGrid.push(newRow);
        }

        this.grid = newGrid;
    }

    // Create a section of the pattern for a specific stitch range
    extractSection(startStitch, endStitch, startRow = 0, endRow = null) {
        endRow = endRow || this.getRowCount();
        
        const section = [];
        for (let row = startRow; row < Math.min(endRow, this.getRowCount()); row++) {
            const newRow = [];
            for (let col = startStitch; col < Math.min(endStitch, this.getStitchCount()); col++) {
                newRow.push(this.grid[row] ? this.grid[row][col] : 'MC');
            }
            section.push(newRow);
        }

        return new ColorworkPattern(section, this.colors, {
            ...this.metadata,
            isSection: true,
            originalStitchRange: [startStitch, endStitch],
            originalRowRange: [startRow, endRow]
        });
    }
}
