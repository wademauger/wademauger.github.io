class StitchPlan {
    constructor() {
        this.rows = [];
    }

    addRow(row) {
        this.rows.push(row);
    }

    generateKnittingInstructions() {
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
                        instruction += `Increase ${leftDiff} stitch${leftDiff > 1 ? `es` : ''} on the left. `;
                    } else if (leftDiff < 0) {
                        instruction += `Decrease ${-leftDiff} stitch${leftDiff < -1 ? `es` : ''} on the left. `;
                    }
                    if (rightDiff > 0) {
                        instruction += `Increase ${rightDiff} stitch${rightDiff > 1 ? `es` : ''} on the right. `;
                    } else if (rightDiff < 0) {
                        instruction += `Decrease ${-rightDiff} stitch${rightDiff < -1 ? `es` : ''} on the right. `;
                    }
                    prevRow = row;
                    instruction = consecutiveRows > 1 ? `${instruction} Knit ${consecutiveRows} rows. ` : `${instruction} Knit 1 row. `;
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
    }
};

export { StitchPlan };