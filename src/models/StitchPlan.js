class StitchPlan {
    constructor() {
        this.rows = [];
        this.colorworkMapping = null; // New: Store colorwork data
    }

    addRow(row) {
        this.rows.push(row);
    }

    // New: Add colorwork mapping from PanelColorworkComposer
    setColorworkMapping(mappedRows, colorworkPattern) {
        this.colorworkMapping = {
            mappedRows,
            colorworkPattern
        };
    }

    generateKnittingInstructions() {
        // Keep existing shaping instruction generation
        return this.generateShapingInstructions();
    }

    // New: Generate colorwork instructions for each row
    generateColorworkInstructions() {
        if (!this.colorworkMapping) return [];
        
        return this.colorworkMapping.mappedRows.map((mappedRow, index) => ({
            row: index + 1,
            machineRow: this.rows[index]?.rowNumber || index + 1,
            colorwork: this.generateRowColorworkSequence(mappedRow.colorwork),
            stitchCount: mappedRow.totalStitches
        }));
    }

    // New: Convert colorwork array to sequence format
    generateRowColorworkSequence(colorworkRow) {
        const sequence = [];
        let currentColor = null;
        let stitchCount = 0;

        for (const colorId of colorworkRow) {
            if (colorId === currentColor) {
                stitchCount++;
            } else {
                if (currentColor !== null) {
                    sequence.push({ colorId: currentColor, stitchCount });
                }
                currentColor = colorId;
                stitchCount = 1;
            }
        }

        if (currentColor !== null) {
            sequence.push({ colorId: currentColor, stitchCount });
        }

        return sequence;
    }

    // New: Check if this stitch plan has colorwork data
    hasColorwork() {
        return this.colorworkMapping !== null;
    }

    // Keep existing shaping instruction generation
    generateShapingInstructions() {
        // case: no rows
        if (this.rows.length === 0) {
            return [];
        }
        const instructions = [];
        // case: rectangular panel, no shaping
        const lowerLeft = this.rows[0].leftStitchesInWork;
        const lowerRight = this.rows[0].rightStitchesInWork;
        const upperLeft = this.rows[this.rows.length - 1].leftStitchesInWork;
        const upperRight = this.rows[this.rows.length - 1].rightStitchesInWork;
        if (lowerLeft === upperLeft && lowerRight === upperRight) {
            instructions.push(`Knit ${this.rows.length} rows (RC=${this.rows[this.rows.length - 1].rowNumber}, ${this.rows[this.rows.length - 1].leftStitchesInWork + this.rows[this.rows.length - 1].rightStitchesInWork} sts in work).`);
        }
        // case: trapezoidal panel
        else {
            const firstRow = this.rows[0];
            let consecutiveRows = 1;
            let prevRow = firstRow;
            for (const row of this.rows) {
                const leftDiff = row.leftStitchesInWork - prevRow.leftStitchesInWork;
                const rightDiff = row.rightStitchesInWork - prevRow.rightStitchesInWork;
                if (leftDiff === 0 && rightDiff === 0) {
                    consecutiveRows++;
                    continue;
                } else {
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
                    prevRow = row;
                    instruction = consecutiveRows > 1 ? `${instruction}Knit ${consecutiveRows} rows. ` : `${instruction}Knit 1 row. `;
                    instruction += `(RC=${row.rowNumber}, ${row.leftStitchesInWork+row.rightStitchesInWork} sts in work)`;
                    consecutiveRows = 1;
                    instructions.push(instruction);
                }
            }
        }
        return instructions;
    }
}

StitchPlan.Row = class {
    constructor(rowNumber, leftStitchesInWork, rightStitchesInWork) {
        this.rowNumber = rowNumber;
        this.leftStitchesInWork = leftStitchesInWork;
        this.rightStitchesInWork = rightStitchesInWork;
        this.colorwork = null; // New: Store colorwork for this row
    }

    // New: Set colorwork data for this row
    setColorwork(colorworkArray, colorworkPattern) {
        this.colorwork = {
            colors: colorworkArray,
            pattern: colorworkPattern
        };
    }

    // New: Get formatted colorwork instructions for this row
    getColorworkInstructions() {
        if (!this.colorwork) return null;
        
        const sequence = [];
        let currentColor = null;
        let stitchCount = 0;

        for (const colorId of this.colorwork.colors) {
            if (colorId === currentColor) {
                stitchCount++;
            } else {
                if (currentColor !== null) {
                    const colorInfo = this.colorwork.pattern.colors[currentColor];
                    sequence.push({
                        colorId: currentColor,
                        colorLabel: colorInfo?.label || currentColor,
                        colorHex: colorInfo?.color || '#000000',
                        stitchCount
                    });
                }
                currentColor = colorId;
                stitchCount = 1;
            }
        }

        if (currentColor !== null) {
            const colorInfo = this.colorwork.pattern.colors[currentColor];
            sequence.push({
                colorId: currentColor,
                colorLabel: colorInfo?.label || currentColor,
                colorHex: colorInfo?.color || '#000000',
                stitchCount
            });
        }

        return sequence;
    }
};

export { StitchPlan };