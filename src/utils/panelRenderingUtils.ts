/**
 * Shared utility functions for panel rendering
 * Used by both ColorworkCanvasEditor and UnifiedPanelDiagram
 */

// Note: generatePattern is imported by callers from ColorworkCanvasEditor
// and passed as needed to avoid circular dependencies

// --- Color Utilities ---

/** Darken a hex color by a factor (0-1) */
export const darkenHex = (hex: string, factor = 0.7): string => {
    if (!hex) return hex;
    let h = hex.replace('#', '');
    if (h.length === 3) h = h.split('').map((c: string) => c + c).join('');
    const r = Math.max(0, Math.min(255, Math.floor(parseInt(h.slice(0, 2), 16) * factor)));
    const g = Math.max(0, Math.min(255, Math.floor(parseInt(h.slice(2, 4), 16) * factor)));
    const b = Math.max(0, Math.min(255, Math.floor(parseInt(h.slice(4, 6), 16) * factor)));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

// --- Short Row Helpers ---

/** Synthesize a trapezoid shape for a short-row section */
export const makeShortRowTrap = (parent: any, section: any = {}): any => {
    const width = typeof section.width === 'number' ? section.width : Math.max(1, (parent.baseA || 10) * 0.25);
    const height = typeof section.height === 'number' ? section.height : Math.max(0.5, (parent.height || 10) * 0.15);

    const shortBaseStart = Math.max(0, typeof section.baseStart === 'number' ? section.baseStart : width);
    const shortBasePivot = Math.max(0, typeof section.basePivot === 'number' ? section.basePivot : width);

    return {
        id: section.id || `sr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        label: section.label || null,
        baseA: shortBaseStart,
        baseB: shortBasePivot,
        baseBHorizontalOffset: 0,
        height: height,
        successors: [],
        isHem: false,
        shortRows: []
    };
};

/** Compute offsets where the short row trapezoid should be rendered */
export const computeShortRowOffsets = (
    parent: any,
    shortTrap: any,
    section: any = {},
    scale = 1,
    parentXOffset = 0,
    parentYOffset = 0
): { childXOffset: number; childYOffset: number; anchorX: number; anchorY: number } => {
    const posX = Math.max(0, Math.min(1, typeof section.posX === 'number' ? section.posX : 0.5));
    let posY = Math.max(0, Math.min(1, typeof section.posY === 'number' ? section.posY : 0));

    if (parent.isHem) {
        const distFromCenter = Math.abs(posY - 0.5);
        const mapped = 1 - (distFromCenter * 2);
        posY = Math.max(0, Math.min(1, mapped));
    }

    const trapWidth = Math.max(parent.baseA, parent.baseB) * scale;
    const xTopLeft = parentXOffset + (trapWidth - parent.baseB * scale) / 2 + (parent.baseBHorizontalOffset || 0) * scale;
    const xTopRight = parentXOffset + (trapWidth + parent.baseB * scale) / 2 + (parent.baseBHorizontalOffset || 0) * scale;
    const xBottomLeft = parentXOffset + (trapWidth - parent.baseA * scale) / 2;
    const xBottomRight = parentXOffset + (trapWidth + parent.baseA * scale) / 2;

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const leftAt = lerp(xTopLeft, xBottomLeft, posY);
    const rightAt = lerp(xTopRight, xBottomRight, posY);
    const widthAt = rightAt - leftAt;
    const centerX = leftAt + widthAt * posX;

    const shortContainerWidth = Math.max(shortTrap.baseA, shortTrap.baseB) * scale;
    const baseBOffset = (shortTrap.baseBHorizontalOffset || 0) * scale;
    const childXOffset = centerX - (shortContainerWidth / 2 + baseBOffset);

    const parentEffectiveHeight = (parent.isHem ? parent.height * 0.5 : parent.height) * scale;
    const parentTopY = parentYOffset;
    const parentBottomY = parentYOffset + parentEffectiveHeight;
    const anchorY = parentTopY + (parentBottomY - parentTopY) * posY;
    const childYOffset = anchorY;

    return { childXOffset, childYOffset, anchorX: centerX, anchorY };
};

// --- Coordinate Collection ---

/** Collect all trapezoid coordinates into a flat array */
export const collectTrapezoidCoordinates = (
    trap: any,
    scale: number,
    xOffset = 0,
    yOffset = 0,
    coordinates: any[] = []
): void => {
    const trapWidth = Math.max(trap.baseA, trap.baseB) * scale;
    const effectiveHeight = (trap.isHem ? (trap.height * 0.5) : trap.height) * scale;
    
    const xTopLeft = xOffset + (trapWidth - trap.baseB * scale) / 2 + (trap.baseBHorizontalOffset || 0) * scale;
    const xTopRight = xOffset + (trapWidth + trap.baseB * scale) / 2 + (trap.baseBHorizontalOffset || 0) * scale;
    const xBottomLeft = xOffset + (trapWidth - trap.baseA * scale) / 2;
    const xBottomRight = xOffset + (trapWidth + trap.baseA * scale) / 2;
    const yTop = yOffset;
    const yBottom = yOffset + effectiveHeight;

    coordinates.push({
        topLeft: { x: xTopLeft, y: yTop },
        topRight: { x: xTopRight, y: yTop },
        bottomLeft: { x: xBottomLeft, y: yBottom },
        bottomRight: { x: xBottomRight, y: yBottom },
        trap // Store reference for labels
    });

    if (trap.successors && trap.successors.length > 0) {
        const successorWidths = trap.successors.map((s: any) => Math.max(s.baseA, s.baseB) * scale);
        const totalSuccessorWidth = successorWidths.reduce((sum: number, w: number) => sum + w, 0);
        let childXOffset = xOffset + (trapWidth - totalSuccessorWidth) / 2;

        for (let i = 0; i < trap.successors.length; i++) {
            const successor = trap.successors[i];
            const successorWidth = successorWidths[i];
            const successorEffectiveHeight = (successor.isHem ? (successor.height * 0.5) : successor.height) * scale;
            collectTrapezoidCoordinates(
                successor,
                scale,
                childXOffset,
                yTop - successorEffectiveHeight,
                coordinates
            );
            childXOffset += successorWidth;
        }
    }
};

/** Collect short row coordinates for rendering */
export const collectShortRowCoordinates = (
    trap: any,
    scale: number,
    xOffset = 0,
    yOffset = 0,
    shortRowCoords: any[] = []
): void => {
    if (trap.shortRows && trap.shortRows.length > 0) {
        for (const s of trap.shortRows) {
            const shortTrap = makeShortRowTrap(trap, s);
            const { childXOffset, childYOffset, anchorX, anchorY } = computeShortRowOffsets(
                trap,
                shortTrap,
                s,
                scale,
                xOffset,
                yOffset
            );

            const width = Math.max(shortTrap.baseA, shortTrap.baseB) * scale;
            const xTopLeft = childXOffset + (width - shortTrap.baseB * scale) / 2 + (shortTrap.baseBHorizontalOffset || 0) * scale;
            const xTopRight = childXOffset + (width + shortTrap.baseB * scale) / 2 + (shortTrap.baseBHorizontalOffset || 0) * scale;
            const xBottomLeft = childXOffset + (width - shortTrap.baseA * scale) / 2;
            const xBottomRight = childXOffset + (width + shortTrap.baseA * scale) / 2;
            const yTop = childYOffset + shortTrap.height * scale;
            const yBottom = childYOffset;

            shortRowCoords.push({
                topLeft: { x: xTopLeft, y: yTop },
                topRight: { x: xTopRight, y: yTop },
                bottomLeft: { x: xBottomLeft, y: yBottom },
                bottomRight: { x: xBottomRight, y: yBottom },
                shortRow: s,
                shortTrap, // Include the synthesized trap for colorwork rendering
                anchorX,
                anchorY
            });
        }
    }

    if (trap.successors && trap.successors.length > 0) {
        const trapWidth = Math.max(trap.baseA, trap.baseB) * scale;
        const effectiveHeight = (trap.isHem ? (trap.height * 0.5) : trap.height) * scale;
        const successorWidths = trap.successors.map((s: any) => Math.max(s.baseA, s.baseB) * scale);
        const totalSuccessorWidth = successorWidths.reduce((sum: number, w: number) => sum + w, 0);
        let childXOffset = xOffset + (trapWidth - totalSuccessorWidth) / 2;

        for (let i = 0; i < trap.successors.length; i++) {
            const successor = trap.successors[i];
            const successorWidth = successorWidths[i];
            const successorEffectiveHeight = (successor.isHem ? (successor.height * 0.5) : successor.height) * scale;
            collectShortRowCoordinates(
                successor,
                scale,
                childXOffset,
                yOffset - successorEffectiveHeight,
                shortRowCoords
            );
            childXOffset += successorWidth;
        }
    }
};

// --- Dimension Calculation ---

/** Calculate the bounding box dimensions of a trapezoid hierarchy */
export const calculateTrapezoidDimensions = (
    trap: any,
    scale: number,
    xOffset = 0,
    yOffset = 0,
    dimensions = { minX: 0, maxX: 0, minY: 0, maxY: 0 }
): void => {
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

    if (trap.successors && trap.successors.length > 0) {
        // Compute total width of all successors
        const successorWidths = trap.successors.map((s: any) => Math.max(s.baseA, s.baseB) * scale);
        const totalSuccessorWidth = successorWidths.reduce((sum: number, w: number) => sum + w, 0);

        // Compute initial offset to center the row
        let childXOffset = xOffset + (trapWidth - totalSuccessorWidth) / 2;

        // Reverse the order of successors before rendering
        for (let i = trap.successors.length - 1; i >= 0; i--) {
            const successor = trap.successors[i];
            const successorWidth = successorWidths[i];

            // Place each successor ABOVE the parent
            calculateTrapezoidDimensions(
                successor,
                scale,
                childXOffset,
                yTop - successor.height * scale,
                dimensions
            );

            // Move x-offset for the next successor
            childXOffset += successorWidth;
        }
    }
};

// --- Colorwork Rendering ---

/** Create a combined pattern grid for all layers with centered origin */
export const createCombinedGridCentered = (
    totalStitches: number,
    totalRows: number,
    patternLayers: any[]
): string[][] => {
    // Initialize grid with transparent background
    const grid = Array(totalRows).fill(null).map(() => Array(totalStitches).fill('transparent'));

    // Process layers from bottom to top using reverse array order
    // First item in array = top visual layer, so render it last
    // Last item in array = bottom visual layer, so render it first
    [...patternLayers].reverse().forEach((layer: any) => {
        applyPatternLayerCentered(grid, totalStitches, totalRows, layer);
    });

    return grid;
};

/** Apply a single pattern layer to the grid with centering */
export const applyPatternLayerCentered = (
    grid: string[][],
    totalStitches: number,
    totalRows: number,
    layer: any
): void => {
    let { pattern, settings } = layer;

    // Note: Pattern regeneration for zero-row/zero-column stripes should be handled
    // by the caller before calling this function

    if (!pattern || !pattern.grid || pattern.grid.length === 0) {
        return;
    }

    const patternRows = pattern.getRowCount();
    const patternStitches = pattern.getStitchCount();

    if (patternRows === 0 || patternStitches === 0) {
        return;
    }

    const {
        repeatMode = 'none',
        repeatCountX = 0,
        repeatCountY = 0,
        offsetHorizontal = 0,
        offsetVertical = 0
    } = settings;

    // Determine if we should repeat
    const repeatHorizontal = repeatMode === 'x' || repeatMode === 'both';
    const repeatVertical = repeatMode === 'y' || repeatMode === 'both';

    // Calculate center offsets to start pattern from center
    const centerOffsetX = Math.floor((totalStitches - patternStitches) / 2);
    const centerOffsetY = Math.floor((totalRows - patternRows) / 2);

    for (let row = 0; row < totalRows; row++) {
        for (let stitch = 0; stitch < totalStitches; stitch++) {
            // Apply center offset and user offset
            const adjustedStitch = stitch - centerOffsetX - offsetHorizontal;
            const adjustedRow = row - centerOffsetY - offsetVertical;

            // Calculate which repeat we're in
            let repeatIndexX = 0;
            let repeatIndexY = 0;

            if (repeatHorizontal && patternStitches > 0) {
                repeatIndexX = Math.floor(adjustedStitch / patternStitches);
            }
            if (repeatVertical && patternRows > 0) {
                repeatIndexY = Math.floor(adjustedRow / patternRows);
            }

            // Check if we're within the allowed repeat count (0 means infinite)
            // For horizontal repeats: center the specified number of repeats
            if (repeatHorizontal && repeatCountX > 0) {
                const halfRepeats = Math.floor(repeatCountX / 2);
                const minRepeatX = repeatCountX % 2 === 0 ? -halfRepeats : -halfRepeats;
                const maxRepeatX = repeatCountX % 2 === 0 ? halfRepeats - 1 : halfRepeats;

                if (repeatIndexX < minRepeatX || repeatIndexX > maxRepeatX) {
                    continue;
                }
            }
            if (repeatVertical && repeatCountY > 0) {
                const halfRepeats = Math.floor(repeatCountY / 2);
                const minRepeatY = repeatCountY % 2 === 0 ? -halfRepeats : -halfRepeats;
                const maxRepeatY = repeatCountY % 2 === 0 ? halfRepeats - 1 : halfRepeats;

                if (repeatIndexY < minRepeatY || repeatIndexY > maxRepeatY) {
                    continue;
                }
            }

            // Skip if outside pattern bounds and no repeat
            if (!repeatHorizontal && (adjustedStitch < 0 || adjustedStitch >= patternStitches)) {
                continue;
            }
            if (!repeatVertical && (adjustedRow < 0 || adjustedRow >= patternRows)) {
                continue;
            }

            // Calculate pattern coordinates with wrapping if repeat is enabled
            let patternStitch, patternRow;

            if (repeatHorizontal) {
                patternStitch = ((adjustedStitch % patternStitches) + patternStitches) % patternStitches;
            } else {
                patternStitch = adjustedStitch;
                if (patternStitch < 0 || patternStitch >= patternStitches) continue;
            }

            if (repeatVertical) {
                patternRow = ((adjustedRow % patternRows) + patternRows) % patternRows;
            } else {
                patternRow = adjustedRow;
                if (patternRow < 0 || patternRow >= patternRows) continue;
            }

            // Get color from pattern
            const colorId = pattern.grid[patternRow][patternStitch];
            const colorInfo = pattern.colors[colorId];

            if (colorInfo) {
                // Use per-layer color mapping if available, otherwise use pattern default
                const layerColor = layer.settings.colorMapping?.[colorId] || colorInfo.color;
                // Only apply color if it's not transparent (allows layers below to show through)
                if (layerColor && layerColor !== 'transparent') {
                    grid[row][stitch] = layerColor;
                }
            }
        }
    }
};

/** Render colorwork layers to canvas with centered origin */
export const renderColorworkLayersToCanvas = (
    ctx: CanvasRenderingContext2D,
    patternLayers: any[],
    shape: any,
    x: number,
    y: number,
    displayWidth: number,
    displayHeight: number,
    scale: number,
    gauge: any,
    fullPanelDimensions: any = null
): void => {
    // Use the full panel dimensions instead of just the top-level shape
    const baseWidthInches = fullPanelDimensions 
        ? (fullPanelDimensions.maxX - fullPanelDimensions.minX) 
        : Math.max(shape.baseA, shape.baseB);
    const baseHeightInches = fullPanelDimensions 
        ? (fullPanelDimensions.maxY - fullPanelDimensions.minY) 
        : shape.height;

    const scalingFactor = gauge.scalingFactor || 1;
    const widthInches = baseWidthInches * scalingFactor;
    const heightInches = baseHeightInches * scalingFactor;

    const stitchesPerInch = gauge.stitchesPerFourInches / 4;
    const rowsPerInch = gauge.rowsPerFourInches / 4;

    const totalStitches = Math.round(widthInches * stitchesPerInch);
    const totalRows = Math.round(heightInches * rowsPerInch);

    const stitchPixelWidth = displayWidth / totalStitches;
    const rowPixelHeight = displayHeight / totalRows;

    // Create a combined pattern grid for all layers with centered origin
    const combinedGrid = createCombinedGridCentered(totalStitches, totalRows, patternLayers);

    // Render the combined grid to canvas
    for (let row = 0; row < totalRows; row++) {
        for (let stitch = 0; stitch < totalStitches; stitch++) {
            const cellX = x + stitch * stitchPixelWidth;
            const cellY = y + row * rowPixelHeight;
            const color = combinedGrid[row] && combinedGrid[row][stitch];

            if (color && color !== 'transparent') {
                ctx.fillStyle = color;
                ctx.fillRect(cellX, cellY, stitchPixelWidth, rowPixelHeight);
            }
        }
    }
};
