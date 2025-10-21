interface ColorworkPattern {
    getRowCount(): number;
    getStitchCount(): number;
    getRowInstructions(rowIndex: number): RowInstruction[];
    grid: number[][];
    colors: Record<number, PatternColor>;
    getColorsUsed(): PatternColor[];
}

interface PatternColor {
    id: string | number;
    label: string;
    color: string;
}

interface RowInstruction {
    colorId: string | number;
    color?: PatternColor;
    stitchCount: number;
}

interface ChartOptions {
    cellSize?: number;
    showGrid?: boolean;
    showRowNumbers?: boolean;
    showStitchNumbers?: boolean;
    width?: number | null;
    height?: number | null;
}

interface ChartResult {
    svg: string;
    dimensions: { width: number; height: number };
    cellSize: number;
    pattern: ColorworkPattern | null;
}

interface RowInstructionResult {
    row: number;
    stitches: RowInstruction[];
    totalStitches: number;
    description: string;
}

interface LegendItem {
    id: string | number;
    label: string;
    color: string;
    description: string;
}

/**
 * ColorworkVisualizer - Transforms colorwork patterns into visual charts and instructions
 */
export class ColorworkVisualizer {
    cellSize: number;
    showGrid: boolean;
    showRowNumbers: boolean;
    showStitchNumbers: boolean;

    constructor() {
        this.cellSize = 20; // Default cell size in pixels
        this.showGrid = true;
        this.showRowNumbers = true;
        this.showStitchNumbers = false;
    }

    /**
     * Generate an SVG chart for the colorwork pattern
     */
    generateChart(pattern: ColorworkPattern, options: ChartOptions = {}): ChartResult {
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
    generateRowInstructions(pattern: ColorworkPattern): RowInstructionResult[] {
        const instructions: RowInstructionResult[] = [];
        
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
    renderSVG(pattern: ColorworkPattern, options: ChartOptions = {}): string {
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
    formatRowInstructions(rowInstructions: RowInstruction[], rowNumber: number): string {
        if (rowInstructions.length === 0) return `Row ${rowNumber}: No stitches`;
        
        const parts = rowInstructions.map((instruction: RowInstruction) => {
            const colorLabel = instruction.color ? instruction.color.label : instruction.colorId;
            return `${instruction.stitchCount} ${colorLabel}`;
        });

        return `Row ${rowNumber}: ${parts.join(', ')}`;
    }

    /**
     * Create an empty chart for when no pattern is available
     */
    createEmptyChart(): ChartResult {
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
    generateLegend(pattern: ColorworkPattern): LegendItem[] {
        const colorsUsed = pattern.getColorsUsed();
        return colorsUsed.map((color: PatternColor) => ({
            id: color.id,
            label: color.label,
            color: color.color,
            description: `${color.label} (${color.color})`
        }));
    }
}
