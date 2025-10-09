import React, { useRef, useEffect } from 'react';
import { theme } from 'antd';
import polygonClipping from 'polygon-clipping';

/**
 * ColorworkPanelDiagram - Canvas-based panel diagram with high performance rendering
 * Replaces SVG DOM elements with Canvas 2D context for complex colorwork visualization
 */

const renderUnifiedShapeToCanvas = (ctx, shape, scale, xOffset = 0, yOffset = 0, fillColor, patternLayers = [], gauge = null, borderConfig = null) => {
    // Collect all trapezoid coordinates into one unified path
    const allCoordinates = [];
    collectTrapezoidCoordinates(shape, scale, xOffset, yOffset, allCoordinates);
    
    if (allCoordinates.length === 0) return;
    
    // Find the bounding box of the entire shape
    let minX = Math.min(...allCoordinates.map((coord: any) => Math.min(coord.topLeft.x, coord.topRight.x, coord.bottomLeft.x, coord.bottomRight.x)));
    let maxX = Math.max(...allCoordinates.map((coord: any) => Math.max(coord.topLeft.x, coord.topRight.x, coord.bottomLeft.x, coord.bottomRight.x)));
    let minY = Math.min(...allCoordinates.map((coord: any) => Math.min(coord.topLeft.y, coord.topRight.y, coord.bottomLeft.y, coord.bottomRight.y)));
    let maxY = Math.max(...allCoordinates.map((coord: any) => Math.max(coord.topLeft.y, coord.topRight.y, coord.bottomLeft.y, coord.bottomRight.y)));
    
    // Create unified clipping path
    ctx.save();
    ctx.beginPath();
    
    // Draw each trapezoid as part of the unified path
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

    // Filter out border patterns - they're rendered as stroke, not grid
    const colorworkLayers = patternLayers ? patternLayers.filter((layer: any) => !layer.pattern?.metadata?.isBorderPattern) : [];

    // If pattern layers are provided, render them as background with centered origin
    if (colorworkLayers.length > 0 && gauge) {
        renderColorworkLayersToCanvasCentered(
            ctx,
            colorworkLayers,
            shape,
            minX, minY, maxX - minX, maxY - minY,
            scale,
            gauge
        );
    } else {
        // Default solid fill if no colorwork
        ctx.fillStyle = fillColor;
        ctx.globalAlpha = 0.3;
        ctx.fillRect(minX, minY, maxX - minX, maxY - minY);
        ctx.globalAlpha = 1.0;
    }

    ctx.restore();

    // Draw unified outline (default gray stroke)
    ctx.strokeStyle = '#a1a8af';
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    
    allCoordinates.forEach((coord: any) => {
        ctx.beginPath();
        ctx.moveTo(coord.topLeft.x, coord.topLeft.y);
        ctx.lineTo(coord.topRight.x, coord.topRight.y);
        ctx.lineTo(coord.bottomRight.x, coord.bottomRight.y);
        ctx.lineTo(coord.bottomLeft.x, coord.bottomLeft.y);
        ctx.closePath();
        ctx.stroke();
    });

    // If border config provided, draw inner border using polygon union
    if (borderConfig && borderConfig.color && borderConfig.thickness && gauge) {
        // Calculate dimensions in inches from the shape bounding box
        const widthInches = (maxX - minX) / scale;
        const heightInches = (maxY - minY) / scale;
        
        // Calculate gauge
        const stitchesPerInch = gauge.stitchesPerFourInches / 4;
        const rowsPerInch = gauge.rowsPerFourInches / 4;
        const scalingFactor = gauge.scalingFactor || 1;
        
        // Calculate total stitches and rows for this shape
        const totalStitches = Math.round(widthInches * scalingFactor * stitchesPerInch);
        const totalRows = Math.round(heightInches * scalingFactor * rowsPerInch);
        
        // Calculate pixel dimensions per stitch/row
        // This matches how the pattern grid is rendered
        const stitchWidthPixels = (maxX - minX) / totalStitches;
        const rowHeightPixels = (maxY - minY) / totalRows;
        
        // Border thickness in "stitches"
        const borderStitches = borderConfig.thickness;
        
        // Convert trapezoids to polygon-clipping format
        const polygons = allCoordinates.map((coord: any) => {
            return [[
                [coord.topLeft.x, coord.topLeft.y],
                [coord.topRight.x, coord.topRight.y],
                [coord.bottomRight.x, coord.bottomRight.y],
                [coord.bottomLeft.x, coord.bottomLeft.y],
                [coord.topLeft.x, coord.topLeft.y]
            ]];
        });
        
        // Perform geometric union to merge all trapezoids
        const mergedPolygons = polygonClipping.union(...polygons);
        
        // Draw border as filled region between outer and inner polygons
        ctx.save();
        ctx.fillStyle = borderConfig.color;
        
        mergedPolygons.forEach((polygon) => {
            polygon.forEach((ring) => {
                if (ring.length < 3) return;
                
                // Calculate inset polygon with angle-dependent offset
                const insetRing: any[] = [];
                
                for (let i = 0; i < ring.length - 1; i++) {
                    const prev = ring[(i - 1 + ring.length - 1) % (ring.length - 1)];
                    const curr = ring[i];
                    const next = ring[i + 1];
                    
                    // Calculate edge vectors
                    const e1dx = curr[0] - prev[0];
                    const e1dy = curr[1] - prev[1];
                    const e1len = Math.sqrt(e1dx * e1dx + e1dy * e1dy);
                    
                    const e2dx = next[0] - curr[0];
                    const e2dy = next[1] - curr[1];
                    const e2len = Math.sqrt(e2dx * e2dx + e2dy * e2dy);
                    
                    if (e1len < 0.001 || e2len < 0.001) continue;
                    
                    // Normalized edge vectors
                    const e1x = e1dx / e1len;
                    const e1y = e1dy / e1len;
                    const e2x = e2dx / e2len;
                    const e2y = e2dy / e2len;
                    
                    // Perpendicular inward normals (rotate 90° counter-clockwise for inward)
                    // For a clockwise-wound polygon, rotating 90° CCW gives inward normal
                    const n1x = -e1y;
                    const n1y = e1x;
                    const n2x = -e2y;
                    const n2y = e2x;
                    
                    // Calculate angles of each edge
                    const angle1 = Math.atan2(e1y, e1x);
                    const angle2 = Math.atan2(e2y, e2x);
                    
                    // Calculate offset distances based on edge angles
                    // The perpendicular direction to an edge at angle θ is at angle θ+90°
                    // For horizontal edge (θ≈0°): perpendicular is vertical
                    //   -> border spans vertically, uses rowHeightPixels
                    //   -> |sin(0°)| = 0, |cos(0°)| = 1
                    // For vertical edge (θ≈90°): perpendicular is horizontal  
                    //   -> border spans horizontally, uses stitchWidthPixels
                    //   -> |sin(90°)| = 1, |cos(90°)| = 0
                    // We need to swap sin/cos because perpendicular is rotated 90°
                    
                    const offset1 = borderStitches * Math.sqrt(
                        Math.pow(Math.abs(Math.sin(angle1)) * stitchWidthPixels, 2) +
                        Math.pow(Math.abs(Math.cos(angle1)) * rowHeightPixels, 2)
                    );
                    const offset2 = borderStitches * Math.sqrt(
                        Math.pow(Math.abs(Math.sin(angle2)) * stitchWidthPixels, 2) +
                        Math.pow(Math.abs(Math.cos(angle2)) * rowHeightPixels, 2)
                    );
                    
                    // Calculate proper miter point by finding intersection of offset edges
                    // The miter point is where the two offset edges meet
                    
                    // Calculate the angle bisector (average of normals)
                    const avgNx = (n1x + n2x) / 2;
                    const avgNy = (n1y + n2y) / 2;
                    const avgNlen = Math.sqrt(avgNx * avgNx + avgNy * avgNy);
                    
                    if (avgNlen < 0.001) continue; // Degenerate case
                    
                    // Normalize the bisector
                    const bisectorX = avgNx / avgNlen;
                    const bisectorY = avgNy / avgNlen;
                    
                    // Calculate the angle between the two edges
                    const dotProduct = e1x * e2x + e1y * e2y;
                    const halfAngle = Math.acos(Math.max(-1, Math.min(1, dotProduct))) / 2;
                    
                    // Avoid extreme miter spikes at very acute angles
                    const sinHalfAngle = Math.sin(halfAngle);
                    if (Math.abs(sinHalfAngle) < 0.1) {
                        // For very sharp corners, use a simpler average offset
                        const avgOffset = (offset1 + offset2) / 2;
                        insetRing.push([
                            curr[0] + bisectorX * avgOffset,
                            curr[1] + bisectorY * avgOffset
                        ]);
                    } else {
                        // Calculate miter distance: offset / sin(half_angle)
                        const avgOffset = (offset1 + offset2) / 2;
                        const miterDistance = avgOffset / sinHalfAngle;
                        
                        insetRing.push([
                            curr[0] + bisectorX * miterDistance,
                            curr[1] + bisectorY * miterDistance
                        ]);
                    }
                }
                
                // Draw the border as the area between outer and inner rings
                if (insetRing.length >= 3) {
                    ctx.beginPath();
                    
                    // Outer ring
                    ctx.moveTo(ring[0][0], ring[0][1]);
                    for (let i = 1; i < ring.length; i++) {
                        ctx.lineTo(ring[i][0], ring[i][1]);
                    }
                    
                    // Inner ring (reverse direction to create a hole)
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
    }
};

const collectTrapezoidCoordinates = (trap, scale, xOffset = 0, yOffset = 0, coordinates = []) => {
    const trapWidth = Math.max(trap.baseA, trap.baseB) * scale;
    const xTopLeft = xOffset + (trapWidth - trap.baseB * scale) / 2 + (trap.baseBHorizontalOffset || 0) * scale;
    const xTopRight = xOffset + (trapWidth + trap.baseB * scale) / 2 + (trap.baseBHorizontalOffset || 0) * scale;
    const xBottomLeft = xOffset + (trapWidth - trap.baseA * scale) / 2;
    const xBottomRight = xOffset + (trapWidth + trap.baseA * scale) / 2;
    const yTop = yOffset;
    const yBottom = yOffset + trap.height * scale;

    coordinates.push({
        topLeft: { x: xTopLeft, y: yTop },
        topRight: { x: xTopRight, y: yTop },
        bottomLeft: { x: xBottomLeft, y: yBottom },
        bottomRight: { x: xBottomRight, y: yBottom }
    });

    if (trap.successors && trap.successors.length > 0) {
        const successorWidths = trap.successors.map((s: any) => Math.max(s.baseA, s.baseB) * scale);
        const totalSuccessorWidth = successorWidths.reduce((sum, w) => sum + w, 0);
        let childXOffset = xOffset + (trapWidth - totalSuccessorWidth) / 2;

        for (let i = trap.successors.length - 1; i >= 0; i--) {
            const successor = trap.successors[i];
            const successorWidth = successorWidths[i];
            collectTrapezoidCoordinates(
                successor, 
                scale, 
                childXOffset, 
                yTop - successor.height * scale, 
                coordinates
            );
            childXOffset += successorWidth;
        }
    }
};

const renderColorworkLayersToCanvasCentered = (ctx, patternLayers, shape, x, y, displayWidth, displayHeight, scale, gauge) => {
    // Calculate actual dimensions in inches
    const widthInches = Math.max(shape.baseA, shape.baseB);
    const heightInches = shape.height;
    
    // Calculate stitch and row counts based on gauge
    const stitchesPerInch = gauge.stitchesPerFourInches / 4;
    const rowsPerInch = gauge.rowsPerFourInches / 4;
    
    const totalStitches = Math.round(widthInches * stitchesPerInch);
    const totalRows = Math.round(heightInches * rowsPerInch);
    
    // Calculate pixel size for each stitch/row in the display
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

const createCombinedGridCentered = (totalStitches, totalRows, patternLayers) => {
    // Initialize grid with transparent background
    const grid = Array(totalRows).fill().map(() => Array(totalStitches).fill('transparent'));
    
    // Process layers from bottom to top (lower priority to higher priority)
    patternLayers.sort((a, b) => a.priority - b.priority).forEach((layer: any) => {
        applyPatternLayerCentered(grid, totalStitches, totalRows, layer);
    });
    
    return grid;
};

const applyPatternLayerCentered = (grid, totalStitches, totalRows, layer) => {
    const { pattern, settings } = layer;
    
    if (!pattern || !pattern.grid || pattern.grid.length === 0) {
        return;
    }
    
        // Special handling for border patterns - they don't use the standard repeat logic
        if (pattern.metadata?.isBorderPattern) {
            const thickness = pattern.metadata.borderThickness || 1;
            const borderColorId = 1; // Border color ID
            const colorInfo = pattern.colors[borderColorId];
            
            if (colorInfo) {
                const borderColor = colorInfo.color;
                
                // For now, use rectangular border logic (shape-aware logic would need more context)
                // Apply border only to edge stitches
                for (let row = 0; row < totalRows; row++) {
                    for (let stitch = 0; stitch < totalStitches; stitch++) {
                        // Check if this stitch is on the border (within thickness of any edge)
                        const isTopEdge = row < thickness;
                        const isBottomEdge = row >= totalRows - thickness;
                        const isLeftEdge = stitch < thickness;
                        const isRightEdge = stitch >= totalStitches - thickness;
                        
                        const isBorderStitch = isTopEdge || isBottomEdge || isLeftEdge || isRightEdge;
                        
                        if (isBorderStitch && borderColor && borderColor !== 'transparent') {
                            grid[row][stitch] = borderColor;
                        }
                    }
                }
            }
            return; // Early return for border patterns
        }    const patternRows = pattern.getRowCount();
    const patternStitches = pattern.getStitchCount();
    
    if (patternRows === 0 || patternStitches === 0) {
        return;
    }
    
    const {
        repeatMode = 'both', // Default to 'both' for backward compatibility
        repeatCountX = 0, // 0 means infinite
        repeatCountY = 0, // 0 means infinite
        repeatHorizontal = true, // Fallback for legacy settings
        repeatVertical = true,   // Fallback for legacy settings
        offsetHorizontal = 0,
        offsetVertical = 0
    } = settings;
    
    // Determine if we should repeat (support both new and legacy formats)
    const shouldRepeatHorizontal = repeatMode ? 
        (repeatMode === 'x' || repeatMode === 'both') : 
        repeatHorizontal;
    const shouldRepeatVertical = repeatMode ? 
        (repeatMode === 'y' || repeatMode === 'both') : 
        repeatVertical;
    
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
            
            if (shouldRepeatHorizontal && patternStitches > 0) {
                repeatIndexX = Math.floor(adjustedStitch / patternStitches);
            }
            if (shouldRepeatVertical && patternRows > 0) {
                repeatIndexY = Math.floor(adjustedRow / patternRows);
            }
            
            // Check if we're within the allowed repeat count (0 means infinite)
            if (shouldRepeatHorizontal && repeatCountX && repeatCountX > 0 && Math.abs(repeatIndexX) >= repeatCountX) {
                continue;
            }
            if (shouldRepeatVertical && repeatCountY && repeatCountY > 0 && Math.abs(repeatIndexY) >= repeatCountY) {
                continue;
            }
            
            // Skip if outside pattern bounds and no repeat
            if (!shouldRepeatHorizontal && (adjustedStitch < 0 || adjustedStitch >= patternStitches)) {
                continue;
            }
            if (!shouldRepeatVertical && (adjustedRow < 0 || adjustedRow >= patternRows)) {
                continue;
            }
            
            // Calculate pattern coordinates with wrapping if repeat is enabled
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
            
            // Get color from pattern
            const colorId = pattern.grid[patternRow][patternStitch];
            const colorInfo = pattern.colors[colorId];
            
            if (colorInfo && colorInfo.color) {
                grid[row][stitch] = colorInfo.color;
            }
        }
    }
};

const renderHierarchyToCanvas = (
    ctx,
    trap, 
    scale, 
    xOffset = 0, 
    yOffset = 0, 
    dimensions = { minX: 0, maxX: 0, minY: 0, maxY: 0 }, 
    fillColor,
    patternLayers = [],
    gauge = null,
    borderConfig = null
) => {
    // Calculate dimensions first
    calculateTrapezoidDimensions(trap, scale, xOffset, yOffset, dimensions);

    // Render as unified shape with centered pattern and border
    renderUnifiedShapeToCanvas(ctx, trap, scale, xOffset, yOffset, fillColor, patternLayers, gauge, borderConfig);
};

const calculateTrapezoidDimensions = (trap, scale, xOffset = 0, yOffset = 0, dimensions = { minX: 0, maxX: 0, minY: 0, maxY: 0 }) => {
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
        const totalSuccessorWidth = successorWidths.reduce((sum, w) => sum + w, 0);

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

const ColorworkPanelDiagram = ({ 
    shape, 
    patternLayers = [], // Array of pattern layer objects
    gauge = null,
    label = '', 
    size = 200, 
    padding = 10,
    showPatterns = true 
}) => {
    const { token } = theme.useToken();
    const fillColor = token.colorPrimary;
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !shape) return;

        const ctx = canvas.getContext('2d');
        const devicePixelRatio = window.devicePixelRatio || 1;
        
        // Set canvas size with device pixel ratio for crisp rendering
        canvas.width = size * devicePixelRatio;
        canvas.height = size * devicePixelRatio;
        canvas.style.width = `${size}px`;
        canvas.style.height = `${size}px`;
        
        // Scale context for device pixel ratio
        ctx.scale(devicePixelRatio, devicePixelRatio);
        
        // Clear canvas
        ctx.clearRect(0, 0, size, size);

        // Extract border configuration from pattern layers if present
        let borderConfig = null;
        const borderLayer = patternLayers.find((layer: any) => layer.pattern?.metadata?.isBorderPattern);
        if (borderLayer) {
            const borderColorId = 1; // Border color ID from pattern generation
            const colorInfo = borderLayer.pattern.colors[borderColorId];
            const thickness = borderLayer.pattern.metadata.borderThickness || 1;
            const color = borderLayer.settings.colorMapping?.[borderColorId] || colorInfo?.color || '#000000';
            borderConfig = { color, thickness };
        }

        let dimensions = { minX: 0, maxX: 0, minY: 0, maxY: 0 };

        // First pass: Compute bounding box (dummy render to calculate dimensions)
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        renderHierarchyToCanvas(tempCtx, shape, 1, 0, 0, dimensions, fillColor, patternLayers, gauge, borderConfig);

        const width = dimensions.maxX - dimensions.minX;
        const height = dimensions.maxY - dimensions.minY;

        // Calculate scale factor
        const availableWidth = size - 2 * padding;
        const availableHeight = size - 2 * padding;
        const scaleFactor = Math.min(availableWidth / width, availableHeight / height);

        // Calculate scaled dimensions and translation
        const scaledWidth = width * scaleFactor;
        const scaledHeight = height * scaleFactor;

        // Adjust translation to account for negative minX and minY
        const translateX = (size - scaledWidth) / 2 - dimensions.minX * scaleFactor + padding;
        const translateY = (size - scaledHeight) / 2 - dimensions.minY * scaleFactor + padding;

        // Second pass: Render with the calculated scale and translation
        ctx.save();
        ctx.translate(translateX, translateY);
        
        dimensions = { minX: 0, maxX: 0, minY: 0, maxY: 0 };
        renderHierarchyToCanvas(
            ctx,
            shape, 
            scaleFactor, 
            0, 
            0, 
            dimensions, 
            fillColor,
            showPatterns ? patternLayers : [],
            gauge,
            borderConfig
        );
        
        ctx.restore();
        
    }, [shape, patternLayers, gauge, size, padding, showPatterns, fillColor]);

    return (
        <div style={{ width: size + padding * 2, height: size + padding * 3, float: 'left' }}>
            <canvas
                ref={canvasRef}
                style={{
                    border: '1px solid #d9d9d9',
                    borderRadius: '6px',
                    backgroundColor: '#fafafa'
                }}
            />
            {label && <div style={{ textAlign: 'center', marginTop: 4, fontSize: '12px' }}>{label}</div>}
        </div>
    );
};

export { ColorworkPanelDiagram };
