import React, { useMemo } from 'react';
import { Typography, Button, Space, Tooltip } from 'antd';
import { ZoomInOutlined, ZoomOutOutlined, ExpandOutlined } from '@ant-design/icons';
import '../styles/PatternPreview.css';

const { Text } = Typography;

const PatternPreview = ({ pattern, colors, gridSize }) => {
  const [scale, setScale] = React.useState(1);
  const maxScale = 3;
  const minScale = 0.25;

  // Calculate pattern statistics
  const patternStats = useMemo(() => {
    const colorCounts = {};
    let totalStitches = 0;

    pattern.forEach(row => {
      row.forEach(stitch => {
        colorCounts[stitch] = (colorCounts[stitch] || 0) + 1;
        totalStitches++;
      });
    });

    return { colorCounts, totalStitches };
  }, [pattern]);

  // Generate preview grid
  const previewGrid = useMemo(() => {
    const cellSize = 4 * scale;
    const width = gridSize.width * cellSize;
    const height = gridSize.height * cellSize;

    return (
        <svg width={width} height={height} className="pattern-preview-svg">
          {pattern.map((row, rowIndex) =>
            row.map((stitch, colIndex) => {
              const x = colIndex * cellSize;
              const y = rowIndex * cellSize;
              const color = colors[stitch] || colors['MC'];

              return (
                <rect
                  key={`${rowIndex}-${colIndex}`}
                  x={x}
                  y={y}
                  width={cellSize}
                  height={cellSize}
                  fill={color}
                  stroke="#ddd"
                  strokeWidth="0.1"
                />
              );
            })
          )}
        </svg>
    );
  }, [pattern, colors, gridSize, scale]);

  // Handle zoom
  const handleZoomIn = () => {
    setScale(prev => Math.min(prev * 1.5, maxScale));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev / 1.5, minScale));
  };

  const handleZoomReset = () => {
    setScale(1);
  };

  return (
    <div className="pattern-preview">
      <div className="preview-controls">
        <Space>
          <Tooltip title="Zoom in">
            <Button
              size="small"
              icon={<ZoomInOutlined />}
              onClick={handleZoomIn}
              disabled={scale >= maxScale}
            />
          </Tooltip>
          <Tooltip title="Zoom out">
            <Button
              size="small"
              icon={<ZoomOutOutlined />}
              onClick={handleZoomOut}
              disabled={scale <= minScale}
            />
          </Tooltip>
          <Tooltip title="Reset zoom">
            <Button
              size="small"
              icon={<ExpandOutlined />}
              onClick={handleZoomReset}
            />
          </Tooltip>
          <Text type="secondary">{Math.round(scale * 100)}%</Text>
        </Space>
      </div>

      <div className="preview-container">
        <div className="preview-grid-container">
          {previewGrid}
        </div>
      </div>

      <div className="pattern-statistics">
        <Text strong>Color Usage</Text>
        <div className="color-stats">
          {Object.entries(patternStats.colorCounts).map(([colorCode, count]) => (
            <div key={colorCode} className="color-stat">
              <div
                className="color-stat-swatch"
                style={{ backgroundColor: colors[colorCode] }}
              />
              <Text>{colorCode}: {count} ({Math.round(count / patternStats.totalStitches * 100)}%)</Text>
            </div>
          ))}
        </div>
      </div>

      <div className="preview-tips">
        <Text type="secondary" style={{ fontSize: '12px' }}>
          This preview shows how your colorwork pattern will look when knitted.
          Colors are shown as they appear in your palette.
        </Text>
      </div>
    </div>
  );
};

export default PatternPreview;
