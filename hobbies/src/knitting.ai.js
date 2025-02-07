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
     * Responsible for increases and decreases in instructions
     */
    constructor(height, baseA, baseB, topLeftOffset = 0, topRightOffset = 0, successors = []) {
        this.height = height;
        this.baseA = baseA;
        this.baseB = baseB;
        this.topLeftOffset = topLeftOffset;
        this.topRightOffset = topRightOffset;
        this.successors = successors;
    }

    static fromJSON(json, parent = null) {
        if (!json || json.length == 0) {
            return json; // Handle null or undefined JSON
        }

        const successors = (json.successors && Array.isArray(json.successors))
            ? json.successors.filter(successorJson => successorJson != null).map(successorJson => Trapezoid.fromJSON(successorJson, this)) // Filter out nulls/undefineds *before* mapping
            : [];

        const trapezoid = new Trapezoid(
            json.height,
            json.baseA,
            json.baseB,
            json.topLeftOffset || 0,
            json.topRightOffset || 0,
            successors
        );
        return trapezoid;
    }
    
    generateKnittingInstructions(gauge, sizeModifier, startRow = 0, initialStitches) {
        // TODO implement
        // divide the shape into a rectangle and two triangles
        // calculate the slope of each side
        // calculate how many stitches are in the first and last rows
        // calculate how many rows are needed to get to the right length
        // calculate how frequently increases or decreases will be needed on each side
        // combine consecutive rows without increases or decreases
        // return an object with the rowcount and the resulting instruction steps.
    }
}

class Panel {
    /**
     * Responsible for cast on-s, bind-offs, connecting parent/successor trapezoids, and emitting instructions for the whole panel
     */
    constructor(shape, gauge = defaultGauge, sizeModifier = 1) {
        this.shape = shape;
        this.gauge = gauge;
        this.sizeModifier = sizeModifier;
    }

    generateKnittingInstructions() {
        // TODO implement
        // perform a depth-first-search of the tree of trapezoids on this.shape
        // emit a bind-off instruction for 0-height successors
        // otherwise, add an instruction step for the user to put all but N stitches on hold, to build up the next successor trapezoid
        // emit a bind-off instruction after any trapezoid with no successors
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
            strokeLinejoin="round"
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

export { Trapezoid, Gauge, PanelDiagram, defaultGauge, Panel };