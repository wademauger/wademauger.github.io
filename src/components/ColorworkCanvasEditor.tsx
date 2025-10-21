import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { Card, Button, Select, Row, Col, Space, Typography, Divider, ColorPicker, InputNumber, Collapse, Slider } from 'antd';
import { ZoomInOutlined, ZoomOutOutlined, ExpandOutlined, DragOutlined, PlusOutlined, DeleteOutlined, CopyOutlined } from '@ant-design/icons';
import { ColorworkPattern } from '../models/ColorworkPattern';
import { Gauge } from '../models/Gauge';
import { draggable, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { useSelector } from 'react-redux';
import { selectColorworkPatterns } from '../store/librarySlice';
import { renderPanel } from './KnittingPanelRenderer';
import {
    collectTrapezoidCoordinates,
    collectShortRowCoordinates,
    calculateTrapezoidDimensions,
    renderColorworkLayersToCanvas
} from '../utils/panelRenderingUtils';
import './ColorworkCanvasEditor.css';

const { Text } = Typography;
const { Option } = Select;

// Draggable Layer Item Component - defined outside to prevent re-creation
interface DraggableLayerItemProps {
    layer: any;
    children: React.ReactNode;
    onLayerReorder: (draggedId: string, targetId: string) => void;
    dragItemHoverStyle: React.CSSProperties;
    dragItemNormalStyle: React.CSSProperties;
}

const DraggableLayerItem = React.memo(({ layer, children, onLayerReorder, dragItemHoverStyle, dragItemNormalStyle }: DraggableLayerItemProps) => {
    const layerRef = useRef<HTMLDivElement>(null);
    const [isDraggedOver, setIsDraggedOver] = useState(false);

    useEffect(() => {
        const element = layerRef.current;
        if (!element) return;

        // Set up draggable
        const draggableCleanup = draggable({
            element,
            getInitialData: () => ({ layerId: layer.id as string, type: 'layer' as const }),
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
                const draggedLayerId = source.data.layerId as string;
                if (draggedLayerId && draggedLayerId !== layer.id) {
                    onLayerReorder(draggedLayerId, layer.id);
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
    }, [layer.id, onLayerReorder]);

    return (
        <div
            ref={layerRef}
            style={isDraggedOver ? dragItemHoverStyle : dragItemNormalStyle}
        >
            {children}
        </div>
    );
});

/**
 * ColorworkCanvasEditor - Full-page canvas-based editor with pan/zoom controls
 * Layout matches colorwork-designer with canvas front-and-center and side panel controls
 * 
 * Performance Optimizations:
 * - Uses requestAnimationFrame for debounced canvas rendering
 * - Prevents render blocking during rapid user input (color changes, slider adjustments)
 * - Canvas updates are async, allowing UI to remain responsive even with complex patterns
 * - Redux state is used only for library patterns; local state for editor operations
 */

interface ColorworkCanvasEditorProps {
    shape: any;
    patternLayers?: any[];
    gauge?: Gauge | null;
    onLayersChange?: (...args: any[]) => void;
    onGaugeChange?: (...args: any[]) => void;
}

const ColorworkCanvasEditor: React.FC<ColorworkCanvasEditorProps> = ({
    shape,
    patternLayers = [],
    gauge = null,
    onLayersChange = (..._args: any[]) => { },
    onGaugeChange = (..._args: any[]) => { }
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
    const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
    const hasInitialized = useRef(false);
    
    // Rendering optimization: debounce canvas renders for performance with large patterns
    const renderTimeoutRef = useRef<number | null>(null);
    const pendingRenderRef = useRef(false);
    const lastRenderParamsRef = useRef<any>(null);
    
    // Get colorwork patterns from the library
    const libraryPatterns = useSelector(selectColorworkPatterns);

    const availablePatterns = useMemo(() => {
        const basePatterns: Record<string, any> = {
            'solid': { name: 'Solid Color', type: 'solid', defaultConfig: { colors: [{ color: '#ffffff' }] } },
            'stripes': { name: 'Horizontal Stripes', type: 'stripes', defaultConfig: { colors: [{ color: '#ffffff', rows: 2 }, { color: '#000000', rows: 2 }], width: 4 } },
            'vstripes': { name: 'Vertical Stripes', type: 'vstripes', defaultConfig: { colors: [{ color: '#ffffff', columns: 2 }, { color: '#000000', columns: 2 }], height: 4 } },
            'checkerboard': { name: 'Checkerboard', type: 'checkerboard', defaultConfig: { cellSize: 2, colors: [{ color: '#ffffff' }, { color: '#000000' }] } },
            'argyle': { name: 'Argyle', type: 'argyle', defaultConfig: { colors: [{ color: '#ffffff' }, { color: '#ff0000' }, { color: '#0000ff' }] } },
            // Special non-pattern layer for drawing an inward border inside the merged panel outline
            'border': { name: 'Border', type: 'border', defaultConfig: { thickness: 1, color: '#000000' } },
            'row': { name: 'Row', type: 'row', defaultConfig: { elements: [] } },
            'vstack': { name: 'Vertical Stack', type: 'vstack', defaultConfig: { elements: [] } }
        };

        // Add library patterns as 'custom' type
        // libraryPatterns is an object with pattern IDs as keys
        if (libraryPatterns && typeof libraryPatterns === 'object') {
            Object.entries(libraryPatterns).forEach(([patternId, libPattern]: [string, any]) => {
                const key = `custom-${patternId}`;
                basePatterns[key] = {
                    name: libPattern.name || patternId,
                    type: 'custom',
                    customPattern: libPattern.pattern, // The actual grid data
                    customColors: libPattern.colors, // The color palette
                    defaultConfig: {
                        pattern: libPattern.pattern,
                        colors: libPattern.colors || {}
                    }
                };
            });
        }

        return basePatterns;
    }, [libraryPatterns]);

    const [collapsedLayers, setCollapsedLayers] = useState(new Set()); // Track collapsed layers

    // Canvas rendering functions - using shared utilities from panelRenderingUtils
    const renderUnifiedShapeToCanvas = (ctx: any, shape: any, scale: any, xOffset = 0, yOffset = 0, fillColor: any, patternLayers: any = [], gauge: any = null) => {
        // Collect all trapezoid coordinates into one unified path
        const allCoordinates: any[] = [];
        collectTrapezoidCoordinates(shape, scale, xOffset, yOffset, allCoordinates);

        if (allCoordinates.length === 0) return;

        // Find the bounding box of the entire shape
        let minX = Math.min(...allCoordinates.map((coord: any) => Math.min(coord.topLeft.x, coord.topRight.x, coord.bottomLeft.x, coord.bottomRight.x)));
        let maxX = Math.max(...allCoordinates.map((coord: any) => Math.max(coord.topLeft.x, coord.topRight.x, coord.bottomLeft.x, coord.bottomRight.x)));
        let minY = Math.min(...allCoordinates.map((coord: any) => Math.min(coord.topLeft.y, coord.topRight.y, coord.bottomLeft.y, coord.bottomRight.y)));
        let maxY = Math.max(...allCoordinates.map((coord: any) => Math.max(coord.topLeft.y, coord.topRight.y, coord.bottomLeft.y, coord.bottomRight.y)));

        // Calculate full panel dimensions once for both main and short row rendering
        let fullPanelDimensions = { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity };
        calculateTrapezoidDimensions(shape, 1, 0, 0, fullPanelDimensions);

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

        // --- Calculate extended bounds that include short rows BEFORE rendering ---
        const shortRowCoords: any[] = [];
        collectShortRowCoordinates(shape, scale, xOffset, yOffset, shortRowCoords);
        
        let extendedMinY = minY;
        let extendedMaxY = maxY;
        shortRowCoords.forEach((srCoord: any) => {
            const { topLeft, topRight, bottomLeft, bottomRight } = srCoord;
            const srMinY = Math.min(topLeft.y, topRight.y, bottomLeft.y, bottomRight.y);
            const srMaxY = Math.max(topLeft.y, topRight.y, bottomLeft.y, bottomRight.y);
            extendedMinY = Math.min(extendedMinY, srMinY);
            extendedMaxY = Math.max(extendedMaxY, srMaxY);
        });

        // If pattern layers are provided, render them as background with centered origin
        // Use EXTENDED dimensions so main shape and short rows share the same pattern grid
        if (patternLayers && patternLayers.length > 0 && gauge) {
            // Skip border layers here; border is rendered separately after fill
            renderColorworkLayersToCanvas(
                ctx,
                (patternLayers || []).filter((l: any) => l.patternType !== 'border'),
                shape,
                minX, extendedMinY, maxX - minX, extendedMaxY - extendedMinY,
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

        // --- NEW: Render short rows with colorwork patterns ---
        // Short row coordinates and extended bounds already calculated above

        shortRowCoords.forEach((srCoord: any) => {
            const { topLeft, topRight, bottomLeft, bottomRight } = srCoord;

            // Create clipping region for this short row
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(topLeft.x, topLeft.y);
            ctx.lineTo(topRight.x, topRight.y);
            ctx.lineTo(bottomRight.x, bottomRight.y);
            ctx.lineTo(bottomLeft.x, bottomLeft.y);
            ctx.closePath();
            ctx.clip();

            // If patterns are enabled, render colorwork inside the short row
            if (patternLayers && patternLayers.length > 0 && gauge) {
                // Render the full pattern grid that covers both main shape and short rows
                // The clipping path will show only the short row portion
                renderColorworkLayersToCanvas(
                    ctx,
                    (patternLayers || []).filter((l: any) => l.patternType !== 'border'),
                    shape,
                    minX, // Start from main shape's left edge
                    minY, // Start from main shape's top
                    maxX - minX, // Full width
                    extendedMaxY - minY, // Extended height to include short rows
                    scale,
                    gauge,
                    fullPanelDimensions // Pass full panel dimensions for proper pattern scale
                );
            } else {
                // Fallback: solid fill (same as parent, no darkening)
                ctx.fillStyle = fillColor;
                ctx.globalAlpha = 0.3;
                ctx.fill();
                ctx.globalAlpha = 1.0;
            }

            ctx.restore();

            // Draw short row border
            ctx.strokeStyle = '#ff4d4f';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 3]);
            ctx.beginPath();
            ctx.moveTo(topLeft.x, topLeft.y);
            ctx.lineTo(topRight.x, topRight.y);
            ctx.lineTo(bottomRight.x, bottomRight.y);
            ctx.lineTo(bottomLeft.x, bottomLeft.y);
            ctx.closePath();
            ctx.stroke();
            ctx.setLineDash([]);
        });
        // --- END short row rendering ---

        // Draw gauge-scaled inward border if a border layer is present
        const borderLayer = (patternLayers || []).find((l: any) => l.patternType === 'border');
        if (borderLayer && gauge) {
            const thicknessStitches = borderLayer.patternConfig?.thickness ?? 1;
            const borderColor = borderLayer.patternConfig?.color || '#000000';

            // Compute pixels per stitch/row at this render scale
            const stitchesPerInch = (gauge.stitchesPerFourInches ?? gauge.spi ?? 0) / 4;
            const rowsPerInch = (gauge.rowsPerFourInches ?? gauge.rpi ?? 0) / 4;
            const inchesPerPanelUnit = gauge.scalingFactor || 1; // panel units -> inches
            const stitchWidthPx = scale * (stitchesPerInch > 0 ? (1 / stitchesPerInch) : 0) / inchesPerPanelUnit;
            const rowHeightPx = scale * (rowsPerInch > 0 ? (1 / rowsPerInch) : 0) / inchesPerPanelUnit;
            const borderGauge = {
                gaugeX: thicknessStitches * stitchWidthPx,
                gaugeY: thicknessStitches * rowHeightPx,
            };

            // Collect trapezoid polygons (already in scaled coordinates used above)
            const polys = allCoordinates.map((c: any) => ([
                [c.topLeft.x, c.topLeft.y],
                [c.topRight.x, c.topRight.y],
                [c.bottomRight.x, c.bottomRight.y],
                [c.bottomLeft.x, c.bottomLeft.y],
            ]));

            // Render border as a filled ring between outer shape and inward offset
            try {
                renderPanel(
                    ctx as unknown as CanvasRenderingContext2D,
                    { trapezoids: polys } as any,
                    borderGauge as any,
                    'transparent',
                    borderColor
                );
            } catch (e) {
                // Non-fatal; keep the rest of rendering working
                console.warn('Border render failed:', e);
            }
        }

        // Draw unified outline
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
    };

    // Now using shared collectTrapezoidCoordinates from panelRenderingUtils

    // Now using shared renderColorworkLayersToCanvas from panelRenderingUtils
    // (The canvas version that renders pixels directly)

    const drawRulers = (ctx: any, canvasWidth: number, canvasHeight: number, shape: any, zoom: number, pan: any, scaleFactor: number, dimensions: any, centerX: number, centerY: number, actualWidthInches: number, actualHeightInches: number) => {
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

    const renderTrapezoidWithPattern = (ctx: any, trap: any, scale: number, xOffset: number = 0, yOffset: number = 0, fillColor: any, patternLayers: any[] = [], gauge: any = null) => {
        const trapWidth = Math.max(trap.baseA, trap.baseB) * scale;
        const effectiveHeight = (trap.isHem ? (trap.height * 0.5) : trap.height) * scale; // Respect hem!
        
        const xTopLeft = xOffset + (trapWidth - trap.baseB * scale) / 2 + (trap.baseBHorizontalOffset || 0) * scale;
        const xTopRight = xOffset + (trapWidth + trap.baseB * scale) / 2 + (trap.baseBHorizontalOffset || 0) * scale;
        const xBottomLeft = xOffset + (trapWidth - trap.baseA * scale) / 2;
        const xBottomRight = xOffset + (trapWidth + trap.baseA * scale) / 2;
        const yTop = yOffset;
        const yBottom = yOffset + effectiveHeight; // Use effectiveHeight

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

            // Skip border layers here; border is rendered after
            renderColorworkLayersToCanvas(
                ctx,
                (patternLayers || []).filter((l: any) => l.patternType !== 'border'),
                trapShape,
                xBottomLeft, yTop, xBottomRight - xBottomLeft, yBottom - yTop,
                scale,
                gauge,
                null // No full panel dimensions for individual trapezoids
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

    const renderHierarchyToCanvas = (ctx: any, trap: any, scale: number, xOffset: number = 0, yOffset: number = 0, dimensions: any = { minX: 0, maxX: 0, minY: 0, maxY: 0 }, fillColor: any, patternLayers: any[] = [], gauge: any = null) => {
        // Calculate dimensions first
        calculateTrapezoidDimensions(trap, scale, xOffset, yOffset, dimensions);

        // Render each trapezoid individually with its own pattern
        renderTrapezoidWithPattern(ctx, trap, scale, xOffset, yOffset, fillColor, patternLayers, gauge);

        // Render successors recursively
        if (trap.successors && trap.successors.length > 0) {
            const trapWidth = Math.max(trap.baseA, trap.baseB) * scale;
            const successorWidths = trap.successors.map((s: any) => Math.max(s.baseA, s.baseB) * scale);
            const totalSuccessorWidth = successorWidths.reduce((sum: number, w: number) => sum + w, 0);
            let childXOffset = xOffset + (trapWidth - totalSuccessorWidth) / 2;
            const yTop = yOffset;

            for (let i = trap.successors.length - 1; i >= 0; i--) {
                const successor = trap.successors[i];
                const successorWidth = successorWidths[i];
                const successorEffectiveHeight = (successor.isHem ? (successor.height * 0.5) : successor.height) * scale; // Respect hem!

                renderHierarchyToCanvas(
                    ctx,
                    successor,
                    scale,
                    childXOffset,
                    yTop - successorEffectiveHeight, // Use effectiveHeight for positioning
                    dimensions,
                    fillColor,
                    patternLayers,
                    gauge
                );

                childXOffset += successorWidth;
            }
        }
    };

    // Now using shared calculateTrapezoidDimensions from panelRenderingUtils

    // Canvas event handlers
    const handleMouseDown = (e: any) => {
        // Only handle left mouse button for panning
        if (e.button !== 0) return;

        e.preventDefault();
        setIsDragging(true);
        setLastMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseMove = (e: any) => {
        if (!isDragging) return;

        e.preventDefault();
        const deltaX = e.clientX - lastMousePos.x;
        const deltaY = e.clientY - lastMousePos.y;

        setPan(prev => ({
            x: prev.x + deltaX,
            y: prev.y + deltaY
        }));

        setLastMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = (e: any) => {
        e.preventDefault();
        setIsDragging(false);
    };

    // Prevent context menu on right click
    const handleContextMenu = (e: any) => {
        e.preventDefault();
    };

    const resetView = () => {
        setZoom(1);
        setPan({ x: 0, y: 0 });
    };

    // Keyboard controls for zoom and pan
    useEffect(() => {
        const handleKeyDown = (e: any) => {
            // Only handle when canvas area is focused/active
            if (!canvasRef.current) return;

            // Zoom controls with + and - keys
            if (e.key === '=' || e.key === '+') {
                e.preventDefault();
                setZoom(prev => Math.min(prev * 1.2, 5));
            } else if (e.key === '-') {
                e.preventDefault();
                setZoom(prev => Math.max(prev / 1.2, 0.1));
            } else if (e.key === '0' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                resetView();
            }

            // Pan controls with arrow keys
            const panStep = 20;
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                setPan(prev => ({ ...prev, y: prev.y + panStep }));
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                setPan(prev => ({ ...prev, y: prev.y - panStep }));
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                setPan(prev => ({ ...prev, x: prev.x + panStep }));
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                setPan(prev => ({ ...prev, x: prev.x - panStep }));
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Debounced canvas rendering function for performance with large patterns
    const scheduleRender = useCallback(() => {
        // Cancel any pending render
        if (renderTimeoutRef.current !== null) {
            cancelAnimationFrame(renderTimeoutRef.current);
        }

        // Mark that we have a pending render
        pendingRenderRef.current = true;

        // Schedule the render on the next animation frame
        renderTimeoutRef.current = requestAnimationFrame(() => {
            pendingRenderRef.current = false;
            renderTimeoutRef.current = null;
            
            const canvas = canvasRef.current;
            if (!canvas || !shape) return;

            const ctx = canvas.getContext('2d');
            if (!ctx) return;
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
            calculateTrapezoidDimensions(shape, 1, 0, 0, dimensions);

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

            // Render with the calculated scale using unified shape rendering
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
            calculateTrapezoidDimensions(shape, 1, 0, 0, actualDimensions);
            
            // Apply gauge scaling factor to get true dimensions
            const gaugeScalingFactor = gauge?.scalingFactor || 1;
            const actualWidthInches = (actualDimensions.maxX - actualDimensions.minX) * gaugeScalingFactor;
            const actualHeightInches = (actualDimensions.maxY - actualDimensions.minY) * gaugeScalingFactor;

            // Draw rulers after restoring context (so they're drawn in screen space)
            const adjustedCenterX = (canvasSize.width - rulerOffsetX) / 2 + pan.x + rulerOffsetX;
            const adjustedCenterY = (canvasSize.height - rulerOffsetY) / 2 + pan.y + rulerOffsetY;
            drawRulers(ctx, canvasSize.width, canvasSize.height, shape, zoom, { x: pan.x, y: pan.y }, scaleFactor, calculatedDimensions, adjustedCenterX, adjustedCenterY, actualWidthInches, actualHeightInches);
        });
    }, [shape, patternLayers, gauge, zoom, pan, canvasSize]);

    // Canvas rendering effect - uses debounced rendering
    useEffect(() => {
        scheduleRender();
        
        // Cleanup function to cancel pending renders
        return () => {
            if (renderTimeoutRef.current !== null) {
                cancelAnimationFrame(renderTimeoutRef.current);
                renderTimeoutRef.current = null;
            }
        };
    }, [scheduleRender]);

    // Legacy rendering effect - REPLACED by debounced version above
    // Keeping this comment for reference of what was replaced
    /*
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !shape) return;

        const ctx = canvas.getContext('2d');
        const devicePixelRatio = window.devicePixelRatio || 1;

        // Ruler constants
        const rulerOffsetX = 30;
        const rulerOffsetY = 30;
        ... (old synchronous rendering code removed for performance)
    }, [shape, patternLayers, gauge, zoom, pan, canvasSize]);
    */

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

    // Initialize default background layer
    useEffect(() => {
        if (patternLayers.length === 0 && !hasInitialized.current) {
            hasInitialized.current = true;
            const defaultBackgroundLayer = {
                id: Date.now(),
                name: 'solid color bg',
                pattern: generatePattern('solid', { colors: [{ color: '#cfcfcf' }] }),
                patternType: 'solid',
                patternConfig: { colors: [{ color: '#cfcfcf' }] },
                priority: 1,
                settings: {
                    repeatMode: 'both', // repeat in both x and y
                    repeatCountX: 0, // 0 means infinite
                    repeatCountY: 0, // 0 means infinite
                    offsetHorizontal: 0,
                    offsetVertical: 0,
                    colorMapping: {}
                }
            };
            onLayersChange([defaultBackgroundLayer]);
        }
    }, [patternLayers.length, onLayersChange]);

    // Pattern layer management
    const handleLayerSettingChange = useCallback((layerId: any, setting: any, value: any) => {
        onLayersChange((prevLayers: any) =>
            prevLayers.map((layer: any) => {
                if (layer.id === layerId) {
                    return {
                        ...layer,
                        settings: { ...layer.settings, [setting]: value }
                    };
                }
                return layer;
            })
        );
    }, [onLayersChange]);

    const handleLayerColorChange = (layerId: any, colorId: any, newColor: any) => {
        // Convert color to hex string if it's a color object
        const colorValue = typeof newColor === 'string' ? newColor : newColor.toHexString();

        const updatedLayers = patternLayers.map((layer: any) => {
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

    const handleLayerReorder = useCallback((draggedLayerId: any, targetLayerId: any) => {
        onLayersChange((prevLayers: any) => {
            const draggedIndex = prevLayers.findIndex((layer: any) => layer.id === draggedLayerId);
            const targetIndex = prevLayers.findIndex((layer: any) => layer.id === targetLayerId);

            if (draggedIndex === -1 || targetIndex === -1) return prevLayers;

            const newLayers = [...prevLayers];
            const [draggedLayer] = newLayers.splice(draggedIndex, 1);
            newLayers.splice(targetIndex, 0, draggedLayer);

            return newLayers;
        });
    }, [onLayersChange]);

    // Simple handler for collapse changes
    const handleCollapseChange = useCallback((layerId: any) => {
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

    const addPatternLayer = useCallback(() => {
        const defaultType = 'checkerboard';
        const newLayer = {
            id: Date.now(),
            name: `Layer ${patternLayers.length + 1}`,
            pattern: generatePattern(availablePatterns[defaultType].type, availablePatterns[defaultType].defaultConfig),
            patternType: availablePatterns[defaultType].type,
            patternConfig: availablePatterns[defaultType].defaultConfig,
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
        onLayersChange((prevLayers: any) => [newLayer, ...prevLayers]);
    }, [patternLayers.length, onLayersChange]);

    // Memoized style objects to prevent re-renders
    const textStyle12 = useMemo(() => ({ fontSize: '12px' }), []);
    const textStyle11 = useMemo(() => ({ minWidth: 30, fontSize: '11px' }), []);
    const fullWidthStyle = useMemo(() => ({ width: '100%' }), []);
    const spaceStyle = useMemo(() => ({ width: '100%' }), []);

    // Memoized style objects for draggable items
    const dragItemBaseStyle = useMemo(() => ({
        marginBottom: 8,
        transition: 'all 0.2s ease'
    }), []);

    const dragItemHoverStyle = useMemo(() => ({
        ...dragItemBaseStyle,
        border: '2px dashed #1890ff',
        borderRadius: '4px'
    }), [dragItemBaseStyle]);

    const dragItemNormalStyle = useMemo(() => ({
        ...dragItemBaseStyle,
        border: 'none',
        borderRadius: '0'
    }), [dragItemBaseStyle]);

    // Memoized pattern key finder to prevent recalculation
    const getPatternKeyForLayer = useCallback((layer: any) => {
        // Return the stored pattern key if it exists, otherwise fall back to patternType
        return layer.patternKey || layer.patternType || 'checkerboard';
    }, []);

    const removePatternLayer = useCallback((layerId: any) => {
        onLayersChange((prevLayers: any) => prevLayers.filter((layer: any) => layer.id !== layerId));
    }, [onLayersChange]);

    const copyPatternLayer = useCallback((layerId: any) => {
        onLayersChange((prevLayers: any) => {
            const layerToCopy = prevLayers.find((layer: any) => layer.id === layerId);
            if (!layerToCopy) return prevLayers;

            const copiedLayer = {
                ...layerToCopy,
                id: Date.now(), // New unique ID
                name: `${layerToCopy.name} Copy`,
                priority: prevLayers.length + 1
            };

            // Add copied layer to the top of the stack (beginning of array)
            return [copiedLayer, ...prevLayers];
        });
    }, [onLayersChange]);

    const handlePatternChangeForLayer = useCallback((layerId: any, patternKey: any) => {
        const patternType = availablePatterns[patternKey].type;
        const config = {
            ...availablePatterns[patternKey].defaultConfig,
            patterns: availablePatterns // Pass availablePatterns for stack types
        };
        const pattern = generatePattern(patternType, config);
        onLayersChange((prevLayers: any) =>
            prevLayers.map((layer: any) => {
                if (layer.id === layerId) {
                    return {
                        ...layer,
                        pattern,
                        patternType,
                        patternKey, // Store the full pattern key (e.g., "custom-123")
                        patternConfig: config,
                        settings: {
                            ...layer.settings,
                            colorMapping: {} // Reset color mapping when changing patterns
                        }
                    };
                }
                return layer;
            })
        );
    }, [onLayersChange, availablePatterns]);

    const handlePatternConfigChange = useCallback((layerId: any, newConfig: any) => {
        onLayersChange((prevLayers: any) =>
            prevLayers.map((layer: any) => {
                if (layer.id === layerId) {
                    // Pass availablePatterns for stack types
                    const configWithPatterns = {
                        ...newConfig,
                        patterns: availablePatterns
                    };
                    const newPattern = generatePattern(layer.patternType, configWithPatterns);
                    return {
                        ...layer,
                        patternConfig: newConfig,
                        pattern: newPattern
                    };
                }
                return layer;
            })
        );
    }, [onLayersChange, availablePatterns]);

    return (
        <div className="colorwork-canvas-editor">
            {/* Zoom controls integrated at top */}
            <div className="canvas-header" style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 16px',
                borderBottom: '1px solid #f0f0f0',
                background: '#fafafa'
            }}>
                <Space>
                    <Text>Zoom: {Math.round(zoom * 100)}%</Text>
                    <Button
                        icon={<ZoomInOutlined />}
                        onClick={() => setZoom(prev => Math.min(prev * 1.2, 5))}
                        size="small"
                        title="Zoom in (+)"
                    >
                    </Button>
                    <Slider
                        min={0.1}
                        max={5}
                        step={0.1}
                        value={zoom}
                        onChange={setZoom}
                        style={{ width: 100 }}
                        tooltip={{ formatter: (value: any) => `${Math.round(value * 100)}%` }}
                    />
                    <Button
                        icon={<ZoomOutOutlined />}
                        onClick={() => setZoom(prev => Math.max(prev / 1.2, 0.1))}
                        size="small"
                        title="Zoom out (-)"
                    >
                    </Button>
                    <Button
                        icon={<ExpandOutlined />}
                        onClick={resetView}
                        size="small"
                        title="Reset view (Ctrl+0)"
                    >
                        Reset
                    </Button>
                    <Text style={{ fontSize: '11px', color: '#666', marginLeft: 8 }}>
                        Drag to pan • +/- to zoom • Arrows to move
                    </Text>
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
                        onContextMenu={handleContextMenu}
                        style={{
                            cursor: isDragging ? 'grabbing' : 'grab',
                            userSelect: 'none',
                            touchAction: 'none'
                        }}
                    />
                </div>

                {/* Side panel with controls */}
                <div className="side-panel">
                    <Card title="Colorwork Layers" size="small">
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
                                {patternLayers.map((layer, index: number) => (
                                    <DraggableLayerItem
                                        key={layer.id}
                                        layer={layer}
                                        onLayerReorder={handleLayerReorder}
                                        dragItemHoverStyle={dragItemHoverStyle}
                                        dragItemNormalStyle={dragItemNormalStyle}
                                    >
                                        <Collapse
                                            size="small"
                                            ghost
                                            activeKey={collapsedLayers.has(layer.id) ? [] : [layer.id]}
                                            onChange={() => handleCollapseChange(layer.id)}
                                            items={[
                                                {
                                                    key: layer.id,
                                                    label: (
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                                            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                                <DragOutlined className="drag-handle" style={{ cursor: 'grab' }} />
                                                                {layer.name}
                                                            </span>
                                                            <div style={{ display: 'flex', gap: 4 }}>
                                                                <Button
                                                                    size="small"
                                                                    type="text"
                                                                    icon={<CopyOutlined />}
                                                                    onClick={(e: any) => {
                                                                        e.stopPropagation();
                                                                        copyPatternLayer(layer.id);
                                                                    }}
                                                                    title="Make a copy"
                                                                />
                                                                <Button
                                                                    size="small"
                                                                    danger
                                                                    type="text"
                                                                    icon={<DeleteOutlined />}
                                                                    onClick={(e: any) => {
                                                                        e.stopPropagation();
                                                                        removePatternLayer(layer.id);
                                                                    }}
                                                                    disabled={patternLayers.length === 1}
                                                                    title="Delete layer"
                                                                />
                                                            </div>
                                                        </div>
                                                    ),
                                                    children: (
                                                        <Space direction="vertical" style={spaceStyle} size="small">
                                                            <div>
                                                                <Text style={textStyle12}>Pattern:</Text>
                                                                <Select
                                                                    value={getPatternKeyForLayer(layer)}
                                                                    onChange={(patternKey: any) => handlePatternChangeForLayer(layer.id, patternKey)}
                                                                    style={fullWidthStyle}
                                                                    size="small"
                                                                >
                                                                    {Object.entries(availablePatterns).map(([key, pattern]) => (
                                                                        <Option key={key} value={key}>{pattern.name}</Option>
                                                                    ))}
                                                                </Select>
                                                            </div>

                                                            {layer.patternType === 'border' && (
                                                                <div>
                                                                    <Text style={textStyle12}>Border Color:</Text>
                                                                    <div style={{ margin: '6px 0 12px' }}>
                                                                        <ColorPicker
                                                                            value={layer.patternConfig?.color || '#000000'}
                                                                            onChange={(newColor: any) => {
                                                                                const colorValue = typeof newColor === 'string' ? newColor : newColor.toHexString();
                                                                                const newConfig = { ...layer.patternConfig, color: colorValue };
                                                                                handlePatternConfigChange(layer.id, newConfig);
                                                                            }}
                                                                            showText={false}
                                                                            size="small"
                                                                        />
                                                                    </div>
                                                                    <Text style={textStyle12}>Border Thickness (stitches):</Text>
                                                                    <InputNumber
                                                                        value={layer.patternConfig?.thickness ?? 1}
                                                                        onChange={(value: any) => {
                                                                            const newConfig = { ...layer.patternConfig, thickness: value ?? 1 };
                                                                            handlePatternConfigChange(layer.id, newConfig);
                                                                        }}
                                                                        min={0}
                                                                        max={20}
                                                                        size="small"
                                                                        style={fullWidthStyle}
                                                                    />
                                                                </div>
                                                            )}

                                                            {layer.patternType === 'stripes' && (
                                                                <div>
                                                                    <Text style={textStyle12}>Pattern Width (stitches):</Text>
                                                                    <InputNumber
                                                                        value={layer.patternConfig?.width || 4}
                                                                        onChange={(value: any) => {
                                                                            const newConfig = { ...layer.patternConfig, width: value || 4 };
                                                                            handlePatternConfigChange(layer.id, newConfig);
                                                                        }}
                                                                        min={1}
                                                                        max={20}
                                                                        size="small"
                                                                        style={fullWidthStyle}
                                                                    />
                                                                </div>
                                                            )}

                                                            {layer.patternType === 'vstripes' && (
                                                                <div>
                                                                    <Text style={textStyle12}>Pattern Height (rows):</Text>
                                                                    <InputNumber
                                                                        value={layer.patternConfig?.height || 4}
                                                                        onChange={(value: any) => {
                                                                            const newConfig = { ...layer.patternConfig, height: value || 4 };
                                                                            handlePatternConfigChange(layer.id, newConfig);
                                                                        }}
                                                                        min={1}
                                                                        max={20}
                                                                        size="small"
                                                                        style={fullWidthStyle}
                                                                    />
                                                                </div>
                                                            )}

                                                            {layer.patternType === 'checkerboard' && (
                                                                <div>
                                                                    <Text style={textStyle12}>Cell Size (n x n):</Text>
                                                                    <InputNumber
                                                                        value={layer.patternConfig?.cellSize || 2}
                                                                        onChange={(value: any) => {
                                                                            const newConfig = { ...layer.patternConfig, cellSize: value || 2 };
                                                                            handlePatternConfigChange(layer.id, newConfig);
                                                                        }}
                                                                        min={1}
                                                                        max={10}
                                                                        size="small"
                                                                        style={fullWidthStyle}
                                                                        formatter={(value: any) => `${value} x ${value}`}
                                                                        parser={(value: any) => value.replace(' x ' + value.split(' x ')[1], '')}
                                                                    />
                                                                </div>
                                                            )}

                                                            {/* Removed Pattern Colors UI to avoid duplication with Color Assignment */}

                                                            {layer.patternType === 'stripes' && (
                                                                <div>
                                                                    <Text style={textStyle12}>Stripe Configuration:</Text>
                                                                    <Text style={{ fontSize: '11px', color: '#666', display: 'block', marginTop: 2 }}>
                                                                        Enter 0 rows to fill remaining space with that color
                                                                    </Text>
                                                                    {(() => {
                                                                        const zeroRowIndices = layer.patternConfig.colors
                                                                            .map((c: any, i: number) => c.rows === 0 ? i : -1)
                                                                            .filter((i: any) => i !== -1);
                                                                        const invalidZeroRows = zeroRowIndices.filter((i: any) =>
                                                                            i !== 0 && i !== layer.patternConfig.colors.length - 1
                                                                        );

                                                                        if (invalidZeroRows.length > 0) {
                                                                            return (
                                                                                <Text style={{ fontSize: '11px', color: '#ff6b35', display: 'block', marginTop: 2 }}>
                                                                                    Warning: Only first or last colors should have 0 rows
                                                                                </Text>
                                                                            );
                                                                        }

                                                                        return null;
                                                                    })()}
                                                                    <Space direction="vertical" size="small" style={{ marginTop: 8 }}>
                                                                        {layer.patternConfig.colors.map((colorConfig: any, index: number) => (
                                                                            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                                                <ColorPicker
                                                                                    value={colorConfig.color || '#ffffff'}
                                                                                    onChange={(newColor: any) => {
                                                                                        const colorValue = typeof newColor === 'string' ? newColor : newColor.toHexString();
                                                                                        const newColors = [...layer.patternConfig.colors];
                                                                                        newColors[index] = { ...newColors[index], color: colorValue };
                                                                                        handlePatternConfigChange(layer.id, { ...layer.patternConfig, colors: newColors });
                                                                                    }}
                                                                                    showText={false}
                                                                                    size="small"
                                                                                />
                                                                                <InputNumber
                                                                                    value={colorConfig.rows}
                                                                                    onChange={(value: any) => {
                                                                                        const newColors = [...layer.patternConfig.colors];
                                                                                        newColors[index] = { ...newColors[index], rows: value ?? 0 };
                                                                                        handlePatternConfigChange(layer.id, { ...layer.patternConfig, colors: newColors });
                                                                                    }}
                                                                                    min={0}
                                                                                    size="small"
                                                                                    style={{ width: 60 }}
                                                                                    placeholder="0"
                                                                                />
                                                                                <Text>{colorConfig.rows === 0 ? 'rows (fill)' : 'rows'}</Text>
                                                                                {layer.patternConfig.colors.length > 1 && (
                                                                                    <Button size="small" danger onClick={() => {
                                                                                        const newColors = layer.patternConfig.colors.filter((_: any, i: number) => i !== index);
                                                                                        handlePatternConfigChange(layer.id, { ...layer.patternConfig, colors: newColors });
                                                                                    }}>Remove</Button>
                                                                                )}
                                                                            </div>
                                                                        ))}
                                                                        <Button size="small" onClick={() => {
                                                                            const newColors = [...layer.patternConfig.colors, { color: '#ff0000', rows: 2 }];
                                                                            handlePatternConfigChange(layer.id, { ...layer.patternConfig, colors: newColors });
                                                                        }}>Add Color</Button>
                                                                    </Space>
                                                                </div>
                                                            )}

                                                            {layer.patternType === 'vstripes' && (
                                                                <div>
                                                                    <Text style={textStyle12}>Vertical Stripe Configuration:</Text>
                                                                    <Text style={{ fontSize: '11px', color: '#666', display: 'block', marginTop: 2 }}>
                                                                        Enter 0 columns to fill remaining space with that color
                                                                    </Text>
                                                                    {(() => {
                                                                        const zeroColumnIndices = layer.patternConfig.colors
                                                                            .map((c: any, i: number) => c.columns === 0 ? i : -1)
                                                                            .filter((i: any) => i !== -1);
                                                                        const invalidZeroColumns = zeroColumnIndices.filter((i: any) =>
                                                                            i !== 0 && i !== layer.patternConfig.colors.length - 1
                                                                        );

                                                                        if (invalidZeroColumns.length > 0) {
                                                                            return (
                                                                                <Text style={{ fontSize: '11px', color: '#ff6b35', display: 'block', marginTop: 2 }}>
                                                                                    Warning: Only first or last colors should have 0 columns
                                                                                </Text>
                                                                            );
                                                                        }

                                                                        return null;
                                                                    })()}
                                                                    <Space direction="vertical" size="small" style={{ marginTop: 8 }}>
                                                                        {layer.patternConfig.colors.map((colorConfig: any, index: number) => (
                                                                            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                                                <ColorPicker
                                                                                    value={colorConfig.color || '#ffffff'}
                                                                                    onChange={(newColor: any) => {
                                                                                        const colorValue = typeof newColor === 'string' ? newColor : newColor.toHexString();
                                                                                        const newColors = [...layer.patternConfig.colors];
                                                                                        newColors[index] = { ...newColors[index], color: colorValue };
                                                                                        handlePatternConfigChange(layer.id, { ...layer.patternConfig, colors: newColors });
                                                                                    }}
                                                                                    showText={false}
                                                                                    size="small"
                                                                                />
                                                                                <InputNumber
                                                                                    value={colorConfig.columns}
                                                                                    onChange={(value: any) => {
                                                                                        const newColors = [...layer.patternConfig.colors];
                                                                                        newColors[index] = { ...newColors[index], columns: value ?? 0 };
                                                                                        handlePatternConfigChange(layer.id, { ...layer.patternConfig, colors: newColors });
                                                                                    }}
                                                                                    min={0}
                                                                                    size="small"
                                                                                    style={{ width: 60 }}
                                                                                    placeholder="0"
                                                                                />
                                                                                <Text>{colorConfig.columns === 0 ? 'cols (fill)' : 'cols'}</Text>
                                                                                {layer.patternConfig.colors.length > 1 && (
                                                                                    <Button size="small" danger onClick={() => {
                                                                                        const newColors = layer.patternConfig.colors.filter((_: any, i: number) => i !== index);
                                                                                        handlePatternConfigChange(layer.id, { ...layer.patternConfig, colors: newColors });
                                                                                    }}>Remove</Button>
                                                                                )}
                                                                            </div>
                                                                        ))}
                                                                        <Button size="small" onClick={() => {
                                                                            const newColors = [...layer.patternConfig.colors, { color: '#ff0000', columns: 2 }];
                                                                            handlePatternConfigChange(layer.id, { ...layer.patternConfig, colors: newColors });
                                                                        }}>Add Color</Button>
                                                                    </Space>
                                                                </div>
                                                            )}

                                                            {(layer.patternType === 'row' || layer.patternType === 'vstack') && (
                                                                <div>
                                                                    <Text style={textStyle12}>
                                                                        {layer.patternType === 'row' ? 'Row:' : 'Vertical Stack:'}
                                                                    </Text>
                                                                    <Text style={{ fontSize: '11px', color: '#666', display: 'block', marginTop: 2, marginBottom: 8 }}>
                                                                        {layer.patternType === 'row' 
                                                                            ? 'Stack elements left to right. Use stripes for bands or custom shapes (with repeat count).'
                                                                            : 'Stack elements top to bottom. Use stripes for bands, custom shapes (with repeat count), or rows for horizontal composition.'}
                                                                    </Text>

                                                                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                                                        {(layer.patternConfig.elements || []).map((element: any, index: number) => (
                                                                            <div key={index} style={{ border: '1px solid #d9d9d9', padding: 8, borderRadius: 4 }}>
                                                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                                                                    <Text style={{ fontSize: '11px', fontWeight: 'bold' }}>
                                                                                        {element.elementType === 'stripes' 
                                                                                            ? `Stripes ${index + 1}` 
                                                                                            : element.elementType === 'shape' && element.shapeKey
                                                                                            ? availablePatterns[element.shapeKey]?.name || 'Shape'
                                                                                            : element.elementType === 'sequence'
                                                                                            ? `Sequence ${index + 1}`
                                                                                            : `Element ${index + 1}`
                                                                                        }
                                                                                    </Text>
                                                                                    <Space size="small">
                                                                                        <Button 
                                                                                            size="small" 
                                                                                            disabled={index === 0}
                                                                                            onClick={() => {
                                                                                                const newElements = [...(layer.patternConfig.elements || [])];
                                                                                                [newElements[index - 1], newElements[index]] = [newElements[index], newElements[index - 1]];
                                                                                                handlePatternConfigChange(layer.id, { 
                                                                                                    ...layer.patternConfig, 
                                                                                                    elements: newElements 
                                                                                                });
                                                                                            }}
                                                                                        >
                                                                                            ↑
                                                                                        </Button>
                                                                                        <Button 
                                                                                            size="small" 
                                                                                            disabled={index === (layer.patternConfig.elements || []).length - 1}
                                                                                            onClick={() => {
                                                                                                const newElements = [...(layer.patternConfig.elements || [])];
                                                                                                [newElements[index], newElements[index + 1]] = [newElements[index + 1], newElements[index]];
                                                                                                handlePatternConfigChange(layer.id, { 
                                                                                                    ...layer.patternConfig, 
                                                                                                    elements: newElements 
                                                                                                });
                                                                                            }}
                                                                                        >
                                                                                            ↓
                                                                                        </Button>
                                                                                        <Button 
                                                                                            size="small" 
                                                                                            danger 
                                                                                            onClick={() => {
                                                                                                const newElements = (layer.patternConfig.elements || []).filter((_: any, i: number) => i !== index);
                                                                                                handlePatternConfigChange(layer.id, { 
                                                                                                    ...layer.patternConfig, 
                                                                                                    elements: newElements 
                                                                                                });
                                                                                            }}
                                                                                        >
                                                                                            Remove
                                                                                        </Button>
                                                                                    </Space>
                                                                                </div>
                                                                                
                                                                                <Select
                                                                                    value={element.elementType || 'stripes'}
                                                                                    onChange={(value: any) => {
                                                                                        const newElements = [...(layer.patternConfig.elements || [])];
                                                                                        if (value === 'stripes') {
                                                                                            newElements[index] = {
                                                                                                elementType: 'stripes',
                                                                                                stripeConfig: layer.patternType === 'row' 
                                                                                                    ? { colors: [{ color: '#ffffff', columns: 2 }] }
                                                                                                    : { colors: [{ color: '#ffffff', rows: 2 }] }
                                                                                            };
                                                                                        } else if (value === 'sequence') {
                                                                                            newElements[index] = {
                                                                                                elementType: 'sequence',
                                                                                                shapes: [],
                                                                                                repeatCount: 1,
                                                                                                alignment: 'center'
                                                                                            };
                                                                                        } else if (value.startsWith('custom-')) {
                                                                                            // Direct custom pattern selection
                                                                                            newElements[index] = {
                                                                                                elementType: 'shape',
                                                                                                shapeKey: value,
                                                                                                repeatCount: 1
                                                                                            };
                                                                                        }
                                                                                        handlePatternConfigChange(layer.id, { 
                                                                                            ...layer.patternConfig, 
                                                                                            elements: newElements 
                                                                                        });
                                                                                    }}
                                                                                    size="small"
                                                                                    style={{ width: '100%', marginBottom: 8 }}
                                                                                >
                                                                                    <Option value="stripes">Stripes</Option>
                                                                                    {Object.entries(availablePatterns)
                                                                                        .filter(([key]) => key.startsWith('custom-'))
                                                                                        .map(([key, pattern]: [string, any]) => (
                                                                                            <Option key={key} value={key}>{pattern.name}</Option>
                                                                                        ))
                                                                                    }
                                                                                </Select>

                                                                                {element.elementType === 'stripes' && element.stripeConfig && (
                                                                                    <div style={{ marginTop: 8, paddingLeft: 8, borderLeft: '2px solid #e8e8e8' }}>
                                                                                        <Text style={{ fontSize: '10px', display: 'block', marginBottom: 4 }}>Stripe width (sts):</Text>
                                                                                        {element.stripeConfig.colors.map((stripe: any, sIndex: number) => (
                                                                                            <div key={sIndex} style={{ display: 'flex', gap: 4, alignItems: 'center', marginBottom: 4 }}>
                                                                                                <InputNumber
                                                                                                    value={layer.patternType === 'row' ? stripe.columns : stripe.rows}
                                                                                                    onChange={(value: any) => {
                                                                                                        const newElements = [...(layer.patternConfig.elements || [])];
                                                                                                        const newColors = [...element.stripeConfig.colors];
                                                                                                        if (layer.patternType === 'row') {
                                                                                                            newColors[sIndex] = { ...newColors[sIndex], columns: value || 1 };
                                                                                                        } else {
                                                                                                            newColors[sIndex] = { ...newColors[sIndex], rows: value || 1 };
                                                                                                        }
                                                                                                        newElements[index] = { ...element, stripeConfig: { colors: newColors } };
                                                                                                        handlePatternConfigChange(layer.id, { ...layer.patternConfig, elements: newElements });
                                                                                                    }}
                                                                                                    min={1}
                                                                                                    size="small"
                                                                                                    style={{ width: 50 }}
                                                                                                />
                                                                                            </div>
                                                                                        ))}
                                                                                    </div>
                                                                                )}

                                                                                {element.elementType === 'shape' && element.shapeKey && (
                                                                                    <div style={{ marginTop: 8, paddingLeft: 8, borderLeft: '2px solid #e8e8e8' }}>
                                                                                        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                                                                                            <Text style={{ fontSize: '10px' }}>Repeat:</Text>
                                                                                            <InputNumber
                                                                                                value={element.repeatCount || 1}
                                                                                                onChange={(value: any) => {
                                                                                                    const newElements = [...(layer.patternConfig.elements || [])];
                                                                                                    newElements[index] = { ...element, repeatCount: value || 1 };
                                                                                                    handlePatternConfigChange(layer.id, { ...layer.patternConfig, elements: newElements });
                                                                                                }}
                                                                                                min={1}
                                                                                                size="small"
                                                                                                style={{ width: 60 }}
                                                                                            />
                                                                                        </div>
                                                                                    </div>
                                                                                )}

                                                                                {(element.elementType === 'vstack' || element.elementType === 'row') && (
                                                                                    <div style={{ marginTop: 8, paddingLeft: 8, borderLeft: '2px solid #e8e8e8' }}>
                                                                                        <Text style={{ fontSize: '10px', display: 'block', marginBottom: 4 }}>
                                                                                            {element.elementType === 'vstack' ? 'Vertical' : 'Row'} Stack:
                                                                                        </Text>
                                                                                        <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginBottom: 6 }}>
                                                                                            <Text style={{ fontSize: '10px' }}>Repeat:</Text>
                                                                                            <InputNumber
                                                                                                value={element.repeatCount || 1}
                                                                                                onChange={(value: any) => {
                                                                                                    const newElements = [...(layer.patternConfig.elements || [])];
                                                                                                    newElements[index] = { ...element, repeatCount: value || 1 };
                                                                                                    handlePatternConfigChange(layer.id, { ...layer.patternConfig, elements: newElements });
                                                                                                }}
                                                                                                min={1}
                                                                                                size="small"
                                                                                                style={{ width: 60 }}
                                                                                            />
                                                                                        </div>
                                                                                        
                                                                                        {/* Stripes sub-elements */}
                                                                                        {(element.elements || []).filter((el: any) => el.elementType === 'stripes').map((subElement: any, subIndex: number) => {
                                                                                            const actualIndex = (element.elements || []).findIndex((el: any, idx: number) => 
                                                                                                el === subElement && idx >= subIndex
                                                                                            );
                                                                                            return (
                                                                                                <div key={`stripe-${subIndex}`} style={{ marginBottom: 6 }}>
                                                                                                    <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginBottom: 4 }}>
                                                                                                        <Text style={{ fontSize: '10px', color: '#666' }}>Stripes</Text>
                                                                                                        <Button
                                                                                                            size="small"
                                                                                                            danger
                                                                                                            onClick={() => {
                                                                                                                const newElements = [...(layer.patternConfig.elements || [])];
                                                                                                                const newSubElements = (element.elements || []).filter((_: any, i: number) => i !== actualIndex);
                                                                                                                newElements[index] = { ...element, elements: newSubElements };
                                                                                                                handlePatternConfigChange(layer.id, { ...layer.patternConfig, elements: newElements });
                                                                                                            }}
                                                                                                        >
                                                                                                            ×
                                                                                                        </Button>
                                                                                                    </div>
                                                                                                    {subElement.stripeConfig && subElement.stripeConfig.colors.map((stripe: any, sIdx: number) => (
                                                                                                        <div key={sIdx} style={{ display: 'flex', gap: 4, alignItems: 'center', marginBottom: 4, marginLeft: 8 }}>
                                                                                                            <ColorPicker
                                                                                                                value={stripe.color}
                                                                                                                onChange={(value: any) => {
                                                                                                                    const newElements = [...(layer.patternConfig.elements || [])];
                                                                                                                    const newSubElements = [...(element.elements || [])];
                                                                                                                    const newStripeConfig = { ...subElement.stripeConfig };
                                                                                                                    newStripeConfig.colors = [...newStripeConfig.colors];
                                                                                                                    newStripeConfig.colors[sIdx] = { ...stripe, color: value.toHexString() };
                                                                                                                    newSubElements[actualIndex] = { ...subElement, stripeConfig: newStripeConfig };
                                                                                                                    newElements[index] = { ...element, elements: newSubElements };
                                                                                                                    handlePatternConfigChange(layer.id, { ...layer.patternConfig, elements: newElements });
                                                                                                                }}
                                                                                                                size="small"
                                                                                                            />
                                                                                                            <InputNumber
                                                                                                                value={element.elementType === 'vstack' ? stripe.rows : stripe.columns}
                                                                                                                onChange={(value: any) => {
                                                                                                                    const newElements = [...(layer.patternConfig.elements || [])];
                                                                                                                    const newSubElements = [...(element.elements || [])];
                                                                                                                    const newStripeConfig = { ...subElement.stripeConfig };
                                                                                                                    newStripeConfig.colors = [...newStripeConfig.colors];
                                                                                                                    if (element.elementType === 'vstack') {
                                                                                                                        newStripeConfig.colors[sIdx] = { ...stripe, rows: value || 1 };
                                                                                                                    } else {
                                                                                                                        newStripeConfig.colors[sIdx] = { ...stripe, columns: value || 1 };
                                                                                                                    }
                                                                                                                    newSubElements[actualIndex] = { ...subElement, stripeConfig: newStripeConfig };
                                                                                                                    newElements[index] = { ...element, elements: newSubElements };
                                                                                                                    handlePatternConfigChange(layer.id, { ...layer.patternConfig, elements: newElements });
                                                                                                                }}
                                                                                                                min={1}
                                                                                                                size="small"
                                                                                                                style={{ width: 50 }}
                                                                                                            />
                                                                                                            <Button
                                                                                                                size="small"
                                                                                                                danger
                                                                                                                onClick={() => {
                                                                                                                    const newElements = [...(layer.patternConfig.elements || [])];
                                                                                                                    const newSubElements = [...(element.elements || [])];
                                                                                                                    const newStripeConfig = { ...subElement.stripeConfig };
                                                                                                                    newStripeConfig.colors = newStripeConfig.colors.filter((_: any, i: number) => i !== sIdx);
                                                                                                                    newSubElements[actualIndex] = { ...subElement, stripeConfig: newStripeConfig };
                                                                                                                    newElements[index] = { ...element, elements: newSubElements };
                                                                                                                    handlePatternConfigChange(layer.id, { ...layer.patternConfig, elements: newElements });
                                                                                                                }}
                                                                                                            >
                                                                                                                ×
                                                                                                            </Button>
                                                                                                        </div>
                                                                                                    ))}
                                                                                                    <Button
                                                                                                        size="small"
                                                                                                        onClick={() => {
                                                                                                            const newElements = [...(layer.patternConfig.elements || [])];
                                                                                                            const newSubElements = [...(element.elements || [])];
                                                                                                            const newStripeConfig = { ...subElement.stripeConfig };
                                                                                                            newStripeConfig.colors = [
                                                                                                                ...newStripeConfig.colors,
                                                                                                                element.elementType === 'vstack'
                                                                                                                    ? { color: '#ffffff', rows: 2 }
                                                                                                                    : { color: '#ffffff', columns: 2 }
                                                                                                            ];
                                                                                                            newSubElements[actualIndex] = { ...subElement, stripeConfig: newStripeConfig };
                                                                                                            newElements[index] = { ...element, elements: newSubElements };
                                                                                                            handlePatternConfigChange(layer.id, { ...layer.patternConfig, elements: newElements });
                                                                                                        }}
                                                                                                        style={{ marginLeft: 8 }}
                                                                                                    >
                                                                                                        + Stripe
                                                                                                    </Button>
                                                                                                </div>
                                                                                            );
                                                                                        })}
                                                                                        
                                                                                        {/* Shape sub-elements */}
                                                                                        {(element.elements || []).filter((el: any) => el.elementType === 'shape').map((subElement: any, subIndex: number) => {
                                                                                            const actualIndex = (element.elements || []).findIndex((el: any, idx: number) => 
                                                                                                el === subElement && idx >= subIndex
                                                                                            );
                                                                                            return (
                                                                                                <div key={`shape-${subIndex}`} style={{ marginBottom: 6 }}>
                                                                                                    <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginBottom: 4 }}>
                                                                                                        <Select
                                                                                                            value={subElement.shapeKey || ''}
                                                                                                            onChange={(value: any) => {
                                                                                                                const newElements = [...(layer.patternConfig.elements || [])];
                                                                                                                const newSubElements = [...(element.elements || [])];
                                                                                                                newSubElements[actualIndex] = { ...subElement, shapeKey: value };
                                                                                                                newElements[index] = { ...element, elements: newSubElements };
                                                                                                                handlePatternConfigChange(layer.id, { ...layer.patternConfig, elements: newElements });
                                                                                                            }}
                                                                                                            size="small"
                                                                                                            style={{ flex: 1 }}
                                                                                                        >
                                                                                                            {Object.keys(availablePatterns).map(key => (
                                                                                                                <Option key={key} value={key}>{availablePatterns[key].name}</Option>
                                                                                                            ))}
                                                                                                        </Select>
                                                                                                        <Text style={{ fontSize: '9px' }}>x</Text>
                                                                                                        <InputNumber
                                                                                                            value={subElement.repeatCount || 1}
                                                                                                            onChange={(value: any) => {
                                                                                                                const newElements = [...(layer.patternConfig.elements || [])];
                                                                                                                const newSubElements = [...(element.elements || [])];
                                                                                                                newSubElements[actualIndex] = { ...subElement, repeatCount: value || 1 };
                                                                                                                newElements[index] = { ...element, elements: newSubElements };
                                                                                                                handlePatternConfigChange(layer.id, { ...layer.patternConfig, elements: newElements });
                                                                                                            }}
                                                                                                            min={1}
                                                                                                            size="small"
                                                                                                            style={{ width: 50 }}
                                                                                                        />
                                                                                                        <Button
                                                                                                            size="small"
                                                                                                            danger
                                                                                                            onClick={() => {
                                                                                                                const newElements = [...(layer.patternConfig.elements || [])];
                                                                                                                const newSubElements = (element.elements || []).filter((_: any, i: number) => i !== actualIndex);
                                                                                                                newElements[index] = { ...element, elements: newSubElements };
                                                                                                                handlePatternConfigChange(layer.id, { ...layer.patternConfig, elements: newElements });
                                                                                                            }}
                                                                                                        >
                                                                                                            ×
                                                                                                        </Button>
                                                                                                    </div>
                                                                                                </div>
                                                                                            );
                                                                                        })}
                                                                                        
                                                                                        <div style={{ display: 'flex', gap: 4 }}>
                                                                                            <Button
                                                                                                size="small"
                                                                                                onClick={() => {
                                                                                                    const newElements = [...(layer.patternConfig.elements || [])];
                                                                                                    const newSubElements = [
                                                                                                        ...(element.elements || []),
                                                                                                        {
                                                                                                            elementType: 'stripes',
                                                                                                            stripeConfig: element.elementType === 'vstack'
                                                                                                                ? { colors: [{ color: '#ffffff', rows: 2 }] }
                                                                                                                : { colors: [{ color: '#ffffff', columns: 2 }] }
                                                                                                        }
                                                                                                    ];
                                                                                                    newElements[index] = { ...element, elements: newSubElements };
                                                                                                    handlePatternConfigChange(layer.id, { ...layer.patternConfig, elements: newElements });
                                                                                                }}
                                                                                            >
                                                                                                + Stripes
                                                                                            </Button>
                                                                                            <Button
                                                                                                size="small"
                                                                                                onClick={() => {
                                                                                                    const newElements = [...(layer.patternConfig.elements || [])];
                                                                                                    const newSubElements = [
                                                                                                        ...(element.elements || []),
                                                                                                        {
                                                                                                            elementType: 'shape',
                                                                                                            shapeKey: Object.keys(availablePatterns)[0] || '',
                                                                                                            repeatCount: 1
                                                                                                        }
                                                                                                    ];
                                                                                                    newElements[index] = { ...element, elements: newSubElements };
                                                                                                    handlePatternConfigChange(layer.id, { ...layer.patternConfig, elements: newElements });
                                                                                                }}
                                                                                            >
                                                                                                + Shape
                                                                                            </Button>
                                                                                        </div>
                                                                                    </div>
                                                                                )}

                                                                                {element.elementType === 'sequence' && (
                                                                                    <div style={{ marginTop: 8, paddingLeft: 8, borderLeft: '2px solid #e8e8e8' }}>
                                                                                        <Text style={{ fontSize: '10px', display: 'block', marginBottom: 4 }}>Shapes in sequence:</Text>
                                                                                        <Text style={{ fontSize: '9px', color: '#999', display: 'block', marginBottom: 4 }}>
                                                                                            (Add shapes to create a sequence)
                                                                                        </Text>
                                                                                        <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginTop: 4 }}>
                                                                                            <Text style={{ fontSize: '10px' }}>Repeat Sequence:</Text>
                                                                                            <InputNumber
                                                                                                value={element.repeatCount || 1}
                                                                                                onChange={(value: any) => {
                                                                                                    const newElements = [...(layer.patternConfig.elements || [])];
                                                                                                    newElements[index] = { ...element, repeatCount: value || 1 };
                                                                                                    handlePatternConfigChange(layer.id, { ...layer.patternConfig, elements: newElements });
                                                                                                }}
                                                                                                min={0}
                                                                                                size="small"
                                                                                                style={{ width: 60 }}
                                                                                            />
                                                                                        </div>
                                                                                        <Select
                                                                                            value={element.alignment || 'center'}
                                                                                            onChange={(value: any) => {
                                                                                                const newElements = [...(layer.patternConfig.elements || [])];
                                                                                                newElements[index] = { ...element, alignment: value };
                                                                                                handlePatternConfigChange(layer.id, { ...layer.patternConfig, elements: newElements });
                                                                                            }}
                                                                                            size="small"
                                                                                            style={{ width: '100%', marginTop: 4 }}
                                                                                        >
                                                                                            <Option value="start">{layer.patternType === 'row' ? 'Left' : 'Top'}</Option>
                                                                                            <Option value="center">Center</Option>
                                                                                            <Option value="end">{layer.patternType === 'row' ? 'Right' : 'Bottom'}</Option>
                                                                                        </Select>
                                                                                    </div>
                                                                                )}

                                                                                {/* Element-specific color assignment */}
                                                                                {(() => {
                                                                                    // Generate a preview pattern to extract color information
                                                                                    let elementColors = [];
                                                                                    
                                                                                    if (element.elementType === 'stripes' && element.stripeConfig) {
                                                                                        elementColors = element.stripeConfig.colors.map((stripe: any, sIndex: number) => ({
                                                                                            id: `stripe-${sIndex}`,
                                                                                            label: element.stripeConfig.colors.length > 1 ? `Color ${sIndex + 1}` : 'Color',
                                                                                            defaultColor: stripe.color
                                                                                        }));
                                                                                    } else if (element.elementType === 'shape' && element.shapeKey && availablePatterns[element.shapeKey]) {
                                                                                        const patternInfo = availablePatterns[element.shapeKey];
                                                                                        const customPattern = generatePattern(element.shapeKey, patternInfo.defaultConfig || {});
                                                                                        
                                                                                        // Only show colors that are actually used in the pattern grid
                                                                                        const usedColors = customPattern.getColorsUsed?.() || [];
                                                                                        const usedColorIds = new Set(usedColors.map((c: any) => c.id));
                                                                                        
                                                                                        elementColors = Object.entries(customPattern.colors)
                                                                                            .filter(([colorId]) => usedColorIds.has(colorId) && colorId !== 'transparent')
                                                                                            .map(([colorId, colorInfo]: [string, any]) => ({
                                                                                                id: colorId,
                                                                                                label: colorInfo.label,
                                                                                                defaultColor: colorInfo.color
                                                                                            }));
                                                                                    }
                                                                                    
                                                                                    if (elementColors.length > 0) {
                                                                                        return (
                                                                                            <div style={{ marginTop: 12, paddingTop: 8, borderTop: '1px solid #e8e8e8' }}>
                                                                                                <Text style={{ fontSize: '10px', fontWeight: 'bold', display: 'block', marginBottom: 6 }}>Colors:</Text>
                                                                                                {elementColors.map((colorInfo: any) => (
                                                                                                    <div key={colorInfo.id} style={{ 
                                                                                                        marginBottom: 4, 
                                                                                                        display: 'grid', 
                                                                                                        gridTemplateColumns: '1fr auto',
                                                                                                        alignItems: 'center', 
                                                                                                        gap: 8 
                                                                                                    }}>
                                                                                                        <Text style={{ fontSize: '10px' }}>{colorInfo.label}</Text>
                                                                                                        <ColorPicker
                                                                                                            value={element.colorMapping?.[colorInfo.id] || colorInfo.defaultColor}
                                                                                                            onChange={(newColor: any) => {
                                                                                                                const newElements = [...(layer.patternConfig.elements || [])];
                                                                                                                newElements[index] = { 
                                                                                                                    ...element, 
                                                                                                                    colorMapping: {
                                                                                                                        ...(element.colorMapping || {}),
                                                                                                                        [colorInfo.id]: newColor.toHexString()
                                                                                                                    }
                                                                                                                };
                                                                                                                handlePatternConfigChange(layer.id, { 
                                                                                                                    ...layer.patternConfig, 
                                                                                                                    elements: newElements 
                                                                                                                });
                                                                                                            }}
                                                                                                            showText={false}
                                                                                                            size="small"
                                                                                                        />
                                                                                                    </div>
                                                                                                ))}
                                                                                            </div>
                                                                                        );
                                                                                    }
                                                                                    return null;
                                                                                })()}
                                                                            </div>
                                                                        ))}
                                                                        <Button 
                                                                            size="small" 
                                                                            onClick={() => {
                                                                                const newElements = [
                                                                                    ...(layer.patternConfig.elements || []), 
                                                                                    { 
                                                                                        elementType: 'stripes',
                                                                                        stripeConfig: layer.patternType === 'row'
                                                                                            ? { colors: [{ color: '#ffffff', columns: 2 }] }
                                                                                            : { colors: [{ color: '#ffffff', rows: 2 }] }
                                                                                    }
                                                                                ];
                                                                                handlePatternConfigChange(layer.id, { 
                                                                                    ...layer.patternConfig, 
                                                                                    elements: newElements 
                                                                                });
                                                                            }}
                                                                        >
                                                                            Add Element
                                                                        </Button>
                                                                    </Space>
                                                                </div>
                                                            )}

                                                            <div>
                                                                <Text style={textStyle12}>Repeat:</Text>
                                                                <Select
                                                                    value={layer.settings.repeatMode || 'none'}
                                                                    onChange={(value: any) => handleLayerSettingChange(layer.id, 'repeatMode', value)}
                                                                    style={fullWidthStyle}
                                                                    size="small"
                                                                >
                                                                    <Option value="none">Non-repeating</Option>
                                                                    <Option value="x">Repeat Horizontal</Option>
                                                                    <Option value="y">Repeat Vertical</Option>
                                                                    <Option value="both">Repeat Both Directions</Option>
                                                                </Select>
                                                            </div>

                                                            {(layer.settings.repeatMode === 'x' || layer.settings.repeatMode === 'both') && (
                                                                <div>
                                                                    <Text style={textStyle12}>Horizontal Repeats (0=infinity):</Text>
                                                                    <InputNumber
                                                                        value={layer.settings.repeatCountX || 0}
                                                                        onChange={(value: any) => handleLayerSettingChange(layer.id, 'repeatCountX', value || 0)}
                                                                        min={0}
                                                                        max={50}
                                                                        size="small"
                                                                        style={fullWidthStyle}
                                                                        formatter={(value: any) => value === 0 ? 'infinity' : value}
                                                                        parser={(value: any) => value === 'infinity' ? 0 : parseInt(value) || 0}
                                                                    />
                                                                </div>
                                                            )}

                                                            {(layer.settings.repeatMode === 'y' || layer.settings.repeatMode === 'both') && (
                                                                <div>
                                                                    <Text style={textStyle12}>Vertical Repeats (0=infinity):</Text>
                                                                    <InputNumber
                                                                        value={layer.settings.repeatCountY || 0}
                                                                        onChange={(value: any) => handleLayerSettingChange(layer.id, 'repeatCountY', value || 0)}
                                                                        min={0}
                                                                        max={50}
                                                                        size="small"
                                                                        style={fullWidthStyle}
                                                                        formatter={(value: any) => value === 0 ? 'infinity' : value}
                                                                        parser={(value: any) => value === 'infinity' ? 0 : parseInt(value) || 0}
                                                                    />
                                                                </div>
                                                            )}

                                                            <Row gutter={4}>
                                                                <Col span={12}>
                                                                    <Text style={textStyle12}>Horizontal Offset:</Text>
                                                                    <InputNumber
                                                                        value={layer.settings.offsetHorizontal}
                                                                        onChange={(value: any) => handleLayerSettingChange(layer.id, 'offsetHorizontal', value || 0)}
                                                                        size="small"
                                                                        style={fullWidthStyle}
                                                                    />
                                                                </Col>
                                                                <Col span={12}>
                                                                    <Text style={textStyle12}>Vertical Offset:</Text>
                                                                    <InputNumber
                                                                        value={layer.settings.offsetVertical}
                                                                        onChange={(value: any) => handleLayerSettingChange(layer.id, 'offsetVertical', value || 0)}
                                                                        size="small"
                                                                        style={fullWidthStyle}
                                                                    />
                                                                </Col>
                                                            </Row>

                                                            <div>
                                                                <Text style={textStyle12}>Color Assignment:</Text>
                                                                <div style={{ marginTop: 4 }}>
                                                                    {layer.pattern && layer.pattern.colors && (() => {
                                                                        // Only show colors that are actually used in the pattern
                                                                        const usedColors = layer.pattern.getColorsUsed?.() || [];
                                                                        const usedColorIds = new Set(usedColors.map((c: any) => String(c.id)));
                                                                        
                                                                        const filteredEntries = Object.entries(layer.pattern.colors)
                                                                            .filter(([colorId]) => {
                                                                                // If getColorsUsed returned results, filter by them
                                                                                // Otherwise show all non-transparent colors
                                                                                if (usedColors.length > 0) {
                                                                                    return usedColorIds.has(colorId) && colorId !== 'transparent';
                                                                                }
                                                                                return colorId !== 'transparent';
                                                                            });
                                                                        
                                                                        return filteredEntries.map(([colorId, colorInfo]: [string, any]) => {
                                                                            const currentColor = layer.settings.colorMapping?.[colorId] || (colorInfo as any).color;
                                                                            const isTransparent = currentColor === 'transparent';
                                                                            
                                                                            return (
                                                                                <div key={colorId} style={{ 
                                                                                    marginBottom: 4, 
                                                                                    display: 'grid', 
                                                                                    gridTemplateColumns: '1fr auto auto',
                                                                                    alignItems: 'center', 
                                                                                    gap: 8 
                                                                                }}>
                                                                                    <Text style={textStyle11}>{(colorInfo as any).label}</Text>
                                                                                    <ColorPicker
                                                                                        value={isTransparent ? '#ffffff' : currentColor}
                                                                                        onChange={(newColor: any) => handleLayerColorChange(layer.id, colorId, newColor)}
                                                                                        showText={false}
                                                                                        size="small"
                                                                                        disabled={isTransparent}
                                                                                    />
                                                                                    <Button
                                                                                        size="small"
                                                                                        type={isTransparent ? "primary" : "default"}
                                                                                        onClick={() => {
                                                                                            const newColor = isTransparent ? (colorInfo as any).color : 'transparent';
                                                                                            handleLayerColorChange(layer.id, colorId, newColor);
                                                                                        }}
                                                                                        style={{ 
                                                                                            minWidth: 'auto', 
                                                                                            padding: '0 8px',
                                                                                            fontSize: '10px',
                                                                                            height: '24px'
                                                                                        }}
                                                                                        title={isTransparent ? "Make opaque" : "Make transparent"}
                                                                                    >
                                                                                        {isTransparent ? '●' : '○'}
                                                                                    </Button>
                                                                                </div>
                                                                            );
                                                                        });
                                                                    })()}
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
                        </Space>
                    </Card>
                </div>
            </div>
        </div>
    );
};

// Helper pattern creation functions
function createSolidPattern(colors = [{ color: '#ffffff' }]) {
    const colorMap: Record<number, any> = {};
    colors.forEach((colorConfig: any, index: number) => {
        colorMap[index] = { id: index, label: `Color ${index + 1}`, color: colorConfig.color };
    });

    return new ColorworkPattern(
        0,
        0,
        [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ],
        colorMap,
        { width: 4, height: 4 }
    );
}

function createCheckerboardPattern(cellSize = 2, colors = [{ color: '#ffffff' }, { color: '#000000' }]) {
    const patternSize = cellSize * 2; // Each full checkerboard cycle is 2x the cell size
    const grid = [];

    for (let row = 0; row < patternSize; row++) {
        const gridRow = [];
        for (let col = 0; col < patternSize; col++) {
            // Determine which cell we're in
            const cellRow = Math.floor(row / cellSize);
            const cellCol = Math.floor(col / cellSize);
            // Checkerboard pattern: alternating cells
            const colorId = (cellRow + cellCol) % 2;
            gridRow.push(colorId);
        }
        grid.push(gridRow);
    }

    const colorMap: Record<number, any> = {};
    colors.forEach((colorConfig: any, index: number) => {
        colorMap[index] = { id: index, label: `Color ${index + 1}`, color: colorConfig.color };
    });

    return new ColorworkPattern(
        0,
        0,
        grid,
        colorMap,
        { width: patternSize, height: patternSize }
    );
}

function createArgylePattern(colors = [{ color: '#ffffff' }, { color: '#ff0000' }, { color: '#0000ff' }]) {
    const colorMap: Record<number, any> = {};
    colors.forEach((colorConfig: any, index: number) => {
        colorMap[index] = { id: index, label: `Color ${index + 1}`, color: colorConfig.color };
    });

    return new ColorworkPattern(
        0,
        0,
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
        colorMap,
        { width: 8, height: 8 }
    );
}

export function generatePattern(type: any, config: any, targetDimension: any = null) {
    console.log('🎯 generatePattern called:', { type, hasConfig: !!config, configKeys: config ? Object.keys(config) : [] });
    
    if (type === 'stripes') {
        const { colors } = config;

        // Calculate pattern height - if targetDimension is provided and we have 0-row colors,
        // use targetDimension, otherwise use sum of explicit row counts
        let patternHeight;
        const zeroRowColors = colors.filter((c: any) => c.rows === 0);
        const definedRowsTotal = colors.reduce((sum: number, c: any) => sum + (c.rows || 0), 0);

        if (zeroRowColors.length > 0 && targetDimension) {
            patternHeight = targetDimension;
        } else if (zeroRowColors.length > 0 && !targetDimension) {
            // Default height when we have zero-row colors but no target
            patternHeight = Math.max(definedRowsTotal * 2, 20);
        } else {
            patternHeight = Math.max(definedRowsTotal, 1);
        }

        const width = config.width || 4;
        const grid: any[] = [];
        let currentRow = 0;
        let colorIndex = 0;

        // If first and last colors have 0 rows, split remaining space between them
        if (colors.length >= 2 && colors[0].rows === 0 && colors[colors.length - 1].rows === 0) {
            const remainingRows = patternHeight - definedRowsTotal;
            const rowsPerEndColor = Math.floor(remainingRows / 2);
            const extraRow = remainingRows % 2;

            colors.forEach((colorConfig: any, index: number) => {
                if (index === 0) {
                    // First color gets half of remaining rows (plus extra if odd)
                    const rowsToAdd = rowsPerEndColor + extraRow;
                    for (let i = 0; i < rowsToAdd; i++) {
                        grid.push(new Array(width).fill(index));
                    }
                } else if (index === colors.length - 1) {
                    // Last color gets half of remaining rows
                    const rowsToAdd = rowsPerEndColor;
                    for (let i = 0; i < rowsToAdd; i++) {
                        grid.push(new Array(width).fill(index));
                    }
                } else {
                    // Middle colors use their defined row count
                    for (let i = 0; i < colorConfig.rows; i++) {
                        grid.push(new Array(width).fill(index));
                    }
                }
            });
        } else if (colors.every((c: any) => c.rows === 0)) {
            // If all colors have 0 rows, split area evenly
            const rowsPerColor = Math.floor(patternHeight / colors.length);
            let extra = patternHeight - rowsPerColor * colors.length;
            colors.forEach((colorConfig: any, index: number) => {
                let thisRows = rowsPerColor + (index < extra ? 1 : 0);
                for (let i = 0; i < thisRows; i++) {
                    grid.push(new Array(width).fill(index));
                }
            });
        } else {
            // Calculate remaining rows for zero-row colors
            const remainingRowsAfterDefined = Math.max(0, patternHeight - definedRowsTotal);
            colors.forEach((colorConfig: any, index: number) => {
                if (colorConfig.rows === 0) {
                    // For zero-row colors, behavior depends on position
                    if (index === 0) {
                        // First color with 0 rows: fill from beginning until other colors start
                        const rowsToAdd = remainingRowsAfterDefined;
                        for (let i = 0; i < rowsToAdd && currentRow < patternHeight; i++) {
                            grid.push(new Array(width).fill(colorIndex));
                            currentRow++;
                        }
                    } else if (index === colors.length - 1) {
                        // Last color with 0 rows: fill remaining rows at the end
                        const rowsToAdd = patternHeight - currentRow;
                        for (let i = 0; i < rowsToAdd; i++) {
                            grid.push(new Array(width).fill(colorIndex));
                            currentRow++;
                        }
                    } else {
                        // Middle color with 0 rows: split remaining evenly (fallback behavior)
                        const rowsToAdd = zeroRowColors.length > 1 ?
                            Math.floor(remainingRowsAfterDefined / zeroRowColors.length) :
                            remainingRowsAfterDefined;
                        for (let i = 0; i < rowsToAdd && currentRow < patternHeight; i++) {
                            grid.push(new Array(width).fill(colorIndex));
                            currentRow++;
                        }
                    }
                } else {
                    // Add specified number of rows
                    for (let i = 0; i < colorConfig.rows && currentRow < patternHeight; i++) {
                        grid.push(new Array(width).fill(colorIndex));
                        currentRow++;
                    }
                }
                colorIndex++;
            });
        }

        // If we didn't fill all rows, repeat the pattern
        while (grid.length < patternHeight) {
            const remainingRows = patternHeight - grid.length;
            const patternToRepeat = grid.slice(0, Math.min(grid.length, remainingRows));
            grid.push(...patternToRepeat);
        }

        const colorMap: Record<number, any> = {};
        colors.forEach((colorConfig: any, index: number) => {
            colorMap[index] = { id: index, label: `Color ${index + 1}`, color: colorConfig.color };
        });
        return new ColorworkPattern(0, 0, grid, colorMap, { width, height: patternHeight });
    } else if (type === 'vstripes') {
        const { colors } = config;

        // Calculate pattern width - if targetDimension is provided and we have 0-column colors,
        // use targetDimension, otherwise use sum of explicit column counts
        let patternWidth;
        const zeroColumnColors = colors.filter((c: any) => c.columns === 0);
        const definedColumnsTotal = colors.reduce((sum: number, c: any) => sum + (c.columns || 0), 0);

        if (zeroColumnColors.length > 0 && targetDimension) {
            patternWidth = targetDimension;
        } else if (zeroColumnColors.length > 0 && !targetDimension) {
            // Default width when we have zero-column colors but no target
            patternWidth = Math.max(definedColumnsTotal * 2, 20);
        } else {
            patternWidth = Math.max(definedColumnsTotal, 1);
        }

        const height = config.height || 4;
        const grid: any[][] = Array(height).fill(null).map(() => []);
        let currentColumn = 0;
        let colorIndex = 0;

        // Calculate remaining columns for zero-column colors
        const remainingColumnsAfterDefined = Math.max(0, patternWidth - definedColumnsTotal);

        // If first and last colors have 0 columns, split remaining space between them
        if (colors.length >= 2 && colors[0].columns === 0 && colors[colors.length - 1].columns === 0) {
            const remainingColumns = patternWidth - definedColumnsTotal;
            const colsPerEndColor = Math.floor(remainingColumns / 2);
            const extraCol = remainingColumns % 2;

            colors.forEach((colorConfig: any, index: number) => {
                if (index === 0) {
                    // First color gets half of remaining columns (plus extra if odd)
                    const colsToAdd = colsPerEndColor + extraCol;
                    for (let i = 0; i < colsToAdd; i++) {
                        for (let row = 0; row < height; row++) {
                            grid[row].push(index);
                        }
                    }
                } else if (index === colors.length - 1) {
                    // Last color gets half of remaining columns
                    const colsToAdd = colsPerEndColor;
                    for (let i = 0; i < colsToAdd; i++) {
                        for (let row = 0; row < height; row++) {
                            grid[row].push(index);
                        }
                    }
                } else {
                    // Middle colors use their defined column count
                    for (let i = 0; i < colorConfig.columns; i++) {
                        for (let row = 0; row < height; row++) {
                            grid[row].push(index);
                        }
                    }
                }
            });
        } else if (colors.every((c: any) => c.columns === 0)) {
            // If all colors have 0 columns, split area evenly
            const colsPerColor = Math.floor(patternWidth / colors.length);
            let extra = patternWidth - colsPerColor * colors.length;
            colors.forEach((colorConfig: any, index: number) => {
                let thisCols = colsPerColor + (index < extra ? 1 : 0);
                for (let i = 0; i < thisCols; i++) {
                    for (let row = 0; row < height; row++) {
                        grid[row].push(index);
                    }
                }
            });
        } else {
            colors.forEach((colorConfig: any, index: number) => {
                if (colorConfig.columns === 0) {
                    // For zero-column colors, behavior depends on position
                    if (index === 0) {
                        // First color with 0 columns: fill from beginning until other colors start
                        const columnsToAdd = remainingColumnsAfterDefined;
                        for (let i = 0; i < columnsToAdd && currentColumn < patternWidth; i++) {
                            for (let row = 0; row < height; row++) {
                                grid[row].push(colorIndex);
                            }
                            currentColumn++;
                        }
                    } else if (index === colors.length - 1) {
                        // Last color with 0 columns: fill remaining columns at the end
                        const columnsToAdd = patternWidth - currentColumn;
                        for (let i = 0; i < columnsToAdd; i++) {
                            for (let row = 0; row < height; row++) {
                                grid[row].push(colorIndex);
                            }
                            currentColumn++;
                        }
                    } else {
                        // Middle color with 0 columns: split remaining evenly (fallback behavior)
                        const columnsToAdd = zeroColumnColors.length > 1 ?
                            Math.floor(remainingColumnsAfterDefined / zeroColumnColors.length) :
                            remainingColumnsAfterDefined;
                        for (let i = 0; i < columnsToAdd && currentColumn < patternWidth; i++) {
                            for (let row = 0; row < height; row++) {
                                grid[row].push(colorIndex);
                            }
                            currentColumn++;
                        }
                    }
                } else {
                    // Add specified number of columns
                    for (let i = 0; i < colorConfig.columns && currentColumn < patternWidth; i++) {
                        for (let row = 0; row < height; row++) {
                            grid[row].push(colorIndex);
                        }
                        currentColumn++;
                    }
                }
                colorIndex++;
            });
        }

        // If we didn't fill all columns, repeat the pattern
        while (grid[0].length < patternWidth) {
            const remainingColumns = patternWidth - grid[0].length;
            for (let row = 0; row < height; row++) {
                const patternToRepeat = grid[row].slice(0, Math.min(grid[row].length, remainingColumns));
                grid[row].push(...patternToRepeat);
            }
        }

        const colorMap: Record<number, any> = {};
        colors.forEach((colorConfig: any, index: number) => {
            colorMap[index] = { id: index, label: `Color ${index + 1}`, color: colorConfig.color };
        });
        return new ColorworkPattern(0, 0, grid, colorMap, { width: patternWidth, height });
    } else if (type === 'custom' || (typeof type === 'string' && type.startsWith('custom-'))) {
        // Custom pattern from library - use the saved pattern data directly
        if (config.pattern && Array.isArray(config.pattern)) {
            // Convert colors from library format to ColorworkPattern format
            const colorMap: Record<string, any> = {};
            const libraryColors = config.colors || {};
            
            // Check if colors are already in the right format (with id, label, color)
            // or if they're in the simple format (just hex colors)
            Object.entries(libraryColors).forEach(([colorId, colorValue]: [string, any]) => {
                // Special handling for "CCX" - treat as transparent
                if (colorId === 'CCX') {
                    colorMap[colorId] = { 
                        id: colorId, 
                        label: 'Transparent', 
                        color: 'transparent' 
                    };
                } else if (typeof colorValue === 'string') {
                    // Simple format: { "MC": "#ffffff" }
                    colorMap[colorId] = { 
                        id: colorId, 
                        label: colorId, 
                        color: colorValue 
                    };
                } else if (colorValue && typeof colorValue === 'object' && colorValue.color) {
                    // Already in the right format: { "MC": { id: "MC", label: "Main", color: "#fff" } }
                    colorMap[colorId] = colorValue;
                } else {
                    // Fallback
                    colorMap[colorId] = { 
                        id: colorId, 
                        label: colorId, 
                        color: '#ffffff' 
                    };
                }
            });
            
            return new ColorworkPattern(0, 0, config.pattern, colorMap, {});
        }
        // Fallback to solid if pattern data is missing
        return createSolidPattern([{ color: '#ffffff' }]);
    } else if (type === 'solid') {
        return createSolidPattern(config.colors || [{ color: '#ffffff' }]);
    } else if (type === 'checkerboard') {
        return createCheckerboardPattern(config.cellSize || 2, config.colors || [{ color: '#ffffff' }, { color: '#000000' }]);
    } else if (type === 'argyle') {
        return createArgylePattern(config.colors || [{ color: '#ffffff' }, { color: '#ff0000' }, { color: '#0000ff' }]);
    } else if (type === 'row') {
        return createRowPattern(config.elements || [], config.patterns || {});
    } else if (type === 'vstack') {
        return createVStackPattern(config.elements || [], config.patterns || {});
    }
    
    // Fallback for unknown pattern types
    return createSolidPattern([{ color: '#ffffff' }]);
}

function createRowPattern(elements: any = [], availablePatternsRef: any = {}) {
    console.log('🎨 createRowPattern called:', elements);
    
    if (!elements || elements.length === 0) {
        return createSolidPattern([{ color: '#ffffff' }]);
    }

    // Build unified color map with element-specific labels
    const colorMap = {};
    let colorIndex = 0;
    const elementData: any[] = [];

    elements.forEach((element: any, elemIndex: any) => {
        if (element.elementType === 'stripes' && element.stripeConfig) {
            // Generate stripe pattern
            const stripeColors = element.stripeConfig.colors || [];
            const stripeColorMapping: Record<string, any> = {};
            
            stripeColors.forEach((stripe: any, sIndex: any) => {
                const colorId = `c${colorIndex}`;
                const label = stripeColors.length > 1 
                    ? `Stripes-${elemIndex + 1} C${sIndex + 1}`
                    : `Stripes-${elemIndex + 1}`;
                    
                (colorMap as any)[colorId] = {
                    id: colorId,
                    label: label,
                    color: stripe.color || '#ffffff'
                };
                (stripeColorMapping as any)[sIndex] = colorId;
                colorIndex++;
            });

            elementData.push({
                type: 'stripes',
                width: stripeColors.reduce((sum: number, s: any) => sum + (s.columns || 1), 0),
                colorMapping: stripeColorMapping,
                stripeConfig: element.stripeConfig
            });
        } else if (element.elementType === 'shape' && element.shapeKey && availablePatternsRef[element.shapeKey]) {
            // Get the custom pattern
            const patternInfo = availablePatternsRef[element.shapeKey];
            const patternName = patternInfo.name || 'Shape';
            const customPattern = generatePattern(element.shapeKey, patternInfo.defaultConfig || {});
            const repeatCount = element.repeatCount || 1;
            
            // Map custom pattern colors to unified color map
            const shapeColorMapping: Record<string, any> = {};
            Object.entries(customPattern.colors).forEach(([origColorId, colorInfo]: [string, any]) => {
                const colorId = `c${colorIndex}`;
                (colorMap as any)[colorId] = {
                    id: colorId,
                    label: `${patternName} ${colorInfo.label}`,
                    color: colorInfo.color
                };
                (shapeColorMapping as any)[origColorId] = colorId;
                colorIndex++;
            });
            
            elementData.push({
                type: 'shape',
                pattern: customPattern,
                repeatCount: repeatCount,
                colorMapping: shapeColorMapping,
                width: customPattern.getStitchCount() * repeatCount
            });
        }
    });

    // For horizontal stacking, each pattern should repeat independently to fill the total width
    // Calculate the total width needed to accommodate all elements repeating
    const height = Math.max(...elementData.map(elem => {
        if (elem.type === 'shape' && elem.pattern) {
            return elem.pattern.getRowCount();
        }
        return 10; // Default height for stripes
    })) || 10;
    
    // For width, sum up the base widths (no repetition in the width calculation)
    const totalWidth = elementData.reduce((sum, elem) => sum + (elem.width || 4), 0);
    
    const grid: any[] = [];
    for (let row = 0; row < height; row++) {
        const rowData: any[] = [];
        
        elementData.forEach((elem) => {
            if (elem.type === 'stripes') {
                // Stripes don't repeat - just add their columns once
                elem.stripeConfig.colors.forEach((stripe: any, sIdx: number) => {
                    const colorId = elem.colorMapping[sIdx];
                    const columns = stripe.columns || 1;
                    for (let c = 0; c < columns; c++) {
                        rowData.push(colorId);
                    }
                });
            } else if (elem.type === 'shape' && elem.pattern) {
                // Repeat the shape to fill its allocated width
                const patternHeight = elem.pattern.getRowCount();
                const patternWidth = elem.pattern.getStitchCount();
                const totalRepeatWidth = patternWidth * elem.repeatCount;
                
                for (let col = 0; col < totalRepeatWidth; col++) {
                    const patternRow = row % patternHeight;
                    const patternCol = col % patternWidth;
                    const origColorId = elem.pattern.grid[patternRow][patternCol];
                    const unifiedColorId = elem.colorMapping[origColorId];
                    rowData.push(unifiedColorId);
                }
            }
        });
        
        grid.push(rowData);
    }

    return new ColorworkPattern(0, 0, grid, colorMap, { width: totalWidth, height });
}

function createVStackPattern(elements: any = [], availablePatternsRef: any = {}) {
    console.log('🎨 createVStackPattern called:', elements);
    
    if (!elements || elements.length === 0) {
        return createSolidPattern([{ color: '#ffffff' }]);
    }

    // Build unified color map with element-specific labels
    const colorMap = {};
    let colorIndex = 0;
    const elementData: any[] = [];

    elements.forEach((element: any, elemIndex: any) => {
        if (element.elementType === 'stripes' && element.stripeConfig) {
            // Generate stripe pattern
            const stripeColors = element.stripeConfig.colors || [];
            const stripeColorMapping: Record<string, any> = {};
            
            stripeColors.forEach((stripe: any, sIndex: any) => {
                const colorId = `c${colorIndex}`;
                const label = stripeColors.length > 1 
                    ? `Stripes-${elemIndex + 1} C${sIndex + 1}`
                    : `Stripes-${elemIndex + 1}`;
                
                // Use element's color mapping if it exists, otherwise use default color
                const effectiveColor = element.colorMapping && element.colorMapping[`stripe-${sIndex}`]
                    ? element.colorMapping[`stripe-${sIndex}`]
                    : stripe.color || '#ffffff';
                    
                (colorMap as any)[colorId] = {
                    id: colorId,
                    label: label,
                    color: effectiveColor
                };
                (stripeColorMapping as any)[sIndex] = colorId;
                colorIndex++;
            });

            elementData.push({
                type: 'stripes',
                height: stripeColors.reduce((sum: number, s: any) => sum + (s.rows || 1), 0),
                colorMapping: stripeColorMapping,
                stripeConfig: element.stripeConfig
            });
        } else if (element.elementType === 'row' && element.elements) {
            // Recursively generate nested row pattern
            const nestedPattern = createRowPattern(element.elements, availablePatternsRef);
            const repeatCount = element.repeatCount || 1;
            
            // Map nested pattern colors to unified color map
            const nestedColorMapping: Record<string, any> = {};
            Object.entries(nestedPattern.colors).forEach(([origColorId, colorInfo]: [string, any]) => {
                const colorId = `c${colorIndex}`;
                (colorMap as any)[colorId] = {
                    id: colorId,
                    label: `Row-${elemIndex + 1} ${colorInfo.label}`,
                    color: colorInfo.color
                };
                (nestedColorMapping as any)[origColorId] = colorId;
                colorIndex++;
            });
            
            elementData.push({
                type: 'row',
                pattern: nestedPattern,
                repeatCount: repeatCount,
                colorMapping: nestedColorMapping,
                height: nestedPattern.getRowCount() * repeatCount
            });
        } else if (element.elementType === 'shape' && element.shapeKey && availablePatternsRef[element.shapeKey]) {
            // Get the custom pattern - wrap in implicit row for independent repetition
            const patternInfo = availablePatternsRef[element.shapeKey];
            const patternName = patternInfo.name || 'Shape';
            const customPattern = generatePattern(element.shapeKey, patternInfo.defaultConfig || {});
            const repeatCount = element.repeatCount || 1;
            
            // Create an implicit row containing just this shape
            const rowElements = [{ 
                elementType: 'shape', 
                shapeKey: element.shapeKey, 
                repeatCount: repeatCount 
            }];
            const implicitRowPattern = createRowPattern(rowElements, availablePatternsRef);
            
            // Map row pattern colors to unified color map, using element's color mapping if available
            const rowColorMapping: Record<string, any> = {};
            Object.entries(implicitRowPattern.colors).forEach(([origColorId, colorInfo]: [string, any]) => {
                const colorId = `c${colorIndex}`;
                
                // Use element's color mapping if it exists
                const effectiveColor = element.colorMapping && element.colorMapping[origColorId]
                    ? element.colorMapping[origColorId]
                    : colorInfo.color;
                
                (colorMap as any)[colorId] = {
                    id: colorId,
                    label: colorInfo.label,
                    color: effectiveColor
                };
                (rowColorMapping as any)[origColorId] = colorId;
                colorIndex++;
            });
            
            elementData.push({
                type: 'implicit-row',
                pattern: implicitRowPattern,
                colorMapping: rowColorMapping,
                height: implicitRowPattern.getRowCount()
            });
        }
    });

    // Create vertically stacked pattern
    // Calculate LCM of all pattern widths so each pattern completes fully
    const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
    const lcm = (a: number, b: number): number => (a * b) / gcd(a, b);
    
    const patternWidths = elementData.map(elem => {
        if (elem.type === 'row' && elem.pattern) {
            return elem.pattern.getStitchCount();
        } else if (elem.type === 'implicit-row' && elem.pattern) {
            return elem.pattern.getStitchCount();
        }
        return 1; // Stripes can be any width
    });
    
    // Calculate LCM of all widths
    let width = patternWidths.reduce((acc, w) => lcm(acc, w), 1);
    
    // Cap at reasonable maximum to avoid huge patterns
    if (width > 500) {
        // If LCM is too large, just use the max width
        width = Math.max(...patternWidths);
    }
    
    // Ensure minimum width
    width = Math.max(width, 10);
    
    const totalHeight = elementData.reduce((sum, elem) => sum + (elem.height || 4), 0);
    
    const grid: string[][] = [];
    
    elementData.forEach((elem) => {
        if (elem.type === 'stripes') {
            elem.stripeConfig.colors.forEach((stripe: any, sIdx: number) => {
                const colorId = elem.colorMapping[sIdx];
                const rows = stripe.rows || 1;
                for (let r = 0; r < rows; r++) {
                    const rowData = Array(width).fill(colorId);
                    grid.push(rowData);
                }
            });
        } else if (elem.type === 'row' && elem.pattern) {
            // Row repeats independently across full width
            const patternWidth = elem.pattern.getStitchCount();
            
            for (let rep = 0; rep < elem.repeatCount; rep++) {
                for (let row = 0; row < elem.pattern.getRowCount(); row++) {
                    const rowData = [];
                    
                    // Repeat pattern horizontally to fill width
                    for (let col = 0; col < width; col++) {
                        const patternCol = col % patternWidth;
                        const origColorId = elem.pattern.grid[row][patternCol];
                        const unifiedColorId = elem.colorMapping[origColorId];
                        rowData.push(unifiedColorId);
                    }
                    
                    grid.push(rowData);
                }
            }
        } else if (elem.type === 'implicit-row' && elem.pattern) {
            // Implicit row (shape wrapped in row) repeats independently across full width
            const patternWidth = elem.pattern.getStitchCount();
            
            for (let row = 0; row < elem.pattern.getRowCount(); row++) {
                const rowData = [];
                
                // Repeat pattern horizontally to fill width
                for (let col = 0; col < width; col++) {
                    const patternCol = col % patternWidth;
                    const origColorId = elem.pattern.grid[row][patternCol];
                    const unifiedColorId = elem.colorMapping[origColorId];
                    rowData.push(unifiedColorId);
                }
                
                grid.push(rowData);
            }
        }
    });

    return new ColorworkPattern(0, 0, grid, colorMap, { width, height: totalHeight });
}

export default ColorworkCanvasEditor;
