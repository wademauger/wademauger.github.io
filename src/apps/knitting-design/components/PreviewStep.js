import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Switch, Button, Space, Typography, Select, Slider, Radio, Divider, Tag, message, Dropdown, Menu } from 'antd';
import { 
  EyeOutlined, 
  DownloadOutlined, 
  SettingOutlined, 
  ZoomInOutlined, 
  ZoomOutOutlined,
  RotateLeftOutlined,
  RotateRightOutlined,
  FullscreenOutlined,
  FileImageOutlined,
  FileTextOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

const PREVIEW_MODES = {
  flat: 'Flat Pattern',
  '3d': '3D Model', 
  technical: 'Technical Drawing',
  schematic: 'Schematic'
};

const VISUALIZATION_OPTIONS = {
  realistic: 'Realistic Texture',
  symbolic: 'Symbolic Stitches',
  wireframe: 'Wireframe',
  colorwork: 'Colorwork Only'
};

const PreviewStep = ({ data, onUpdate, onNext, onPrev }) => {
  const [previewSettings, setPreviewSettings] = useState({
    mode: 'flat',
    visualization: 'realistic',
    showGrid: true,
    showMeasurements: true,
    showStitchCount: false,
    zoom: 100,
    rotation: { x: 0, y: 0, z: 0 },
    lighting: 'natural',
    backgroundColor: '#f0f0f0'
  });

  const [patternStats, setPatternStats] = useState({});

  useEffect(() => {
    calculatePatternStats();
  }, [data]);

  const calculatePatternStats = () => {
    const { gauge, sizing, colorwork } = data;
    
    if (!gauge || !sizing) return;

    const dimensions = sizing.method === 'percentage' 
      ? { 
          chest: 40 * (sizing.scale / 100), 
          length: 24 * (sizing.scale / 100),
          armLength: 25 * (sizing.scale / 100)
        }
      : sizing.customDimensions;

    const totalStitches = Math.round(dimensions.chest * gauge.stitches);
    const totalRows = Math.round(dimensions.length * gauge.rows);
    const estimatedTime = Math.round((totalStitches * totalRows) / 1000); // rough estimate

    setPatternStats({
      totalStitches: totalStitches * totalRows,
      bodyStitches: totalStitches,
      bodyRows: totalRows,
      colors: colorwork.enabled ? colorwork.colors.length : 1,
      estimatedTime,
      difficulty: calculateDifficulty()
    });
  };

  const calculateDifficulty = () => {
    let difficulty = 1; // Base difficulty
    
    if (data.colorwork?.enabled) {
      difficulty += data.colorwork.colors.length > 2 ? 2 : 1;
      if (data.colorwork.type === 'intarsia') difficulty += 2;
      if (data.colorwork.type === 'fairisle') difficulty += 1;
    }
    
    if (data.gauge?.stitches > 20) difficulty += 1; // Fine gauge
    
    const levels = ['Beginner', 'Easy', 'Intermediate', 'Advanced', 'Expert'];
    return levels[Math.min(difficulty - 1, levels.length - 1)];
  };

  const updatePreviewSetting = (key, value) => {
    setPreviewSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleRotation = (axis, direction) => {
    const increment = direction === 'positive' ? 15 : -15;
    setPreviewSettings(prev => ({
      ...prev,
      rotation: {
        ...prev.rotation,
        [axis]: (prev.rotation[axis] + increment) % 360
      }
    }));
  };

  const resetView = () => {
    setPreviewSettings(prev => ({
      ...prev,
      zoom: 100,
      rotation: { x: 0, y: 0, z: 0 }
    }));
  };

  const exportOptions = (
    <Menu>
      <Menu.Item key="pdf" icon={<FileTextOutlined />}>
        Export as PDF Pattern
      </Menu.Item>
      <Menu.Item key="image" icon={<FileImageOutlined />}>
        Export as Image
      </Menu.Item>
      <Menu.Item key="schematic" icon={<FileTextOutlined />}>
        Export Schematic
      </Menu.Item>
    </Menu>
  );

  const handleExport = ({ key }) => {
    message.info(`Exporting ${key.toUpperCase()}...`);
    // Export functionality would be implemented here
  };

  const handleSave = () => {
    onUpdate({ preview: previewSettings });
    message.success('Preview settings saved');
  };

  const handleNext = () => {
    handleSave();
    onNext();
  };

  return (
    <div className="preview-step">
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={14}>
          <Card title="Pattern Preview" className="preview-card">
            {/* Preview Controls */}
            <div className="preview-controls" style={{ marginBottom: 16 }}>
              <Row gutter={[16, 16]} align="middle">
                <Col span={8}>
                  <Text>View Mode</Text>
                  <Select
                    value={previewSettings.mode}
                    onChange={(mode) => updatePreviewSetting('mode', mode)}
                    style={{ width: '100%' }}
                  >
                    {Object.entries(PREVIEW_MODES).map(([key, label]) => (
                      <Option key={key} value={key}>{label}</Option>
                    ))}
                  </Select>
                </Col>
                <Col span={8}>
                  <Text>Visualization</Text>
                  <Select
                    value={previewSettings.visualization}
                    onChange={(visualization) => updatePreviewSetting('visualization', visualization)}
                    style={{ width: '100%' }}
                  >
                    {Object.entries(VISUALIZATION_OPTIONS).map(([key, label]) => (
                      <Option key={key} value={key}>{label}</Option>
                    ))}
                  </Select>
                </Col>
                <Col span={8}>
                  <Space>
                    <Button
                      icon={<ZoomOutOutlined />}
                      onClick={() => updatePreviewSetting('zoom', Math.max(25, previewSettings.zoom - 25))}
                    />
                    <Text style={{ minWidth: 60, textAlign: 'center' }}>
                      {previewSettings.zoom}%
                    </Text>
                    <Button
                      icon={<ZoomInOutlined />}
                      onClick={() => updatePreviewSetting('zoom', Math.min(200, previewSettings.zoom + 25))}
                    />
                  </Space>
                </Col>
              </Row>
            </div>

            {/* Main Preview Area */}
            <div 
              className="pattern-preview-area"
              style={{ 
                height: '400px', 
                backgroundColor: previewSettings.backgroundColor,
                border: '1px solid #d9d9d9',
                borderRadius: '8px',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {/* Mock Pattern Visualization */}
              <div style={{ 
                transform: `scale(${previewSettings.zoom / 100}) rotateX(${previewSettings.rotation.x}deg) rotateY(${previewSettings.rotation.y}deg) rotateZ(${previewSettings.rotation.z}deg)`,
                transition: 'transform 0.3s ease'
              }}>
                {previewSettings.mode === 'flat' && (
                  <div className="flat-pattern" style={{ 
                    width: '300px', 
                    height: '250px', 
                    background: 'linear-gradient(45deg, #e6f7ff 25%, transparent 25%), linear-gradient(-45deg, #e6f7ff 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e6f7ff 75%), linear-gradient(-45deg, transparent 75%, #e6f7ff 75%)',
                    backgroundSize: '20px 20px',
                    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                    border: '2px solid #1890ff',
                    borderRadius: '8px',
                    position: 'relative'
                  }}>
                    {data.colorwork?.enabled && (
                      <div style={{ 
                        position: 'absolute', 
                        top: '20%', 
                        left: '20%', 
                        right: '20%', 
                        height: '30%',
                        background: `linear-gradient(90deg, ${data.colorwork.colors.join(', ')})`,
                        borderRadius: '4px'
                      }} />
                    )}
                    {previewSettings.showMeasurements && (
                      <>
                        <div style={{ position: 'absolute', top: '-20px', left: '50%', transform: 'translateX(-50%)', fontSize: '12px', color: '#666' }}>
                          {data.sizing?.method === 'percentage' ? `${40 * (data.sizing.scale / 100)}"` : `${data.sizing?.customDimensions?.chest}"`}
                        </div>
                        <div style={{ position: 'absolute', left: '-30px', top: '50%', transform: 'translateY(-50%) rotate(-90deg)', fontSize: '12px', color: '#666' }}>
                          {data.sizing?.method === 'percentage' ? `${24 * (data.sizing.scale / 100)}"` : `${data.sizing?.customDimensions?.length}"`}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {previewSettings.mode === '3d' && (
                  <div className="3d-model" style={{ 
                    width: '250px', 
                    height: '300px', 
                    background: 'linear-gradient(135deg, #f0f0f0, #d9d9d9)',
                    borderRadius: '20px 20px 10px 10px',
                    position: 'relative',
                    border: '1px solid #bfbfbf',
                    boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                  }}>
                    <div style={{ 
                      position: 'absolute', 
                      top: '10px', 
                      left: '20px', 
                      right: '20px', 
                      height: '30px',
                      background: '#1890ff',
                      borderRadius: '10px 10px 0 0'
                    }} />
                    {data.colorwork?.enabled && (
                      <div style={{ 
                        position: 'absolute', 
                        top: '40%', 
                        left: '10%', 
                        right: '10%', 
                        height: '20%',
                        background: `repeating-linear-gradient(90deg, ${data.colorwork.colors[0]} 0px, ${data.colorwork.colors[0]} 10px, ${data.colorwork.colors[1]} 10px, ${data.colorwork.colors[1]} 20px)`,
                        borderRadius: '4px'
                      }} />
                    )}
                  </div>
                )}

                {previewSettings.mode === 'technical' && (
                  <div className="technical-drawing" style={{ 
                    width: '350px', 
                    height: '280px', 
                    background: 'white',
                    border: '1px solid #000',
                    position: 'relative'
                  }}>
                    {/* Technical schematic with measurements */}
                    <svg width="100%" height="100%" viewBox="0 0 350 280">
                      <rect x="50" y="40" width="200" height="160" fill="none" stroke="#000" strokeWidth="2" />
                      <rect x="50" y="40" width="60" height="40" fill="none" stroke="#000" strokeWidth="1" strokeDasharray="5,5" />
                      <rect x="190" y="40" width="60" height="40" fill="none" stroke="#000" strokeWidth="1" strokeDasharray="5,5" />
                      
                      <text x="150" y="30" textAnchor="middle" fontSize="12">Front</text>
                      <text x="25" y="125" textAnchor="middle" fontSize="10" transform="rotate(-90, 25, 125)">Length</text>
                      <text x="150" y="220" textAnchor="middle" fontSize="10">Chest</text>
                      
                      {previewSettings.showMeasurements && (
                        <>
                          <text x="150" y="250" textAnchor="middle" fontSize="12" fill="#1890ff">
                            {data.sizing?.method === 'percentage' ? `${40 * (data.sizing.scale / 100)}"` : `${data.sizing?.customDimensions?.chest}"`}
                          </text>
                          <text x="10" y="125" textAnchor="middle" fontSize="12" fill="#1890ff" transform="rotate(-90, 10, 125)">
                            {data.sizing?.method === 'percentage' ? `${24 * (data.sizing.scale / 100)}"` : `${data.sizing?.customDimensions?.length}"`}
                          </text>
                        </>
                      )}
                    </svg>
                  </div>
                )}

                {previewSettings.mode === 'schematic' && (
                  <div className="schematic" style={{ 
                    width: '400px', 
                    height: '300px', 
                    background: 'white',
                    border: '1px solid #ccc',
                    padding: '20px',
                    fontSize: '12px',
                    lineHeight: '18px'
                  }}>
                    <Title level={5} style={{ margin: '0 0 16px 0' }}>Pattern Schematic</Title>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <Text strong>Dimensions:</Text><br />
                        Chest: {data.sizing?.method === 'percentage' ? `${40 * (data.sizing.scale / 100)}"` : `${data.sizing?.customDimensions?.chest}"`}<br />
                        Length: {data.sizing?.method === 'percentage' ? `${24 * (data.sizing.scale / 100)}"` : `${data.sizing?.customDimensions?.length}"`}<br />
                        <br />
                        <Text strong>Gauge:</Text><br />
                        {data.gauge?.stitches} sts × {data.gauge?.rows} rows<br />
                        per inch
                      </div>
                      <div>
                        <Text strong>Construction:</Text><br />
                        Body: {patternStats.bodyStitches} sts<br />
                        Rows: {patternStats.bodyRows}<br />
                        <br />
                        <Text strong>Colors:</Text><br />
                        {data.colorwork?.enabled ? data.colorwork.colors.length : 1} color(s)
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Grid Overlay */}
              {previewSettings.showGrid && (
                <div style={{ 
                  position: 'absolute', 
                  top: 0, 
                  left: 0, 
                  right: 0, 
                  bottom: 0,
                  backgroundImage: 'linear-gradient(rgba(0,0,0,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,.1) 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                  pointerEvents: 'none'
                }} />
              )}
            </div>

            {/* View Controls */}
            <div className="view-controls" style={{ marginTop: 16 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Space>
                    <Text>Options:</Text>
                    <Switch
                      checkedChildren="Grid"
                      unCheckedChildren="Grid"
                      checked={previewSettings.showGrid}
                      onChange={(showGrid) => updatePreviewSetting('showGrid', showGrid)}
                    />
                    <Switch
                      checkedChildren="Measure"
                      unCheckedChildren="Measure"
                      checked={previewSettings.showMeasurements}
                      onChange={(showMeasurements) => updatePreviewSetting('showMeasurements', showMeasurements)}
                    />
                  </Space>
                </Col>
                <Col span={12}>
                  <Space style={{ float: 'right' }}>
                    <Button icon={<RotateLeftOutlined />} onClick={() => handleRotation('y', 'negative')} />
                    <Button icon={<RotateRightOutlined />} onClick={() => handleRotation('y', 'positive')} />
                    <Button onClick={resetView}>Reset</Button>
                    <Dropdown overlay={exportOptions} trigger={['click']}>
                      <Button type="primary" icon={<DownloadOutlined />}>
                        Export
                      </Button>
                    </Dropdown>
                  </Space>
                </Col>
              </Row>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card title="Pattern Statistics" className="stats-card" style={{ marginBottom: 16 }}>
            <Space direction="vertical" size="medium" style={{ width: '100%' }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Card size="small" className="stat-card">
                    <Text type="secondary">Total Stitches</Text>
                    <br />
                    <Text strong style={{ fontSize: '18px', color: '#1890ff' }}>
                      {patternStats.totalStitches?.toLocaleString()}
                    </Text>
                  </Card>
                </Col>
                <Col span={12}>
                  <Card size="small" className="stat-card">
                    <Text type="secondary">Estimated Time</Text>
                    <br />
                    <Text strong style={{ fontSize: '18px', color: '#52c41a' }}>
                      {patternStats.estimatedTime}h
                    </Text>
                  </Card>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Card size="small" className="stat-card">
                    <Text type="secondary">Body Stitches</Text>
                    <br />
                    <Text strong style={{ fontSize: '16px' }}>
                      {patternStats.bodyStitches}
                    </Text>
                  </Card>
                </Col>
                <Col span={12}>
                  <Card size="small" className="stat-card">
                    <Text type="secondary">Body Rows</Text>
                    <br />
                    <Text strong style={{ fontSize: '16px' }}>
                      {patternStats.bodyRows}
                    </Text>
                  </Card>
                </Col>
              </Row>

              <div>
                <Text type="secondary">Difficulty Level</Text>
                <br />
                <Tag color={
                  patternStats.difficulty === 'Beginner' ? 'green' :
                  patternStats.difficulty === 'Easy' ? 'blue' :
                  patternStats.difficulty === 'Intermediate' ? 'orange' :
                  patternStats.difficulty === 'Advanced' ? 'red' : 'purple'
                }>
                  {patternStats.difficulty}
                </Tag>
              </div>

              {data.colorwork?.enabled && (
                <div>
                  <Text type="secondary">Colorwork Colors</Text>
                  <br />
                  <Space wrap>
                    {data.colorwork.colors.map((color, index) => (
                      <div 
                        key={index}
                        style={{ 
                          width: 20, 
                          height: 20, 
                          backgroundColor: color, 
                          borderRadius: '50%',
                          border: '1px solid #d9d9d9'
                        }} 
                      />
                    ))}
                  </Space>
                </div>
              )}
            </Space>
          </Card>

          <Card title="Pattern Summary" className="summary-card">
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <div>
                <Text strong>Pattern:</Text> {data.name || 'Untitled Pattern'}
              </div>
              <div>
                <Text strong>Type:</Text> {data.type || 'Custom'}
              </div>
              <div>
                <Text strong>Gauge:</Text> {data.gauge?.stitches} × {data.gauge?.rows} per inch
              </div>
              <div>
                <Text strong>Size:</Text> {
                  data.sizing?.method === 'percentage' 
                    ? `${data.sizing.scale}% scale`
                    : 'Custom dimensions'
                }
              </div>
              {data.colorwork?.enabled && (
                <div>
                  <Text strong>Colorwork:</Text> {data.colorwork.type} with {data.colorwork.colors.length} colors
                </div>
              )}
            </Space>
          </Card>
        </Col>
      </Row>

      <div className="step-actions">
        <Space>
          <Button onClick={onPrev}>Previous</Button>
          <Button type="primary" onClick={handleSave}>
            Save Preview
          </Button>
          <Button type="primary" onClick={handleNext}>
            Start Knitting
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default PreviewStep;
