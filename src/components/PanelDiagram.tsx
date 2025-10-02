import { theme } from 'antd'; // Import theme from antd

// Slightly darken an rgb hex color by a factor (0-1) where 0.5 is half brightness
const darkenHex = (hex, factor = 0.7) => {
    if (!hex) return hex;
    let h = hex.replace('#', '');
    if (h.length === 3) h = h.split('').map(c => c + c).join('');
    const r = Math.max(0, Math.min(255, Math.floor(parseInt(h.slice(0,2),16) * factor)));
    const g = Math.max(0, Math.min(255, Math.floor(parseInt(h.slice(2,4),16) * factor)));
    const b = Math.max(0, Math.min(255, Math.floor(parseInt(h.slice(4,6),16) * factor)));
    return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
};

// --- Short-row helpers ---
// Synthesize a trapezoid shape for a short-row section
// section: { id, posX (0..1 center), posY (0..1 anchor between parent top/bottom), width (inches), height (inches), label }
const makeShortRowTrap = (parent, section = {}) => {
    // Short row dimensions are specified in the same units (inches) as parent trapezoids.
    // Short rows can specify a start/end base and a pivot base separately so the overlay
    // can represent the mirrored pocket: `baseStart` (start/end base) and `basePivot` (turn/short-row base).
    const width = typeof section.width === 'number' ? section.width : Math.max(1, (parent.baseA || 10) * 0.25);
    const height = typeof section.height === 'number' ? section.height : Math.max(0.5, (parent.height || 10) * 0.15);

    // Determine the two bases. If the short-row section explicitly provides bases, use them.
    const shortBaseStart = Math.max(0, typeof section.baseStart === 'number' ? section.baseStart : width);
    const shortBasePivot = Math.max(0, typeof section.basePivot === 'number' ? section.basePivot : width);

    return {
        id: section.id || `sr-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
        label: section.label || null,
        // follow the trapezoid convention: baseA = bottom (start/end), baseB = top (pivot)
        baseA: shortBaseStart,
        baseB: shortBasePivot,
        baseBHorizontalOffset: 0,
        height: height,
        successors: [],
        isHem: false,
        shortRows: []
    };
};

// Compute offsets (xOffset, yOffset) where the synthesized shortTrap should be rendered
// All units are in the same coordinate space used by renderHierarchy (i.e., scale applied externally)
const computeShortRowOffsets = (parent, shortTrap, section = {}, scale = 1, parentXOffset = 0, parentYOffset = 0) => {
    const posX = Math.max(0, Math.min(1, typeof section.posX === 'number' ? section.posX : 0.5));
    let posY = Math.max(0, Math.min(1, typeof section.posY === 'number' ? section.posY : 0));

    // If the parent is a hem (folded in half), map posY so that the folded geometry
    // treats 0 and 1 as the top of the folded hem and 0.5 as the bottom. This creates
    // the mirror behavior: positions near the edges map to the top of the folded layer,
    // while the center maps to the outer bottom.
    if (parent.isHem) {
        // posYMapped ranges 0..1 where 0 => top, 1 => bottom. We want posY=0 or 1 -> top (0), posY=0.5 -> bottom (1).
        const distFromCenter = Math.abs(posY - 0.5);
        const mapped = 1 - (distFromCenter * 2);
        // clamp just in case
        posY = Math.max(0, Math.min(1, mapped));
    }

    // Compute parent's top/bottom x coords for interpolation
    const trapWidth = Math.max(parent.baseA, parent.baseB) * scale;
    const xTopLeft = parentXOffset + (trapWidth - parent.baseB * scale) / 2 + (parent.baseBHorizontalOffset || 0) * scale;
    const xTopRight = parentXOffset + (trapWidth + parent.baseB * scale) / 2 + (parent.baseBHorizontalOffset || 0) * scale;
    const xBottomLeft = parentXOffset + (trapWidth - parent.baseA * scale) / 2;
    const xBottomRight = parentXOffset + (trapWidth + parent.baseA * scale) / 2;

    const lerp = (a, b, t) => a + (b - a) * t;

    // interpolate left/right at anchor vertical position
    const leftAt = lerp(xTopLeft, xBottomLeft, posY);
    const rightAt = lerp(xTopRight, xBottomRight, posY);
    const widthAt = rightAt - leftAt;

    // choose center based on posX across the slice
    const centerX = leftAt + widthAt * posX;

    // Compute the width used in rendering (consistent with renderShortTrap): the overall
    // container width is the max of top/bottom bases.
    const shortContainerWidth = Math.max(shortTrap.baseA, shortTrap.baseB) * scale;

    // The top midpoint (pivot) position relative to xOffset is at: xOffset + shortContainerWidth/2 + baseBHorizontalOffset
    const baseBOffset = (shortTrap.baseBHorizontalOffset || 0) * scale;
    const childXOffset = centerX - (shortContainerWidth / 2 + baseBOffset);

    // vertical: anchor at the slice y coordinate
    const parentEffectiveHeight = (parent.isHem ? parent.height * 0.5 : parent.height) * scale;
    const parentTopY = parentYOffset;
    const parentBottomY = parentYOffset + parentEffectiveHeight;
    const anchorY = parentTopY + (parentBottomY - parentTopY) * posY;

    // For the inverted short-row overlay we want it to "hang out the back" below the anchor.
    // To shift the rendered trapezoid down by its own height (so it hangs beneath the anchor),
    // set the y-offset such that the bottom of the inverted shape sits at the anchor.
    // In renderShortTrap we render yBottom = yOffset and yTop = yOffset + trap.height*scale.
    // Setting childYOffset = anchorY makes the bottom coincide with the anchor and the
    // visible trapezoid extend below by its height.
    const childYOffset = anchorY;

    return { childXOffset, childYOffset, anchorX: centerX, anchorY };
};

// Render a short-row trapezoid overlay with reduced opacity
const renderShortTrap = (trap, scale, xOffset = 0, yOffset = 0, fillColor) => {
    const width = Math.max(trap.baseA, trap.baseB) * scale;
    const xTopLeft = xOffset + (width - trap.baseB * scale) / 2 + (trap.baseBHorizontalOffset || 0) * scale;
    const xTopRight = xOffset + (width + trap.baseB * scale) / 2 + (trap.baseBHorizontalOffset || 0) * scale;
    const xBottomLeft = xOffset + (width - trap.baseA * scale) / 2;
    const xBottomRight = xOffset + (width + trap.baseA * scale) / 2;
    // Render inverted: top is below bottom so swap yTop/yBottom to flip vertically
    const yTop = yOffset + trap.height * scale; // visually the top is lower when inverted
    const yBottom = yOffset;

    const fillToUse = darkenHex(fillColor, 0.7);

    return (
        <g key={trap.id || `${xOffset}-${yOffset}`}> 
            <polygon
                points={`${xTopLeft},${yTop} ${xTopRight},${yTop} ${xBottomRight},${yBottom} ${xBottomLeft},${yBottom}`}
                fill={fillToUse}
                fillOpacity={0.65}
                stroke={'#666'}
                strokeWidth={1}
                strokeLinejoin="round"
                data-shortrow-id={trap.id}
            />
        </g>
    );
};


const renderTrapezoid = (trap, scale, xOffset = 0, yOffset = 0, fillColor, selectedId, onSelect) => {
    const shape = trap;
    const effectiveHeight = (shape.isHem ? (shape.height * 0.5) : shape.height) * scale;
    const width = Math.max(shape.baseA, shape.baseB) * scale;
    const xTopLeft = xOffset + (width - shape.baseB * scale) / 2 + (shape.baseBHorizontalOffset || 0) * scale;
    const xTopRight = xOffset + (width + shape.baseB * scale) / 2 + (shape.baseBHorizontalOffset || 0) * scale;
    const xBottomLeft = xOffset + (width - shape.baseA * scale) / 2;
    const xBottomRight = xOffset + (width + shape.baseA * scale) / 2;
    const yTop = yOffset;
    const yBottom = yOffset + effectiveHeight;
    const isSelected = selectedId && trap.id && trap.id === selectedId;
    const centerX = (xTopLeft + xTopRight + xBottomLeft + xBottomRight) / 4;
    const centerY = (yTop + yBottom) / 2;

    // If this is a hem, darken the fill color to visually distinguish it
    const fillToUse = shape.isHem ? darkenHex(fillColor, 0.6) : fillColor;

    return (
        <g key={trap.id || `${xOffset}-${yOffset}`}>
            <polygon
                points={`${xTopLeft},${yTop} ${xTopRight},${yTop} ${xBottomRight},${yBottom} ${xBottomLeft},${yBottom}`}
                fill={fillToUse}
                fillOpacity={isSelected ? 0.95 : 0.85}
                stroke={isSelected ? '#1677ff' : '#a1a8af'}
                strokeWidth={isSelected ? 4 : 3}
                strokeLinejoin="round"
                style={{ cursor: onSelect ? 'pointer' : 'default' }}
                onClick={onSelect ? () => onSelect(trap.id) : undefined}
                data-trapezoid-id={trap.id}
                role={onSelect ? 'button' : undefined}
                tabIndex={onSelect ? 0 : undefined}
            />
            {trap.label ? (
                <text
                    x={centerX}
                    y={centerY}
                    textAnchor="middle"
                    dominantBaseline="central"
                    style={{ pointerEvents: 'none', fontWeight: 700, fontSize: '24px' }}
                    fill="#ffffff"
                    stroke="#000000"
                    strokeWidth={2}
                >
                    {trap.label}
                </text>
            ) : null}
        </g>
    );
};

const renderHierarchy = (trap, scale, xOffset = 0, yOffset = 0, dimensions = { minX: 0, maxX: 0, minY: 0, maxY: 0 }, fillColor, selectedId, onSelect, selectedShortRowId = null) => {
    const elements = [];
    const trapWidth = Math.max(trap.baseA, trap.baseB) * scale;

    // Compute bounding box of the current trapezoid
    const xTopLeft = xOffset + (trapWidth - trap.baseB * scale) / 2 + (trap.baseBHorizontalOffset || 0) * scale;
    const xTopRight = xOffset + (trapWidth + trap.baseB * scale) / 2 + (trap.baseBHorizontalOffset || 0) * scale;
    const xBottomLeft = xOffset + (trapWidth - trap.baseA * scale) / 2;
    const xBottomRight = xOffset + (trapWidth + trap.baseA * scale) / 2;
    const yTop = yOffset;
    // Use effective height for bounding box if this trapezoid is a hem (half height)
    const effectiveTrapHeight = (trap.isHem ? (trap.height * 0.5) : trap.height) * scale;
    const yBottom = yOffset + effectiveTrapHeight;

    // include short-row overlays when computing bounding box: compute their actual rendered
    // offsets and include their extents (they are inverted and hang below the anchor)
    dimensions.minX = Math.min(dimensions.minX, xTopLeft, xTopRight, xBottomLeft, xBottomRight);
    dimensions.maxX = Math.max(dimensions.maxX, xTopLeft, xTopRight, xBottomLeft, xBottomRight);
    dimensions.minY = Math.min(dimensions.minY, yTop, yBottom);
    dimensions.maxY = Math.max(dimensions.maxY, yTop, yBottom);
    if (trap.shortRows && trap.shortRows.length) {
        for (let s of trap.shortRows) {
            const preview = makeShortRowTrap(trap, s);
            const { childXOffset, childYOffset } = computeShortRowOffsets(trap, preview, s, scale, xOffset, yOffset);
            const previewLeft = childXOffset + (Math.max(preview.baseA, preview.baseB) * scale - preview.baseB * scale) / 2;
            const previewRight = childXOffset + (Math.max(preview.baseA, preview.baseB) * scale + preview.baseB * scale) / 2;
            const previewTop = childYOffset + preview.height * scale; // inverted top
            const previewBottom = childYOffset; // inverted bottom
            dimensions.minX = Math.min(dimensions.minX, previewLeft);
            dimensions.maxX = Math.max(dimensions.maxX, previewRight);
            dimensions.minY = Math.min(dimensions.minY, previewBottom);
            dimensions.maxY = Math.max(dimensions.maxY, previewTop, dimensions.maxY);
        }
    }

    // Render the current trapezoid
    elements.push(renderTrapezoid(trap, scale, xOffset, yOffset, fillColor, selectedId, onSelect));

    // Render short-row overlays on top of this trapezoid (visual layering)
    if (trap.shortRows && trap.shortRows.length) {
        for (let s of trap.shortRows) {
            const shortTrap = makeShortRowTrap(trap, s);
            // compute offsets in the same coordinate space; also get exact anchor coordinates
            const { childXOffset, childYOffset, anchorX, anchorY } = computeShortRowOffsets(trap, shortTrap, s, scale, xOffset, yOffset);
            elements.push(renderShortTrap(shortTrap, scale, childXOffset, childYOffset, fillColor));

            // If this short-row is selected, add a small black marker at its anchor (positioning point)
            if (s.id && s.id === selectedShortRowId) {
                elements.push(
                    <g key={`marker-${s.id}`}>
                        <circle cx={anchorX} cy={anchorY} r={4} fill="#000" />
                    </g>
                );
            }
        }
    }

    if (trap.successors && trap.successors.length > 0) {
        // Compute total width of all successors
        const successorWidths = trap.successors.map(s => Math.max(s.baseA, s.baseB) * scale);
        const totalSuccessorWidth = successorWidths.reduce((sum, w) => sum + w, 0);

        // Compute initial offset to center the row
        let childXOffset = xOffset + (trapWidth - totalSuccessorWidth) / 2;

        // Render successors left-to-right in their array order
        for (let i = 0; i < trap.successors.length; i++) {
            const successor = trap.successors[i];
            const successorWidth = successorWidths[i];

            // Place each successor ABOVE the parent (but now in the correct order)
            const childDimensions = { minX: dimensions.minX, maxX: dimensions.maxX, minY: dimensions.minY, maxY: dimensions.maxY };
            // If the successor is a hem, its effective height is half
            const successorEffectiveHeight = (successor.isHem ? (successor.height * 0.5) : successor.height) * scale;
            elements.push(...renderHierarchy(successor, scale, childXOffset, yTop - successorEffectiveHeight, childDimensions, fillColor, selectedId, onSelect));

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

const PanelDiagram = ({ shape, label = '', size = 200, padding = 10, selectedId = null, onSelect = null, selectedShortRowId = null }) => {
    const { token } = theme.useToken(); // Get the theme token
    const fillColor = token.colorPrimary; // Get the primary color from the theme

    let dimensions = { minX: 0, maxX: 0, minY: 0, maxY: 0 };

    // First pass: Compute bounding box *including negative coordinates*
    renderHierarchy(shape, 1, 0, 0, dimensions, fillColor, null, null);

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
    const elements = renderHierarchy(shape, scaleFactor, 0, 0, dimensions, fillColor, selectedId, onSelect, selectedShortRowId);

    return (
        <div style={{ }}>
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