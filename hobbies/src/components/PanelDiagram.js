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
            fill="#68a2b9"
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

export { PanelDiagram };