import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Card, Button, Select, Radio, Row, Col, Space, Typography, Divider, ColorPicker, InputNumber, Switch, Collapse, Slider, List } from 'antd';
import { ZoomInOutlined, ZoomOutOutlined, ExpandOutlined, DragOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { ColorworkPattern } from '../models/ColorworkPattern.js';
import { Gauge } from '../models/Gauge.js';
import { draggable, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import './ColorworkCanvasEditor.css';

const { Title, Text } = Typography;
const { Option } = Select;

/**
 * ColorworkCanvasEditor - Full-page canvas-based editor with pan/zoom controls
 * Layout matches colorwork-designer with canvas front-and-center and side panel controls
 */
const ColorworkCanvasEditor = ({
    shape,
    patternLayers = [],
    gauge = null,
    onLayersChange = () => {},
    onGaugeChange = () => {},
    renderToolbarControls = null // Optional function to render zoom controls in parent toolbar
}) => {
    const canvasRef = useRef(null);
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
    const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });

    // Pattern creation functions (same as original)
    const createDefaultPatterns = () => ({
        'solid': { name: 'Solid Color', pattern: createSolidPattern() },
        'stripes': { name: 'Stripes', pattern: createStripesPattern() },
        'checkerboard': { name: 'Checkerboard', pattern: createCheckerboardPattern() },
        'argyle': { name: 'Argyle', pattern: createArgylePattern() }
    });

    const [availablePatterns] = useState(createDefaultPatterns());
    const [selectedPatternKey, setSelectedPatternKey] = useState('checkerboard');
    const [collapsedLayers, setCollapsedLayers] = useState(new Set()); // Track collapsed layers

    // Canvas rendering functions (adapted from ColorworkPanelDiagram)
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
            // Calculate full panel dimensions for pattern rendering
            let fullPanelDimensions = { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity };
            calculateTrapezoidDimensions(shape, 1, 0, 0, fullPanelDimensions);
            
            renderColorworkLayersToCanvasCentered(
                ctx,
                patternLayers,
                shape,
                minX, minY, maxX - minX, maxY - minY,
                scale,
                gauge,
                fullPanelDimensions // Pass the full panel dimensions
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

    const renderColorworkLayersToCanvasCentered = (ctx, patternLayers, shape, x, y, displayWidth, displayHeight, scale, gauge, fullPanelDimensions = null) => {
        // Use the full panel dimensions instead of just the top-level shape
        const widthInches = fullPanelDimensions ? (fullPanelDimensions.maxX - fullPanelDimensions.minX) : Math.max(shape.baseA, shape.baseB);
        const heightInches = fullPanelDimensions ? (fullPanelDimensions.maxY - fullPanelDimensions.minY) : shape.height;
        
        // Calculate stitch and row counts based on gauge
        const stitchesPerInch = gauge.stitchesPerFourInches / 4;
        const rowsPerInch = gauge.rowsPerFourInches / 4;
        
        const totalStitches = Math.round(widthInches * stitchesPerInch);
        const totalRows = Math.round(heightInches * rowsPerInch);
        
        // Calculate pixel size for each stitch/row to match the ruler scale
        // The scale factor maps shape inches to screen pixels, so:
        // - 1 inch of shape = scale pixels on screen
        // - 1 stitch = scale pixels / stitches per inch
        const stitchPixelWidth = scale / stitchesPerInch;
        const rowPixelHeight = scale / rowsPerInch;
        
        // Create a combined pattern grid for all layers with centered origin
        const combinedGrid = createCombinedGridCentered(totalStitches, totalRows, patternLayers, displayWidth, displayHeight);
        
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

    const createCombinedGridCentered = (totalStitches, totalRows, patternLayers, displayWidth, displayHeight) => {
        // Initialize grid with transparent background
        const grid = Array(totalRows).fill().map(() => Array(totalStitches).fill('transparent'));
        
        // Process layers from bottom to top (lower priority to higher priority)
        patternLayers.sort((a, b) => a.priority - b.priority).forEach(layer => {
            applyPatternLayerCentered(grid, totalStitches, totalRows, layer, displayWidth, displayHeight);
        });
        
        return grid;
    };

    const applyPatternLayerCentered = (grid, totalStitches, totalRows, layer, displayWidth, displayHeight) => {
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
                    // Calculate the range of valid repeat indices for centering
                    const halfRepeats = Math.floor(repeatCountX / 2);
                    const minRepeatX = repeatCountX % 2 === 0 ? -halfRepeats : -halfRepeats;
                    const maxRepeatX = repeatCountX % 2 === 0 ? halfRepeats - 1 : halfRepeats;
                    
                    if (repeatIndexX < minRepeatX || repeatIndexX > maxRepeatX) {
                        continue;
                    }
                }
                if (repeatVertical && repeatCountY > 0) {
                    // Calculate the range of valid repeat indices for centering
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
                    if (layerColor) {
                        grid[row][stitch] = layerColor;
                    }
                }
            }
        }
    };

const drawRulers = (ctx, canvasWidth, canvasHeight, shape, zoom, pan, scaleFactor, dimensions, centerX, centerY, actualWidthInches, actualHeightInches) => {
    const devicePixelRatio = window.devicePixelRatio || 1;
    const rulerWidth = 30 * devicePixelRatio;
    const rulerHeight = 30 * devicePixelRatio;
    
    // Calculate the pixel size per inch after scaling
    // This should match the actual zoom and scale for accurate ruler measurement
    const pixelsPerInch = scaleFactor * zoom * devicePixelRatio;
    
    // Save context
    ctx.save();
    
    // Reset transform to draw rulers in screen space
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    
    // Draw ruler backgrounds - extending to full width/height
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, canvasHeight - rulerHeight / devicePixelRatio, canvasWidth, rulerHeight / devicePixelRatio); // Bottom ruler (full width)
    ctx.fillRect(0, 0, rulerWidth / devicePixelRatio, canvasHeight); // Left ruler (full height)
    
    // Draw ruler borders
    ctx.strokeStyle = '#d0d0d0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    // Horizontal line separating bottom ruler from canvas
    ctx.moveTo(0, canvasHeight - rulerHeight / devicePixelRatio);
    ctx.lineTo(canvasWidth, canvasHeight - rulerHeight / devicePixelRatio);
    // Vertical line separating left ruler from canvas
    ctx.moveTo(rulerWidth / devicePixelRatio, 0);
    ctx.lineTo(rulerWidth / devicePixelRatio, canvasHeight);
    ctx.stroke();
    
    // Show dimensions along the ruler edges instead of in corner
    ctx.fillStyle = '#666';
    ctx.font = `${10}px Arial`;
    
    // Width measurement on top ruler
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Draw horizontal ruler (bottom) - only spanning panel width
    // Starting from 0 at bottom-left corner of panel
    ctx.fillStyle = '#333';
    ctx.font = `${10}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Calculate the shape bounds in screen coordinates to determine panel area
    const shapeScreenWidth = (dimensions.maxX - dimensions.minX) * scaleFactor * zoom;
    const shapeScreenHeight = (dimensions.maxY - dimensions.minY) * scaleFactor * zoom;
    const shapeCenterX = centerX;
    const shapeCenterY = centerY;
    const shapeLeft = shapeCenterX - shapeScreenWidth / 2;
    const shapeRight = shapeCenterX + shapeScreenWidth / 2;
    const shapeTop = shapeCenterY - shapeScreenHeight / 2;
    const shapeBottom = shapeCenterY + shapeScreenHeight / 2;
    
    // Origin should be at bottom-left of the shape (0,0)
    const originX = shapeLeft;
    const originY = shapeBottom;
    
    // Only draw ruler marks within the panel width (0 to actualWidthInches)
    const maxInchX = Math.ceil(actualWidthInches);
    const maxInchY = Math.ceil(actualHeightInches);
    
    // Draw horizontal ruler marks from 0 to panel width
    for (let inch = 0; inch <= maxInchX; inch++) {
        const screenX = originX + (inch * pixelsPerInch / devicePixelRatio);
        
        // More lenient bounds checking for tick marks
        if (screenX >= rulerWidth / devicePixelRatio && screenX <= canvasWidth) {
            // Draw tick mark at bottom
            ctx.strokeStyle = '#666';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(screenX, canvasHeight - 8);
            ctx.lineTo(screenX, canvasHeight);
            ctx.stroke();
            
            // Draw label at bottom
            ctx.fillStyle = '#333';
            ctx.fillText(inch.toString(), screenX, canvasHeight - 15);
        }
        
        // Draw half-inch marks at bottom
        const halfInchX = screenX + (pixelsPerInch / devicePixelRatio / 2);
        if (halfInchX >= rulerWidth / devicePixelRatio && halfInchX <= canvasWidth && inch < maxInchX) {
            ctx.strokeStyle = '#999';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(halfInchX, canvasHeight - 4);
            ctx.lineTo(halfInchX, canvasHeight);
            ctx.stroke();
        }
        
        // Draw quarter-inch marks at bottom
        if (inch < maxInchX) {
            const quarterInchX1 = screenX + (pixelsPerInch / devicePixelRatio / 4);
            const quarterInchX2 = screenX + (3 * pixelsPerInch / devicePixelRatio / 4);
            
            if (quarterInchX1 >= rulerWidth / devicePixelRatio && quarterInchX1 <= canvasWidth) {
                ctx.strokeStyle = '#ccc';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(quarterInchX1, canvasHeight - 2);
                ctx.lineTo(quarterInchX1, canvasHeight);
                ctx.stroke();
            }
            
            if (quarterInchX2 >= rulerWidth / devicePixelRatio && quarterInchX2 <= canvasWidth) {
                ctx.strokeStyle = '#ccc';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(quarterInchX2, canvasHeight - 2);
                ctx.lineTo(quarterInchX2, canvasHeight);
                ctx.stroke();
            }
        }
    }
    
    // Show total width dimension after the last tick at bottom
    const totalWidthX = originX + (actualWidthInches * pixelsPerInch / devicePixelRatio);
    if (totalWidthX >= rulerWidth / devicePixelRatio && totalWidthX <= canvasWidth) {
        ctx.fillStyle = '#555';
        ctx.font = `italic ${10}px Arial`;
        ctx.fillText(`${actualWidthInches.toFixed(1)}"`, totalWidthX + 20, canvasHeight - 10);
    }
    
    // Draw vertical ruler (left) - only spanning panel height  
    // With origin at bottom-left (Y increases upward from 0)
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Draw vertical ruler marks from 0 to panel height
    for (let inch = 0; inch <= maxInchY; inch++) {
        const screenY = originY - (inch * pixelsPerInch / devicePixelRatio);
        
        // More lenient bounds checking for tick marks
        if (screenY >= rulerHeight / devicePixelRatio && screenY <= canvasHeight) {
            // Draw tick mark
            ctx.strokeStyle = '#666';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(rulerWidth / devicePixelRatio - 8, screenY);
            ctx.lineTo(rulerWidth / devicePixelRatio, screenY);
            ctx.stroke();
            
            // Draw label (rotated for vertical text)
            ctx.save();
            ctx.translate(15, screenY);
            ctx.rotate(-Math.PI / 2);
            ctx.fillStyle = '#333';
            ctx.fillText(inch.toString(), 0, 0);
            ctx.restore();
        }
        
        // Draw half-inch marks
        const halfInchY = screenY - (pixelsPerInch / devicePixelRatio / 2);
        if (halfInchY >= rulerHeight / devicePixelRatio && halfInchY <= canvasHeight && inch < maxInchY) {
            ctx.strokeStyle = '#999';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(rulerWidth / devicePixelRatio - 4, halfInchY);
            ctx.lineTo(rulerWidth / devicePixelRatio, halfInchY);
            ctx.stroke();
        }
        
        // Draw quarter-inch marks
        if (inch < maxInchY) {
            const quarterInchY1 = screenY - (pixelsPerInch / devicePixelRatio / 4);
            const quarterInchY2 = screenY - (3 * pixelsPerInch / devicePixelRatio / 4);
            
            if (quarterInchY1 >= rulerHeight / devicePixelRatio && quarterInchY1 <= canvasHeight) {
                ctx.strokeStyle = '#ccc';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(rulerWidth / devicePixelRatio - 2, quarterInchY1);
                ctx.lineTo(rulerWidth / devicePixelRatio, quarterInchY1);
                ctx.stroke();
            }
            
            if (quarterInchY2 >= rulerHeight / devicePixelRatio && quarterInchY2 <= canvasHeight) {
                ctx.strokeStyle = '#ccc';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(rulerWidth / devicePixelRatio - 2, quarterInchY2);
                ctx.lineTo(rulerWidth / devicePixelRatio, quarterInchY2);
                ctx.stroke();
            }
        }
    }
    
    // Show total height dimension after the last tick
    const totalHeightY = originY - (actualHeightInches * pixelsPerInch / devicePixelRatio);
    if (totalHeightY >= rulerHeight / devicePixelRatio && totalHeightY <= canvasHeight) {
        ctx.save();
        ctx.translate(10, totalHeightY - 20);
        ctx.rotate(-Math.PI / 2);
        ctx.fillStyle = '#555';
        ctx.font = `italic ${10}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(`${actualHeightInches.toFixed(1)}"`, 0, 0);
        ctx.restore();
    }
    
    // Restore context
    ctx.restore();
};

    const renderTrapezoidWithPattern = (ctx, trap, scale, xOffset = 0, yOffset = 0, fillColor, patternLayers = [], gauge = null) => {
        const trapWidth = Math.max(trap.baseA, trap.baseB) * scale;
        const xTopLeft = xOffset + (trapWidth - trap.baseB * scale) / 2 + (trap.baseBHorizontalOffset || 0) * scale;
        const xTopRight = xOffset + (trapWidth + trap.baseB * scale) / 2 + (trap.baseBHorizontalOffset || 0) * scale;
        const xBottomLeft = xOffset + (trapWidth - trap.baseA * scale) / 2;
        const xBottomRight = xOffset + (trapWidth + trap.baseA * scale) / 2;
        const yTop = yOffset;
        const yBottom = yOffset + trap.height * scale;

        // Create clipping path for this individual trapezoid
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(xTopLeft, yTop);
        ctx.lineTo(xTopRight, yTop);
        ctx.lineTo(xBottomRight, yBottom);
        ctx.lineTo(xBottomLeft, yBottom);
        ctx.closePath();
        ctx.clip();

        // If pattern layers are provided, render them for this trapezoid
        if (patternLayers && patternLayers.length > 0 && gauge) {
            // Create a temporary shape object for this trapezoid
            const trapShape = {
                baseA: trap.baseA,
                baseB: trap.baseB,
                height: trap.height,
                baseBHorizontalOffset: trap.baseBHorizontalOffset || 0
            };
            
            renderColorworkLayersToCanvasCentered(
                ctx,
                patternLayers,
                trapShape,
                xBottomLeft, yTop, xBottomRight - xBottomLeft, yBottom - yTop,
                scale,
                gauge
            );
        } else {
            // Fill with solid color if no pattern
            ctx.fillStyle = fillColor;
            ctx.fill();
        }

        // Draw border
        ctx.restore();
        ctx.strokeStyle = '#1890ff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(xTopLeft, yTop);
        ctx.lineTo(xTopRight, yTop);
        ctx.lineTo(xBottomRight, yBottom);
        ctx.lineTo(xBottomLeft, yBottom);
        ctx.closePath();
        ctx.stroke();
    };

const renderHierarchyToCanvas = (ctx, trap, scale, xOffset = 0, yOffset = 0, dimensions = { minX: 0, maxX: 0, minY: 0, maxY: 0 }, fillColor, patternLayers = [], gauge = null) => {
        // Calculate dimensions first
        calculateTrapezoidDimensions(trap, scale, xOffset, yOffset, dimensions);

        // Render each trapezoid individually with its own pattern
        renderTrapezoidWithPattern(ctx, trap, scale, xOffset, yOffset, fillColor, patternLayers, gauge);
        
        // Render successors recursively
        if (trap.successors && trap.successors.length > 0) {
            const trapWidth = Math.max(trap.baseA, trap.baseB) * scale;
            const successorWidths = trap.successors.map(s => Math.max(s.baseA, s.baseB) * scale);
            const totalSuccessorWidth = successorWidths.reduce((sum, w) => sum + w, 0);
            let childXOffset = xOffset + (trapWidth - totalSuccessorWidth) / 2;
            const yTop = yOffset;

            for (let i = trap.successors.length - 1; i >= 0; i--) {
                const successor = trap.successors[i];
                const successorWidth = successorWidths[i];

                renderHierarchyToCanvas(
                    ctx,
                    successor, 
                    scale, 
                    childXOffset, 
                    yTop - successor.height * scale, 
                    dimensions,
                    fillColor,
                    patternLayers,
                    gauge
                );

                childXOffset += successorWidth;
            }
        }
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

    // Canvas event handlers
    const handleMouseDown = (e) => {
        setIsDragging(true);
        setLastMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        
        const deltaX = e.clientX - lastMousePos.x;
        const deltaY = e.clientY - lastMousePos.y;
        
        setPan(prev => ({
            x: prev.x + deltaX,
            y: prev.y + deltaY
        }));
        
        setLastMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleWheel = (e) => {
        e.preventDefault();
        const delta = e.deltaY * -0.01;
        const newZoom = Math.min(Math.max(0.1, zoom + delta), 5);
        setZoom(newZoom);
    };

    const resetView = () => {
        setZoom(1);
        setPan({ x: 0, y: 0 });
    };

    // Canvas rendering effect
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !shape) return;

        const ctx = canvas.getContext('2d');
        const devicePixelRatio = window.devicePixelRatio || 1;
        
        // Ruler constants
        const rulerOffsetX = 30;
        const rulerOffsetY = 30;
        
        // Set canvas size with device pixel ratio for crisp rendering
        canvas.width = canvasSize.width * devicePixelRatio;
        canvas.height = canvasSize.height * devicePixelRatio;
        canvas.style.width = `${canvasSize.width}px`;
        canvas.style.height = `${canvasSize.height}px`;
        
        // Scale context for device pixel ratio
        ctx.scale(devicePixelRatio, devicePixelRatio);
        
        // Clear canvas
        ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
        
        // Apply zoom and pan transforms
        ctx.save();
        
        // Add offset for rulers (move content area to account for ruler space)
        ctx.translate(
            (canvasSize.width - rulerOffsetX) / 2 + pan.x + rulerOffsetX, 
            (canvasSize.height - rulerOffsetY) / 2 + pan.y + rulerOffsetY
        );
        ctx.scale(zoom, zoom);

        let dimensions = { minX: 0, maxX: 0, minY: 0, maxY: 0 };

        // First pass: Compute bounding box (dummy render to calculate dimensions)
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        renderHierarchyToCanvas(tempCtx, shape, 1, 0, 0, dimensions, '#1890ff');

        const width = dimensions.maxX - dimensions.minX;
        const height = dimensions.maxY - dimensions.minY;

        // Calculate scale factor to fit in view (accounting for ruler space)
        const availableWidth = (canvasSize.width - rulerOffsetX) * 0.8; // Leave some margin
        const availableHeight = (canvasSize.height - rulerOffsetY) * 0.8;
        const scaleFactor = Math.min(availableWidth / width, availableHeight / height);

        // Center the shape
        const translateX = -dimensions.minX * scaleFactor - width * scaleFactor / 2;
        const translateY = -dimensions.minY * scaleFactor - height * scaleFactor / 2;

        ctx.translate(translateX, translateY);
        
        // Save the calculated dimensions for the rulers
        const calculatedDimensions = { ...dimensions };
        
        // Second pass: Render with the calculated scale using unified shape rendering
        // This ensures continuous pattern flow across all trapezoids
        renderUnifiedShapeToCanvas(
            ctx,
            shape, 
            scaleFactor, 
            0, 
            0, 
            '#1890ff',
            patternLayers,
            gauge
        );
        
        ctx.restore();
        
        // Calculate actual dimensions in inches for the rulers
        let actualDimensions = { minX: 0, maxX: 0, minY: 0, maxY: 0 };
        calculateTrapezoidDimensions(shape, 1, 0, 0, actualDimensions); // Scale=1 for true dimensions
        const actualWidthInches = actualDimensions.maxX - actualDimensions.minX;
        const actualHeightInches = actualDimensions.maxY - actualDimensions.minY;
        
        // Draw rulers after restoring context (so they're drawn in screen space)
        const adjustedCenterX = (canvasSize.width - rulerOffsetX) / 2 + pan.x + rulerOffsetX;
        const adjustedCenterY = (canvasSize.height - rulerOffsetY) / 2 + pan.y + rulerOffsetY;
        drawRulers(ctx, canvasSize.width, canvasSize.height, shape, zoom, { x: pan.x, y: pan.y }, scaleFactor, calculatedDimensions, adjustedCenterX, adjustedCenterY, actualWidthInches, actualHeightInches);
        
    }, [shape, patternLayers, gauge, zoom, pan, canvasSize]);

    // Handle canvas resize
    useEffect(() => {
        const updateCanvasSize = () => {
            const container = document.querySelector('.canvas-container');
            if (container) {
                setCanvasSize({
                    width: container.clientWidth - 20,
                    height: container.clientHeight - 20
                });
            }
        };

        updateCanvasSize();
        window.addEventListener('resize', updateCanvasSize);
        return () => window.removeEventListener('resize', updateCanvasSize);
    }, []);

    // Pattern layer management
    const handleLayerSettingChange = (layerId, setting, value) => {
        const updatedLayers = patternLayers.map(layer => {
            if (layer.id === layerId) {
                return {
                    ...layer,
                    settings: { ...layer.settings, [setting]: value }
                };
            }
            return layer;
        });
        onLayersChange(updatedLayers);
    };

    const handleLayerColorChange = (layerId, colorId, newColor) => {
        // Convert color to hex string if it's a color object
        const colorValue = typeof newColor === 'string' ? newColor : newColor.toHexString();
        
        const updatedLayers = patternLayers.map(layer => {
            if (layer.id === layerId) {
                const newColorMapping = {
                    ...layer.settings.colorMapping,
                    [colorId]: colorValue
                };
                return {
                    ...layer,
                    settings: {
                        ...layer.settings,
                        colorMapping: newColorMapping
                    }
                };
            }
            return layer;
        });
        onLayersChange(updatedLayers);
    };

    const handleLayerReorder = useCallback((draggedLayerId, targetLayerId) => {
        onLayersChange(prevLayers => {
            const draggedIndex = prevLayers.findIndex(layer => layer.id === draggedLayerId);
            const targetIndex = prevLayers.findIndex(layer => layer.id === targetLayerId);
            
            if (draggedIndex === -1 || targetIndex === -1) return prevLayers;
            
            const newLayers = [...prevLayers];
            const [draggedLayer] = newLayers.splice(draggedIndex, 1);
            newLayers.splice(targetIndex, 0, draggedLayer);
            
            return newLayers;
        });
    }, [onLayersChange]);

    const handleLayerCollapse = useCallback((layerId) => {
        setCollapsedLayers(prev => {
            const newCollapsed = new Set(prev);
            if (newCollapsed.has(layerId)) {
                newCollapsed.delete(layerId);
            } else {
                newCollapsed.add(layerId);
            }
            return newCollapsed;
        });
    }, []);

    const addPatternLayer = () => {
        const newLayer = {
            id: Date.now(),
            name: `Layer ${patternLayers.length + 1}`,
            pattern: availablePatterns.checkerboard.pattern,
            priority: patternLayers.length + 1,
            settings: {
                repeatMode: 'none', // 'none', 'x', 'y', 'both'
                repeatCountX: 0, // 0 means infinite
                repeatCountY: 0, // 0 means infinite
                offsetHorizontal: 0,
                offsetVertical: 0,
                colorMapping: {} // Per-layer color overrides
            }
        };
        // Add new layer to the top of the stack
        onLayersChange([newLayer, ...patternLayers]);
    };

    const removePatternLayer = (layerId) => {
        const updatedLayers = patternLayers.filter(layer => layer.id !== layerId);
        onLayersChange(updatedLayers);
    };

    const moveLayer = (fromIndex, toIndex) => {
        const newLayers = [...patternLayers];
        const [movedLayer] = newLayers.splice(fromIndex, 1);
        newLayers.splice(toIndex, 0, movedLayer);
        
        // Update priorities based on new order
        const updatedLayers = newLayers.map((layer, index) => ({
            ...layer,
            priority: newLayers.length - index // Higher index = higher priority (top of stack)
        }));
        
        onLayersChange(updatedLayers);
    };

    const handlePatternChangeForLayer = (layerId, patternKey) => {
        const pattern = availablePatterns[patternKey]?.pattern;
        if (pattern) {
            const updatedLayers = patternLayers.map(layer => {
                if (layer.id === layerId) {
                    return { 
                        ...layer, 
                        pattern,
                        settings: {
                            ...layer.settings,
                            colorMapping: {} // Reset color mapping when changing patterns
                        }
                    };
                }
                return layer;
            });
            onLayersChange(updatedLayers);
        }
    };

    // Draggable Layer Item Component
    const DraggableLayerItem = ({ layer, index, children }) => {
        const layerRef = useRef(null);
        const [isDraggedOver, setIsDraggedOver] = useState(false);

        useEffect(() => {
            const element = layerRef.current;
            if (!element) return;

            // Set up draggable
            const draggableCleanup = draggable({
                element,
                getInitialData: () => ({ layerId: layer.id, type: 'layer' }),
                onDragStart: () => {
                    element.style.opacity = '0.5';
                },
                onDrop: () => {
                    element.style.opacity = '1';
                }
            });

            // Set up drop target
            const dropTargetCleanup = dropTargetForElements({
                element,
                onDragEnter: () => setIsDraggedOver(true),
                onDragLeave: () => setIsDraggedOver(false),
                onDrop: ({ source }) => {
                    setIsDraggedOver(false);
                    const draggedLayerId = source.data.layerId;
                    if (draggedLayerId && draggedLayerId !== layer.id) {
                        handleLayerReorder(draggedLayerId, layer.id);
                    }
                },
                canDrop: ({ source }) => {
                    return source.data.type === 'layer' && source.data.layerId !== layer.id;
                }
            });

            return () => {
                draggableCleanup();
                dropTargetCleanup();
            };
        }, [layer.id]);

        return (
            <div 
                ref={layerRef}
                style={{
                    marginBottom: 8,
                    border: isDraggedOver ? '2px dashed #1890ff' : 'none',
                    borderRadius: isDraggedOver ? '4px' : '0',
                    transition: 'all 0.2s ease'
                }}
            >
                {children}
            </div>
        );
    };

    return (
        <div className="colorwork-canvas-editor">
            {/* Zoom controls integrated at top */}
            <div className="canvas-header" style={{ 
                display: 'flex', 
                justifyContent: 'flex-end', 
                alignItems: 'center', 
                padding: '8px 16px', 
                borderBottom: '1px solid #f0f0f0',
                background: '#fafafa'
            }}>
                <Space>
                    <Button 
                        icon={<ZoomInOutlined />} 
                        onClick={() => setZoom(prev => Math.min(prev * 1.2, 5))}
                        size="small"
                    >
                        Zoom In
                    </Button>
                    <Button 
                        icon={<ZoomOutOutlined />} 
                        onClick={() => setZoom(prev => Math.max(prev / 1.2, 0.1))}
                        size="small"
                    >
                        Zoom Out
                    </Button>
                    <Slider
                        min={0.1}
                        max={5}
                        step={0.1}
                        value={zoom}
                        onChange={setZoom}
                        style={{ width: 100 }}
                    />
                    <Button 
                        icon={<ExpandOutlined />} 
                        onClick={resetView}
                        size="small"
                    >
                        Reset View
                    </Button>
                    <Text>Zoom: {Math.round(zoom * 100)}%</Text>
                </Space>
            </div>
            
            <div className="canvas-main-layout">
                {/* Main canvas area */}
                <div className="canvas-container">
                    <canvas
                        ref={canvasRef}
                        className="main-canvas"
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        onWheel={handleWheel}
                        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
                    />
                </div>

                {/* Side panel with controls */}
                <div className="side-panel">
                    <Card title="Pattern Settings" size="small">
                        <Space direction="vertical" style={{ width: '100%' }} size="small">
                            <Button 
                                type="primary" 
                                icon={<PlusOutlined />}
                                onClick={addPatternLayer} 
                                style={{ width: '100%' }}
                                size="small"
                            >
                                + New Layer
                            </Button>
                            
                            <div className="layers-list">
                                {patternLayers.map((layer, index) => (
                                    <DraggableLayerItem key={layer.id} layer={layer} index={index}>
                                        <Collapse
                                            size="small"
                                            ghost
                                            activeKey={collapsedLayers.has(layer.id) ? [] : [layer.id]}
                                            onChange={() => handleLayerCollapse(layer.id)}
                                            items={[
                                                {
                                                    key: layer.id,
                                                    label: (
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                                            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                                <DragOutlined className="drag-handle" style={{ cursor: 'grab' }} />
                                                                {layer.name}
                                                            </span>
                                                            <Button 
                                                                size="small" 
                                                                danger 
                                                                type="text"
                                                                icon={<DeleteOutlined />}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    removePatternLayer(layer.id);
                                                                }}
                                                                disabled={patternLayers.length === 1}
                                                            />
                                                        </div>
                                                    ),
                                                    children: (
                                                        <Space direction="vertical" style={{ width: '100%' }} size="small">
                                            <div>
                                                <Text style={{ fontSize: '12px' }}>Pattern:</Text>
                                                <Select
                                                    value={Object.keys(availablePatterns).find(key => 
                                                        availablePatterns[key].pattern === layer.pattern
                                                    ) || 'checkerboard'}
                                                    onChange={(patternKey) => handlePatternChangeForLayer(layer.id, patternKey)}
                                                    style={{ width: '100%' }}
                                                    size="small"
                                                >
                                                    {Object.entries(availablePatterns).map(([key, pattern]) => (
                                                        <Option key={key} value={key}>{pattern.name}</Option>
                                                    ))}
                                                </Select>
                                            </div>
                                            
                                            <div>
                                                <Text style={{ fontSize: '12px' }}>Repeat:</Text>
                                                <Select
                                                    value={layer.settings.repeatMode || 'none'}
                                                    onChange={(value) => handleLayerSettingChange(layer.id, 'repeatMode', value)}
                                                    style={{ width: '100%' }}
                                                    size="small"
                                                >
                                                    <Option value="none">Non-repeating</Option>
                                                    <Option value="x">Repeat X</Option>
                                                    <Option value="y">Repeat Y</Option>
                                                    <Option value="both">Repeat X and Y</Option>
                                                </Select>
                                            </div>
                                            
                                            {(layer.settings.repeatMode === 'x' || layer.settings.repeatMode === 'both') && (
                                                <div>
                                                    <Text style={{ fontSize: '12px' }}>X Repeats (0=infinity):</Text>
                                                    <InputNumber
                                                        value={layer.settings.repeatCountX || 0}
                                                        onChange={(value) => handleLayerSettingChange(layer.id, 'repeatCountX', value || 0)}
                                                        min={0}
                                                        max={50}
                                                        size="small"
                                                        style={{ width: '100%' }}
                                                        formatter={(value) => value === 0 ? 'infinity' : value}
                                                        parser={(value) => value === 'infinity' ? 0 : parseInt(value) || 0}
                                                    />
                                                </div>
                                            )}
                                            
                                            {(layer.settings.repeatMode === 'y' || layer.settings.repeatMode === 'both') && (
                                                <div>
                                                    <Text style={{ fontSize: '12px' }}>Y Repeats (0=infinity):</Text>
                                                    <InputNumber
                                                        value={layer.settings.repeatCountY || 0}
                                                        onChange={(value) => handleLayerSettingChange(layer.id, 'repeatCountY', value || 0)}
                                                        min={0}
                                                        max={50}
                                                        size="small"
                                                        style={{ width: '100%' }}
                                                        formatter={(value) => value === 0 ? 'infinity' : value}
                                                        parser={(value) => value === 'infinity' ? 0 : parseInt(value) || 0}
                                                    />
                                                </div>
                                            )}
                                            
                                            <Row gutter={4}>
                                                <Col span={12}>
                                                    <Text style={{ fontSize: '12px' }}>H Offset:</Text>
                                                    <InputNumber
                                                        value={layer.settings.offsetHorizontal}
                                                        onChange={(value) => handleLayerSettingChange(layer.id, 'offsetHorizontal', value || 0)}
                                                        size="small"
                                                        style={{ width: '100%' }}
                                                    />
                                                </Col>
                                                <Col span={12}>
                                                    <Text style={{ fontSize: '12px' }}>V Offset:</Text>
                                                    <InputNumber
                                                        value={layer.settings.offsetVertical}
                                                        onChange={(value) => handleLayerSettingChange(layer.id, 'offsetVertical', value || 0)}
                                                        size="small"
                                                        style={{ width: '100%' }}
                                                    />
                                                </Col>
                                            </Row>
                                            
                                            <div>
                                                <Text style={{ fontSize: '12px' }}>Color Assignment:</Text>
                                                <div style={{ marginTop: 4 }}>
                                                    {layer.pattern && layer.pattern.colors && Object.entries(layer.pattern.colors).map(([colorId, colorInfo]) => (
                                                        <div key={colorId} style={{ marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                                                            <Text style={{ minWidth: 30, fontSize: '11px' }}>{colorInfo.label}:</Text>
                                                            <ColorPicker
                                                                value={layer.settings.colorMapping?.[colorId] || colorInfo.color}
                                                                onChange={(newColor) => handleLayerColorChange(layer.id, colorId, newColor)}
                                                                showText={false}
                                                                size="small"
                                                                style={{ flex: 1 }}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                                        </Space>
                                                    )
                                                }
                                            ]}
                                        />
                                    </DraggableLayerItem>
                                ))}
                            </div>
                            
                            <Divider style={{ margin: '8px 0' }} />
                        </Space>
                    </Card>

                    <Card title="Gauge Settings" size="small" style={{ marginTop: 8 }}>
                        <Space direction="vertical" style={{ width: '100%' }} size="small">
                            <div>
                                <Text style={{ fontSize: '12px' }}>Stitches per 4":</Text>
                                <InputNumber
                                    value={gauge?.stitchesPerFourInches || 19}
                                    onChange={(value) => onGaugeChange(new Gauge(value || 19, gauge?.rowsPerFourInches || 30))}
                                    min={10}
                                    max={40}
                                    style={{ width: '100%' }}
                                    size="small"
                                />
                            </div>
                            <div>
                                <Text style={{ fontSize: '12px' }}>Rows per 4":</Text>
                                <InputNumber
                                    value={gauge?.rowsPerFourInches || 30}
                                    onChange={(value) => onGaugeChange(new Gauge(gauge?.stitchesPerFourInches || 19, value || 30))}
                                    min={20}
                                    max={60}
                                    style={{ width: '100%' }}
                                    size="small"
                                />
                            </div>
                        </Space>
                    </Card>
                </div>
            </div>
        </div>
    );
};

// Helper pattern creation functions
function createSolidPattern() {
    return new ColorworkPattern(
        [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ],
        { 0: { id: 0, label: 'Color 1', color: '#ffffff' } },
        { width: 4, height: 4 }
    );
}

function createStripesPattern() {
    return new ColorworkPattern(
        [
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0],
            [1, 1, 1, 1]
        ],
        { 
            0: { id: 0, label: 'Color 1', color: '#ffffff' },
            1: { id: 1, label: 'Color 2', color: '#000000' }
        },
        { width: 4, height: 4 }
    );
}

function createCheckerboardPattern() {
    return new ColorworkPattern(
        [
            [0, 1, 0, 1, 0, 1, 0, 1],
            [1, 0, 1, 0, 1, 0, 1, 0],
            [0, 1, 0, 1, 0, 1, 0, 1],
            [1, 0, 1, 0, 1, 0, 1, 0],
            [0, 1, 0, 1, 0, 1, 0, 1],
            [1, 0, 1, 0, 1, 0, 1, 0],
            [0, 1, 0, 1, 0, 1, 0, 1],
            [1, 0, 1, 0, 1, 0, 1, 0]
        ],
        { 
            0: { id: 0, label: 'Color 1', color: '#ffffff' },
            1: { id: 1, label: 'Color 2', color: '#000000' }
        },
        { width: 8, height: 8 }
    );
}

function createArgylePattern() {
    return new ColorworkPattern(
        [
            [0, 0, 1, 1, 1, 1, 0, 0],
            [0, 1, 1, 2, 2, 1, 1, 0],
            [1, 1, 2, 2, 2, 2, 1, 1],
            [1, 2, 2, 0, 0, 2, 2, 1],
            [1, 2, 2, 0, 0, 2, 2, 1],
            [1, 1, 2, 2, 2, 2, 1, 1],
            [0, 1, 1, 2, 2, 1, 1, 0],
            [0, 0, 1, 1, 1, 1, 0, 0]
        ],
        { 
            0: { id: 0, label: 'Color 1', color: '#ffffff' },
            1: { id: 1, label: 'Color 2', color: '#ff0000' },
            2: { id: 2, label: 'Color 3', color: '#0000ff' }
        },
        { width: 8, height: 8 }
    );
}

export default ColorworkCanvasEditor;
