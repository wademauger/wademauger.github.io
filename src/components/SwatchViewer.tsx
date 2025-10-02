import React, { useMemo, useCallback } from 'react';
import KnitStitch from './KnitStitch';

const SwatchViewer = ({ 
  pattern = [], 
  colors = ['#ffffff'], 
  gauge = { stitches: 19, rows: 30 }, 
  size = { width: 4, height: 4 }, // in inches
  onStitchClick = null,
  className = '',
  style = {},
  showScrollbars = false,
  maxDisplayStitches = 1000 // Performance limit
}) => {
  // Calculate dimensions
  const dimensions = useMemo(() => {
    const stitchesWide = Math.round(size.width * gauge.stitches);
    const rowsHigh = Math.round(size.height * gauge.rows);
    const stitchSize = Math.min(16, Math.max(4, 400 / Math.max(stitchesWide, rowsHigh)));
    
    return {
      stitchesWide,
      rowsHigh,
      stitchSize,
      totalStitches: stitchesWide * rowsHigh
    };
  }, [size, gauge]);

  // Create pattern grid with flyweight approach for performance
  const patternGrid = useMemo(() => {
    const { stitchesWide, rowsHigh } = dimensions;
    
    // Limit rendering for performance
    if (dimensions.totalStitches > maxDisplayStitches) {
      console.warn(`SwatchViewer: ${dimensions.totalStitches} stitches exceeds limit of ${maxDisplayStitches}. Consider using scrollable view.`);
    }
    
    const grid = [];
    
    for (let row = 0; row < rowsHigh; row++) {
      const rowStitches = [];
      for (let stitch = 0; stitch < stitchesWide; stitch++) {
        // Get color index from pattern or default to 0
        let colorIndex = 0;
        
        if (pattern.length > 0) {
          if (Array.isArray(pattern[0])) {
            // 2D pattern array
            const patternRow = row % pattern.length;
            const patternCol = stitch % pattern[patternRow].length;
            colorIndex = pattern[patternRow][patternCol];
          } else {
            // 1D pattern array (stripes)
            colorIndex = pattern[row % pattern.length];
          }
        }
        
        // Ensure colorIndex is valid
        colorIndex = Math.min(colorIndex, colors.length - 1);
        
        rowStitches.push({
          row,
          stitch,
          colorIndex,
          color: colors[colorIndex] || colors[0] || '#ffffff',
          key: `${row}-${stitch}`
        });
      }
      grid.push(rowStitches);
    }
    
    return grid;
  }, [pattern, colors, dimensions, maxDisplayStitches]);

  // Handle stitch clicks
  const handleStitchClick = useCallback((row, stitch) => {
    if (onStitchClick) {
      onStitchClick(row, stitch);
    }
  }, [onStitchClick]);

  // Performance check
  if (dimensions.totalStitches > maxDisplayStitches && !showScrollbars) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center', 
        border: '2px dashed #ccc', 
        borderRadius: '8px',
        backgroundColor: '#fafafa',
        ...style 
      }} className={className}>
        <p>Pattern too large to display ({dimensions.totalStitches} stitches)</p>
        <p>Enable scrollbars or reduce pattern size</p>
        <small>Size: {dimensions.stitchesWide} × {dimensions.rowsHigh} stitches</small>
      </div>
    );
  }

  const containerStyle = {
    display: 'inline-block',
    border: '1px solid #ddd',
    borderRadius: '4px',
    padding: '8px',
    backgroundColor: '#fff',
    ...style
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${dimensions.stitchesWide}, ${dimensions.stitchSize}px)`,
    gap: '0px',
    lineHeight: 0,
    maxWidth: showScrollbars ? '400px' : 'none',
    maxHeight: showScrollbars ? '400px' : 'none',
    overflow: showScrollbars ? 'auto' : 'visible'
  };

  return (
    <div className={className} style={containerStyle}>
      <div style={gridStyle}>
        {patternGrid.map(row => 
          row.map(({ row: r, stitch: s, color, key }) => (
            <KnitStitch
              key={key}
              color={color}
              size={dimensions.stitchSize}
              strokeWidth={dimensions.stitchSize > 8 ? 0.5 : 0.25}
              onClick={onStitchClick ? () => handleStitchClick(r, s) : null}
              style={{
                width: dimensions.stitchSize,
                height: dimensions.stitchSize * 0.75
              }}
            />
          ))
        )}
      </div>
      
      {/* Info overlay */}
      <div style={{ 
        marginTop: '8px', 
        fontSize: '11px', 
        color: '#666', 
        textAlign: 'center' 
      }}>
        {dimensions.stitchesWide} × {dimensions.rowsHigh} stitches
        ({size.width}" × {size.height}")
      </div>
    </div>
  );
};

export default SwatchViewer;
