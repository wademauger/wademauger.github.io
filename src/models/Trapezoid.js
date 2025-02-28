import { StitchPlan } from "./StitchPlan";
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

    static fromObject(json) {
        if (!json || json == [] || json == {}) {
            return null; // Handle empty JSON
        }

        const successors = (json.successors && Array.isArray(json.successors))
            ? json.successors.filter(s => s != null).map(s => Trapezoid.fromObject(s))
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
        const value = Math.round(this.getUpperBase() * (gauge.getStitchesPerInch() * sizeModifier))
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
                instructions.push(`Bind off all ${successorBaseWidth} stitches.`);
            }
        } else if (stitchPlan.rows.length > 0) {
            instructions.push(`Bind off ${stitchPlan.rows[stitchPlan.rows.length - 1].leftStitchesInWork + stitchPlan.rows[stitchPlan.rows.length - 1].rightStitchesInWork} stitches.`);
        }
        return instructions;
    }
}

export { Trapezoid };