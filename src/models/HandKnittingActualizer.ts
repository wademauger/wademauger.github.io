import KnittingInstructionActualizer, { StitchRow, KnittingInstruction } from './KnittingInstructionActualizer';

/**
 * HandKnittingActualizer - Generates instructions for hand knitting
 * 
 * Specializes the generic actualizer for traditional hand knitting:
 * - Shows individual row increases/decreases  
 * - Includes wrap/turn instructions for short rows
 * - Uses hand knitting terminology and conventions
 * - Supports different short row techniques (wraps, gaps, german)
 */
export class HandKnittingActualizer extends KnittingInstructionActualizer {
    /**
     * Convert stitch plan section to hand knitting instructions
     */
    actualize(sectionRows: StitchRow[], baseRowIndex: number): KnittingInstruction[] {
        const instructions: KnittingInstruction[] = [];

        if (sectionRows.length === 0) return instructions;

        let i = 0;
        while (i < sectionRows.length) {
            const row = sectionRows[i];

            // Check if this row is part of a short row sequence
            if (row.shortRowInfo) {
                this._generateShortRowInstructions(sectionRows, i, baseRowIndex, instructions);
                // Skip all rows in this short row sequence
                const srInfo = row.shortRowInfo;
                i += srInfo.totalRowsInShortRow;
            } else {
                // Regular (non-short-row) processing
                const firstRow = row;
                let consecutiveRows = 1;
                let prevRow = firstRow;
                const stepStartRowIndex = baseRowIndex + i;

                // Collect consecutive rows without shaping
                let hasShortRowsInRange = false;
                for (let j = i + 1; j < sectionRows.length; j++) {
                    const nextRow = sectionRows[j];
                    if (nextRow.shortRowInfo) {
                        hasShortRowsInRange = true;
                        break;
                    }

                    const leftDiff = nextRow.leftStitchesInWork - prevRow.leftStitchesInWork;
                    const rightDiff = nextRow.rightStitchesInWork - prevRow.rightStitchesInWork;

                    if (leftDiff === 0 && rightDiff === 0) {
                        consecutiveRows++;
                        prevRow = nextRow;
                    } else {
                        break;
                    }
                }

                // Check if first group is rectangular (and no short rows ahead)
                const isRectangularCondition = !hasShortRowsInRange &&
                    consecutiveRows === sectionRows.length - i &&
                    firstRow.leftStitchesInWork === sectionRows[sectionRows.length - 1].leftStitchesInWork &&
                    firstRow.rightStitchesInWork === sectionRows[sectionRows.length - 1].rightStitchesInWork;

                if (isRectangularCondition) {
                    // Entire remaining section is rectangular
                    const lastRow = sectionRows[sectionRows.length - 1];
                    const rectInstr = `Knit ${consecutiveRows} rows (RC=${lastRow.rowNumber}, ${lastRow.leftStitchesInWork + lastRow.rightStitchesInWork} sts in work).`;
                    instructions.push({
                        text: rectInstr,
                        stepData: {
                            text: rectInstr,
                            startRowIndex: stepStartRowIndex,
                            endRowIndex: baseRowIndex + sectionRows.length - 1,
                            rowsInStep: consecutiveRows,
                            absolutePositioning: this.getAbsolutePosition(lastRow)
                        }
                    });
                    i = sectionRows.length;
                } else {
                    // Generate shaping instruction for this group
                    const pattern = this.detectShapingPattern(sectionRows, i);

                    if (pattern && pattern.repeatCount >= 2) {
                        // Collapse repeated pattern into single instruction
                        const patternEndRow = sectionRows[i + pattern.totalRows - 1];
                        const directionLeft = pattern.leftDiff > 0 ? 'increase' : 'decrease';
                        const directionRight = pattern.rightDiff > 0 ? 'increase' : 'decrease';
                        const patternInstr = `Every ${pattern.frequency} rows, ${directionLeft} ${Math.abs(pattern.leftDiff)} on the left and ${directionRight} ${Math.abs(pattern.rightDiff)} on the right ${pattern.repeatCount} times. (RC=${patternEndRow.rowNumber}, ${patternEndRow.leftStitchesInWork + patternEndRow.rightStitchesInWork} sts in work)`;

                        instructions.push({
                            text: patternInstr,
                            stepData: {
                                text: patternInstr,
                                startRowIndex: stepStartRowIndex,
                                endRowIndex: baseRowIndex + i + pattern.totalRows - 1,
                                rowsInStep: pattern.totalRows,
                                absolutePositioning: this.getAbsolutePosition(patternEndRow)
                            }
                        });

                        i += pattern.totalRows;
                    } else {
                        // No pattern detected, use individual instruction
                        const lastRowInGroup = sectionRows[i + consecutiveRows - 1];

                        const leftDiff = lastRowInGroup.leftStitchesInWork - firstRow.leftStitchesInWork;
                        const rightDiff = lastRowInGroup.rightStitchesInWork - firstRow.rightStitchesInWork;

                        let instruction = '';

                        // If no increases or decreases, just knit across
                        if (leftDiff === 0 && rightDiff === 0) {
                            instruction = `Knit across ${firstRow.leftStitchesInWork + firstRow.rightStitchesInWork} stitches`;
                            if (consecutiveRows > 1) {
                                instruction += ` for ${consecutiveRows} rows`;
                            }
                            instruction += `. (RC=${lastRowInGroup.rowNumber})`;
                        } else {
                            // Build shaping instructions
                            instruction = this.buildShapingText(leftDiff, rightDiff);
                            instruction += this.buildKnitRowsText(consecutiveRows);
                            instruction += `(RC=${lastRowInGroup.rowNumber}, ${lastRowInGroup.leftStitchesInWork + lastRowInGroup.rightStitchesInWork} sts in work)`;
                        }

                        instructions.push({
                            text: instruction,
                            stepData: {
                                text: instruction,
                                startRowIndex: stepStartRowIndex,
                                endRowIndex: baseRowIndex + i + consecutiveRows - 1,
                                rowsInStep: consecutiveRows,
                                absolutePositioning: this.getAbsolutePosition(lastRowInGroup)
                            }
                        });

                        i += consecutiveRows;
                    }
                }
            }
        }

        return instructions;
    }

    /**
     * Generate instructions for a short row sequence
     */
    private _generateShortRowInstructions(sectionRows: StitchRow[], startIndex: number, baseRowIndex: number, instructions: KnittingInstruction[]): void {
        if (startIndex >= sectionRows.length) return;

        const firstShortRow = sectionRows[startIndex];
        const srInfo = firstShortRow.shortRowInfo;

        if (!srInfo) return;

        const shortRowTechnique = this.knittingOptions?.shortRowTechnique || 'wraps';

        // Generate HOLD instruction for the start
        if (srInfo.rowInShortRowSequence === 1) {
            let holdInstr = '';
            if (srInfo.heldStitchesLeft > 0) {
                holdInstr += `Place ${srInfo.heldStitchesLeft} stitch${srInfo.heldStitchesLeft > 1 ? 'es' : ''} on left on HOLD. `;
            }
            if (srInfo.heldStitchesRight > 0) {
                holdInstr += `Place ${srInfo.heldStitchesRight} stitch${srInfo.heldStitchesRight > 1 ? 'es' : ''} on right on HOLD.`;
            }

            instructions.push({
                text: holdInstr.trim(),
                stepData: {
                    text: holdInstr.trim(),
                    startRowIndex: baseRowIndex + startIndex,
                    endRowIndex: baseRowIndex + startIndex,
                    rowsInStep: 1,
                    absolutePositioning: this.getAbsolutePosition(firstShortRow)
                }
            });
        }

        // Generate knitting instruction for the short row
        const activeStitches = srInfo.activeStitchesLeft + srInfo.activeStitchesRight;
        const positionInfo = this.getAbsolutePosition(firstShortRow);

        const shortRowInstr = `Knit across ${activeStitches} stitches (${srInfo.activeStitchesLeft} left, ${srInfo.activeStitchesRight} right).${
            shortRowTechnique === 'wraps' ? ' Wrap last stitch and turn.' :
            shortRowTechnique === 'gaps' ? ' Turn (leave a gap).' :
            shortRowTechnique === 'german' ? ' German short row (slip, turn).' : ''
        } (RC=${firstShortRow.rowNumber})`;

        instructions.push({
            text: shortRowInstr,
            stepData: {
                text: shortRowInstr,
                startRowIndex: baseRowIndex + startIndex,
                endRowIndex: baseRowIndex + startIndex + srInfo.totalRowsInShortRow - 1,
                rowsInStep: srInfo.totalRowsInShortRow,
                absolutePositioning: positionInfo
            }
        });
    }
}

export default HandKnittingActualizer;
