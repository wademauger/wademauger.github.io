import React, { useRef, useEffect } from 'react';
import { theme } from 'antd';

/**
 * ColorworkPanelDiagram - Canvas-based panel diagram with high performance rendering
 * Replaces SVG DOM elements with Canvas 2D context for complex colorwork visualization
 */

const renderUnifiedShapeToCanvas = (ctx, shape, scale, xOffset = 0, yOffset = 0, fillColor, patternLayers = [], gauge = null) => {
    // Collect all trapezoid coordinates into one unified path
    const allCoordinates = [];
    collectTrapezoidCoordinates(shape, scale, xOffset, yOffset, allCoordinates);
    
    if (allCoordinates.length === 0) return;
    
    // Find the bounding box of the entire shape
    let minX = Math.min(...allCoordinates.map(coord => Math.min(coord.topLeft.x, coord.topRight.x, coord.bottomLeft.x, coord.bottomRight.x)));
    let maxX = Math.max(...allCoordinates.map(coord => Math.max(coord.topLeft.x, coord.topRight.x, coord.bottomLeft.x, coord.bottomRight.x)));
    let minY = Math.min(...allCoordinates.map(coord => Math.min(coord.topLeft.y, coord.topRight.y, coord.bottomLeft.y, coord.bottomRight.y)));
    let maxY = Math.max(...allCoordinates.map(coord => Math.max(coord.topLeft.y, coord.topRight.y, coord.bottomLeft.y, coord.bottomRight.y)));
    
    // Create unified clipping path
    ctx.save();
    ctx.beginPath();
    
    // Draw each trapezoid as part of the unified path
    allCoordinates.forEach((coord, index) => {
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

    // If pattern layers are provided, render them as background with centered origin
    if (patternLayers && patternLayers.length > 0 && gauge) {
        renderColorworkLayersToCanvasCentered(
            ctx,
            patternLayers,
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

    // Draw unified outline
    ctx.strokeStyle = '#a1a8af';
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    
    allCoordinates.forEach(coord => {
        ctx.beginPath();
        ctx.moveTo(coord.topLeft.x, coord.topLeft.y);
        ctx.lineTo(coord.topRight.x, coord.topRight.y);
        ctx.lineTo(coord.bottomRight.x, coord.bottomRight.y);
        ctx.lineTo(coord.bottomLeft.x, coord.bottomLeft.y);
        ctx.closePath();
        ctx.stroke();
    });
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
        const successorWidths = trap.successors.map(s => Math.max(s.baseA, s.baseB) * scale);
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
    patternLayers.sort((a, b) => a.priority - b.priority).forEach(layer => {
        applyPatternLayerCentered(grid, totalStitches, totalRows, layer);
    });
    
    return grid;
};

const applyPatternLayerCentered = (grid, totalStitches, totalRows, layer) => {
    const { pattern, settings } = layer;
    
    if (!pattern || !pattern.grid || pattern.grid.length === 0) {
        return;
    }
    
    const patternRows = pattern.getRowCount();
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
    gauge = null
) => {
    // Calculate dimensions first
    calculateTrapezoidDimensions(trap, scale, xOffset, yOffset, dimensions);

    // Render as unified shape with centered pattern
    renderUnifiedShapeToCanvas(ctx, trap, scale, xOffset, yOffset, fillColor, patternLayers, gauge);
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
        const successorWidths = trap.successors.map(s => Math.max(s.baseA, s.baseB) * scale);
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

        let dimensions = { minX: 0, maxX: 0, minY: 0, maxY: 0 };

        // First pass: Compute bounding box (dummy render to calculate dimensions)
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        renderHierarchyToCanvas(tempCtx, shape, 1, 0, 0, dimensions, fillColor);

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
            gauge
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
