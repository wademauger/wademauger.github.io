/**
 * Zustand store for ephemeral viewport/UI state
 * 
 * This store manages:
 * - Pan/zoom transforms (offsetX, offsetY, scale)
 * - Hovered cell position
 * - Active drag/selection state
 * - Temporary UI state that doesn't need to persist
 * 
 * Separating this from Redux prevents unnecessary re-renders
 * and keeps responsive interactions smooth.
 */

import { create } from 'zustand';

interface ViewportState {
  // Pan/zoom transforms
  offsetX: number;
  offsetY: number;
  scale: number;
  
  // Hovered cell (for cursor feedback)
  hoveredCell: { row: number; col: number } | null;
  
  // Selection in progress
  isDragging: boolean;
  selectionStart: { row: number; col: number } | null;
  selectionEnd: { row: number; col: number } | null;
  
  // Paste preview
  pastePreviewPosition: { row: number; col: number } | null;
  
  // Actions
  setPan: (offsetX: number, offsetY: number) => void;
  setScale: (scale: number) => void;
  setHoveredCell: (cell: { row: number; col: number } | null) => void;
  startSelection: (row: number, col: number) => void;
  updateSelection: (row: number, col: number) => void;
  endSelection: () => void;
  setPastePreview: (position: { row: number; col: number } | null) => void;
  resetViewport: () => void;
  
  // Computed viewport bounds for visible region calculation
  getVisibleBounds: (containerWidth: number, containerHeight: number, cellSize: number) => {
    startRow: number;
    endRow: number;
    startCol: number;
    endCol: number;
  };
}

const INITIAL_SCALE = 1;
const MIN_SCALE = 0.1;
const MAX_SCALE = 5;

export const useViewportStore = create<ViewportState>((set, get) => ({
  offsetX: 0,
  offsetY: 0,
  scale: INITIAL_SCALE,
  hoveredCell: null,
  isDragging: false,
  selectionStart: null,
  selectionEnd: null,
  pastePreviewPosition: null,
  
  setPan: (offsetX: number, offsetY: number) => {
    set({ offsetX, offsetY });
  },
  
  setScale: (scale: number) => {
    // Clamp scale to reasonable bounds
    const clampedScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale));
    set({ scale: clampedScale });
  },
  
  setHoveredCell: (cell) => {
    set({ hoveredCell: cell });
  },
  
  startSelection: (row: number, col: number) => {
    set({
      isDragging: true,
      selectionStart: { row, col },
      selectionEnd: { row, col }
    });
  },
  
  updateSelection: (row: number, col: number) => {
    set({ selectionEnd: { row, col } });
  },
  
  endSelection: () => {
    set({
      isDragging: false,
      selectionStart: null,
      selectionEnd: null
    });
  },
  
  setPastePreview: (position) => {
    set({ pastePreviewPosition: position });
  },
  
  resetViewport: () => {
    set({
      offsetX: 0,
      offsetY: 0,
      scale: INITIAL_SCALE,
      hoveredCell: null,
      isDragging: false,
      selectionStart: null,
      selectionEnd: null,
      pastePreviewPosition: null
    });
  },
  
  /**
   * Calculate visible cell bounds based on current viewport state
   * This is used to determine which cells to render in react-window
   */
  getVisibleBounds: (containerWidth: number, containerHeight: number, cellSize: number) => {
    const state = get();
    const scaledCellSize = cellSize * state.scale;
    
    // Calculate visible region accounting for pan offset
    const startCol = Math.max(0, Math.floor(-state.offsetX / scaledCellSize));
    const startRow = Math.max(0, Math.floor(-state.offsetY / scaledCellSize));
    const endCol = Math.ceil((containerWidth - state.offsetX) / scaledCellSize);
    const endRow = Math.ceil((containerHeight - state.offsetY) / scaledCellSize);
    
    return {
      startRow,
      endRow,
      startCol,
      endCol
    };
  }
}));

/**
 * Hook to get current selection rectangle (if any)
 */
export const useCurrentSelection = () => {
  const { selectionStart, selectionEnd } = useViewportStore();
  
  if (!selectionStart || !selectionEnd) {
    return null;
  }
  
  return {
    startRow: Math.min(selectionStart.row, selectionEnd.row),
    endRow: Math.max(selectionStart.row, selectionEnd.row),
    startCol: Math.min(selectionStart.col, selectionEnd.col),
    endCol: Math.max(selectionStart.col, selectionEnd.col)
  };
};

/**
 * Hook to check if a cell is in the current selection
 */
export const useIsCellInSelection = (row: number, col: number): boolean => {
  const { selectionStart, selectionEnd } = useViewportStore();
  
  if (!selectionStart || !selectionEnd) {
    return false;
  }
  
  const minRow = Math.min(selectionStart.row, selectionEnd.row);
  const maxRow = Math.max(selectionStart.row, selectionEnd.row);
  const minCol = Math.min(selectionStart.col, selectionEnd.col);
  const maxCol = Math.max(selectionStart.col, selectionEnd.col);
  
  return row >= minRow && row <= maxRow && col >= minCol && col <= maxCol;
};
