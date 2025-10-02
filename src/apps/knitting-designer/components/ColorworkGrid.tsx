import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { throttle } from '../utils/performanceUtils';
import RibbonUI from './RibbonUI';
import '../styles/ColorworkGrid.css';

const ColorworkGrid = ({
    pattern,
    colors,
    backgroundColorId,
    gridSize,
    activeTool,
    activeColor,
    selection,
    selectedCells,
    onStitchClick,
    onAreaSelect,
    pasteMode,
    pastePreview,
    onPastePreview,
    clipboard,
    // Status bar props
    activeColorData,
    // RibbonUI props
    onToolChange,
    hasClipboard,
    onCopy,
    onPaste,
    onClearSelection,
    onFillSelection,
    hasSelection,
    onDuplicateSelection,
    onRotateSelection,
    onReflectSelection,
    onGridResize,
    onClearPattern,
    onUndo,
    onRedo,
    canUndo,
    canRedo,
    onExport,
    symmetry,
    onSymmetryChange
}) => {
    const [isMouseDown, setIsMouseDown] = useState(false);
    const [selectionStart, setSelectionStart] = useState(null);
    const [selectionEnd, setSelectionEnd] = useState(null);
    const [hoverPosition, setHoverPosition] = useState(null);
    const gridRef = useRef(null);
    const [offsetRow, setOffsetRow] = useState(0);
    const [offsetCol, setOffsetCol] = useState(0);
    const [visibleRows, setVisibleRows] = useState(20);
    const [visibleCols, setVisibleCols] = useState(20);

    // Handle mouse down
    const handleMouseDown = useCallback((row, col, event: any) => {
        // Handle control-click for individual cell selection
        if (event.ctrlKey && activeTool === 'area-select') {
            // Don't prevent default for control-click to allow proper handling
            onStitchClick(row, col, event);
            return;
        }

        event.preventDefault();
        setIsMouseDown(true);

        if (activeTool === 'pencil') {
            onStitchClick(row, col, event);
        } else if (activeTool === 'area-select') {
            setSelectionStart({ row, col });
            setSelectionEnd({ row, col });
        }
    }, [activeTool, onStitchClick]);

    // Throttled mouse move handler for better performance
    const throttledMouseMove = useMemo(
        () => throttle((row, col, event: any) => {
            setHoverPosition({ row, col });

            if (pasteMode && clipboard) {
                onPastePreview({ row, col, width: clipboard[0].length, height: clipboard.length });
            }

            if (isMouseDown) {
                if (activeTool === 'pencil') {
                    onStitchClick(row, col, event);
                } else if (activeTool === 'area-select' && selectionStart) {
                    setSelectionEnd({ row, col });
                }
            }
        }, 16), // ~60fps
        [isMouseDown, activeTool, onStitchClick, selectionStart, pasteMode, clipboard, onPastePreview]
    );

    // Handle mouse move
    const handleMouseMove = useCallback((row, col, event: any) => {
        throttledMouseMove(row, col, event);
    }, [throttledMouseMove]);

    // Handle mouse up
    const handleMouseUp = useCallback((event: any) => {
        if (isMouseDown && activeTool === 'area-select' && selectionStart && selectionEnd) {
            const modifierKey = event.shiftKey ? 'shift' : event.ctrlKey ? 'ctrl' : null;
            onAreaSelect(selectionStart.row, selectionStart.col, selectionEnd.row, selectionEnd.col, modifierKey);
        }

        setIsMouseDown(false);
        setSelectionStart(null);
        setSelectionEnd(null);
    }, [isMouseDown, activeTool, selectionStart, selectionEnd, onAreaSelect]);

    // Handle mouse leave
    const handleMouseLeave = useCallback(() => {
        setIsMouseDown(false);
        setSelectionStart(null);
        setSelectionEnd(null);
        setHoverPosition(null);
        if (pasteMode) {
            onPastePreview(null);
        }
    }, [pasteMode, onPastePreview]);

    // Add event listeners
    useEffect(() => {
        const handleGlobalMouseUp = (event: any) => {
            handleMouseUp(event);
        };

        document.addEventListener('mouseup', handleGlobalMouseUp);
        return () => {
            document.removeEventListener('mouseup', handleGlobalMouseUp);
        };
    }, [handleMouseUp]);

    // Compute visible rows/cols based on container size (viewport-limited rendering)
    useEffect(() => {
        const computeVisible = () => {
            const container = gridRef.current;
            if (!container) return;
            // Measure available area for the SVG. Subtract space for RibbonUI and status bar if needed.
            const rect = container.getBoundingClientRect();
            const width = Math.max(40, rect.width - 20); // padding
            const height = Math.max(40, rect.height - 80); // reserve space for ribbon/status

            const cols = Math.max(1, Math.floor(width / 20));
            const rows = Math.max(1, Math.floor(height / 20));

            // Clamp offsets so we don't go out of bounds
            setVisibleCols(cols);
            setVisibleRows(rows);
            setOffsetCol(prev => Math.min(Math.max(0, prev), Math.max(0, gridSize.width - cols)));
            setOffsetRow(prev => Math.min(Math.max(0, prev), Math.max(0, gridSize.height - rows)));
        };

        computeVisible();
        const handleResize = throttle(() => computeVisible(), 100);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [gridRef, gridSize.width, gridSize.height]);

    // Check if a stitch is selected - handle multiple selection areas and excluded cells
    const isStitchSelected = useCallback((row, col) => {
        const cellKey = `${row},${col}`;

        // Check if this cell is in rectangular selection areas
        let inRectangularSelection = false;
        if (selection) {
            const selections = Array.isArray(selection) ? selection : [selection];
            inRectangularSelection = selections.some((sel: any) =>
                row >= sel.startRow && row <= sel.endRow &&
                col >= sel.startCol && col <= sel.endCol
            );
        }

        // Check if this cell is excluded (control-clicked to remove from selection)
        const isExcluded = selectedCells && selectedCells.has(cellKey);

        // Show as selected if in rectangular selection and not excluded
        return inRectangularSelection && !isExcluded;
    }, [selection, selectedCells]);

    // Check if a stitch is in current selection area
    const isStitchInCurrentSelection = useCallback((row, col) => {
        if (!selectionStart || !selectionEnd) return false;
        const minRow = Math.min(selectionStart.row, selectionEnd.row);
        const maxRow = Math.max(selectionStart.row, selectionEnd.row);
        const minCol = Math.min(selectionStart.col, selectionEnd.col);
        const maxCol = Math.max(selectionStart.col, selectionEnd.col);
        return row >= minRow && row <= maxRow && col >= minCol && col <= maxCol;
    }, [selectionStart, selectionEnd]);

    // Check if a stitch is in paste preview - handle null cells
    const isStitchInPastePreview = useCallback((row, col) => {
        if (!pastePreview || !clipboard) return false;
        const { row: previewRow, col: previewCol } = pastePreview;
        const clipboardRow = row - previewRow;
        const clipboardCol = col - previewCol;
        return row >= previewRow && row < previewRow + clipboard.length &&
            col >= previewCol && col < previewCol + clipboard[0].length &&
            clipboard[clipboardRow] && clipboard[clipboardRow][clipboardCol] !== null;
    }, [pastePreview, clipboard]);

    // Get stitch display color - handle null clipboard cells
    const getStitchDisplayColor = useCallback((row, col) => {
        if (isStitchInPastePreview(row, col)) {
            const clipboardRow = row - pastePreview.row;
            const clipboardCol = col - pastePreview.col;
            const clipboardColor = clipboard[clipboardRow][clipboardCol];
            if (clipboardColor !== null) {
                return colors[clipboardColor] || colors[backgroundColorId] || colors['MC'];
            }
        }
        return colors[pattern[row][col]] || colors[backgroundColorId] || colors['MC'];
    }, [pattern, colors, isStitchInPastePreview, pastePreview, clipboard]);

    // Get stitch CSS classes
    const getStitchClasses = useCallback((row, col) => {
        const classes = ['stitch'];

        if (isStitchSelected(row, col)) {
            classes.push('selected');
        }

        if (isStitchInCurrentSelection(row, col)) {
            classes.push('current-selection');
        }

        if (isStitchInPastePreview(row, col)) {
            classes.push('paste-preview');
        }

        if (hoverPosition && hoverPosition.row === row && hoverPosition.col === col) {
            classes.push('hover');
        }

        return classes.join(' ');
    }, [isStitchSelected, isStitchInCurrentSelection, isStitchInPastePreview, hoverPosition]);

    // Generate grid lines for visible viewport - memoized for performance
    const gridLines = useMemo(() => {
        const lines = [];
        const startCol = offsetCol;
        const endCol = Math.min(gridSize.width - 1, offsetCol + visibleCols - 1);
        const startRow = offsetRow;
        const endRow = Math.min(gridSize.height - 1, offsetRow + visibleRows - 1);

        // Vertical lines (in viewport coordinates)
        for (let c = startCol; c <= endCol + 1; c++) {
            const x = (c - offsetCol) * 20;
            lines.push(
                <line
                    key={`v-${c}`}
                    x1={x}
                    y1={0}
                    x2={x}
                    y2={(endRow - startRow + 1) * 20}
                    stroke="#ddd"
                    strokewidth="1"
                />
            );
        }

        // Horizontal lines
        for (let r = startRow; r <= endRow + 1; r++) {
            const y = (r - offsetRow) * 20;
            lines.push(
                <line
                    key={`h-${r}`}
                    x1={0}
                    y1={y}
                    x2={(endCol - startCol + 1) * 20}
                    y2={y}
                    stroke="#ddd"
                    strokewidth="1"
                />
            );
        }

        return lines;
    }, [gridSize, offsetCol, offsetRow, visibleCols, visibleRows]);

    // Selection overlays (viewport-relative) - memoized
    const selectionOverlays = useMemo(() => {
        if (!selection) return null;
        return (Array.isArray(selection) ? selection : [selection]).map((sel, index: number) => {
            const x = (sel.startCol - offsetCol) * 20;
            const y = (sel.startRow - offsetRow) * 20;
            const w = (sel.endCol - sel.startCol + 1) * 20;
            const h = (sel.endRow - sel.startRow + 1) * 20;
            if (sel.endCol < offsetCol || sel.startCol > offsetCol + visibleCols - 1 || sel.endRow < offsetRow || sel.startRow > offsetRow + visibleRows - 1) return null;
            return (
                <rect
                    key={`selection-${index}`}
                    x={x}
                    y={y}
                    width={w}
                    height={h}
                    fill="rgba(0, 100, 255, 0.2)"
                    stroke="#0064ff"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                    pointerEvents="none"
                />
            );
        });
    }, [selection, offsetCol, offsetRow, visibleCols, visibleRows]);

    const currentSelectionOverlay = useMemo(() => {
        if (!isMouseDown || !selectionStart || !selectionEnd) return null;
        const minCol = Math.min(selectionStart.col, selectionEnd.col);
        const minRow = Math.min(selectionStart.row, selectionEnd.row);
        const w = (Math.abs(selectionEnd.col - selectionStart.col) + 1) * 20;
        const h = (Math.abs(selectionEnd.row - selectionStart.row) + 1) * 20;
        const x = (minCol - offsetCol) * 20;
        const y = (minRow - offsetRow) * 20;
        if (minCol > offsetCol + visibleCols - 1 || (minCol + w / 20 - 1) < offsetCol || minRow > offsetRow + visibleRows - 1 || (minRow + h / 20 - 1) < offsetRow) return null;
        return (
            <rect
                x={x}
                y={y}
                width={w}
                height={h}
                fill="rgba(255, 165, 0, 0.3)"
                stroke="#ff6600"
                strokeWidth="2"
                pointerEvents="none"
            />
        );
    }, [isMouseDown, selectionStart, selectionEnd, offsetCol, offsetRow, visibleCols, visibleRows]);

    const pastePreviewOverlays = useMemo(() => {
        if (!pastePreview || !clipboard) return null;
        const items = [];
        clipboard.forEach((prow, rowIndex) => {
            prow.forEach((cell, colIndex) => {
                if (cell === null) return;
                const ar = pastePreview.row + rowIndex;
                const ac = pastePreview.col + colIndex;
                if (ar < offsetRow || ar > offsetRow + visibleRows - 1 || ac < offsetCol || ac > offsetCol + visibleCols - 1) return;
                items.push(
                    <rect
                        key={`paste-${rowIndex}-${colIndex}`}
                        x={(ac - offsetCol) * 20}
                        y={(ar - offsetRow) * 20}
                        width={20}
                        height={20}
                        fill="rgba(0, 255, 0, 0.2)"
                        stroke="#00ff00"
                        strokeWidth="2"
                        strokeDasharray="3,3"
                        pointerEvents="none"
                    />
                );
            });
        });
        return items;
    }, [pastePreview, clipboard, offsetCol, offsetRow, visibleCols, visibleRows]);

    // Memoized stitch renderer for performance (renders at viewport-relative coords)
    const renderStitch = useCallback((actualRow, actualCol, stitch) => {
        const x = (actualCol - offsetCol) * 20;
        const y = (actualRow - offsetRow) * 20;
        const color = getStitchDisplayColor(actualRow, actualCol);

        // If the stitch is the 'no color' marker (CCX) or resolves to transparent, render a 2x2 checkerboard
        const resolvedId = pattern[actualRow] && pattern[actualRow][actualCol];
        const isNoColor = resolvedId === 'CCX' || color === 'transparent' || color === undefined;

        if (isNoColor) {
            // Draw 2x2 checker inside the 18x18 cell (each sub-square 9x9)
            return (
                <g key={`${actualRow}-${actualCol}`} className={getStitchClasses(actualRow, actualCol)}>
                    <rect x={x + 1} y={y + 1} width={9} height={9} fill="#f0f0f0" stroke="#999" strokeWidth="0.25" />
                    <rect x={x + 10} y={y + 1} width={9} height={9} fill="#ffffff" stroke="#999" strokeWidth="0.25" />
                    <rect x={x + 1} y={y + 10} width={9} height={9} fill="#ffffff" stroke="#999" strokeWidth="0.25" />
                    <rect x={x + 10} y={y + 10} width={9} height={9} fill="#f0f0f0" stroke="#999" strokeWidth="0.25" />
                    <rect
                        x={x + 1}
                        y={y + 1}
                        width={18}
                        height={18}
                        fill="transparent"
                        stroke="#999"
                        strokeWidth={1}
                        onMouseDown={(e: any) => handleMouseDown(actualRow, actualCol, e)}
                        onMouseMove={(e: any) => handleMouseMove(actualRow, actualCol, e)}
                        style={{ pointerEvents: 'all', cursor: pasteMode ? 'crosshair' : activeTool === 'pencil' ? 'crosshair' : 'cell' }}
                        title={`${actualRow + 1},${actualCol + 1}: ${stitch}`}
                    />
                </g>
            );
        }

        return (
            <rect
                key={`${actualRow}-${actualCol}`}
                x={x + 1}
                y={y + 1}
                width={18}
                height={18}
                fill={color}
                stroke="#999"
                strokeWidth="1"
                className={getStitchClasses(actualRow, actualCol)}
                onMouseDown={(e: any) => handleMouseDown(actualRow, actualCol, e)}
                onMouseMove={(e: any) => handleMouseMove(actualRow, actualCol, e)}
                style={{ pointerEvents: 'all', cursor: pasteMode ? 'crosshair' : activeTool === 'pencil' ? 'crosshair' : 'cell' }}
                title={`${actualRow + 1},${actualCol + 1}: ${stitch}`}
            />
        );
    }, [getStitchDisplayColor, getStitchClasses, handleMouseDown, handleMouseMove, pasteMode, activeTool, offsetCol, offsetRow, pattern]);

    return (
        <div className="colorwork-grid-container">
            <div
                className="colorwork-grid"
                ref={gridRef}
                onMouseLeave={handleMouseLeave}
            >
                {/* Ribbon UI */}
                <RibbonUI
                    // Tool props
                    activeTool={activeTool}
                    onToolChange={onToolChange}
                    pasteMode={pasteMode}
                    hasClipboard={hasClipboard}
                    onCopy={onCopy}
                    onPaste={onPaste}
                    onClearSelection={onClearSelection}
                    onFillSelection={onFillSelection}
                    hasSelection={hasSelection}

                    // Selection tools props
                    onDuplicateSelection={onDuplicateSelection}
                    onRotateSelection={onRotateSelection}
                    onReflectSelection={onReflectSelection}

                    // Grid props
                    gridSize={gridSize}
                    onGridResize={onGridResize}
                    onClearPattern={onClearPattern}
                    onUndo={onUndo}
                    onRedo={onRedo}
                    canUndo={canUndo}
                    canRedo={canRedo}
                    onExport={onExport}

                    // Symmetry props
                    symmetry={symmetry}
                    onSymmetryChange={onSymmetryChange}
                />
                <div className="svg-wrapper">
                    <svg
                        width={4 + (gridSize.width * 20)}
                        height={4 + (gridSize.height * 20)}
                        className="grid-svg"
                    >
                        {/* Grid lines */}
                        {gridLines}

                        {/* Stitches */}
                        {pattern.map((row, rowIndex) =>
                            row.map((stitch, colIndex) => renderStitch(rowIndex, colIndex, stitch))
                        )}

                        {/* Selection overlay - handle rectangular selection areas */}
                        {selectionOverlays}

                        {/* Current selection overlay */}
                        {currentSelectionOverlay}

                        {/* Paste preview overlay - handle irregular shapes */}
                        {pastePreviewOverlays}
                    </svg>
                </div>

                {/* Status bar */}
                <div className="status-bar">
                    <span>Size: {gridSize.width} × {gridSize.height}</span>
                    <span>Tool: {activeTool}</span>
                    <span>Color: {activeColorData?.label || activeColor}</span>
                    {(selection || selectedCells?.size > 0) && (
                        <span>
                            Selection: {
                                selection
                                    ? Array.isArray(selection)
                                        ? `${selection.length} areas`
                                        : `${selection.endRow - selection.startRow + 1} × ${selection.endCol - selection.startCol + 1}`
                                    : ''
                            }
                            {selectedCells?.size > 0 && selection && (
                                <span style={{ color: '#ff6600' }}> (-{selectedCells.size} excluded)</span>
                            )}
                        </span>
                    )}
                    {pasteMode && <span className="paste-mode">Paste Mode Active</span>}
                </div>
            </div>
        </div>
    );
};

export default ColorworkGrid;
