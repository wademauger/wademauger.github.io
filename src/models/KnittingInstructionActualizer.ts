/**
 * KnittingInstructionActualizer - Base class for generating knitting instructions
 * 
 * Transforms a concrete stitch plan into structured, machine/technique-specific instructions.
 * Different actualizers can be subclassed for different knitting styles:
 * - HandKnittingActualizer: For traditional hand knitting (needles, turns, wraps)
 * - MachineKnittingActualizer: For knitting machine instructions (carrier threading, etc.)
 * - CircularNeedleActualizer: For circular needle knitting (continuous rounds)
 * - FlatCircularActualizer: For flat knitting on circular needles
 * 
 * This abstraction ensures:
 * 1. Clear separation of concerns (data vs presentation)
 * 2. Extensibility for different knitting techniques
 * 3. Reusability across different UI components
 * 4. Testability of instruction logic independent of React components
 */
export interface StitchRow {
    rowNumber: number;
    leftStitchesInWork: number;
    rightStitchesInWork: number;
    shortRowInfo?: {
        shortRowId: string;
        rowInShortRowSequence: number;
        totalRowsInShortRow: number;
        heldStitchesLeft: number;
        heldStitchesRight: number;
        activeStitchesLeft: number;
        activeStitchesRight: number;
    };
    colorwork?: any[];
}

export interface KnittingInstruction {
    text: string;
    stepData: {
        text: string;
        startRowIndex: number;
        endRowIndex: number;
        rowsInStep: number;
        absolutePositioning: {
            totalStitches: number;
            leftStitches: number;
            rightStitches: number;
            needleRange: string;
            description: string;
        };
    };
}

export interface PatternDetectionResult {
    leftDiff: number;
    rightDiff: number;
    frequency: number;
    repeatCount: number;
    totalRows: number;
}

import formatNeedleRange from './needleRangeFormatter';

export abstract class KnittingInstructionActualizer {
    protected knittingOptions: any;
    protected maxNeedlesPerSide: number;

    constructor(knittingOptions: any = {}) {
        this.knittingOptions = knittingOptions;
        // Determine max needles per side from options or machine type. Default to 75 for LK150.
        if (knittingOptions && typeof knittingOptions.maxNeedlesPerSide === 'number') {
            this.maxNeedlesPerSide = knittingOptions.maxNeedlesPerSide;
        } else if (knittingOptions && knittingOptions.machineType === 'lk150') {
            this.maxNeedlesPerSide = 75;
        } else {
            this.maxNeedlesPerSide = 75; // sensible default
        }
    }

    /**
     * Main entry point: Convert stitch plan to instructions
     */
    abstract actualize(sectionRows: StitchRow[], baseRowIndex: number): KnittingInstruction[];

    /**
     * Calculate needle position from stitch counts
     * Override in subclasses for different needle arrangement conventions
     */
    public getAbsolutePosition(row: StitchRow): any {
        if (!row) return null;

        const totalStitches = row.leftStitchesInWork + row.rightStitchesInWork;
        const leftStitches = row.leftStitchesInWork;
        const rightStitches = row.rightStitchesInWork;

        // Use centralized formatter (clamps to maxNeedlesPerSide and produces compact LK-style ranges)
        const needleRange = formatNeedleRange({ leftStitches, rightStitches, totalStitches, maxNeedlesPerSide: this.maxNeedlesPerSide });

        return {
            totalStitches,
            leftStitches,
            rightStitches,
            needleRange,
            description: `Knitting across ${totalStitches} stitches (${leftStitches} left, ${rightStitches} right)`
        };
    }

    /**
     * Detect repeating shaping patterns
     * Override in subclasses for different pattern detection algorithms
     */
    protected detectShapingPattern(sectionRows: StitchRow[], startIndex: number): PatternDetectionResult | null {
        if (startIndex + 3 >= sectionRows.length) return null;

        const firstRow = sectionRows[startIndex];
        const secondRow = sectionRows[startIndex + 1];

        // Don't start a pattern if any of the first two rows are short rows
        if (firstRow.shortRowInfo || secondRow.shortRowInfo) {
            return null;
        }

        const leftDiff1 = secondRow.leftStitchesInWork - firstRow.leftStitchesInWork;
        const rightDiff1 = secondRow.rightStitchesInWork - firstRow.rightStitchesInWork;

        // Look for next occurrence of same change (but stop at short rows)
        let frequency = 1;
        for (let j = startIndex + 2; j < Math.min(startIndex + 10, sectionRows.length); j++) {
            if (sectionRows[j].shortRowInfo) {
                return null;
            }

            const leftDiff = sectionRows[j].leftStitchesInWork - sectionRows[j - 1].leftStitchesInWork;
            const rightDiff = sectionRows[j].rightStitchesInWork - sectionRows[j - 1].rightStitchesInWork;

            if (leftDiff === leftDiff1 && rightDiff === rightDiff1) {
                frequency = j - startIndex;
                break;
            }
        }

        if (frequency === 1) return null;

        // Check if any rows within the first pattern unit are short rows
        for (let k = startIndex; k < startIndex + frequency; k++) {
            if (sectionRows[k].shortRowInfo) {
                return null;
            }
        }

        // Count how many times this pattern repeats (but stop at short rows)
        let repeatCount = 1;
        let idx = startIndex + frequency;
        while (idx < sectionRows.length) {
            if (sectionRows[idx].shortRowInfo) {
                break;
            }

            const leftDiff = sectionRows[idx].leftStitchesInWork - sectionRows[idx - 1].leftStitchesInWork;
            const rightDiff = sectionRows[idx].rightStitchesInWork - sectionRows[idx - 1].rightStitchesInWork;

            if (leftDiff === leftDiff1 && rightDiff === rightDiff1) {
                repeatCount++;
                idx += frequency;
            } else {
                break;
            }
        }

        if (repeatCount < 2) return null;

        return {
            leftDiff: leftDiff1,
            rightDiff: rightDiff1,
            frequency,
            repeatCount,
            totalRows: repeatCount * frequency
        };
    }

    /**
     * Helper: Build increase/decrease instruction text
     */
    protected buildShapingText(leftDiff: number, rightDiff: number): string {
        let instruction = '';

        if (leftDiff > 0) {
            instruction += `Increase ${leftDiff} stitch${leftDiff > 1 ? 'es' : ''} on the left. `;
        } else if (leftDiff < 0) {
            instruction += `Decrease ${-leftDiff} stitch${leftDiff < -1 ? 'es' : ''} on the left. `;
        }

        if (rightDiff > 0) {
            instruction += `Increase ${rightDiff} stitch${rightDiff > 1 ? 'es' : ''} on the right. `;
        } else if (rightDiff < 0) {
            instruction += `Decrease ${-rightDiff} stitch${rightDiff < -1 ? 'es' : ''} on the right. `;
        }

        return instruction;
    }

    /**
     * Helper: Build knit rows text
     */
    protected buildKnitRowsText(consecutiveRows: number): string {
        return consecutiveRows > 1 ? `Knit ${consecutiveRows} rows. ` : `Knit 1 row. `;
    }
}

export default KnittingInstructionActualizer;
