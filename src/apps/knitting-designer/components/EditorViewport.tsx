/**
 * EditorViewport - Gesture-based pan wrapper for the virtualized grid
 * 
 * Key Changes:
 * - Removed CSS transform approach (incompatible with react-window virtualization)
 * - Now passes viewport dimensions to VirtualizedColorworkGrid
 * - Grid renders at viewport size, not full grid size
 * - Pan gestures update Grid scroll position via scrollTo method
 * - react-window Grid handles virtualization and scrolling natively
 * 
 * Architecture:
 * - Uses Zustand for viewport state (offsetX, offsetY as scroll positions)
 * - Uses @use-gesture for gesture recognition (Shift+Drag pan)
 * - Grid ref provides scrollTo method for programmatic scrolling
 * - No CSS transforms - Grid handles all positioning internally
 * 
 * Note: Zoom functionality removed for simplicity
 */

import React, { useRef, useEffect, useCallback } from 'react';
import { useDrag } from '@use-gesture/react';
import { useViewportStore } from '../store/viewportStore';
import { VirtualizedColorworkGrid, VirtualizedColorworkGridProps } from './VirtualizedColorworkGrid';
import type { GridImperativeAPI } from 'react-window';

export interface EditorViewportProps extends Omit<VirtualizedColorworkGridProps, 'cellSize'> {
  // Optional cell size override (default: 20)
  cellSize?: number;
  
  // Optional pan constraints (for bounded panning)
  enablePanConstraints?: boolean;
  
  // Maximum cells to show in viewport (default: 40)
  maxViewportCells?: number;
}

/**
 * Main EditorViewport component
 */
export const EditorViewport: React.FC<EditorViewportProps> = ({
  gridWidth,
  gridHeight,
  cellSize = 20,
  enablePanConstraints = false,
  maxViewportCells = 40,
  ...gridProps
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<GridImperativeAPI>(null);
  
  // Calculate viewport dimensions (max 40x40 cells worth of pixels)
  const maxViewportWidth = Math.min(gridWidth, maxViewportCells) * cellSize;
  const maxViewportHeight = Math.min(gridHeight, maxViewportCells) * cellSize;
  
  // Get viewport state from Zustand (now represents scroll position in pixels)
  const { offsetX, offsetY, setPan } = useViewportStore();
  
  // Apply scroll position to Grid when it changes
  useEffect(() => {
    if (gridRef.current) {
      // Convert pixel offset to cell index
      // offsetX/offsetY are negative when panned (scroll position)
      const scrollLeftPixels = Math.abs(offsetX);
      const scrollTopPixels = Math.abs(offsetY);
      
      // Calculate which cell should be at top-left of viewport
      const columnIndex = Math.floor(scrollLeftPixels / cellSize);
      const rowIndex = Math.floor(scrollTopPixels / cellSize);
      
      // Use scrollToCell with 'start' alignment to position that cell at top-left
      gridRef.current.scrollToCell({
        columnIndex: Math.min(columnIndex, gridWidth - 1),
        rowIndex: Math.min(rowIndex, gridHeight - 1),
        columnAlign: 'start',
        rowAlign: 'start',
        behavior: 'auto'
      });
    }
  }, [offsetX, offsetY, cellSize, gridWidth, gridHeight]);
  
  // Calculate pan constraints (prevent panning beyond grid bounds)
  const getPanConstraints = useCallback((newOffsetX: number, newOffsetY: number) => {
    if (!enablePanConstraints) {
      return { x: newOffsetX, y: newOffsetY };
    }
    
    const gridPixelWidth = gridWidth * cellSize;
    const gridPixelHeight = gridHeight * cellSize;
    
    // Max scroll distance = grid size - viewport size
    const maxScrollX = Math.max(0, gridPixelWidth - maxViewportWidth);
    const maxScrollY = Math.max(0, gridPixelHeight - maxViewportHeight);
    
    return {
      x: Math.max(-maxScrollX, Math.min(0, newOffsetX)),
      y: Math.max(-maxScrollY, Math.min(0, newOffsetY))
    };
  }, [gridWidth, gridHeight, cellSize, maxViewportWidth, maxViewportHeight, enablePanConstraints]);
  
  // Pan with Shift+Drag gesture
  const bindShiftPan = useDrag(
    ({ offset: [ox, oy], event, memo = { initialOffsetX: offsetX, initialOffsetY: offsetY } }) => {
      // Check if Shift key is pressed
      const isShiftPressed = (event as any).shiftKey;
      
      if (!isShiftPressed) return memo;
      
      const newOffsetX = memo.initialOffsetX + ox;
      const newOffsetY = memo.initialOffsetY + oy;
      
      const constrained = getPanConstraints(newOffsetX, newOffsetY);
      setPan(constrained.x, constrained.y);
      
      return memo;
    },
    {
      from: () => [0, 0]
    }
  );
  
  return (
    <div
      ref={containerRef}
      className="editor-viewport"
      style={{
        width: maxViewportWidth,
        height: maxViewportHeight,
        overflow: 'hidden',
        position: 'relative',
        cursor: 'default',
        touchAction: 'none',
        border: '1px solid #ccc'
      }}
      {...bindShiftPan()}
    >
      {/* Grid renders at viewport size with scroll capability */}
      <VirtualizedColorworkGrid
        ref={gridRef}
        {...gridProps}
        gridWidth={gridWidth}
        gridHeight={gridHeight}
        cellSize={cellSize}
        viewportWidth={maxViewportWidth}
        viewportHeight={maxViewportHeight}
      />
      
      {/* Instructions overlay */}
      <div
        className="viewport-instructions"
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          background: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: 4,
          fontSize: 12,
          pointerEvents: 'none',
          zIndex: 1000
        }}
      >
        <div>�️ Shift+Drag to pan</div>
      </div>
    </div>
  );
};

export default EditorViewport;
