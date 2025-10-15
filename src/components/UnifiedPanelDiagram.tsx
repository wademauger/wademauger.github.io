import React, { useRef, useEffect } from 'react';
import { theme } from 'antd';
import polygonClipping from 'polygon-clipping';
import { generatePattern } from './ColorworkCanvasEditor';
import {
    darkenHex,
    makeShortRowTrap,
    computeShortRowOffsets,
    collectTrapezoidCoordinates,
    collectShortRowCoordinates,
    calculateTrapezoidDimensions,
    renderColorworkLayersToCanvas as renderColorworkLayersToCanvasShared
} from '../utils/panelRenderingUtils';

/**
 * UnifiedPanelDiagram - A flexible, high-performance panel visualization component
 * 
 * Combines the capabilities of PanelDiagram and ColorworkPanelDiagram into a single,
 * configurable component that can handle:
 * - Trapezoid labels and selection
 * - Short row sections with visual overlays
 * - Colorwork patterns with precise gauge-based rendering
 * - Border patterns
 * - Progress indicators for interactive knitting
 * - Multiple rendering modes for different use cases
 * 
 * Uses canvas-based rendering for high performance with complex colorwork.
 * Shares rendering utilities with ColorworkCanvasEditor via panelRenderingUtils.
 */

export interface UnifiedPanelDiagramProps {
    /** The panel shape (trapezoid hierarchy) to render */
    shape: any;
    
    /** Display size in pixels (width/height of square canvas) */
    size?: number;
    
    /** Padding around the diagram */
    padding?: number;
    
    /** Text label to display below the diagram */
    label?: string;
    
    // Label and selection features (from PanelDiagram)
    /** Show trapezoid labels (A, B, C, etc.) */
    showLabels?: boolean;
    
    /** ID of the currently selected trapezoid */
    selectedId?: string | null;
    
    /** Callback when a trapezoid is clicked */
    onSelect?: ((id: string) => void) | null;
    
    /** ID of the currently selected short row section */
    selectedShortRowId?: string | null;
    
    // Colorwork features (from ColorworkPanelDiagram)
    /** Array of colorwork pattern layers to render */
    patternLayers?: any[];
    
    /** Gauge information for accurate stitch/row rendering */
    gauge?: {
        stitchesPerFourInches: number;
        rowsPerFourInches: number;
        scalingFactor?: number;
    } | null;
    
    /** Whether to render colorwork patterns (vs just shape outline) */
    showPatterns?: boolean;
    
    // Progress tracking features (for InteractiveKnittingPage)
    /** Current row being knitted (0-indexed) */
    highlightedRow?: number | null;
    
    /** Array of completed row numbers */
    completedRows?: number[];
    
    /** Show progress indicators */
    showProgress?: boolean;
    
    // Visual customization
    /** Custom fill color (defaults to theme primary color) */
    fillColor?: string;
    
    /** Opacity for the base shape fill */
    fillOpacity?: number;
    
        /** Show or hide the short row overlays */
    showShortRows?: boolean;
}

// Utility functions are now imported from panelRenderingUtils
// (darkenHex, makeShortRowTrap, computeShortRowOffsets, collectTrapezoidCoordinates,
//  collectShortRowCoordinates, calculateTrapezoidDimensions, renderColorworkLayersToCanvas)

// --- Border Rendering (polygon-clipping specific, stays here) ---

/**
}

// Utility functions are now imported from panelRenderingUtils
// (darkenHex, makeShortRowTrap, computeShortRowOffsets, collectTrapezoidCoordinates,
//  collectShortRowCoordinates, calculateTrapezoidDimensions, renderColorworkLayersToCanvas)

// --- Border Rendering (polygon-clipping specific, stays here) ---

    const combinedGrid = createCombinedGridCentered(totalStitches, totalRows, patternLayers);

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

/** Create combined grid from all pattern layers */
const createCombinedGridCentered = (totalStitches: number, totalRows: number, patternLayers: any[]): string[][] => {
    const grid = Array(totalRows).fill(null).map(() => Array(totalStitches).fill('transparent'));
    patternLayers.sort((a, b) => a.priority - b.priority).forEach((layer: any) => {
        applyPatternLayerCentered(grid, totalStitches, totalRows, layer);
    });
    return grid;
};

/** Apply a single pattern layer to the grid */
const applyPatternLayerCentered = (grid: string[][], totalStitches: number, totalRows: number, layer: any): void => {
    let { pattern, settings } = layer;

    if (layer.patternType === 'stripes' && layer.patternConfig && layer.patternConfig.colors) {
        const hasZeroRows = layer.patternConfig.colors.some((c: any) => c.rows === 0);
        if (hasZeroRows) {
            pattern = generatePattern('stripes', layer.patternConfig, totalRows as any);
        }
    } else if (layer.patternType === 'vstripes' && layer.patternConfig && layer.patternConfig.colors) {
        const hasZeroColumns = layer.patternConfig.colors.some((c: any) => c.columns === 0);
        if (hasZeroColumns) {
            pattern = generatePattern('vstripes', layer.patternConfig, totalStitches as any);
        }
    }

    if (!pattern || !pattern.grid || pattern.grid.length === 0) {
        return;
    }

    if (pattern.metadata?.isBorderPattern) {
        return; // Border patterns handled separately
    }

    const patternRows = pattern.getRowCount();
    const patternStitches = pattern.getStitchCount();

    if (patternRows === 0 || patternStitches === 0) {
        return;
    }

    const {
        repeatMode = 'both',
        repeatCountX = 0,
        repeatCountY = 0,
        repeatHorizontal = true,
        repeatVertical = true,
        offsetHorizontal = 0,
        offsetVertical = 0
    } = settings;

    const shouldRepeatHorizontal = repeatMode ? (repeatMode === 'x' || repeatMode === 'both') : repeatHorizontal;
    const shouldRepeatVertical = repeatMode ? (repeatMode === 'y' || repeatMode === 'both') : repeatVertical;

    const centerOffsetX = Math.floor((totalStitches - patternStitches) / 2);
    const centerOffsetY = Math.floor((totalRows - patternRows) / 2);

    for (let row = 0; row < totalRows; row++) {
        for (let stitch = 0; stitch < totalStitches; stitch++) {
            const adjustedStitch = stitch - centerOffsetX - offsetHorizontal;
            const adjustedRow = row - centerOffsetY - offsetVertical;

            let repeatIndexX = 0;
            let repeatIndexY = 0;

            if (shouldRepeatHorizontal && patternStitches > 0) {
                repeatIndexX = Math.floor(adjustedStitch / patternStitches);
            }
            if (shouldRepeatVertical && patternRows > 0) {
                repeatIndexY = Math.floor(adjustedRow / patternRows);
            }

            if (shouldRepeatHorizontal && repeatCountX && repeatCountX > 0 && Math.abs(repeatIndexX) >= repeatCountX) {
                continue;
            }
            if (shouldRepeatVertical && repeatCountY && repeatCountY > 0 && Math.abs(repeatIndexY) >= repeatCountY) {
                continue;
            }

            if (!shouldRepeatHorizontal && (adjustedStitch < 0 || adjustedStitch >= patternStitches)) {
                continue;
            }
            if (!shouldRepeatVertical && (adjustedRow < 0 || adjustedRow >= patternRows)) {
                continue;
            }

            let patternStitch, patternRow;

            if (shouldRepeatHorizontal) {
                patternStitch = ((adjustedStitch % patternStitches) + patternStitches) % patternStitches;
            } else {
                patternStitch = adjustedStitch;
                if (patternStitch < 0 || patternStitch >= patternStitches) continue;
            }

            if (shouldRepeatVertical) {
                patternRow = ((adjustedRow % patternRows) + patternRows) % patternRows;
            } else {
                patternRow = adjustedRow;
                if (patternRow < 0 || patternRow >= patternRows) continue;
            }

            const colorId = pattern.grid[patternRow][patternStitch];
            const colorInfo = pattern.colors[colorId];

            if (colorInfo && colorInfo.color) {
                grid[row][stitch] = colorInfo.color;
            }
        }
    }
};

/** Render border pattern using polygon operations */
const renderBorderToCanvas = (
    ctx: CanvasRenderingContext2D,
    allCoordinates: any[],
    borderConfig: { color: string; thickness: number },
    minX: number,
    minY: number,
    maxX: number,
    maxY: number,
    scale: number,
    gauge: any
): void => {
    const widthInches = (maxX - minX) / scale;
    const heightInches = (maxY - minY) / scale;

    const stitchesPerInch = gauge.stitchesPerFourInches / 4;
    const rowsPerInch = gauge.rowsPerFourInches / 4;
    const scalingFactor = gauge.scalingFactor || 1;

    const totalStitches = Math.round(widthInches * scalingFactor * stitchesPerInch);
    const totalRows = Math.round(heightInches * scalingFactor * rowsPerInch);

    const stitchWidthPixels = (maxX - minX) / totalStitches;
    const rowHeightPixels = (maxY - minY) / totalRows;

    const borderStitches = borderConfig.thickness;

    const polygons = allCoordinates.map((coord: any) => {
        return [[
            [coord.topLeft.x, coord.topLeft.y],
            [coord.topRight.x, coord.topRight.y],
            [coord.bottomRight.x, coord.bottomRight.y],
            [coord.bottomLeft.x, coord.bottomLeft.y],
            [coord.topLeft.x, coord.topLeft.y]
        ]];
    });

    const mergedPolygons = (polygonClipping.union as any)(...polygons);

    ctx.save();
    ctx.fillStyle = borderConfig.color;

    mergedPolygons.forEach((polygon: any) => {
        polygon.forEach((ring: any) => {
            if (ring.length < 3) return;

            const insetRing: any[] = [];

            for (let i = 0; i < ring.length - 1; i++) {
                const prev = ring[(i - 1 + ring.length - 1) % (ring.length - 1)];
                const curr = ring[i];
                const next = ring[i + 1];

                const e1dx = curr[0] - prev[0];
                const e1dy = curr[1] - prev[1];
                const e1len = Math.sqrt(e1dx * e1dx + e1dy * e1dy);

                const e2dx = next[0] - curr[0];
                const e2dy = next[1] - curr[1];
                const e2len = Math.sqrt(e2dx * e2dx + e2dy * e2dy);

                if (e1len < 0.001 || e2len < 0.001) continue;

                const e1x = e1dx / e1len;
                const e1y = e1dy / e1len;
                const e2x = e2dx / e2len;
                const e2y = e2dy / e2len;

                const n1x = -e1y;
                const n1y = e1x;
                const n2x = -e2y;
                const n2y = e2x;

                const angle1 = Math.atan2(e1y, e1x);
                const angle2 = Math.atan2(e2y, e2x);

                const offset1 = borderStitches * Math.sqrt(
                    Math.pow(Math.abs(Math.sin(angle1)) * stitchWidthPixels, 2) +
                    Math.pow(Math.abs(Math.cos(angle1)) * rowHeightPixels, 2)
                );
                const offset2 = borderStitches * Math.sqrt(
                    Math.pow(Math.abs(Math.sin(angle2)) * stitchWidthPixels, 2) +
                    Math.pow(Math.abs(Math.cos(angle2)) * rowHeightPixels, 2)
                );

                const avgNx = (n1x + n2x) / 2;
                const avgNy = (n1y + n2y) / 2;
                const avgNlen = Math.sqrt(avgNx * avgNx + avgNy * avgNy);

                if (avgNlen < 0.001) continue;

                const bisectorX = avgNx / avgNlen;
                const bisectorY = avgNy / avgNlen;

                const dotProduct = e1x * e2x + e1y * e2y;
                const halfAngle = Math.acos(Math.max(-1, Math.min(1, dotProduct))) / 2;

                const sinHalfAngle = Math.sin(halfAngle);
                if (Math.abs(sinHalfAngle) < 0.1) {
                    const avgOffset = (offset1 + offset2) / 2;
                    insetRing.push([
                        curr[0] + bisectorX * avgOffset,
                        curr[1] + bisectorY * avgOffset
                    ]);
                } else {
                    const avgOffset = (offset1 + offset2) / 2;
                    const miterDistance = avgOffset / sinHalfAngle;

                    insetRing.push([
                        curr[0] + bisectorX * miterDistance,
                        curr[1] + bisectorY * miterDistance
                    ]);
                }
            }

            if (insetRing.length >= 3) {
                ctx.beginPath();

                ctx.moveTo(ring[0][0], ring[0][1]);
                for (let i = 1; i < ring.length; i++) {
                    ctx.lineTo(ring[i][0], ring[i][1]);
                }

                ctx.moveTo(insetRing[insetRing.length - 1][0], insetRing[insetRing.length - 1][1]);
                for (let i = insetRing.length - 2; i >= 0; i--) {
                    ctx.lineTo(insetRing[i][0], insetRing[i][1]);
                }
                ctx.closePath();

                ctx.fill('evenodd');
            }
        });
    });

    ctx.restore();
};

/** Calculate row positions for progress highlighting */
const calculateRowPositions = (shape: any, scale: number, xOffset: number, yOffset: number, startRow: number, gauge: any): any[] => {
    const positions: any[] = [];

    if (!shape || !gauge) return positions;

    const stitchesPerInch = (gauge.stitchesPerFourInches / 4) * (gauge.scalingFactor || 1);
    const rowsPerInch = (gauge.rowsPerFourInches / 4) * (gauge.scalingFactor || 1);

    const effectiveHeight = (shape.isHem ? shape.height * 0.5 : shape.height);
    const heightPixels = effectiveHeight * scale;
    const rowCount = Math.round(effectiveHeight * rowsPerInch);
    const rowHeightPixels = heightPixels / rowCount;

    const topWidth = shape.baseB * scale;
    const bottomWidth = shape.baseA * scale;
    const containerWidth = Math.max(topWidth, bottomWidth);

    const topLeftX = xOffset + (containerWidth - topWidth) / 2 + (shape.baseBHorizontalOffset || 0) * scale;
    const topRightX = topLeftX + topWidth;
    const bottomLeftX = xOffset + (containerWidth - bottomWidth) / 2;
    const bottomRightX = bottomLeftX + bottomWidth;

    for (let i = 0; i < rowCount; i++) {
        const t = i / rowCount;
        const y = yOffset + t * heightPixels;

        const leftX = topLeftX + (bottomLeftX - topLeftX) * t;
        const rightX = topRightX + (bottomRightX - topRightX) * t;

        positions.push({
            y,
            leftX,
            rightX,
            rowNumber: startRow + i,
            trapezoidId: shape.id || shape.label
        });
    }

    if (shape.successors && shape.successors.length > 0) {
        const nextStartRow = startRow + rowCount;
        const nextYOffset = yOffset + heightPixels;
        const trapWidth = Math.max(shape.baseA, shape.baseB) * scale;

        if (shape.successors.length > 1) {
            const successorWidths = shape.successors.map((s: any) => Math.max(s.baseA, s.baseB) * scale);
            const totalSuccessorWidth = successorWidths.reduce((sum: number, w: number) => sum + w, 0);
            let currentXOffset = xOffset + (trapWidth - totalSuccessorWidth) / 2;

            shape.successors.forEach((successor: any, idx: number) => {
                const successorPositions = calculateRowPositions(
                    successor,
                    scale,
                    currentXOffset,
                    nextYOffset,
                    nextStartRow,
                    gauge
                );
                positions.push(...successorPositions);

                const successorWidth = successorWidths[idx];
                currentXOffset += successorWidth;
            });
        } else {
            const successor = shape.successors[0];
            const successorPositions = calculateRowPositions(
                successor,
                scale,
                xOffset,
                nextYOffset,
                nextStartRow,
                gauge
            );
            positions.push(...successorPositions);
        }
    }

    return positions;
};

/** Draw progress indicators on canvas */
const drawProgressIndicators = (
    ctx: CanvasRenderingContext2D,
    shape: any,
    scale: number,
    translateX: number,
    translateY: number,
    gauge: any,
    highlightedRow: number | null,
    completedRows: number[]
): void => {
    const rowPositions = calculateRowPositions(shape, scale, 0, 0, 0, gauge);

    if (rowPositions.length === 0) return;

    ctx.save();
    ctx.translate(translateX, translateY);

    // Draw completed rows
    completedRows.forEach(rowNum => {
        if (rowNum >= 0 && rowNum < rowPositions.length) {
            const pos = rowPositions[rowNum];
            ctx.strokeStyle = 'rgba(82, 196, 26, 0.6)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(pos.leftX, pos.y);
            ctx.lineTo(pos.rightX, pos.y);
            ctx.stroke();
        }
    });

    // Draw highlighted (current) row
    if (highlightedRow !== null && highlightedRow >= 0 && highlightedRow < rowPositions.length) {
        const pos = rowPositions[highlightedRow];
        ctx.strokeStyle = 'rgba(255, 77, 79, 0.9)';
        ctx.lineWidth = 3;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(pos.leftX, pos.y);
        ctx.lineTo(pos.rightX, pos.y);
        ctx.stroke();

        // Arrow indicators
        const arrowSize = 6;
        ctx.fillStyle = 'rgba(255, 77, 79, 0.9)';
        ctx.beginPath();
        ctx.moveTo(pos.leftX, pos.y);
        ctx.lineTo(pos.leftX - arrowSize, pos.y - arrowSize);
        ctx.lineTo(pos.leftX - arrowSize, pos.y + arrowSize);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(pos.rightX, pos.y);
        ctx.lineTo(pos.rightX + arrowSize, pos.y - arrowSize);
        ctx.lineTo(pos.rightX + arrowSize, pos.y + arrowSize);
        ctx.closePath();
        ctx.fill();
    }

    ctx.restore();
};

/** Main canvas rendering function */
const renderToCanvas = (
    ctx: CanvasRenderingContext2D,
    shape: any,
    scale: number,
    translateX: number,
    translateY: number,
    fillColor: string,
    fillOpacity: number,
    patternLayers: any[],
    gauge: any,
    showPatterns: boolean,
    showLabels: boolean,
    selectedId: string | null,
    showShortRows: boolean,
    selectedShortRowId: string | null
): void => {
    // Collect all coordinates
    const allCoordinates: any[] = [];
    collectTrapezoidCoordinates(shape, scale, 0, 0, allCoordinates);

    if (allCoordinates.length === 0) return;

    // Find bounding box
    let minX = Math.min(...allCoordinates.map((coord: any) => Math.min(coord.topLeft.x, coord.topRight.x, coord.bottomLeft.x, coord.bottomRight.x)));
    let maxX = Math.max(...allCoordinates.map((coord: any) => Math.max(coord.topLeft.x, coord.topRight.x, coord.bottomLeft.x, coord.bottomRight.x)));
    let minY = Math.min(...allCoordinates.map((coord: any) => Math.min(coord.topLeft.y, coord.topRight.y, coord.bottomLeft.y, coord.bottomRight.y)));
    let maxY = Math.max(...allCoordinates.map((coord: any) => Math.max(coord.topLeft.y, coord.topRight.y, coord.bottomLeft.y, coord.bottomRight.y)));

    ctx.save();
    ctx.translate(translateX, translateY);

    // Create unified clipping path
    ctx.save();
    ctx.beginPath();
    allCoordinates.forEach((coord, index: number) => {
        if (index === 0) {
            ctx.moveTo(coord.topLeft.x, coord.topLeft.y);
        } else {
            ctx.moveTo(coord.topLeft.x, coord.topLeft.y);
        }
        ctx.lineTo(coord.topRight.x, coord.topRight.y);
        ctx.lineTo(coord.bottomRight.x, coord.bottomRight.y);
        ctx.lineTo(coord.bottomLeft.x, coord.bottomLeft.y);
        ctx.closePath();
    });
    ctx.clip();

    // Filter out border patterns
    const colorworkLayers = patternLayers ? patternLayers.filter((layer: any) => !layer.pattern?.metadata?.isBorderPattern) : [];

    // Calculate full panel dimensions for consistent pattern scale
    let fullPanelDimensions = { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity };
    calculateTrapezoidDimensions(shape, 1, 0, 0, fullPanelDimensions);

    // Render colorwork or solid fill
    if (showPatterns && colorworkLayers.length > 0 && gauge) {
        renderColorworkLayersToCanvasShared(
            ctx,
            colorworkLayers,
            shape,
            minX, minY, maxX - minX, maxY - minY,
            scale,
            gauge,
            fullPanelDimensions // Pass full panel dimensions for consistent pattern scale with ColorworkCanvasEditor
        );
    } else {
        ctx.fillStyle = fillColor;
        ctx.globalAlpha = fillOpacity;
        ctx.fillRect(minX, minY, maxX - minX, maxY - minY);
        ctx.globalAlpha = 1.0;
    }

    ctx.restore();

    // Draw outlines
    allCoordinates.forEach((coord: any) => {
        const isSelected = selectedId && coord.trap.id && coord.trap.id === selectedId;
        ctx.strokeStyle = isSelected ? '#1677ff' : '#a1a8af';
        ctx.lineWidth = isSelected ? 4 : 3;
        ctx.lineJoin = 'round';

        ctx.beginPath();
        ctx.moveTo(coord.topLeft.x, coord.topLeft.y);
        ctx.lineTo(coord.topRight.x, coord.topRight.y);
        ctx.lineTo(coord.bottomRight.x, coord.bottomRight.y);
        ctx.lineTo(coord.bottomLeft.x, coord.bottomLeft.y);
        ctx.closePath();
        ctx.stroke();

        // Draw labels
        if (showLabels && coord.trap.label) {
            const centerX = (coord.topLeft.x + coord.topRight.x + coord.bottomLeft.x + coord.bottomRight.x) / 4;
            const centerY = (coord.topLeft.y + coord.topRight.y + coord.bottomLeft.y + coord.bottomRight.y) / 4;

            ctx.font = 'bold 24px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            ctx.strokeText(coord.trap.label, centerX, centerY);
            ctx.fillStyle = '#ffffff';
            ctx.fillText(coord.trap.label, centerX, centerY);
        }
    });

    // Render short rows with colorwork
    if (showShortRows) {
        const shortRowCoords: any[] = [];
        collectShortRowCoordinates(shape, scale, 0, 0, shortRowCoords);

        shortRowCoords.forEach((coord: any) => {
            // Calculate short row dimensions
            const srMinX = Math.min(coord.topLeft.x, coord.topRight.x, coord.bottomLeft.x, coord.bottomRight.x);
            const srMaxX = Math.max(coord.topLeft.x, coord.topRight.x, coord.bottomLeft.x, coord.bottomRight.x);
            const srMinY = Math.min(coord.topLeft.y, coord.topRight.y, coord.bottomLeft.y, coord.bottomRight.y);
            const srMaxY = Math.max(coord.topLeft.y, coord.topRight.y, coord.bottomLeft.y, coord.bottomRight.y);

            // Create clipping path for this short row
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(coord.topLeft.x, coord.topLeft.y);
            ctx.lineTo(coord.topRight.x, coord.topRight.y);
            ctx.lineTo(coord.bottomRight.x, coord.bottomRight.y);
            ctx.lineTo(coord.bottomLeft.x, coord.bottomLeft.y);
            ctx.closePath();
            ctx.clip();

            // Render colorwork or solid fill for short row
            if (showPatterns && colorworkLayers.length > 0 && gauge) {
                // Render using the PARENT shape so the pattern continues seamlessly
                // Use the same coordinates and dimensions as the main shape rendering
                renderColorworkLayersToCanvasShared(
                    ctx,
                    colorworkLayers,
                    shape, // Use parent shape for pattern continuity!
                    minX, // Use parent's origin, not short row's
                    minY,
                    maxX - minX, // Use parent's dimensions
                    maxY - minY,
                    scale,
                    gauge,
                    null // fullPanelDimensions - using minX/minY/maxX/maxY which already account for the full shape
                );
            } else {
                // Solid fill (same as parent, no darkening)
                ctx.fillStyle = fillColor;
                ctx.globalAlpha = fillOpacity;
                ctx.fillRect(srMinX, srMinY, srMaxX - srMinX, srMaxY - srMinY);
                ctx.globalAlpha = 1.0;
            }

            ctx.restore();

            // Draw outline
            ctx.strokeStyle = '#666';
            ctx.lineWidth = 1;
            ctx.lineJoin = 'round';
            ctx.beginPath();
            ctx.moveTo(coord.topLeft.x, coord.topLeft.y);
            ctx.lineTo(coord.topRight.x, coord.topRight.y);
            ctx.lineTo(coord.bottomRight.x, coord.bottomRight.y);
            ctx.lineTo(coord.bottomLeft.x, coord.bottomLeft.y);
            ctx.closePath();
            ctx.stroke();

            // Draw anchor marker for selected short row
            if (selectedShortRowId && coord.shortRow.id === selectedShortRowId) {
                ctx.fillStyle = '#000';
                ctx.beginPath();
                ctx.arc(coord.anchorX, coord.anchorY, 4, 0, Math.PI * 2);
                ctx.fill();
            }
        });
    }

    // Render border
    const borderLayer = patternLayers.find((layer: any) => layer.pattern?.metadata?.isBorderPattern);
    if (borderLayer && gauge) {
        const borderColorId = 1;
        const colorInfo = borderLayer.pattern.colors[borderColorId];
        const thickness = borderLayer.pattern.metadata.borderThickness || 1;
        const color = borderLayer.settings.colorMapping?.[borderColorId] || colorInfo?.color || '#000000';
        const borderConfig = { color, thickness };

        renderBorderToCanvas(ctx, allCoordinates, borderConfig, minX, minY, maxX, maxY, scale, gauge);
    }

    ctx.restore();
};

/** Calculate dimensions of the shape hierarchy */
const calculateDimensions = (shape: any, scale: number): { minX: number; maxX: number; minY: number; maxY: number } => {
    const dimensions = { minX: 0, maxX: 0, minY: 0, maxY: 0 };
    const coords: any[] = [];
    collectTrapezoidCoordinates(shape, scale, 0, 0, coords);

    if (coords.length === 0) return dimensions;

    dimensions.minX = Math.min(...coords.map((c: any) => Math.min(c.topLeft.x, c.topRight.x, c.bottomLeft.x, c.bottomRight.x)));
    dimensions.maxX = Math.max(...coords.map((c: any) => Math.max(c.topLeft.x, c.topRight.x, c.bottomLeft.x, c.bottomRight.x)));
    dimensions.minY = Math.min(...coords.map((c: any) => Math.min(c.topLeft.y, c.topRight.y, c.bottomLeft.y, c.bottomRight.y)));
    dimensions.maxY = Math.max(...coords.map((c: any) => Math.max(c.topLeft.y, c.topRight.y, c.bottomLeft.y, c.bottomRight.y)));

    // Include short rows in bounding box
    const shortRowCoords: any[] = [];
    collectShortRowCoordinates(shape, scale, 0, 0, shortRowCoords);
    shortRowCoords.forEach((c: any) => {
        dimensions.minX = Math.min(dimensions.minX, c.topLeft.x, c.topRight.x, c.bottomLeft.x, c.bottomRight.x);
        dimensions.maxX = Math.max(dimensions.maxX, c.topLeft.x, c.topRight.x, c.bottomLeft.x, c.bottomRight.x);
        dimensions.minY = Math.min(dimensions.minY, c.topLeft.y, c.topRight.y, c.bottomLeft.y, c.bottomRight.y);
        dimensions.maxY = Math.max(dimensions.maxY, c.topLeft.y, c.topRight.y, c.bottomLeft.y, c.bottomRight.y);
    });

    return dimensions;
};

// --- Main Component ---

export const UnifiedPanelDiagram: React.FC<UnifiedPanelDiagramProps> = ({
    shape,
    size = 200,
    padding = 10,
    label = '',
    showLabels = false,
    selectedId = null,
    onSelect = null,
    selectedShortRowId = null,
    patternLayers = [],
    gauge = null,
    showPatterns = true,
    highlightedRow = null,
    completedRows = [],
    showProgress = false,
    fillColor,
    fillOpacity = 0.3,
    showShortRows = true
}) => {
    const { token } = theme.useToken();
    const defaultFillColor = fillColor || token.colorPrimary;
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !shape) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const devicePixelRatio = window.devicePixelRatio || 1;

        canvas.width = size * devicePixelRatio;
        canvas.height = size * devicePixelRatio;
        canvas.style.width = `${size}px`;
        canvas.style.height = `${size}px`;

        ctx.scale(devicePixelRatio, devicePixelRatio);
        ctx.clearRect(0, 0, size, size);

        // Calculate dimensions
        const dimensions = calculateDimensions(shape, 1);
        const width = dimensions.maxX - dimensions.minX;
        const height = dimensions.maxY - dimensions.minY;

        // Calculate scale factor
        const availableWidth = size - 2 * padding;
        const availableHeight = size - 2 * padding;
        const scaleFactor = Math.min(availableWidth / width, availableHeight / height);

        // Calculate translation
        const scaledWidth = width * scaleFactor;
        const scaledHeight = height * scaleFactor;
        const translateX = (size - scaledWidth) / 2 - dimensions.minX * scaleFactor + padding;
        const translateY = (size - scaledHeight) / 2 - dimensions.minY * scaleFactor + padding;

        // Render
        renderToCanvas(
            ctx,
            shape,
            scaleFactor,
            translateX,
            translateY,
            defaultFillColor,
            fillOpacity,
            patternLayers,
            gauge,
            showPatterns,
            showLabels,
            selectedId,
            showShortRows,
            selectedShortRowId
        );

        // Draw progress indicators
        if (showProgress && (highlightedRow !== null || completedRows.length > 0) && gauge) {
            drawProgressIndicators(
                ctx,
                shape,
                scaleFactor,
                translateX,
                translateY,
                gauge,
                highlightedRow,
                completedRows
            );
        }
    }, [shape, size, padding, showLabels, selectedId, selectedShortRowId, patternLayers, gauge, showPatterns, highlightedRow, completedRows, showProgress, defaultFillColor, fillOpacity, showShortRows]);

    // Handle canvas clicks for selection
    const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!onSelect || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Calculate which trapezoid was clicked
        // This requires checking point-in-polygon for each trapezoid
        // For now, we'll keep the existing behavior and rely on external click handling
        // TODO: Implement point-in-polygon detection for canvas-based selection
    };

    return (
        <div style={{ width: size + padding * 2, height: size + padding * 3, float: 'left' }}>
            <canvas
                ref={canvasRef}
                style={{
                    border: '1px solid #d9d9d9',
                    borderRadius: '6px',
                    backgroundColor: '#fafafa',
                    cursor: onSelect ? 'pointer' : 'default'
                }}
                onClick={handleCanvasClick}
            />
            {label && <div style={{ textAlign: 'center', marginTop: 4, fontSize: '12px' }}>{label}</div>}
        </div>
    );
};
