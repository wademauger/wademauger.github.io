class Gauge {
    /**
     * Represents the knitting gauge, which defines stitch and row density.
     * @param {number} stitchesPerFourInches - The number of stitches in four inches.
     * @param {number} rowsPerFourInches - The number of rows in four inches.
     */
    constructor(stitchesPerFourInches, rowsPerFourInches) {
        this.stitchesPerFourInches = stitchesPerFourInches;
        this.rowsPerFourInches = rowsPerFourInches;
    }

    getStitchesPerInch() {
        return this.stitchesPerFourInches / 4;
    }

    getRowsPerInch() {
        return this.rowsPerFourInches / 4;
    }
}

const defaultGauge = new Gauge(19, 30);

class Trapezoid {
    /**
     * Represents a trapezoidal section of the knitting panel.
     * Responsible for increases and decreases in instructions.
     */
    constructor(height, baseA, baseB, baseBHorizontalOffset = 0, successors = [], finishingSteps = [], sizeModifier = 1) {
        this.height = height;
        this.baseA = baseA;
        this.baseB = baseB;
        this.baseBHorizontalOffset = baseBHorizontalOffset;
        this.successors = successors;
        this.modificationScale = sizeModifier;
        this.finishingSteps = finishingSteps; // Array of extra instructions for finishing
    }

    setSizeModifier(sizeModifier) {
        this.modificationScale = sizeModifier;
    }

    getHeight() {
        return this.height * this.modificationScale;
    }

    getLowerBase() {
        return this.baseA * this.modificationScale;
    }

    getUpperBase() {
        return this.baseB * this.modificationScale;
    }

    getOffset() {
        return this.baseBHorizontalOffset * this.modificationScale;
    }

    static fromJSON(json) {
        if (!json || json.length === 0) {
            return null; // Handle empty JSON
        }

        const successors = (json.successors && Array.isArray(json.successors))
            ? json.successors.filter(s => s != null).map(s => Trapezoid.fromJSON(s))
            : [];

        return new Trapezoid(
            json.height,
            json.baseA,
            json.baseB,
            json.baseBHorizontalOffset || 0,
            successors,
            json.finishingSteps || [] // Ensure finishingSteps is an array
        );
    }

    getBaseWidthInStitches(gauge = defaultGauge, sizeModifier = 1) {
        const gaugeStitchesPerInch = gauge.getStitchesPerInch() * sizeModifier;
        const value = Math.round(this.getLowerBase() * (gauge.getStitchesPerInch() * sizeModifier))
        window.value = value;
        return value;
    }

    getStitchPlan(gauge, sizeModifier, startRow = 1) {
        const stitchesPerInch = gauge.getStitchesPerInch() * sizeModifier;
        const rowsPerInch = gauge.getRowsPerInch() * sizeModifier;
        const startStitches = Math.round(this.getLowerBase() * stitchesPerInch);
        const startStitchesLeft = Math.floor(startStitches / 2);
        const startStitchesRight = startStitches % 2 === 0 ? startStitchesLeft : startStitchesLeft + 1;
        const totalRows = Math.round(this.getHeight() * rowsPerInch);

        // calculate the number of stitches to be increased on the left and right edges of the trapezoid
        const baseWidthDifference = this.getUpperBase() - this.getLowerBase();
        const leftIncreaseWidth = baseWidthDifference / 2 - this.getOffset();
        const rightIncreaseWidth = baseWidthDifference / 2 + this.getOffset();
        const leftIncreaseStitches = Math.round(leftIncreaseWidth * stitchesPerInch);
        const rightIncreaseStitches = Math.round(rightIncreaseWidth * stitchesPerInch);

        // calculate how often to increase or decrease stitches
        const increaseLeftFrequency = Math.abs(leftIncreaseStitches / totalRows);
        const increaseRightFrequency = Math.abs(rightIncreaseStitches / totalRows);

        let leftShapingCounter = 0, rightShapingCounter = 0;

        const stitchPlan = new StitchPlan(gauge, sizeModifier);
        let prevRow = new StitchPlan.Row(startRow - 1, startStitchesLeft, startStitchesRight);
        for (let rowNumber = startRow; rowNumber < startRow + totalRows; rowNumber++) {
            let leftShapingModifier = 0;
            let rightShapingModifier = 0;
            leftShapingCounter += increaseLeftFrequency;
            rightShapingCounter += increaseRightFrequency;

            // Handle multiple increases or decreases in a single row
            while (leftShapingCounter >= 1) {
                if (leftIncreaseStitches > 0) {
                    // increase 1 stitch on the left edge
                    leftShapingModifier += 1;
                } else {
                    // decrease 1 stitch on the left edge
                    leftShapingModifier -= 1;
                }
                leftShapingCounter -= 1;
            }

            while (rightShapingCounter >= 1) {
                if (rightIncreaseStitches > 0) {
                    // increase 1 stitch on the right edge
                    rightShapingModifier += 1;
                } else {
                    // decrease 1 stitch on the right edge
                    rightShapingModifier -= 1;
                }
                rightShapingCounter -= 1;
            }

            const leftStitchesInWork = prevRow.leftStitchesInWork + leftShapingModifier;
            const rightStitchesInWork = prevRow.rightStitchesInWork + rightShapingModifier;
            const newRow = new StitchPlan.Row(rowNumber, leftStitchesInWork, rightStitchesInWork);
            stitchPlan.addRow(newRow);
            prevRow = newRow;
        }

        return stitchPlan;
    }

    generateKnittingInstructions(gauge, sizeModifier, startRow = 1, isRoot = false, visualMotif = null) {
        const stitchPlan = this.getStitchPlan(gauge, sizeModifier, startRow);
        const instructions = [];

        if (isRoot && stitchPlan.rows.length > 0) {
            instructions.push(`Cast on ${stitchPlan.rows[0].leftStitchesInWork + stitchPlan.rows[0].rightStitchesInWork} stitches.`);
        }

        instructions.push(...stitchPlan.generateKnittingInstructions(visualMotif));

        instructions.push(...this.finishingSteps);

        if (this.successors.length > 1) {
            instructions.push(`Divide into ${this.successors.length} sections:`);
            for (let i = 0; i < this.successors.length; i++) {
                const successor = this.successors[i];
                const successorBaseWidth = successor.getBaseWidthInStitches(gauge, sizeModifier);
                if (successor.getHeight() > 0) {
                    instructions.push(`Section ${i + 1}: ${successorBaseWidth} stitches`);
                    const successorInstructions = successor.generateKnittingInstructions(gauge, sizeModifier, stitchPlan.rows.length > 0 ? stitchPlan.rows[stitchPlan.rows.length - 1].rowNumber + 1 : startRow, false, visualMotif ? visualMotif.getChild(stitchPlan.rows.length) : null);
                    instructions.push(...successorInstructions);
                } else {
                    instructions.push(`Section ${i + 1}: bind off ${successor.getBaseWidthInStitches(gauge, sizeModifier)} stitches.`);
                }
            }
        } else if (this.successors.length === 1) {
            const successor = this.successors[0];
            const successorBaseWidth = successor.getBaseWidthInStitches(gauge, sizeModifier);
            if (successor.getHeight() > 0) {
                const successorInstructions = successor.generateKnittingInstructions(gauge, sizeModifier, stitchPlan.rows.length > 0 ? stitchPlan.rows[stitchPlan.rows.length - 1].rowNumber + 1 : startRow, false, visualMotif ? visualMotif.getChild(stitchPlan.rows.length) : null);
                instructions.push(...successorInstructions);
            } else {
                instructions.push(`Bind off ${successor.getBaseWidthInStitches(gauge, sizeModifier)} stitches.`);
            }
        } else if (stitchPlan.rows.length > 0) {
            instructions.push(`Bind off ${stitchPlan.rows[stitchPlan.rows.length - 1].leftStitchesInWork + stitchPlan.rows[stitchPlan.rows.length - 1].rightStitchesInWork} stitches.`);
        }
        return instructions;
    }
}

class Panel {
    /**
     * Responsible for gauge and sizing, and motifs
     */
    constructor(shape, gauge = defaultGauge, sizeModifier = 1.006, visualMotif = null) {
        this.shape = shape;
        this.gauge = gauge;
        this.sizeModifier = sizeModifier;
        this.visualMotif = visualMotif;
        this.shape.setSizeModifier(sizeModifier);
    }

    generateKnittingInstructions() {
        if (!this.shape) return [];
        return this.shape.generateKnittingInstructions(this.gauge, this.sizeModifier, 1, true, this.visualMotif);
    }
}

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
    }
};

export { Trapezoid, Gauge, defaultGauge, Panel };