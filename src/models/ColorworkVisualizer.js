/**
 * ColorworkVisualizer - Transforms colorwork patterns into visual charts and instructions
 */
export class ColorworkVisualizer {
    constructor() {
        this.cellSize = 20; // Default cell size in pixels
        this.showGrid = true;
        this.showRowNumbers = true;
        this.showStitchNumbers = false;
    }

    /**
     * Generate an SVG chart for the colorwork pattern
     */
    generateChart(pattern, options = {}) {
        const {
            cellSize = this.cellSize,
            showGrid = this.showGrid,
            showRowNumbers = this.showRowNumbers,
            showStitchNumbers = this.showStitchNumbers,
            width = null,
            height = null
        } = options;

        const rows = pattern.getRowCount();
        const stitches = pattern.getStitchCount();
        
        if (rows === 0 || stitches === 0) {
            return this.createEmptyChart();
        }

        const chartWidth = width || (stitches * cellSize + (showStitchNumbers ? 30 : 10));
        const chartHeight = height || (rows * cellSize + (showRowNumbers ? 30 : 10));

        return {
            svg: this.renderSVG(pattern, { cellSize, showGrid, showRowNumbers, showStitchNumbers }),
            dimensions: { width: chartWidth, height: chartHeight },
            cellSize,
            pattern
        };
    }

    /**
     * Generate row-by-row color instructions
     */
    generateRowInstructions(pattern) {
        const instructions = [];
        
        for (let rowIndex = 0; rowIndex < pattern.getRowCount(); rowIndex++) {
            const rowInstructions = pattern.getRowInstructions(rowIndex);
            instructions.push({
                row: rowIndex + 1,
                stitches: rowInstructions,
                totalStitches: pattern.getStitchCount(),
                description: this.formatRowInstructions(rowInstructions, rowIndex + 1)
            });
        }

        return instructions;
    }

    /**
     * Render SVG element for the colorwork pattern
     */
    renderSVG(pattern, options = {}) {
        const {
            cellSize = this.cellSize,
            showGrid = this.showGrid,
            showRowNumbers = this.showRowNumbers,
            showStitchNumbers = this.showStitchNumbers
        } = options;

        const rows = pattern.getRowCount();
        const stitches = pattern.getStitchCount();
        const leftMargin = showRowNumbers ? 30 : 5;
        const topMargin = showStitchNumbers ? 30 : 5;
        const chartWidth = stitches * cellSize + leftMargin + 5;
        const chartHeight = rows * cellSize + topMargin + 5;

        // Create SVG elements array
        const elements = [];

        // Add background
        elements.push(`<rect width="${chartWidth}" height="${chartHeight}" fill="white" stroke="none"/>`);

        // Add grid and cells
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < stitches; col++) {
                const x = leftMargin + col * cellSize;
                const y = topMargin + row * cellSize;
                const colorId = pattern.grid[row][col];
                const color = pattern.colors[colorId];
                const fillColor = color ? color.color : '#ffffff';

                // Add cell
                elements.push(`<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${fillColor}" stroke="${showGrid ? '#cccccc' : 'none'}" stroke-width="0.5"/>`);
            }
        }

        // Add row numbers
        if (showRowNumbers) {
            for (let row = 0; row < rows; row++) {
                const y = topMargin + row * cellSize + cellSize / 2;
                elements.push(`<text x="20" y="${y + 4}" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#666">${rows - row}</text>`);
            }
        }

        // Add stitch numbers
        if (showStitchNumbers) {
            for (let col = 0; col < stitches; col++) {
                const x = leftMargin + col * cellSize + cellSize / 2;
                elements.push(`<text x="${x}" y="20" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#666">${col + 1}</text>`);
            }
        }

        const svgContent = `<svg width="${chartWidth}" height="${chartHeight}" xmlns="http://www.w3.org/2000/svg">
            ${elements.join('\n')}
        </svg>`;

        return svgContent;
    }

    /**
     * Format row instructions into human-readable text
     */
    formatRowInstructions(rowInstructions, rowNumber) {
        if (rowInstructions.length === 0) return `Row ${rowNumber}: No stitches`;
        
        const parts = rowInstructions.map(instruction => {
            const colorLabel = instruction.color ? instruction.color.label : instruction.colorId;
            return `${instruction.stitchCount} ${colorLabel}`;
        });

        return `Row ${rowNumber}: ${parts.join(', ')}`;
    }

    /**
     * Create an empty chart for when no pattern is available
     */
    createEmptyChart() {
        return {
            svg: '<svg width="100" height="50" xmlns="http://www.w3.org/2000/svg"><text x="50" y="25" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#666">No Pattern</text></svg>',
            dimensions: { width: 100, height: 50 },
            cellSize: this.cellSize,
            pattern: null
        };
    }

    /**
     * Generate a legend for the colorwork pattern
     */
    generateLegend(pattern) {
        const colorsUsed = pattern.getColorsUsed();
        return colorsUsed.map(color => ({
            id: color.id,
            label: color.label,
            color: color.color,
            description: `${color.label} (${color.color})`
        }));
    }
}
