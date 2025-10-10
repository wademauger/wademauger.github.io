/**
 * VirtualizedColorworkGrid - High-performance virtualized grid renderer
 * 
 * This component:
 * - Uses react-window's FixedSizeGrid for virtualization
 * - Only renders visible cells (dramatically improves performance)
 * - Integrates with Redux for pattern data and selection state
 * - Integrates with Zustand for viewport state
 * - Supports all editing features (pencil, area select, paste, etc.)
 * - Handles mouse events and propagates to parent handlers
 * 
 * Architecture:
 * - Redux: Persistent state (pattern, colors, selection)
 * - Zustand: Ephemeral state (pan, zoom, hover, drag)
 * - react-window: Virtualization layer (only renders visible cells)
 * - VirtualizedGridCell: Individual cell rendering
 */

import React, { useCallback, useMemo, useRef } from 'react';
import { Grid, type GridImperativeAPI } from 'react-window';
import { VirtualizedGridCell } from './VirtualizedGridCell';
import { useViewportStore } from '../store/viewportStore';

interface GridChildComponentProps {
  columnIndex: number;
  rowIndex: number;
  style: React.CSSProperties;
  data: any;
}

export interface VirtualizedColorworkGridProps {
  // Grid dimensions
  gridWidth: number;
  gridHeight: number;
  cellSize: number;
  
  // Viewport dimensions (for constraining visible area)
  viewportWidth?: number;
  viewportHeight?: number;
  
  // Pattern data (2D array of color IDs)
  pattern: string[][];
  
  // Color mapping (colorId -> hex color)
  colors: Record<string, { id: string; color: string; label: string }>;
  
  // Selection state from Redux
  selection: Array<{
    startRow: number;
    endRow: number;
    startCol: number;
    endCol: number;
  }> | null;
  
  // Excluded cells (Ctrl+click removed from selection)
  selectedCells: Set<string> | null;
  
  // Clipboard for paste preview
  clipboard: (string | null)[][] | null;
  
  // Tool state
  activeTool: 'pencil' | 'area-select' | 'eraser';
  pasteMode: boolean;
  
  // Event handlers
  onStitchClick: (row: number, col: number, event: React.MouseEvent) => void;
  onAreaSelect: (
    startRow: number,
    startCol: number,
    endRow: number,
    endCol: number,
    modifierKey: 'shift' | 'ctrl' | null
  ) => void;
}

/**
 * Cell renderer for react-window
 * This function is called for each visible cell
 */
const CellRenderer = (props: any) => {
  // Destructure all props - react-window spreads cellProps along with columnIndex, rowIndex, style
  const {
    columnIndex,
    rowIndex,
    style,
    pattern,
    colors,
    selection,
    selectedCells,
    clipboard,
    pasteMode,
    activeTool,
    cellSize,
    hoveredCell,
    selectionStart,
    selectionEnd,
    pastePreviewPosition,
    onStitchClick,
    onMouseEnter,
    onMouseMove
  } = props;
  
  // Get color for this cell
  const colorId = pattern[rowIndex]?.[columnIndex] || 'CCX';
  const colorData = colors[colorId] || { id: 'CCX', color: 'transparent', label: 'No Color' };
  
  // Check if cell is selected (in Redux selection)
  const isSelected = useMemo(() => {
    if (!selection) return false;
    
    const cellKey = `${rowIndex},${columnIndex}`;
    
    // Check if in rectangular selection areas
    const inRectangularSelection = selection.some((sel: { startRow: number; endRow: number; startCol: number; endCol: number }) =>
      rowIndex >= sel.startRow &&
      rowIndex <= sel.endRow &&
      columnIndex >= sel.startCol &&
      columnIndex <= sel.endCol
    );
    
    // Check if excluded (Ctrl+clicked to remove)
    const isExcluded = selectedCells?.has(cellKey) || false;
    
    return inRectangularSelection && !isExcluded;
  }, [selection, selectedCells, rowIndex, columnIndex]);
  
  // Check if cell is hovered
  const isHovered = hoveredCell?.row === rowIndex && hoveredCell?.col === columnIndex;
  
  // Check if cell is in current selection (being dragged)
  const isInCurrentSelection = useMemo(() => {
    if (!selectionStart || !selectionEnd) return false;
    
    const minRow = Math.min(selectionStart.row, selectionEnd.row);
    const maxRow = Math.max(selectionStart.row, selectionEnd.row);
    const minCol = Math.min(selectionStart.col, selectionEnd.col);
    const maxCol = Math.max(selectionStart.col, selectionEnd.col);
    
    return rowIndex >= minRow && rowIndex <= maxRow && columnIndex >= minCol && columnIndex <= maxCol;
  }, [selectionStart, selectionEnd, rowIndex, columnIndex]);
  
  // Check if cell is in paste preview
  const isInPastePreview = useMemo(() => {
    if (!pastePreviewPosition || !clipboard || !pasteMode) return false;
    
    const localRow = rowIndex - pastePreviewPosition.row;
    const localCol = columnIndex - pastePreviewPosition.col;
    
    return (
      localRow >= 0 &&
      localRow < clipboard.length &&
      localCol >= 0 &&
      localCol < clipboard[0]?.length &&
      clipboard[localRow]?.[localCol] !== null
    );
  }, [pastePreviewPosition, clipboard, pasteMode, rowIndex, columnIndex]);
  
  return (
    <div style={style}>
      <svg width={cellSize} height={cellSize} style={{ display: 'block' }}>
        <VirtualizedGridCell
          rowIndex={rowIndex}
          columnIndex={columnIndex}
          color={colorData.color}
          colorId={colorData.id}
          isSelected={isSelected}
          isHovered={isHovered}
          isInCurrentSelection={isInCurrentSelection}
          isInPastePreview={isInPastePreview}
          cellSize={cellSize}
          onMouseDown={onStitchClick}
          onMouseEnter={onMouseEnter}
          onMouseMove={onMouseMove}
        />
      </svg>
    </div>
  );
};

/**
 * Main virtualized grid component
 */
export const VirtualizedColorworkGrid = React.forwardRef<GridImperativeAPI, VirtualizedColorworkGridProps>(({
  gridWidth,
  gridHeight,
  cellSize,
  viewportWidth,
  viewportHeight,
  pattern,
  colors,
  selection,
  selectedCells,
  clipboard,
  activeTool,
  pasteMode,
  onStitchClick,
  onAreaSelect
}, ref) => {
  
  // Use provided viewport dimensions or calculate from grid size
  const displayWidth = viewportWidth || gridWidth * cellSize;
  const displayHeight = viewportHeight || gridHeight * cellSize;
  
  // Track mouse down state for pencil tool drag painting
  const isMouseDownRef = useRef(false);
  
  // Get viewport state from Zustand
  const {
    hoveredCell,
    selectionStart,
    selectionEnd,
    pastePreviewPosition,
    isDragging,
    setHoveredCell,
    startSelection,
    updateSelection,
    endSelection,
    setPastePreview
  } = useViewportStore();
  
  // Handle mouse enter on cell
  const handleMouseEnter = useCallback((row: number, col: number) => {
    setHoveredCell({ row, col });
    
    // Update paste preview if in paste mode
    if (pasteMode && clipboard) {
      setPastePreview({ row, col });
    }
  }, [pasteMode, clipboard, setHoveredCell, setPastePreview]);
  
  // Handle mouse move on cell
  const handleMouseMove = useCallback((row: number, col: number, event: React.MouseEvent) => {
    // Update hover
    setHoveredCell({ row, col });
    
    // Update paste preview
    if (pasteMode && clipboard) {
      setPastePreview({ row, col });
    }
    
    // Update selection if dragging with area-select
    if (isDragging && activeTool === 'area-select') {
      updateSelection(row, col);
    } 
    // Continue painting if mouse is down with pencil tool
    else if (isMouseDownRef.current && activeTool === 'pencil') {
      onStitchClick(row, col, event);
    }
  }, [isDragging, activeTool, pasteMode, clipboard, setHoveredCell, setPastePreview, updateSelection, onStitchClick]);
  
  // Handle mouse down on cell
  const handleMouseDown = useCallback((row: number, col: number, event: React.MouseEvent) => {
    // Handle Ctrl+click for individual cell selection
    if (event.ctrlKey && activeTool === 'area-select') {
      onStitchClick(row, col, event);
      return;
    }
    
    event.preventDefault();
    
    // Set mouse down flag for drag painting
    isMouseDownRef.current = true;
    
    if (activeTool === 'pencil') {
      onStitchClick(row, col, event);
    } else if (activeTool === 'area-select') {
      startSelection(row, col);
    }
  }, [activeTool, onStitchClick, startSelection]);
  
  // Handle mouse up (global)
  const handleMouseUp = useCallback((event: MouseEvent) => {
    // Clear mouse down flag
    isMouseDownRef.current = false;
    
    if (isDragging && activeTool === 'area-select' && selectionStart && selectionEnd) {
      const minRow = Math.min(selectionStart.row, selectionEnd.row);
      const maxRow = Math.max(selectionStart.row, selectionEnd.row);
      const minCol = Math.min(selectionStart.col, selectionEnd.col);
      const maxCol = Math.max(selectionStart.col, selectionEnd.col);
      
      const modifierKey = (event as any).shiftKey ? 'shift' : (event as any).ctrlKey ? 'ctrl' : null;
      onAreaSelect(minRow, minCol, maxRow, maxCol, modifierKey);
    }
    
    endSelection();
  }, [isDragging, activeTool, selectionStart, selectionEnd, onAreaSelect, endSelection]);
  
  // Handle mouse leave
  const handleMouseLeave = useCallback(() => {
    // Clear mouse down flag when leaving grid
    isMouseDownRef.current = false;
    
    setHoveredCell(null);
    if (pasteMode) {
      setPastePreview(null);
    }
  }, [pasteMode, setHoveredCell, setPastePreview]);
  
  // Set up global mouse up listener
  React.useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseUp]);
  
  // Fix react-window resize observer div blocking clicks
  React.useEffect(() => {
    // Find and disable pointer events on the resize observer div
    const container = document.querySelector('.virtualized-grid-container');
    if (container) {
      // Find all divs with negative z-index or aria-hidden
      const blockingDivs = container.querySelectorAll('div[aria-hidden="true"], div[style*="z-index: -1"]');
      blockingDivs.forEach((div) => {
        (div as HTMLElement).style.pointerEvents = 'none';
      });
    }
  }, [displayWidth, displayHeight]); // Re-run when dimensions change
  
  // Memoized cell data (passed to every cell renderer)
  const cellData = useMemo(() => ({
    pattern,
    colors,
    selection,
    selectedCells,
    clipboard,
    pasteMode,
    activeTool,
    cellSize,
    hoveredCell,
    selectionStart,
    selectionEnd,
    pastePreviewPosition,
    onStitchClick: handleMouseDown,
    onMouseEnter: handleMouseEnter,
    onMouseMove: handleMouseMove
  }), [
    pattern,
    colors,
    selection,
    selectedCells,
    clipboard,
    pasteMode,
    activeTool,
    cellSize,
    hoveredCell,
    selectionStart,
    selectionEnd,
    pastePreviewPosition,
    handleMouseDown,
    handleMouseEnter,
    handleMouseMove
  ]);
  
  return (
    <div
      className="virtualized-grid-container"
      onMouseLeave={handleMouseLeave}
      style={{ 
        width: displayWidth,
        height: displayHeight,
        overflow: 'hidden',
        pointerEvents: 'auto',
        position: 'relative',
        isolation: 'isolate', // Create stacking context to fix z-index issues
        zIndex: 0 // Establish base stacking context
      }}
    >
      <Grid
        gridRef={ref}
        columnCount={gridWidth}
        columnWidth={cellSize}
        rowCount={gridHeight}
        rowHeight={cellSize}
        defaultWidth={displayWidth}
        defaultHeight={displayHeight}
        cellProps={cellData as any}
        overscanCount={5}
        cellComponent={CellRenderer as any}
        style={{ 
          position: 'relative', 
          zIndex: 1,
          pointerEvents: 'auto' 
        }}
      />
    </div>
  );
});

// Set display name for debugging
VirtualizedColorworkGrid.displayName = 'VirtualizedColorworkGrid';

export default VirtualizedColorworkGrid;
