import React, { useState, useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
    selectActiveColorId,
    selectColorPalette,
    selectActiveColor
} from './store/colorworkGridSlice';
import { selectBackgroundColorId } from './store/colorworkGridSlice';
import ColorworkGrid from './components/ColorworkGrid';
import './styles/KnittingDesignerApp.css';

const KnittingDesignerApp = () => {
    // Redux selectors
    const activeColorId = useSelector(selectActiveColorId);
    const colors = useSelector(selectColorPalette); // Legacy format for existing code
    const activeColorData = useSelector(selectActiveColor);
    // Google Drive connection state (some UI paths expect this variable)
    const isGoogleDriveConnected = useSelector((state) => (state && state.songs ? state.songs.isGoogleDriveConnected : false));

    // Current active color (for painting)
    const activeColor = activeColorId;
    const backgroundColorId = useSelector(selectBackgroundColorId);

    // Grid state
    const [gridSize, setGridSize] = useState({ width: 20, height: 20 });
    const [pattern, setPattern] = useState(() => {
        // Initialize with background color (defaults to CC1)
        const defaultFill = backgroundColorId || activeColorId || 'MC';
        return Array(20).fill(null).map(() => Array(20).fill(defaultFill));
    });

    // Tool state
    const [activeTool, setActiveTool] = useState('pencil'); // 'pencil' or 'area-select'

    // Symmetry state
    const [symmetry, setSymmetry] = useState({
        enabled: false,
        direction: 'horizontal', // 'horizontal' or 'vertical'
        type: 'mirror' // 'mirror' or 'rotational'
    });

    // Selection state - now supports individual cells and rectangles
    const [selection, setSelection] = useState(null); // Can be rectangles or individual cells
    const [selectedCells, setSelectedCells] = useState(new Set()); // Set of "row,col" strings

    // Clipboard state
    const [clipboard, setClipboard] = useState(null);
    const [pasteMode, setPasteMode] = useState(false);
    const [pastePreview, setPastePreview] = useState(null);

    // History for undo/redo
    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    // Helper functions for selection management
    const cellKey = (row, col) => `${row},${col}`;

    // Save current state to history - defined early to avoid hoisting issues
    const saveToHistory = useCallback((newPattern) => {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(JSON.parse(JSON.stringify(newPattern)));
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    }, [history, historyIndex]);

    // Selection manipulation functions - work with rectangular selections only
    const duplicateSelection = useCallback(() => {
        if (!selection) return;

        const newPattern = [...pattern];
        let newSelection = [];

        // Handle rectangular selection
        const selections = Array.isArray(selection) ? selection : [selection];

        selections.forEach(sel => {
            const offsetCol = sel.endCol - sel.startCol + 2;

            for (let row = sel.startRow; row <= sel.endRow; row++) {
                newPattern[row] = [...newPattern[row]];
                for (let col = sel.startCol; col <= sel.endCol; col++) {
                    const newCol = col + offsetCol;
                    if (newCol < gridSize.width) {
                        // Don't duplicate cells that are excluded (control-clicked to remove from selection)
                        const isExcluded = selectedCells.has(cellKey(row, col));
                        if (!isExcluded) {
                            newPattern[row][newCol] = pattern[row][col];
                        }
                    }
                }
            }

            // Create new selection area for the duplicated region
            const newSelectionArea = {
                startRow: sel.startRow,
                endRow: sel.endRow,
                startCol: sel.startCol + offsetCol,
                endCol: sel.endCol + offsetCol
            };

            // Only add if the new area fits within the grid
            if (newSelectionArea.endCol < gridSize.width) {
                newSelection.push(newSelectionArea);
            }
        });

        saveToHistory(newPattern);
        setPattern(newPattern);

        // Update selection to show the new duplicated areas
        if (newSelection.length > 0) {
            setSelection(newSelection.length === 1 ? newSelection[0] : newSelection);
        }
        // Clear individual excluded cells since we have new selection areas
        setSelectedCells(new Set());
    }, [selection, selectedCells, pattern, gridSize, saveToHistory]);

    // rotateCounterclockwise: boolean. false => rotate right (clockwise), true => rotate left (counter-clockwise).
    const rotateSelection = useCallback((rotateCounterclockwise = false) => {
        if (!selection) return;

        const newPattern = [...pattern];
        let newSelection = [];

        // Handle rectangular selection
        const selections = Array.isArray(selection) ? selection : [selection];

        selections.forEach(sel => {
            const centerRow = (sel.startRow + sel.endRow) / 2;
            const centerCol = (sel.startCol + sel.endCol) / 2;

            // Store original colors for cells that are not individually unselected
            const originalColors = {};
            for (let row = sel.startRow; row <= sel.endRow; row++) {
                for (let col = sel.startCol; col <= sel.endCol; col++) {
                    const isIndividuallyUnselected = selectedCells.has(cellKey(row, col));
                    if (!isIndividuallyUnselected) {
                        originalColors[cellKey(row, col)] = pattern[row][col];
                    }
                }
            }

            // Clear original cells (only the ones that are not individually unselected)
            for (let row = sel.startRow; row <= sel.endRow; row++) {
                newPattern[row] = [...newPattern[row]];
                for (let col = sel.startCol; col <= sel.endCol; col++) {
                    const isIndividuallyUnselected = selectedCells.has(cellKey(row, col));
                    if (!isIndividuallyUnselected) {
                        newPattern[row][col] = backgroundColorId || activeColorId || 'MC';
                    }
                }
            }

            // Track the bounds of the rotated area
            let minRow = Infinity, maxRow = -Infinity, minCol = Infinity, maxCol = -Infinity;

            // Rotate 90 degrees around center
            // For clockwise (rotateCounterclockwise=false): (x, y) -> (-y, x)
            // For counter-clockwise (rotateCounterclockwise=true): (x, y) -> (y, -x)
            for (let row = sel.startRow; row <= sel.endRow; row++) {
                for (let col = sel.startCol; col <= sel.endCol; col++) {
                    const isExcluded = selectedCells.has(cellKey(row, col));
                    if (!isExcluded && originalColors[cellKey(row, col)]) {
                        const relativeRow = row - centerRow;
                        const relativeCol = col - centerCol;

                        let newRelativeRow, newRelativeCol;
                        // Note: grid row increases downward, which flips the visual sense of rotation.
                        // To match expected visual directions in screen coordinates, swap the math used for the boolean.
                        if (rotateCounterclockwise) {
                            // Visual left (counter-clockwise) mapping for grid coordinates
                            newRelativeRow = -relativeCol;
                            newRelativeCol = relativeRow;
                        } else {
                            // Visual right (clockwise) mapping for grid coordinates
                            newRelativeRow = relativeCol;
                            newRelativeCol = -relativeRow;
                        }

                        const newRow = Math.round(centerRow + newRelativeRow);
                        const newCol = Math.round(centerCol + newRelativeCol);

                        if (newRow >= 0 && newRow < gridSize.height && newCol >= 0 && newCol < gridSize.width) {
                            newPattern[newRow] = [...newPattern[newRow]];
                            newPattern[newRow][newCol] = originalColors[cellKey(row, col)];

                            // Track bounds for new selection
                            minRow = Math.min(minRow, newRow);
                            maxRow = Math.max(maxRow, newRow);
                            minCol = Math.min(minCol, newCol);
                            maxCol = Math.max(maxCol, newCol);
                        }
                    }
                }
            }

            // Create new selection area for the rotated region
            if (minRow !== Infinity) {
                newSelection.push({
                    startRow: minRow,
                    endRow: maxRow,
                    startCol: minCol,
                    endCol: maxCol
                });
            }
        });

        saveToHistory(newPattern);
        setPattern(newPattern);

        // Update selection to show the new rotated areas
        if (newSelection.length > 0) {
            setSelection(newSelection.length === 1 ? newSelection[0] : newSelection);
        }
        // Clear individual excluded cells since we have new selection areas
        setSelectedCells(new Set());
    }, [selection, selectedCells, pattern, gridSize, saveToHistory, backgroundColorId, activeColorId]);

    const reflectSelection = useCallback((direction) => {
        if (!selection) return;

        const newPattern = [...pattern];
        let newSelection = [];

        // Handle rectangular selection
        const selections = Array.isArray(selection) ? selection : [selection];

        selections.forEach(sel => {
            const centerRow = (sel.startRow + sel.endRow) / 2;
            const centerCol = (sel.startCol + sel.endCol) / 2;

            // Store original colors for cells that are not excluded
            const originalColors = {};
            for (let row = sel.startRow; row <= sel.endRow; row++) {
                for (let col = sel.startCol; col <= sel.endCol; col++) {
                    const isExcluded = selectedCells.has(cellKey(row, col));
                    if (!isExcluded) {
                        originalColors[cellKey(row, col)] = pattern[row][col];
                    }
                }
            }

            // Clear original cells (only the ones that are not excluded)
            for (let row = sel.startRow; row <= sel.endRow; row++) {
                newPattern[row] = [...newPattern[row]];
                for (let col = sel.startCol; col <= sel.endCol; col++) {
                    const isExcluded = selectedCells.has(cellKey(row, col));
                    if (!isExcluded) {
                        newPattern[row][col] = backgroundColorId || activeColorId || 'MC';
                    }
                }
            }

            // Track the bounds of the reflected area
            let minRow = Infinity, maxRow = -Infinity, minCol = Infinity, maxCol = -Infinity;

            // Reflect
            for (let row = sel.startRow; row <= sel.endRow; row++) {
                for (let col = sel.startCol; col <= sel.endCol; col++) {
                    const isExcluded = selectedCells.has(cellKey(row, col));
                    if (!isExcluded && originalColors[cellKey(row, col)]) {
                        let newRow = row;
                        let newCol = col;

                        if (direction === 'horizontal') {
                            // Reflect horizontally around center
                            newCol = Math.round(2 * centerCol - col);
                        } else if (direction === 'vertical') {
                            // Reflect vertically around center
                            newRow = Math.round(2 * centerRow - row);
                        }

                        if (newRow >= 0 && newRow < gridSize.height && newCol >= 0 && newCol < gridSize.width) {
                            newPattern[newRow] = [...newPattern[newRow]];
                            newPattern[newRow][newCol] = originalColors[cellKey(row, col)];

                            // Track bounds for new selection
                            minRow = Math.min(minRow, newRow);
                            maxRow = Math.max(maxRow, newRow);
                            minCol = Math.min(minCol, newCol);
                            maxCol = Math.max(maxCol, newCol);
                        }
                    }
                }
            }

            // Create new selection area for the reflected region
            if (minRow !== Infinity) {
                newSelection.push({
                    startRow: minRow,
                    endRow: maxRow,
                    startCol: minCol,
                    endCol: maxCol
                });
            }
        });

        saveToHistory(newPattern);
        setPattern(newPattern);

        // Update selection to show the new reflected areas
        if (newSelection.length > 0) {
            setSelection(newSelection.length === 1 ? newSelection[0] : newSelection);
        }
        // Clear individual excluded cells since we have new selection areas
        setSelectedCells(new Set());
    }, [selection, selectedCells, pattern, gridSize, saveToHistory, backgroundColorId, activeColorId]);

    // Initialize history with first pattern
    useEffect(() => {
        if (history.length === 0) {
            const initialFill = backgroundColorId || activeColorId || 'MC';
            const initialPattern = Array(20).fill(null).map(() => Array(20).fill(initialFill));
            setHistory([JSON.parse(JSON.stringify(initialPattern))]);
            setHistoryIndex(0);
        }
    }, [history.length, backgroundColorId, activeColorId]);

    // Apply symmetry to pattern
    const applySymmetry = useCallback((newPattern, row, col, color) => {
        const height = newPattern.length;
        const width = newPattern[0].length;

        // Always set the original stitch
        newPattern[row][col] = color;

        // Apply symmetry if enabled
        if (!symmetry.enabled) return newPattern;

        if (symmetry.direction === 'horizontal') {
            if (symmetry.type === 'mirror') {
                // Mirror horizontally (left-right)
                const mirrorCol = width - 1 - col;
                if (mirrorCol >= 0 && mirrorCol < width) {
                    newPattern[row][mirrorCol] = color;
                }
            } else if (symmetry.type === 'rotational') {
                // Rotate 180 degrees around center
                const rotatedRow = height - 1 - row;
                const rotatedCol = width - 1 - col;
                if (rotatedRow >= 0 && rotatedRow < height && rotatedCol >= 0 && rotatedCol < width) {
                    newPattern[rotatedRow][rotatedCol] = color;
                }
            }
        } else if (symmetry.direction === 'vertical') {
            if (symmetry.type === 'mirror') {
                // Mirror vertically (top-bottom)
                const mirrorRow = height - 1 - row;
                if (mirrorRow >= 0 && mirrorRow < height) {
                    newPattern[mirrorRow][col] = color;
                }
            } else if (symmetry.type === 'rotational') {
                // Rotate 180 degrees around center
                const rotatedRow = height - 1 - row;
                const rotatedCol = width - 1 - col;
                if (rotatedRow >= 0 && rotatedRow < height && rotatedCol >= 0 && rotatedCol < width) {
                    newPattern[rotatedRow][rotatedCol] = color;
                }
            }
        }

        return newPattern;
    }, [symmetry]);

    // Handle symmetry change
    const handleSymmetryChange = useCallback((newSymmetry) => {
        setSymmetry(newSymmetry);
    }, []);

    // Resize grid
    const handleGridResize = useCallback((newSize) => {
        const defaultFill = backgroundColorId || activeColorId || 'MC';
        const newPattern = Array(newSize.height).fill(null).map((_, row) =>
            Array(newSize.width).fill(null).map((_, col) => {
                // Preserve existing pattern data if within bounds
                if (row < pattern.length && col < pattern[0].length) {
                    return pattern[row][col];
                }
                return defaultFill;
            })
        );

        saveToHistory(newPattern);
        setPattern(newPattern);
        setGridSize(newSize);
        setSelection(null);
        setSelectedCells(new Set());
    }, [pattern, saveToHistory, backgroundColorId, activeColorId]);

    // Handle stitch clicks
    const handleStitchClick = useCallback((row, col, event) => {
        if (pasteMode && clipboard) {
            // Handle paste - skip null cells
            const newPattern = [...pattern];
            for (let r = 0; r < clipboard.length; r++) {
                for (let c = 0; c < clipboard[r].length; c++) {
                    const targetRow = row + r;
                    const targetCol = col + c;
                    if (targetRow < newPattern.length && targetCol < newPattern[0].length && clipboard[r][c] !== null) {
                        newPattern[targetRow][targetCol] = clipboard[r][c];
                    }
                }
            }
            saveToHistory(newPattern);
            setPattern(newPattern);
            setPasteMode(false);
            setPastePreview(null);
            setClipboard(null);
            return;
        }

        if (activeTool === 'pencil') {
            // Single stitch coloring with symmetry
            const newPattern = [...pattern];
            newPattern[row] = [...newPattern[row]];

            // Apply symmetry (this will set the original cell and any symmetry cells)
            applySymmetry(newPattern, row, col, activeColor);

            saveToHistory(newPattern);
            setPattern(newPattern);
        } else if (activeTool === 'area-select' && event.ctrlKey) {
            // Control-click for removing cells from current selection
            event.preventDefault();
            event.stopPropagation();

            if (selection) {
                // Check if the clicked cell is in any of the current selection areas
                const selections = Array.isArray(selection) ? selection : [selection];
                let cellIsInSelection = false;

                selections.forEach(sel => {
                    if (row >= sel.startRow && row <= sel.endRow && col >= sel.startCol && col <= sel.endCol) {
                        cellIsInSelection = true;
                    }
                });

                if (cellIsInSelection) {
                    // Actually remove this cell from selection by adding it to excluded cells
                    const key = cellKey(row, col);
                    setSelectedCells(prev => {
                        const newSet = new Set(prev);
                        newSet.add(key); // Add to excluded cells
                        return newSet;
                    });
                }
            }
        }
    }, [pattern, activeTool, activeColor, pasteMode, clipboard, saveToHistory, applySymmetry, selection, selectedCells, cellKey]);

    // Handle area selection with support for irregular shapes
    const handleAreaSelect = useCallback((startRow, startCol, endRow, endCol, modifierKey) => {
        const minRow = Math.min(startRow, endRow);
        const maxRow = Math.max(startRow, endRow);
        const minCol = Math.min(startCol, endCol);
        const maxCol = Math.max(startCol, endCol);

        const newSelection = {
            startRow: minRow,
            endRow: maxRow,
            startCol: minCol,
            endCol: maxCol
        };

        if (modifierKey === 'shift') {
            // Union with existing selection - keep both areas
            if (selection) {
                // If selection is already an array, add to it
                if (Array.isArray(selection)) {
                    setSelection([...selection, newSelection]);
                } else {
                    // Convert single selection to array and add new selection
                    setSelection([selection, newSelection]);
                }
            } else {
                // No existing selection, just set the new one
                setSelection(newSelection);
            }
        } else if (modifierKey === 'ctrl') {
            // Subtract from existing selection
            if (selection) {
                // For now, just clear any overlapping areas (simplified implementation)
                // In a full implementation, this would be more sophisticated
                setSelection(newSelection);
            } else {
                setSelection(newSelection);
            }
        } else {
            // Regular selection - replace any existing selection
            setSelection(newSelection);
        }
    }, [selection]);

    // Copy selection to clipboard - handle rectangular selection areas with unselected cells
    const handleCopy = useCallback(() => {
        if (!selection && selectedCells.size === 0) return;

        const clipboardData = [];

        if (selection) {
            // Handle rectangular selection areas with individually unselected cells
            const selections = Array.isArray(selection) ? selection : [selection];

            // Find the bounding box of all selections
            let minRow = Infinity, maxRow = -Infinity, minCol = Infinity, maxCol = -Infinity;
            selections.forEach(sel => {
                minRow = Math.min(minRow, sel.startRow);
                maxRow = Math.max(maxRow, sel.endRow);
                minCol = Math.min(minCol, sel.startCol);
                maxCol = Math.max(maxCol, sel.endCol);
            });

            // Create clipboard data with null for non-selected areas
            for (let row = minRow; row <= maxRow; row++) {
                const clipboardRow = [];
                for (let col = minCol; col <= maxCol; col++) {
                    let isInSelection = false;
                    // Check if this cell is in any of the selected areas
                    selections.forEach(sel => {
                        if (row >= sel.startRow && row <= sel.endRow && col >= sel.startCol && col <= sel.endCol) {
                            isInSelection = true;
                        }
                    });

                    // Check if this cell is excluded (control-clicked to remove from selection)
                    const isExcluded = selectedCells.has(cellKey(row, col));

                    if (isInSelection && !isExcluded) {
                        clipboardRow.push(pattern[row][col]);
                    } else {
                        clipboardRow.push(null); // null means don't paste this cell
                    }
                }
                clipboardData.push(clipboardRow);
            }
        }

        setClipboard(clipboardData);
    }, [selection, selectedCells, pattern]);

    // Paste from clipboard
    const handlePaste = useCallback(() => {
        if (!clipboard) return;
        setPasteMode(true);
    }, [clipboard]);

    // Clear selection
    const handleClearSelection = useCallback(() => {
        setSelection(null);
        setSelectedCells(new Set());
        setPasteMode(false);
        setPastePreview(null);
    }, []);

    // Fill selection with active color - handle rectangular selection areas with unselected cells
    const handleFillSelection = useCallback(() => {
        if (!selection && selectedCells.size === 0) return;

        const newPattern = [...pattern];

        if (selection) {
            // Handle rectangular selection areas with individually unselected cells
            const selections = Array.isArray(selection) ? selection : [selection];

            selections.forEach(sel => {
                for (let row = sel.startRow; row <= sel.endRow; row++) {
                    newPattern[row] = [...newPattern[row]];
                    for (let col = sel.startCol; col <= sel.endCol; col++) {
                        // Don't fill cells that are excluded (control-clicked to remove from selection)
                        const isExcluded = selectedCells.has(cellKey(row, col));
                        if (!isExcluded) {
                            newPattern[row][col] = activeColor;
                        }
                    }
                }
            });
        }

        saveToHistory(newPattern);
        setPattern(newPattern);
        // Keep selection active after fill
    }, [selection, selectedCells, pattern, activeColor, saveToHistory]);

    // Clear entire pattern
    const handleClearPattern = useCallback(() => {
        const defaultFill = backgroundColorId || activeColorId || 'MC';
        const newPattern = Array(gridSize.height).fill(null).map(() => Array(gridSize.width).fill(defaultFill));
        saveToHistory(newPattern);
        setPattern(newPattern);
        setSelection(null);
        setSelectedCells(new Set());
    }, [gridSize, saveToHistory, backgroundColorId, activeColorId]);

    // Undo/Redo
    const handleUndo = useCallback(() => {
        if (historyIndex > 0) {
            setHistoryIndex(historyIndex - 1);
            setPattern(JSON.parse(JSON.stringify(history[historyIndex - 1])));
        }
    }, [history, historyIndex]);

    const handleRedo = useCallback(() => {
        if (historyIndex < history.length - 1) {
            setHistoryIndex(historyIndex + 1);
            setPattern(JSON.parse(JSON.stringify(history[historyIndex + 1])));
        }
    }, [history, historyIndex]);

    // Export pattern
    const handleExportPattern = useCallback(() => {
        const exportData = {
            pattern,
            colors,
            gridSize,
            created: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `knitting-pattern-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }, [pattern, colors, gridSize]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (event) => {
            // Prevent default browser shortcuts
            if (event.ctrlKey || event.metaKey) {
                switch (event.key) {
                    case 'c':
                        if (selection || selectedCells.size > 0) {
                            event.preventDefault();
                            handleCopy();
                        }
                        break;
                    case 'v':
                        if (clipboard) {
                            event.preventDefault();
                            handlePaste();
                        }
                        break;
                    case 'z':
                        if (event.shiftKey) {
                            event.preventDefault();
                            handleRedo();
                        } else {
                            event.preventDefault();
                            handleUndo();
                        }
                        break;
                    case 'y':
                        event.preventDefault();
                        handleRedo();
                        break;
                    default:
                        break;
                }
            }

            // Tool shortcuts
            switch (event.key) {
                case 'p':
                    if (!event.ctrlKey && !event.metaKey) {
                        setActiveTool('pencil');
                    }
                    break;
                case 's':
                    if (!event.ctrlKey && !event.metaKey) {
                        setActiveTool('area-select');
                    }
                    break;
                case 'Escape':
                    handleClearSelection();
                    break;
                default:
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [selection, selectedCells, clipboard, handleCopy, handlePaste, handleUndo, handleRedo, handleClearSelection]);

    return (
        <ColorworkGrid
            pattern={pattern}
            colors={colors}
            backgroundColorId={backgroundColorId}
            gridSize={gridSize}
            activeTool={activeTool}
            activeColor={activeColor}
            selection={selection}
            selectedCells={selectedCells}
            onStitchClick={handleStitchClick}
            onAreaSelect={handleAreaSelect}
            pasteMode={pasteMode}
            pastePreview={pastePreview}
            onPastePreview={setPastePreview}
            clipboard={clipboard}
            activeColorData={activeColorData}
            // RibbonUI props
            onToolChange={setActiveTool}
            hasClipboard={!!clipboard}
            onCopy={handleCopy}
            onPaste={handlePaste}
            onClearSelection={handleClearSelection}
            onFillSelection={handleFillSelection}
            hasSelection={!!selection || selectedCells.size > 0}
            onDuplicateSelection={duplicateSelection}
            onRotateSelection={rotateSelection}
            onReflectSelection={reflectSelection}
            onGridResize={handleGridResize}
            onClearPattern={handleClearPattern}
            onUndo={handleUndo}
            onRedo={handleRedo}
            canUndo={historyIndex > 0}
            canRedo={historyIndex < history.length - 1}
            onExport={handleExportPattern}
            symmetry={symmetry}
            onSymmetryChange={handleSymmetryChange}
        />
    );
};

export default KnittingDesignerApp;
