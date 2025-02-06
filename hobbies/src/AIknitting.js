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
     * Represents a trapezoidal knitting panel section.
     * @param {number} height - The vertical height of the trapezoid.
     * @param {number} baseA - The width of the top of the trapezoid.
     * @param {number} baseB - The width of the bottom of the trapezoid.
     * @param {number} [topLeftOffset=0] - The horizontal offset of the top-left corner relative to the bottom-left.
     * @param {number} [topRightOffset=0] - The horizontal offset of the top-right corner relative to the bottom-right.
     * @param {Trapezoid[]} [successors=[]] - The trapezoids that follow this one, forming a sequence.
     */
    constructor(height, baseA, baseB, topLeftOffset = 0, topRightOffset = 0, successors = []) {
        this.height = height;
        this.baseA = baseA; // Top width
        this.baseB = baseB; // Bottom width
        this.topLeftOffset = topLeftOffset; // Horizontal offset of top-left corner
        this.topRightOffset = topRightOffset; // Horizontal offset of top-right corner
        this.successors = successors;
    }

    getRows(gauge = defaultGauge) {
        return Math.round(this.height * gauge.getRowsPerInch());
    }

    validateSuccessors() {
        const totalWidth = this.successors.reduce((sum, shape) => sum + shape.baseA, 0);
        return totalWidth === this.baseB;
    }
}

class Panel {
    /**
     * Represents a knitting panel, composed of a main trapezoidal shape and gauge information.
     * @param {Trapezoid} trapezoid - The trapezoidal shape of the panel.
     * @param {Gauge} [gauge=defaultGauge] - The knitting gauge used for the panel.
     */
    constructor(trapezoid, gauge = defaultGauge) {
        this.trapezoid = trapezoid;
        this.gauge = gauge;
    }

    generateInstructions() {
        let rows = this.trapezoid.getRows(this.gauge);
        let widthChange = (this.trapezoid.baseA - this.trapezoid.baseB) / rows;
        let instructions = [];

        for (let i = 0; i < rows; i++) {
            let currentWidth = Math.round(this.trapezoid.baseA - i * widthChange);
            instructions.push(`Row ${i + 1}: Knit ${currentWidth} stitches`);
        }

        return instructions;
    }
}

const renderTrapezoid = (shape, scale, xOffset = 0, yOffset = 0) => {
    const width = Math.max(shape.baseA, shape.baseB) * scale;
    const xTopLeft = xOffset + (width - shape.baseB * scale) / 2 + (shape.topLeftOffset || 0) * scale;
    const xTopRight = xOffset + (width + shape.baseB * scale) / 2 + (shape.topRightOffset || 0) * scale;
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
        />
    );
};

const renderHierarchy = (trap, scale, xOffset = 0, yOffset = 0, dimensions = { minX: 0, maxX: 0, minY: 0, maxY: 0 }) => {
    const elements = [];
    const trapWidth = Math.max(trap.baseA, trap.baseB) * scale;

    // Compute bounding box of the current trapezoid
    const xTopLeft = xOffset + (trapWidth - trap.baseB * scale) / 2 + (trap.topLeftOffset || 0) * scale;
    const xTopRight = xOffset + (trapWidth + trap.baseB * scale) / 2 + (trap.topRightOffset || 0) * scale;
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

const TrapezoidDisplay = ({ trapezoid, scale = 10 }) => {

    const dimensions = { minX: 0, maxX: 0, minY: 0, maxY: 0 };
    const elements = renderHierarchy(trapezoid, scale, 0, 0, dimensions);
    const width = dimensions.maxX - dimensions.minX;
    const height = dimensions.maxY - dimensions.minY;

    return (
        <svg width={width} height={height} viewBox={`${dimensions.minX} ${dimensions.minY} ${width} ${height}`}>
            {elements}
        </svg>
    );
};

export { Trapezoid, TrapezoidDisplay };