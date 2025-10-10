/**
 * MiniMap - Interactive overview/navigator for large grids
 * 
 * This component:
 * - Renders a scaled-down canvas representation of the full grid
 * - Highlights the current viewport rectangle
 * - Allows dragging the viewport rectangle to pan the main view
 * - Allows clicking to jump to a specific location
 * - Updates in real-time as the main viewport changes
 * - Uses canvas for performance with very large grids
 * 
 * Architecture:
 * - Canvas rendering for efficient scaled-down visualization
 * - Integrates with Zustand viewport store for bi-directional sync
 * - Uses Redux for pattern data
 * - Separate drag handling for mini-map interactions
 */

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useDrag } from '@use-gesture/react';
import { useViewportStore } from '../store/viewportStore';

export interface MiniMapProps {
  // Grid dimensions
  gridWidth: number;
  gridHeight: number;
  cellSize: number;
  
  // Pattern data (2D array of color IDs)
  pattern: string[][];
  
  // Color mapping (colorId -> hex color)
  colors: Record<string, { id: string; color: string; label: string }>;
  
  // Mini-map size
  width?: number;
  height?: number;
  
  // Viewport dimensions (from main editor)
  viewportWidth: number;
  viewportHeight: number;
}

/**
 * Main MiniMap component
 */
export const MiniMap: React.FC<MiniMapProps> = ({
  gridWidth,
  gridHeight,
  cellSize,
  pattern,
  colors,
  width = 200,
  height = 200,
  viewportWidth,
  viewportHeight
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDraggingViewport, setIsDraggingViewport] = useState(false);
  
  // Get viewport state from Zustand
  const { offsetX, offsetY, scale, setPan } = useViewportStore();
  
  // Calculate scale factor for mini-map
  const scaleX = width / (gridWidth * cellSize);
  const scaleY = height / (gridHeight * cellSize);
  const miniMapScale = Math.min(scaleX, scaleY);
  
  // Calculate actual mini-map canvas size
  const canvasWidth = gridWidth * cellSize * miniMapScale;
  const canvasHeight = gridHeight * cellSize * miniMapScale;
  
  /**
   * Render the mini-map canvas
   */
  const renderMiniMap = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // Set canvas size
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    
    // Calculate cell size in mini-map
    const miniCellSize = cellSize * miniMapScale;
    
    // Render cells (batch draw for performance)
    for (let row = 0; row < gridHeight; row++) {
      for (let col = 0; col < gridWidth; col++) {
        const colorId = pattern[row]?.[col] || 'CCX';
        const colorData = colors[colorId] || { id: 'CCX', color: 'transparent', label: 'No Color' };
        
        const x = col * miniCellSize;
        const y = row * miniCellSize;
        
        // Draw cell
        if (colorData.color === 'transparent' || colorId === 'CCX') {
          // Render checkerboard for "no color"
          ctx.fillStyle = '#f0f0f0';
          ctx.fillRect(x, y, miniCellSize / 2, miniCellSize / 2);
          ctx.fillRect(x + miniCellSize / 2, y + miniCellSize / 2, miniCellSize / 2, miniCellSize / 2);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(x + miniCellSize / 2, y, miniCellSize / 2, miniCellSize / 2);
          ctx.fillRect(x, y + miniCellSize / 2, miniCellSize / 2, miniCellSize / 2);
        } else {
          ctx.fillStyle = colorData.color;
          ctx.fillRect(x, y, miniCellSize, miniCellSize);
        }
      }
    }
    
    // Draw grid lines (optional, only for larger mini-maps)
    if (miniCellSize > 2) {
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.lineWidth = 0.5;
      
      // Vertical lines
      for (let col = 0; col <= gridWidth; col++) {
        const x = col * miniCellSize;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvasHeight);
        ctx.stroke();
      }
      
      // Horizontal lines
      for (let row = 0; row <= gridHeight; row++) {
        const y = row * miniCellSize;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvasWidth, y);
        ctx.stroke();
      }
    }
    
    // Draw viewport rectangle
    const viewportRectX = (-offsetX / scale) * miniMapScale;
    const viewportRectY = (-offsetY / scale) * miniMapScale;
    const viewportRectWidth = (viewportWidth / scale) * miniMapScale;
    const viewportRectHeight = (viewportHeight / scale) * miniMapScale;
    
    // Semi-transparent overlay for area outside viewport
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // Clear viewport area
    ctx.clearRect(viewportRectX, viewportRectY, viewportRectWidth, viewportRectHeight);
    
    // Re-render cells in viewport area (so they're not darkened)
    ctx.save();
    ctx.beginPath();
    ctx.rect(viewportRectX, viewportRectY, viewportRectWidth, viewportRectHeight);
    ctx.clip();
    
    for (let row = 0; row < gridHeight; row++) {
      for (let col = 0; col < gridWidth; col++) {
        const colorId = pattern[row]?.[col] || 'CCX';
        const colorData = colors[colorId] || { id: 'CCX', color: 'transparent', label: 'No Color' };
        
        const x = col * miniCellSize;
        const y = row * miniCellSize;
        
        if (colorData.color === 'transparent' || colorId === 'CCX') {
          ctx.fillStyle = '#f0f0f0';
          ctx.fillRect(x, y, miniCellSize / 2, miniCellSize / 2);
          ctx.fillRect(x + miniCellSize / 2, y + miniCellSize / 2, miniCellSize / 2, miniCellSize / 2);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(x + miniCellSize / 2, y, miniCellSize / 2, miniCellSize / 2);
          ctx.fillRect(x, y + miniCellSize / 2, miniCellSize / 2, miniCellSize / 2);
        } else {
          ctx.fillStyle = colorData.color;
          ctx.fillRect(x, y, miniCellSize, miniCellSize);
        }
      }
    }
    
    ctx.restore();
    
    // Draw viewport rectangle border
    ctx.strokeStyle = '#ff6600';
    ctx.lineWidth = 2;
    ctx.strokeRect(viewportRectX, viewportRectY, viewportRectWidth, viewportRectHeight);
    
  }, [
    canvasWidth,
    canvasHeight,
    cellSize,
    miniMapScale,
    gridWidth,
    gridHeight,
    pattern,
    colors,
    offsetX,
    offsetY,
    scale,
    viewportWidth,
    viewportHeight
  ]);
  
  // Re-render when dependencies change
  useEffect(() => {
    renderMiniMap();
  }, [renderMiniMap]);
  
  /**
   * Handle click/drag on mini-map to pan viewport
   */
  const handleMiniMapClick = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    // Convert mini-map coordinates to grid coordinates
    const gridX = (x / miniMapScale);
    const gridY = (y / miniMapScale);
    
    // Center viewport on clicked position
    const newOffsetX = -(gridX * scale - viewportWidth / 2);
    const newOffsetY = -(gridY * scale - viewportHeight / 2);
    
    setPan(newOffsetX, newOffsetY);
  }, [miniMapScale, scale, viewportWidth, viewportHeight, setPan]);
  
  /**
   * Drag gesture for viewport rectangle
   */
  const bindDrag = useDrag(
    ({ movement: [mx, my], first, last }) => {
      if (first) {
        setIsDraggingViewport(true);
      }
      
      if (last) {
        setIsDraggingViewport(false);
      }
      
      // Convert movement to grid coordinates
      const deltaX = (mx / miniMapScale);
      const deltaY = (my / miniMapScale);
      
      const newOffsetX = offsetX - deltaX * scale;
      const newOffsetY = offsetY - deltaY * scale;
      
      setPan(newOffsetX, newOffsetY);
    },
    {
      from: () => [0, 0]
    }
  );
  
  return (
    <div
      ref={containerRef}
      className="mini-map-container"
      style={{
        position: 'absolute',
        top: 20,
        right: 20,
        background: 'rgba(255, 255, 255, 0.95)',
        padding: 12,
        borderRadius: 8,
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        zIndex: 1000
      }}
    >
      <div style={{ marginBottom: 8, fontSize: 12, fontWeight: 'bold', color: '#333' }}>
        Navigator
      </div>
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        style={{
          border: '1px solid #ccc',
          cursor: isDraggingViewport ? 'grabbing' : 'grab',
          display: 'block'
        }}
        onClick={(e) => handleMiniMapClick(e.clientX, e.clientY)}
        {...bindDrag()}
      />
      <div style={{ marginTop: 8, fontSize: 10, color: '#666' }}>
        Grid: {gridWidth} × {gridHeight}
      </div>
    </div>
  );
};

export default MiniMap;
