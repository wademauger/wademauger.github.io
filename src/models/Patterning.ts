// Alignment Enum
const Alignment = {
    LEFT: 'left',
    CENTER: 'center',
    RIGHT: 'right'
};

// Abstract Base Class for Patterns
class Pattern {
    constructor() {
        if (new.target === Pattern) {
            throw new Error('Abstract classes can\'t be instantiated.');
        }
    }

    // Abstract method to get the stitch pattern for a given row and stitch
    getStitchPatterning(rowNumber?: number, stitchIndex?: number): any {
        throw new Error('Method \'getStitchPatterning(rowNumber, stitchIndex)\' must be implemented.');
    }
}

// Stripe Pattern
class Stripe extends Pattern {
    color: string;
    length: number;

    constructor(color: string, length: number) {
        super();
        this.color = color;
        this.length = length;
    }

    override getStitchPatterning(rowNumber: number, stitchIndex?: number): any {
        if (stitchIndex === undefined || stitchIndex === null) {
            // Return the whole row as an array
            if (rowNumber % this.length === 0) {
                return Array(20).fill({ color: this.color }); // Assuming a default row length of 20
            } else {
                return Array(20).fill({}); // Assuming a default row length of 20
            }
        } else {
            // Return pattern info for a single stitch
            if (rowNumber % this.length === 0) {
                return { color: this.color }; // Apply color to the entire row
            }
            return {}; // Return an empty object if not the start of a stripe
        }
    }
}

// Motif Pattern
class Motif extends Pattern {
    motifData: any[][];
    colorMap: any;
    repeatX: string;
    repeatY: string;
    alignment: string;

    constructor(motifData: any[][], colorMap: any, repeatX: string = 'single', repeatY: string = 'single', alignment: string = Alignment.LEFT) {
        super();
        this.motifData = motifData; // 2D array of color indexes
        this.colorMap = colorMap; // Map of color indexes to actual colors
        this.repeatX = repeatX; // 'single', 'repeat-n', 'repeat-infinity'
        this.repeatY = repeatY; // 'single', 'repeat-infinity'
        this.alignment = alignment; // Alignment of the motif
    }

    override getStitchPatterning(rowNumber: number, stitchIndex?: number): any {
        const motifHeight = this.motifData.length;
        const motifWidth = this.motifData[0].length;
        const rowLength = 20; // Assuming a default row length of 20

        if (stitchIndex === undefined || stitchIndex === null) {
            // Return the whole row as an array
            const row = [];
            for (let i = 0; i < rowLength; i++) {
                let motifX;
                if (this.alignment === Alignment.CENTER) {
                    motifX = (i - (rowLength - motifWidth) / 2 + motifWidth) % motifWidth;
                } else if (this.alignment === Alignment.RIGHT) {
                    motifX = (i - (rowLength - motifWidth) + motifWidth) % motifWidth;
                }
                else {
                    motifX = i % motifWidth;
                }
                let motifY = rowNumber % motifHeight;

                if (this.repeatX === 'single' && i >= motifWidth) {
                    row.push({});
                    continue;
                }
                if (this.repeatY === 'single' && rowNumber >= motifHeight) {
                    row.push({});
                    continue;
                }

                let colorIndex = this.motifData[motifY][motifX];
                let color = this.colorMap[colorIndex];
                row.push(color ? { color: color } : {});
            }
            return row;
        } else {
            // Return pattern info for a single stitch
            let motifX;
            if (this.alignment === Alignment.CENTER) {
                motifX = (stitchIndex - (rowLength - motifWidth) / 2 + motifWidth) % motifWidth;
            } else if (this.alignment === Alignment.RIGHT) {
                motifX = (stitchIndex - (rowLength - motifWidth) + motifWidth) % motifWidth;
            }
            else {
                motifX = stitchIndex % motifWidth;
            }
            let motifY = rowNumber % motifHeight;

            if (this.repeatX === 'single' && stitchIndex >= motifWidth) return {}; // Skip if past single motif width
            if (this.repeatY === 'single' && rowNumber >= motifHeight) return {}; // Skip if past single motif height

            let colorIndex = this.motifData[motifY][motifX];
            let color = this.colorMap[colorIndex];

            return color ? { color: color } : {}; // Return color from colorMap, or empty object if not found
        }
    }
}

// Pattern Combinator (for complex combinations)
class ComplexPattern extends Pattern {
    patterns: Pattern[];
    combinationMode: string;

    constructor(patterns: Pattern[], combinationMode: string = 'overlay') {
        super();
        this.patterns = patterns; // Array of Pattern objects
        this.combinationMode = combinationMode; // 'overlay', 'replace', etc.
    }

    override getStitchPatterning(rowNumber: number, stitchIndex?: number): any {
        if (stitchIndex === undefined || stitchIndex === null) {
            // Return the whole row as an array
            let combinedRow = Array(20).fill({}); // Assuming a default row length of 20

            for (const pattern of this.patterns) {
                const patternResult = pattern.getStitchPatterning(rowNumber); // Get the whole row

                if (this.combinationMode === 'overlay') {
                    // Overlay: Merge the pattern's result with the existing row
                    for (let i = 0; i < combinedRow.length; i++) {
                        combinedRow[i] = { ...combinedRow[i], ...patternResult[i] }; // Merge pattern info
                    }
                } else if (this.combinationMode === 'replace') {
                    // Replace: Completely replace the row with the pattern's output
                    combinedRow = patternResult;
                }
                // Add more combination modes as needed (e.g., 'blend', 'mask')
            }

            return combinedRow;
        } else {
            // Return pattern info for a single stitch
            let combinedPatterning = {};

            for (const pattern of this.patterns) {
                const patternResult = pattern.getStitchPatterning(rowNumber, stitchIndex);

                if (this.combinationMode === 'overlay') {
                    // Overlay: Merge the pattern's result with the existing result
                    combinedPatterning = { ...combinedPatterning, ...patternResult }; // Later patterns overwrite earlier ones
                } else if (this.combinationMode === 'replace') {
                    // Replace: Completely replace the row with the pattern's output
                    combinedPatterning = patternResult;
                }
                // Add more combination modes as needed (e.g., 'blend', 'mask')
            }

            return combinedPatterning;
        }
    }
}

export { Stripe, Motif, ComplexPattern, Alignment };