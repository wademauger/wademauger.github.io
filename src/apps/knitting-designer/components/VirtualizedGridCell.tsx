/**
 * VirtualizedGridCell - A memoized, dumb component for rendering individual grid cells
 * 
 * This component:
 * - Receives all necessary props (no local state)
 * - Is heavily memoized to prevent unnecessary re-renders
 * - Handles rendering of regular cells and "no color" checkerboard pattern
 * - Captures mouse events for editing and selection
 * 
 * Performance optimization: React.memo with custom comparison function
 * Only re-renders when color, selection state, or hover state changes
 */

import React, { memo } from 'react';

export interface GridCellProps {
  rowIndex: number;
  columnIndex: number;
  color: string;
  colorId: string;
  isSelected: boolean;
  isHovered: boolean;
  isInCurrentSelection: boolean;
  isInPastePreview: boolean;
  cellSize: number;
  
  // Event handlers
  onMouseDown: (row: number, col: number, event: React.MouseEvent) => void;
  onMouseEnter: (row: number, col: number, event: React.MouseEvent) => void;
  onMouseMove: (row: number, col: number, event: React.MouseEvent) => void;
}

/**
 * Renders a checkerboard pattern for "no color" cells (CCX or transparent)
 */
const CheckerboardPattern: React.FC<{
  x: number;
  y: number;
  size: number;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseEnter: (e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  title: string;
}> = ({ x, y, size, onMouseDown, onMouseEnter, onMouseMove, title }) => {
  const halfSize = size / 2;
  const quarterSize = size / 4;
  
  return (
    <g>
      {/* 2x2 checkerboard pattern */}
      <rect x={x} y={y} width={quarterSize} height={quarterSize} fill="#f0f0f0" />
      <rect x={x + quarterSize} y={y} width={quarterSize} height={quarterSize} fill="#ffffff" />
      <rect x={x} y={y + quarterSize} width={quarterSize} height={quarterSize} fill="#ffffff" />
      <rect x={x + quarterSize} y={y + quarterSize} width={quarterSize} height={quarterSize} fill="#f0f0f0" />
      
      <rect x={x + halfSize} y={y} width={quarterSize} height={quarterSize} fill="#ffffff" />
      <rect x={x + halfSize + quarterSize} y={y} width={quarterSize} height={quarterSize} fill="#f0f0f0" />
      <rect x={x + halfSize} y={y + quarterSize} width={quarterSize} height={quarterSize} fill="#f0f0f0" />
      <rect x={x + halfSize + quarterSize} y={y + quarterSize} width={quarterSize} height={quarterSize} fill="#ffffff" />
      
      <rect x={x} y={y + halfSize} width={quarterSize} height={quarterSize} fill="#ffffff" />
      <rect x={x + quarterSize} y={y + halfSize} width={quarterSize} height={quarterSize} fill="#f0f0f0" />
      <rect x={x} y={y + halfSize + quarterSize} width={quarterSize} height={quarterSize} fill="#f0f0f0" />
      <rect x={x + quarterSize} y={y + halfSize + quarterSize} width={quarterSize} height={quarterSize} fill="#ffffff" />
      
      <rect x={x + halfSize} y={y + halfSize} width={quarterSize} height={quarterSize} fill="#f0f0f0" />
      <rect x={x + halfSize + quarterSize} y={y + halfSize} width={quarterSize} height={quarterSize} fill="#ffffff" />
      <rect x={x + halfSize} y={y + halfSize + quarterSize} width={quarterSize} height={quarterSize} fill="#ffffff" />
      <rect x={x + halfSize + quarterSize} y={y + halfSize + quarterSize} width={quarterSize} height={quarterSize} fill="#f0f0f0" />
      
      {/* Transparent overlay for events */}
      <rect
        x={x}
        y={y}
        width={size}
        height={size}
        fill="transparent"
        stroke="#999"
        strokeWidth={1}
        onMouseDown={onMouseDown}
        onMouseEnter={onMouseEnter}
        onMouseMove={onMouseMove}
        style={{ pointerEvents: 'all', cursor: 'crosshair' }}
      >
        <title>{title}</title>
      </rect>
    </g>
  );
};

/**
 * Main cell component - renders a single grid cell
 */
const VirtualizedGridCellComponent: React.FC<GridCellProps> = ({
  rowIndex,
  columnIndex,
  color,
  colorId,
  isSelected,
  isHovered,
  isInCurrentSelection,
  isInPastePreview,
  cellSize,
  onMouseDown,
  onMouseEnter,
  onMouseMove
}) => {
  // In virtualized grid, each cell is rendered in its own positioned container
  // So we always render at (0, 0) with a 1px margin for the border
  const x = 0;
  const y = 0;
  const innerSize = cellSize - 2; // Account for 1px border on each side
  
  // Determine if this is a "no color" cell
  const isNoColor = colorId === 'CCX' || color === 'transparent' || !color;
  
  // Build CSS classes for styling
  const classes = ['virtualized-cell'];
  if (isSelected) classes.push('selected');
  if (isHovered) classes.push('hovered');
  if (isInCurrentSelection) classes.push('current-selection');
  if (isInPastePreview) classes.push('paste-preview');
  
  const handleMouseDown = (e: React.MouseEvent) => {
    onMouseDown(rowIndex, columnIndex, e);
  };
  
  const handleMouseEnter = (e: React.MouseEvent) => {
    onMouseEnter(rowIndex, columnIndex, e);
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    onMouseMove(rowIndex, columnIndex, e);
  };
  
  const title = `${rowIndex + 1},${columnIndex + 1}: ${colorId}`;
  
  // Render checkerboard for "no color" cells
  if (isNoColor) {
    return (
      <CheckerboardPattern
        x={x + 1}
        y={y + 1}
        size={innerSize}
        onMouseDown={handleMouseDown}
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        title={title}
      />
    );
  }
  
  // Render regular colored cell
  return (
    <rect
      x={x + 1}
      y={y + 1}
      width={innerSize}
      height={innerSize}
      fill={color}
      stroke="#999"
      strokeWidth={1}
      className={classes.join(' ')}
      onMouseDown={handleMouseDown}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      style={{ pointerEvents: 'all', cursor: 'crosshair' }}
    >
      <title>{title}</title>
    </rect>
  );
};

/**
 * Custom comparison function for React.memo
 * Only re-render if these props change
 */
const areEqual = (prevProps: GridCellProps, nextProps: GridCellProps): boolean => {
  return (
    prevProps.rowIndex === nextProps.rowIndex &&
    prevProps.columnIndex === nextProps.columnIndex &&
    prevProps.color === nextProps.color &&
    prevProps.colorId === nextProps.colorId &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.isHovered === nextProps.isHovered &&
    prevProps.isInCurrentSelection === nextProps.isInCurrentSelection &&
    prevProps.isInPastePreview === nextProps.isInPastePreview &&
    prevProps.cellSize === nextProps.cellSize
    // Note: We don't compare event handlers as they should be stable references
  );
};

/**
 * Memoized export - prevents unnecessary re-renders
 */
export const VirtualizedGridCell = memo(VirtualizedGridCellComponent, areEqual);

export default VirtualizedGridCell;
