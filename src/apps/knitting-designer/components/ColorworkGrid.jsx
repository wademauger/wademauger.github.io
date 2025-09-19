import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { throttle } from '../utils/performanceUtils';
import RibbonUI from './RibbonUI';
import '../styles/ColorworkGrid.css';

const ColorworkGrid = ({
    pattern,
    colors,
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
    statusInfo,
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

    // Handle mouse down
    const handleMouseDown = useCallback((row, col, event) => {
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
        () => throttle((row, col, event) => {
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
    const handleMouseMove = useCallback((row, col, event) => {
        throttledMouseMove(row, col, event);
    }, [throttledMouseMove]);

    // Handle mouse up
    const handleMouseUp = useCallback((event) => {
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
        const handleGlobalMouseUp = (event) => {
            handleMouseUp(event);
        };

        document.addEventListener('mouseup', handleGlobalMouseUp);
        return () => {
            document.removeEventListener('mouseup', handleGlobalMouseUp);
        };
    }, [handleMouseUp]);

    // Check if a stitch is selected - handle multiple selection areas and excluded cells
    const isStitchSelected = useCallback((row, col) => {
        const cellKey = `${row},${col}`;

        // Check if this cell is in rectangular selection areas
        let inRectangularSelection = false;
        if (selection) {
            const selections = Array.isArray(selection) ? selection : [selection];
            inRectangularSelection = selections.some(sel =>
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
                return colors[clipboardColor] || colors['MC'];
            }
        }
        return colors[pattern[row][col]] || colors['MC'];
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

    // Generate grid lines - memoized for performance
    const gridLines = useMemo(() => {
        const lines = [];

        // Vertical lines
        for (let i = 0; i <= gridSize.width; i++) {
            lines.push(
                <line
                    key={`v-${i}`}
                    x1={i * 20}
                    y1={0}
                    x2={i * 20}
                    y2={gridSize.height * 20}
                    stroke="#ddd"
                    strokeWidth="0.5"
                />
            );
        }

        // Horizontal lines
        for (let i = 0; i <= gridSize.height; i++) {
            lines.push(
                <line
                    key={`h-${i}`}
                    x1={0}
                    y1={i * 20}
                    x2={gridSize.width * 20}
                    y2={i * 20}
                    stroke="#ddd"
                    strokeWidth="0.5"
                />
            );
        }

        return lines;
    }, [gridSize]);

    // Memoized stitch renderer for performance
    const renderStitch = useCallback((rowIndex, colIndex, stitch) => {
        const x = colIndex * 20;
        const y = rowIndex * 20;
        const color = getStitchDisplayColor(rowIndex, colIndex);

        return (
            <rect
                key={`${rowIndex}-${colIndex}`}
                x={x + 1}
                y={y + 1}
                width={18}
                height={18}
                fill={color}
                stroke="#999"
                strokeWidth="0.5"
                className={getStitchClasses(rowIndex, colIndex)}
                onMouseDown={(e) => handleMouseDown(rowIndex, colIndex, e)}
                onMouseMove={(e) => handleMouseMove(rowIndex, colIndex, e)}
                style={{ cursor: pasteMode ? 'crosshair' : activeTool === 'pencil' ? 'crosshair' : 'cell' }}
                title={`${rowIndex + 1},${colIndex + 1}: ${stitch}`}
            />
        );
    }, [getStitchDisplayColor, getStitchClasses, handleMouseDown, handleMouseMove, pasteMode, activeTool]);

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
                    {selection && (
                        <>
                            {(Array.isArray(selection) ? selection : [selection]).map((sel, index) => (
                                <rect
                                    key={`selection-${index}`}
                                    x={sel.startCol * 20}
                                    y={sel.startRow * 20}
                                    width={(sel.endCol - sel.startCol + 1) * 20}
                                    height={(sel.endRow - sel.startRow + 1) * 20}
                                    fill="rgba(0, 100, 255, 0.2)"
                                    stroke="#0064ff"
                                    strokeWidth="2"
                                    strokeDasharray="5,5"
                                    pointerEvents="none"
                                />
                            ))}
                        </>
                    )}

                    {/* Current selection overlay */}
                    {isMouseDown && selectionStart && selectionEnd && (
                        <rect
                            x={Math.min(selectionStart.col, selectionEnd.col) * 20}
                            y={Math.min(selectionStart.row, selectionEnd.row) * 20}
                            width={(Math.abs(selectionEnd.col - selectionStart.col) + 1) * 20}
                            height={(Math.abs(selectionEnd.row - selectionStart.row) + 1) * 20}
                            fill="rgba(255, 165, 0, 0.3)"
                            stroke="#ff6600"
                            strokeWidth="2"
                            pointerEvents="none"
                        />
                    )}

                    {/* Paste preview overlay - handle irregular shapes */}
                    {pastePreview && clipboard && (
                        <>
                            {clipboard.map((row, rowIndex) =>
                                row.map((cell, colIndex) => {
                                    if (cell === null) return null; // Skip null cells
                                    return (
                                        <rect
                                            key={`paste-${rowIndex}-${colIndex}`}
                                            x={(pastePreview.col + colIndex) * 20}
                                            y={(pastePreview.row + rowIndex) * 20}
                                            width={20}
                                            height={20}
                                            fill="rgba(0, 255, 0, 0.2)"
                                            stroke="#00ff00"
                                            strokeWidth="2"
                                            strokeDasharray="3,3"
                                            pointerEvents="none"
                                        />
                                    );
                                })
                            )}
                        </>
                    )}
                </svg>
                
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
