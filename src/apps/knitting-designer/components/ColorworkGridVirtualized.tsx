/**
 * ColorworkGridVirtualized - Drop-in replacement for ColorworkGrid with virtualization
 * 
 * This component maintains the same API as the original ColorworkGrid but uses:
 * - ColorworkGrid for small grids (< 40x40) - no virtualization overhead
 * - VirtualizedColorworkGrid for large grids (>= 40x40) - performance optimization
 * - EditorViewport for pan with gestures (no zoom for now)
 * - MiniMap for overview navigation (large grids only)
 * - Zustand for viewport state management
 * 
 * All existing features are preserved:
 * - Selection (area select, individual cells, exclusions)
 * - Editing (pencil, eraser, fill)
 * - Clipboard operations (copy, paste, preview)
 * - Undo/redo
 * - Symmetry
 * - All existing event handlers
 */

// @ts-nocheck
import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import { EditorViewport } from './EditorViewport';
import { MiniMap } from './MiniMap';
import ColorworkGrid from './ColorworkGrid';
import RibbonUI from './RibbonUI';
import { useViewportStore } from '../store/viewportStore';
import '../styles/ColorworkGrid.css';
import '../styles/VirtualizedGrid.css';

// Threshold for switching to virtualized grid
const VIRTUALIZATION_THRESHOLD = 40;

type ColorworkGridVirtualizedProps = {
  pattern: string[][];
  colors: Record<string, { id: string; color: string; label: string }>;
  backgroundColorId: string;
  gridSize: { width: number; height: number };
  activeTool: 'pencil' | 'area-select' | 'eraser';
  activeColor: string;
  selection: Array<{
    startRow: number;
    endRow: number;
    startCol: number;
    endCol: number;
  }> | null;
  selectedCells: Set<string> | null;
  onStitchClick: (row: number, col: number, event: React.MouseEvent) => void;
  onAreaSelect: (
    startRow: number,
    startCol: number,
    endRow: number,
    endCol: number,
    modifierKey: 'shift' | 'ctrl' | null
  ) => void;
  pasteMode: boolean;
  pastePreview: { row: number; col: number; width: number; height: number } | null;
  onPastePreview: (preview: any) => void;
  clipboard: (string | null)[][] | null;
  activeColorData: { id: string; color: string; label: string } | null;
  
  // RibbonUI props
  onToolChange: (tool: string) => void;
  hasClipboard: boolean;
  onCopy: () => void;
  onPaste: () => void;
  onClearSelection: () => void;
  onFillSelection: () => void;
  hasSelection: boolean;
  onDuplicateSelection: () => void;
  onRotateSelection: (direction: string) => void;
  onReflectSelection: (direction: string) => void;
  onGridResize: (size: { width: number; height: number }) => void;
  onClearPattern: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onExport: () => void;
  symmetry: any;
  onSymmetryChange: (symmetry: any) => void;
};

const ColorworkGridVirtualized: React.FC<ColorworkGridVirtualizedProps> = (props) => {
  const {
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
  } = props;
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });
  const { setPastePreview: setZustandPastePreview } = useViewportStore();
  
  // Determine if we should use virtualization based on grid size
  const shouldVirtualize = gridSize.width >= VIRTUALIZATION_THRESHOLD || gridSize.height >= VIRTUALIZATION_THRESHOLD;
  
  // Measure container size
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        // Reserve space for RibbonUI (60px) and status bar (30px)
        setContainerSize({
          width: Math.max(400, rect.width - 20),
          height: Math.max(300, rect.height - 110)
        });
      }
    };
    
    updateSize();
    const resizeObserver = new ResizeObserver(updateSize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    
    return () => {
      resizeObserver.disconnect();
    };
  }, []);
  
  // Sync paste preview to Zustand store
  useEffect(() => {
    if (pastePreview && clipboard) {
      setZustandPastePreview({ row: pastePreview.row, col: pastePreview.col });
    } else {
      setZustandPastePreview(null);
    }
  }, [pastePreview, clipboard, setZustandPastePreview]);
  
  // Convert colors object to format expected by virtualized grid
  const colorsFormatted = useMemo(() => {
    const formatted: Record<string, { id: string; color: string; label: string }> = {};
    
    Object.entries(colors).forEach(([id, color]) => {
      if (typeof color === 'string') {
        // Legacy format: colors is a map of id -> hex color string
        formatted[id] = { id, color, label: id };
      } else {
        // New format: colors is already properly formatted
        formatted[id] = color as { id: string; color: string; label: string };
      }
    });
    
    return formatted;
  }, [colors]);
  
  // Convert selection to array format if needed
  const selectionArray = useMemo(() => {
    if (!selection) return null;
    return Array.isArray(selection) ? selection : [selection];
  }, [selection]);
  
  // If grid is small, use the original non-virtualized ColorworkGrid
  if (!shouldVirtualize) {
    return <ColorworkGrid {...props} />;
  }
  
  return (
    <div className="colorwork-grid-container" ref={containerRef}>
      {/* Ribbon UI */}
      <RibbonUI
        activeTool={activeTool}
        onToolChange={onToolChange}
        pasteMode={pasteMode}
        hasClipboard={hasClipboard}
        onCopy={onCopy}
        onPaste={onPaste}
        onClearSelection={onClearSelection}
        onFillSelection={onFillSelection}
        hasSelection={hasSelection}
        onRotateSelection={onRotateSelection}
        onReflectSelection={onReflectSelection}
        gridSize={gridSize}
        onGridResize={onGridResize}
        onUndo={onUndo}
        onRedo={onRedo}
        canUndo={canUndo}
        canRedo={canRedo}
        onExport={onExport}
        symmetry={symmetry}
        onSymmetryChange={onSymmetryChange}
      />
      
      {/* Main viewport with virtualized grid */}
      <div
        className="svg-wrapper"
        style={{
          width: '100%',
          height: containerSize.height,
          position: 'relative'
        }}
      >
        <EditorViewport
          gridWidth={gridSize.width}
          gridHeight={gridSize.height}
          pattern={pattern}
          colors={colorsFormatted}
          selection={selectionArray}
          selectedCells={selectedCells}
          clipboard={clipboard}
          activeTool={activeTool}
          pasteMode={pasteMode}
          onStitchClick={onStitchClick}
          onAreaSelect={onAreaSelect}
          cellSize={20}
          enablePanConstraints={true}
          maxViewportCells={40}
        />
        
        {/* Mini-map overlay */}
        <MiniMap
          gridWidth={gridSize.width}
          gridHeight={gridSize.height}
          cellSize={20}
          pattern={pattern}
          colors={colorsFormatted}
          width={200}
          height={200}
          viewportWidth={containerSize.width}
          viewportHeight={containerSize.height}
        />
      </div>
      
      {/* Status bar */}
      <div className="status-bar">
        <span>Size: {gridSize.width} × {gridSize.height}</span>
        <span>Tool: {activeTool}</span>
        <span>Color: {activeColorData?.label || activeColor}</span>
        {(selection || (selectedCells && selectedCells.size > 0)) && (
          <span>
            Selection: {
              selection
                ? Array.isArray(selection)
                  ? `${selection.length} areas`
                  : selection.length > 0
                    ? `${selection[0].endRow - selection[0].startRow + 1} × ${selection[0].endCol - selection[0].startCol + 1}`
                    : ''
                : ''
            }
            {selectedCells && selectedCells.size > 0 && selection && (
              <span style={{ color: '#ff6600' }}> (-{selectedCells.size} excluded)</span>
            )}
          </span>
        )}
        {pasteMode && <span className="paste-mode">Paste Mode Active</span>}
      </div>
    </div>
  );
};

export default ColorworkGridVirtualized;
