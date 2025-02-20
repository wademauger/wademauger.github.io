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
    constructor(height, baseA, baseB, baseBHorizontalOffset = 0, successors = [], finishingSteps = []) {
        this.height = height;
        this.baseA = baseA;
        this.baseB = baseB;
        this.baseBHorizontalOffset = baseBHorizontalOffset;
        this.successors = successors;
        this.finishingSteps = finishingSteps; // Array of extra instructions for finishing
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

    getStitchPlan(gauge, sizeModifier, startRow = 1) {
        const stitchesPerInch = gauge.getStitchesPerInch() * sizeModifier;
        const rowsPerInch = gauge.getRowsPerInch() * sizeModifier;
        const startStitches = Math.round(this.baseA * stitchesPerInch);
        const startStitchesLeft = Math.floor(startStitches/2);
        const startStitchesRight = startStitches % 2 == 0 ? startStitchesLeft : startStitchesLeft + 1;
        const totalRows = Math.round(this.height * rowsPerInch);

        // calculate the number of stitches to be increased on the left and right edges of the trapezoid
        const baseWidthDifference = Math.abs(this.baseA-this.baseB);
        const leftIncreaseWidth = baseWidthDifference / 2 - this.baseBHorizontalOffset;
        const rightIncreaseWidth = baseWidthDifference / 2 + this.baseBHorizontalOffset;
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
            if (leftShapingCounter >= 1) {
                if (leftIncreaseStitches > 0) {
                    // increase 1 stitch on the left edge
                    leftShapingModifier = 1;
                } else {
                    // decrease i stitch on the left edge
                    leftShapingModifier = -1;
                }
                leftShapingCounter -= 1;
            }
            if (rightShapingCounter >= 1) {
                if (rightIncreaseStitches > 0) {
                    // increase 1 stitch on the right edge
                    rightShapingModifier = 1;
                } else {
                    // decrease i stitch on the right edge
                    rightShapingModifier = -1;
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
}

class Panel {
    /**
     * Responsible for cast-ons, bind-offs, connecting parent/successor trapezoids, and emitting instructions for the whole panel.
     */
    constructor(shape, gauge = defaultGauge, sizeModifier = 1) {
        this.shape = shape;
        this.gauge = gauge;
        this.sizeModifier = sizeModifier;
    }

    generateKnittingInstructions() {
        if (!this.shape) return [];
        return this.shape.getStitchPlan(this.gauge, this.sizeModifier).generateKnittingInstructions();
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
            instructions.push(`Knit ${this.rows.length} rows.`);
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
                        instruction += `Increase ${leftDiff} stitch${leftDiff > 1 ? `es` : ''} on the left edge. `;
                    } else if (leftDiff < 0) {
                        instruction += `Decrease ${-leftDiff} stitch${leftDiff < -1 ? `es` : ''} on the left edge. `;
                    }
                    if (rightDiff > 0) {
                        instruction += `Increase ${rightDiff} stitch${rightDiff > 1 ? `es` : ''} on the right edge. `;
                    } else if (rightDiff < 0) {
                        instruction += `Decrease ${-rightDiff} stitch${rightDiff < -1 ? `es` : ''} on the right edge. `;
                    }
                    prevRow = row;
                    instruction += `Finish on row ${row.rowNumber}.`;
                    instruction = consecutiveRows > 1 ? `Knit ${consecutiveRows} rows. ${instruction}` : `Knit 1 row. ${instruction}`;
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

const renderTrapezoid = (shape, scale, xOffset = 0, yOffset = 0) => {
    const width = Math.max(shape.baseA, shape.baseB) * scale;
    const xTopLeft = xOffset + (width - shape.baseB * scale) / 2 + (shape.baseBHorizontalOffset || 0) * scale;
    const xTopRight = xOffset + (width + shape.baseB * scale) / 2 + (shape.baseBHorizontalOffset || 0) * scale;
    const xBottomLeft = xOffset + (width - shape.baseA * scale) / 2;
    const xBottomRight = xOffset + (width + shape.baseA * scale) / 2;
    const yTop = yOffset;
    const yBottom = yOffset + shape.height * scale;
    return (
        <polygon
            key={`${xOffset}-${yOffset}`}
            points={`${xTopLeft},${yTop} ${xTopRight},${yTop} ${xBottomRight},${yBottom} ${xBottomLeft},${yBottom}`}
            fill="lightblue"
            stroke="white"
            strokeWidth={3}
            strokeLinejoin="round"
        />
    );
};

const renderHierarchy = (trap, scale, xOffset = 0, yOffset = 0, dimensions = { minX: 0, maxX: 0, minY: 0, maxY: 0 }) => {
    const elements = [];
    const trapWidth = Math.max(trap.baseA, trap.baseB) * scale;

    // Compute bounding box of the current trapezoid
    const xTopLeft = xOffset + (trapWidth - trap.baseB * scale) / 2 + (trap.baseBHorizontalOffset || 0) * scale;
    const xTopRight = xOffset + (trapWidth + trap.baseB * scale) / 2 + (trap.baseBHorizontalOffset || 0) * scale;
    const xBottomLeft = xOffset + (trapWidth - trap.baseA * scale) / 2;
    const xBottomRight = xOffset + (trapWidth + trap.baseA * scale) / 2;
    const yTop = yOffset;
    const yBottom = yOffset + trap.height * scale;

    // Update dimensions
    dimensions.minX = Math.min(dimensions.minX, xTopLeft, xTopRight, xBottomLeft, xBottomRight);
    dimensions.maxX = Math.max(dimensions.maxX, xTopLeft, xTopRight, xBottomLeft, xBottomRight);
    dimensions.minY = Math.min(dimensions.minY, yTop, yBottom);
    dimensions.maxY = Math.max(dimensions.maxY, yTop, yBottom);

    // Render the current trapezoid
    elements.push(renderTrapezoid(trap, scale, xOffset, yOffset));

    if (trap.successors && trap.successors.length > 0) {
        // Compute total width of all successors
        const successorWidths = trap.successors.map(s => Math.max(s.baseA, s.baseB) * scale);
        const totalSuccessorWidth = successorWidths.reduce((sum, w) => sum + w, 0);

        // Compute initial offset to center the row
        let childXOffset = xOffset + (trapWidth - totalSuccessorWidth) / 2;

        // **Reverse the order of successors before rendering**
        for (let i = trap.successors.length - 1; i >= 0; i--) {
            const successor = trap.successors[i];
            const successorWidth = successorWidths[i];

            // Place each successor ABOVE the parent (but now in the correct order)
            const childDimensions = { minX: dimensions.minX, maxX: dimensions.maxX, minY: dimensions.minY, maxY: dimensions.maxY };
            elements.push(...renderHierarchy(successor, scale, childXOffset, yTop - successor.height * scale, childDimensions));

            // Update dimensions
            dimensions.minX = childDimensions.minX;
            dimensions.maxX = childDimensions.maxX;
            dimensions.minY = childDimensions.minY;
            dimensions.maxY = childDimensions.maxY;

            // Move x-offset for the next successor
            childXOffset += successorWidth;
        }
    }

    return elements;
};

const PanelDiagram = ({ shape, label = "", size = 200, padding = 10 }) => {
    let dimensions = { minX: 0, maxX: 0, minY: 0, maxY: 0 };

    // First pass: Compute bounding box *including negative coordinates*
    renderHierarchy(shape, 1, 0, 0, dimensions);

    const width = dimensions.maxX - dimensions.minX;
    const height = dimensions.maxY - dimensions.minY;

    // Calculate scale factor
    const availableWidth = size - 2 * padding;
    const availableHeight = size - 2 * padding;
    const scaleFactor = Math.min(availableWidth / width, availableHeight / height);

    // Calculate scaled dimensions and translation
    const scaledWidth = width * scaleFactor;
    const scaledHeight = height * scaleFactor;

    // Adjust translation to account for negative minX and minY ***
    const translateX = (size - scaledWidth) / 2 - dimensions.minX * scaleFactor + padding;
    const translateY = (size - scaledHeight) / 2 - dimensions.minY * scaleFactor + padding;

    // Second pass: Render with the calculated scale.  This isn't strictly necessary, but is good practice.
    dimensions = { minX: 0, maxX: 0, minY: 0, maxY: 0 };
    const elements = renderHierarchy(shape, scaleFactor, 0, 0, dimensions);

    return (
        <div style={{ width: size + padding * 2, height: size + padding * 3, float: 'left' }}>
            <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size + 4}`}
                preserveAspectRatio="none" // Or "xMidYMid meet" if you want to maintain aspect ratio
            >
                <g transform={`translate(${translateX}, ${translateY})`}>
                    {elements}
                </g>
            </svg>
            {label}
        </div>
    );
};

export { Trapezoid, Gauge, defaultGauge, Panel };