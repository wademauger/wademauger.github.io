import React, { useMemo } from 'react';
import KnitStitch from './KnitStitch';

const KnitSwatch = ({ 
  gauge = { stitches: 19, rows: 26 }, // Stitches and rows per 4 inches
  colors = ['#ffffff'], 
  pattern = [], // 2D array for colorwork patterns, empty for solid
  size = { width: 4, height: 4 }, // Size in inches
  stitchSize = 8, // Size of each stitch in pixels
  className = '',
  style = {},
  onClick = null,
  showBorder = true,
  borderColor = '#cccccc'
}) => {
  // Calculate grid dimensions based on gauge
  const dimensions = useMemo(() => {
    const stitchesWide = Math.round((gauge.stitches / 4) * size.width);
    const rowsHigh = Math.round((gauge.rows / 4) * size.height);
    
    return {
      stitchesWide,
      rowsHigh,
      totalStitches: stitchesWide * rowsHigh
    };
  }, [gauge, size]);

  // Generate the stitch grid
  const stitchGrid = useMemo(() => {
    const grid = [];
    
    for (let row = 0; row < dimensions.rowsHigh; row++) {
      const rowStitches = [];
      
      for (let stitch = 0; stitch < dimensions.stitchesWide; stitch++) {
        let colorIndex = 0;
        
        // Apply pattern if provided
        if (pattern.length > 0) {
          if (Array.isArray(pattern[0])) {
            // 2D pattern array (stranded/intarsia)
            const patternRow = row % pattern.length;
            const patternCol = stitch % pattern[patternRow].length;
            colorIndex = pattern[patternRow][patternCol] || 0;
          } else {
            // 1D pattern array (stripes)
            colorIndex = pattern[row % pattern.length] || 0;
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
  }, [pattern, colors, dimensions]);

  // Handle stitch clicks
  const handleStitchClick = (row, stitch) => {
    if (onClick) {
      onClick(row, stitch);
    }
  };

  const containerStyle = {
    display: 'inline-block',
    padding: '16px',
    backgroundColor: '#fafafa',
    borderRadius: '8px',
    border: showBorder ? `2px solid ${borderColor}` : 'none',
    ...style
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${dimensions.stitchesWide}, ${stitchSize}px)`,
    gap: '0px', // Remove gaps for tessellation
    backgroundColor: '#ffffff',
    padding: '8px',
    borderRadius: '4px',
    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
    overflow: 'hidden' // Ensure seamless edges
  };

  return (
    <div className={className} style={containerStyle}>
      {/* Swatch info header */}
      <div style={{ 
        marginBottom: '12px', 
        textAlign: 'center',
        fontSize: '12px',
        color: '#666'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
          Knit Swatch ({size.width}" × {size.height}")
        </div>
        <div>
          {dimensions.stitchesWide} × {dimensions.rowsHigh} stitches
        </div>
        <div>
          Gauge: {gauge.stitches} sts × {gauge.rows} rows per 4"
        </div>
      </div>

      {/* Stitch grid */}
      <div style={gridStyle}>
        {stitchGrid.map((row: any) => 
          row.map(({ row: r, stitch: s, color, key }) => (
            <KnitStitch
              key={key}
              color={color}
              size={stitchSize}
              strokeWidth={0} // Remove stroke for seamless tessellation
              onClick={onClick ? () => handleStitchClick(r, s) : null}
              style={{
                width: stitchSize,
                height: stitchSize * 0.75,
                display: 'block',
                margin: 0,
                padding: 0
              }}
            />
          ))
        )}
      </div>

      {/* Color legend */}
      {colors.length > 1 && (
        <div style={{ 
          marginTop: '12px', 
          display: 'flex', 
          justifyContent: 'center',
          gap: '8px',
          flexWrap: 'wrap'
        }}>
          {colors.map((color, index: number) => (
            <div key={index} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '4px',
              fontSize: '11px',
              color: '#666'
            }}>
              <div style={{
                width: '12px',
                height: '12px',
                backgroundColor: color,
                border: '1px solid #ccc',
                borderRadius: '2px'
              }} />
              <span>Color {index + 1}</span>
            </div>
          ))}
        </div>
      )}

      {/* Pattern stats */}
      <div style={{ 
        marginTop: '8px', 
        textAlign: 'center',
        fontSize: '10px',
        color: '#999'
      }}>
        {pattern.length > 0 ? 'Colorwork Pattern' : 'Solid Color'} • {dimensions.totalStitches} total stitches
      </div>
    </div>
  );
};

export default KnitSwatch;
