import { StitchPlan } from './StitchPlan';
import { defaultGauge } from './Gauge';

class Trapezoid {
    height: number;
    baseA: number;
    baseB: number;
    baseBHorizontalOffset: number;
    successors: Trapezoid[];
    modificationScale: number;
    finishingSteps: any[];
    label: string | null;

    /**
     * Represents a trapezoidal section of the knitting panel.
     * Responsible for increases and decreases in instructions.
     */
    constructor(height: number, baseA: number, baseB: number, baseBHorizontalOffset = 0, successors: Trapezoid[] = [], finishingSteps: any[] = [], sizeModifier = 1, label: string | null = null) {
        this.height = height;
        this.baseA = baseA;
        this.baseB = baseB;
        this.baseBHorizontalOffset = baseBHorizontalOffset;
        this.successors = successors;
        this.modificationScale = sizeModifier;
        this.finishingSteps = finishingSteps; // Array of extra instructions for finishing
        this.label = label; // Optional display label (e.g., "A", "B", "C")
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
        // Defensive checks: ensure json is an object with meaningful data
        if (!json || typeof json !== 'object' || Array.isArray(json) && json.length === 0) {
            return null;
        }

        // Build successors first, recursively. Ensure we filter out any nulls
        // returned from recursive calls so the successors array contains only
        // valid Trapezoid instances.
        const successors = Array.isArray(json.successors)
            ? json.successors.map((s: any) => Trapezoid.fromObject(s)).filter((s: any) => s != null)
            : [];

        // Parse numeric fields defensively so downstream logic doesn't receive undefined
        const height = (typeof json.height === 'number') ? json.height : (Number(json.height) || 0);
        const baseA = (typeof json.baseA === 'number') ? json.baseA : (Number(json.baseA) || 0);
        const baseB = (typeof json.baseB === 'number') ? json.baseB : (Number(json.baseB) || 0);
        const baseBHorizontalOffset = (typeof json.baseBHorizontalOffset === 'number') ? json.baseBHorizontalOffset : (Number(json.baseBHorizontalOffset) || 0);
        const finishingSteps = Array.isArray(json.finishingSteps) ? json.finishingSteps : (json.finishingSteps ? [json.finishingSteps] : []);
        const sizeModifier = (typeof json.sizeModifier === 'number') ? json.sizeModifier : (Number(json.sizeModifier) || 1);
        const label = (typeof json.label === 'string') ? json.label : (json.label == null ? null : String(json.label));

        const trap = new Trapezoid(
            height,
            baseA,
            baseB,
            baseBHorizontalOffset,
            successors,
            finishingSteps,
            sizeModifier,
            label
        );

        // Preserve existing id if present, otherwise generate a stable-ish fallback id.
        // Use json.id if available, or try common alternative keys, then fall back to
        // a deterministic-ish counter to avoid many duplicates during a single load.
        try {
            if (json.id) {
                trap.id = json.id;
            } else if (json._id) {
                trap.id = json._id;
            } else {
                // Maintain a simple counter on the class to provide stable ids within
                // the same runtime load. This is safer than using Date.now+random for
                // reproducible behavior during a single import operation.
                if (!Trapezoid._nextId) Trapezoid._nextId = 1;
                trap.id = `trap-${Trapezoid._nextId++}`;
            }
        } catch (e: unknown) {
            trap.id = json && (json.id || json._id) ? (json.id || json._id) : (`trap-${Date.now()}`);
        }

        // Ensure label is never undefined (use null when absent)
        trap.label = label === undefined ? null : label;

        // Preserve hem flag and short-row metadata if present
        trap.isHem = !!json.isHem;
        trap.shortRows = Array.isArray(json.shortRows) ? json.shortRows.map((s: any) => ({ ...s })) : [];

        return trap;
    }

    toJSON() {
        return {
            height: this.height,
            baseA: this.baseA,
            baseB: this.baseB,
            baseBHorizontalOffset: this.baseBHorizontalOffset,
            successors: (this.successors || []).map((s: any) => (typeof s.toJSON === 'function' ? s.toJSON() : s)),
            finishingSteps: this.finishingSteps || [],
            sizeModifier: this.modificationScale || 1,
            label: this.label || null,
            isHem: !!this.isHem,
            shortRows: Array.isArray(this.shortRows) ? this.shortRows.map((s: any) => ({ ...s })) : []
        };
    }

    getUpperBaseWidthInStitches(gauge = defaultGauge) {
        return Math.round(this.getUpperBase() * (gauge.getStitchesPerInch()));
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
                const successorBaseWidth = successor.getUpperBaseWidthInStitches(gauge, sizeModifier);
                if (successor.getHeight() > 0) {
                    instructions.push(`Section ${i + 1}: ${successorBaseWidth} stitches`);
                    const successorInstructions = successor.generateKnittingInstructions(gauge, sizeModifier, stitchPlan.rows.length > 0 ? stitchPlan.rows[stitchPlan.rows.length - 1].rowNumber + 1 : startRow, false, visualMotif ? visualMotif.getChild(stitchPlan.rows.length) : null);
                    instructions.push(...successorInstructions);
                } else {
                    instructions.push(`Section ${i + 1}: bind off ${successor.getUpperBaseWidthInStitches(gauge, sizeModifier)} stitches.`);
                }
            }
        } else if (this.successors.length === 1) {
            const successor = this.successors[0];
            const successorBaseWidth = successor.getUpperBaseWidthInStitches(gauge, sizeModifier);
            if (successor.getHeight() > 0) {
                const successorInstructions = successor.generateKnittingInstructions(gauge, sizeModifier, stitchPlan.rows.length > 0 ? stitchPlan.rows[stitchPlan.rows.length - 1].rowNumber + 1 : startRow, false, visualMotif ? visualMotif.getChild(stitchPlan.rows.length) : null);
                instructions.push(...successorInstructions);
            } else {
                instructions.push(`Bind off ${successorBaseWidth} stitches.`);
            }
        } else if (stitchPlan.rows.length > 0) {
            instructions.push(`Bind off ${stitchPlan.rows[stitchPlan.rows.length - 1].leftStitchesInWork + stitchPlan.rows[stitchPlan.rows.length - 1].rightStitchesInWork} stitches.`);
        }
        return instructions;
    }
}

export { Trapezoid };