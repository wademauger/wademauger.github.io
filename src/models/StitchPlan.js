class StitchPlan {
    constructor(pattern = null) {
        this.rows = [];
        this.pattern = pattern; // Add a Pattern object
    }

    addRow(row) {
        this.rows.push(row);
    }

    generateKnittingInstructions() {
        if (this.rows.length === 0) {
            return [];
        }

        const lowerLeft = this.rows[0].leftStitchesInWork;
        const lowerRight = this.rows[0].rightStitchesInWork;
        const upperLeft = this.rows[this.rows.length - 1].leftStitchesInWork;
        const upperRight = this.rows[this.rows.length - 1].rightStitchesInWork;

        if (lowerLeft === upperLeft && lowerRight === upperRight) {
            return this.generateRectangularPanelInstructions();
        } else {
            return this.generateTrapezoidalPanelInstructions();
        }
    }

    generateRectangularPanelInstructions() {
        let panelInstructions = [];
        for (let i = 0; i < this.rows.length; i++) {
            const row = this.rows[i];
            let stitchInstructions = [];
            for (let j = 0; j < row.leftStitchesInWork + row.rightStitchesInWork; j++) {
                let patternInfo = {};
                if (this.pattern) {
                    patternInfo = this.pattern.getStitchPatterning(i, j - row.leftStitchesInWork);
                }
                stitchInstructions.push(patternInfo);
            }
            panelInstructions.push(stitchInstructions);
        }
        return [`Knit ${this.rows.length} rows (RC=${this.rows[this.rows.length - 1].rowNumber}, ${this.rows[this.rows.length - 1].leftStitchesInWork + this.rows[this.rows.length - 1].rightStitchesInWork} sts in work).`];
    }

    generateTrapezoidalPanelInstructions() {
        const instructions = [];
        const firstRow = this.rows[0];
        let consecutiveRows = 1;
        let prevRow = firstRow;

        for (let i = 0; i < this.rows.length; i++) {
            const row = this.rows[i];
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
                instruction = consecutiveRows > 1 ? `${instruction}Knit ${consecutiveRows} rows. ` : `${instruction}Knit 1 row. `;
                instruction += `(RC=${row.rowNumber}, ${row.leftStitchesInWork + row.rightStitchesInWork} sts in work)`;
                consecutiveRows = 1;
                instructions.push(instruction);
            }
            let stitchInstructions = [];
            for (let j = 0; j < row.leftStitchesInWork + row.rightStitchesInWork; j++) {
                let patternInfo = {};
                if (this.pattern) {
                    patternInfo = this.pattern.getStitchPatterning(i, j - row.leftStitchesInWork);
                }
                stitchInstructions.push(patternInfo);
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