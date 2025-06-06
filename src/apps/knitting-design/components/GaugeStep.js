import React, { useState, useEffect } from 'react';
import { Card, Row, Col, InputNumber, Select, Typography, Space, Button, Divider, Tag, message } from 'antd';
import { InfoCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

// Gauge presets for different yarn weights (Craft Yarn Council standards)
const YARN_WEIGHT_PRESETS = {
  '0': { name: 'Lace', stitches: 33, rows: 41, needleSize: '1.5-2.25mm' },
  '1': { name: 'Super Fine', stitches: 27, rows: 37, needleSize: '2.25-3.25mm' },
  '2': { name: 'Fine', stitches: 23, rows: 32, needleSize: '3.25-3.75mm' },
  '3': { name: 'Light', stitches: 21, rows: 28, needleSize: '3.75-4.5mm' },
  '4': { name: 'Medium', stitches: 16, rows: 20, needleSize: '4.5-5.5mm' },
  '5': { name: 'Bulky', stitches: 12, rows: 16, needleSize: '5.5-8mm' },
  '6': { name: 'Super Bulky', stitches: 7, rows: 9, needleSize: '8mm+' },
  'custom': { name: 'Custom', stitches: 0, rows: 0, needleSize: 'Custom' }
};

const GaugeStep = ({ data, onUpdate, onNext, onPrev }) => {
  const [tempGauge, setTempGauge] = useState(data.gauge || {
    stitches: 19,
    rows: 30,
    yarnWeight: '4',
    needleSize: '6',
    swatchSize: 4 // inches
  });
  
  const [fabricDimensions, setFabricDimensions] = useState({});
  const [hasSwatchMeasurement, setHasSwatchMeasurement] = useState(false);

  // Calculate fabric dimensions based on gauge and pattern sizing
  useEffect(() => {
    if (tempGauge.stitches && tempGauge.rows && data.sizing) {
      const dimensions = calculateFabricDimensions();
      setFabricDimensions(dimensions);
    }
  }, [tempGauge, data.sizing]);

  const calculateFabricDimensions = () => {
    const { stitches, rows } = tempGauge;
    const sizing = data.sizing;
    
    if (sizing.method === 'percentage') {
      // Base dimensions for a medium sweater
      const baseDimensions = { chest: 40, length: 24, armLength: 25 };
      const scale = sizing.scale / 100;
      
      return {
        chest: Math.round(baseDimensions.chest * scale * stitches),
        length: Math.round(baseDimensions.length * scale * rows),
        armLength: Math.round(baseDimensions.armLength * scale * rows),
        fabricWidth: (baseDimensions.chest * scale).toFixed(1),
        fabricLength: (baseDimensions.length * scale).toFixed(1)
      };
    } else {
      const { chest, length, armLength } = sizing.customDimensions;
      return {
        chest: Math.round(chest * stitches),
        length: Math.round(length * rows),
        armLength: Math.round(armLength * rows),
        fabricWidth: chest.toFixed(1),
        fabricLength: length.toFixed(1)
      };
    }
  };

  const handleYarnWeightChange = (weight) => {
    if (weight === 'custom') {
      setTempGauge(prev => ({ ...prev, yarnWeight: weight }));
      return;
    }
    
    const preset = YARN_WEIGHT_PRESETS[weight];
    setTempGauge(prev => ({
      ...prev,
      yarnWeight: weight,
      stitches: preset.stitches,
      rows: preset.rows,
      needleSize: preset.needleSize
    }));
  };

  const handleGaugeChange = (field, value) => {
    setTempGauge(prev => ({ ...prev, [field]: value }));
  };

  const handleSwatchCalculation = () => {
    if (!tempGauge.swatchStitches || !tempGauge.swatchRows || !tempGauge.swatchSize) {
      message.error('Please fill in all swatch measurements');
      return;
    }
    
    const calculatedStitches = tempGauge.swatchStitches / tempGauge.swatchSize;
    const calculatedRows = tempGauge.swatchRows / tempGauge.swatchSize;
    
    setTempGauge(prev => ({
      ...prev,
      stitches: Math.round(calculatedStitches * 10) / 10,
      rows: Math.round(calculatedRows * 10) / 10
    }));
    
    setHasSwatchMeasurement(true);
    message.success('Gauge calculated from swatch measurements');
  };

  const handleSave = () => {
    onUpdate({ gauge: tempGauge });
    message.success('Gauge settings saved');
  };

  const handleNext = () => {
    handleSave();
    onNext();
  };

  return (
    <div className="gauge-step">
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={14}>
          <Card title="Gauge Settings" className="settings-card">
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              {/* Yarn Weight Presets */}
              <div>
                <Title level={5}>Yarn Weight</Title>
                <Select
                  value={tempGauge.yarnWeight}
                  onChange={handleYarnWeightChange}
                  style={{ width: '100%' }}
                  placeholder="Select yarn weight"
                >
                  {Object.entries(YARN_WEIGHT_PRESETS).map(([key, preset]) => (
                    <Option key={key} value={key}>
                      <Space>
                        <Text strong>{preset.name}</Text>
                        {key !== 'custom' && (
                          <Text type="secondary">
                            ({preset.stitches} sts, {preset.rows} rows per inch)
                          </Text>
                        )}
                      </Space>
                    </Option>
                  ))}
                </Select>
              </div>

              <Divider />

              {/* Manual Gauge Entry */}
              <div>
                <Title level={5}>
                  <Space>
                    Gauge (per inch)
                    <InfoCircleOutlined style={{ color: '#1890ff' }} />
                  </Space>
                </Title>
                <Row gutter={16}>
                  <Col span={12}>
                    <Text>Stitches per inch</Text>
                    <InputNumber
                      value={tempGauge.stitches}
                      onChange={(value) => handleGaugeChange('stitches', value)}
                      min={1}
                      max={50}
                      step={0.5}
                      style={{ width: '100%' }}
                      placeholder="19"
                    />
                  </Col>
                  <Col span={12}>
                    <Text>Rows per inch</Text>
                    <InputNumber
                      value={tempGauge.rows}
                      onChange={(value) => handleGaugeChange('rows', value)}
                      min={1}
                      max={60}
                      step={0.5}
                      style={{ width: '100%' }}
                      placeholder="30"
                    />
                  </Col>
                </Row>
              </div>

              <Divider />

              {/* Swatch Calculator */}
              <div>
                <Title level={5}>Calculate from Swatch</Title>
                <Paragraph type="secondary">
                  Measure your gauge swatch and let us calculate the gauge for you.
                </Paragraph>
                <Row gutter={16}>
                  <Col span={8}>
                    <Text>Swatch size (inches)</Text>
                    <InputNumber
                      value={tempGauge.swatchSize}
                      onChange={(value) => handleGaugeChange('swatchSize', value)}
                      min={1}
                      max={10}
                      step={0.5}
                      style={{ width: '100%' }}
                      placeholder="4"
                    />
                  </Col>
                  <Col span={8}>
                    <Text>Stitches in swatch</Text>
                    <InputNumber
                      value={tempGauge.swatchStitches}
                      onChange={(value) => handleGaugeChange('swatchStitches', value)}
                      min={1}
                      style={{ width: '100%' }}
                      placeholder="76"
                    />
                  </Col>
                  <Col span={8}>
                    <Text>Rows in swatch</Text>
                    <InputNumber
                      value={tempGauge.swatchRows}
                      onChange={(value) => handleGaugeChange('swatchRows', value)}
                      min={1}
                      style={{ width: '100%' }}
                      placeholder="120"
                    />
                  </Col>
                </Row>
                <Button 
                  type="primary" 
                  ghost 
                  onClick={handleSwatchCalculation}
                  style={{ marginTop: 16 }}
                >
                  Calculate Gauge from Swatch
                </Button>
                {hasSwatchMeasurement && (
                  <Tag color="green" style={{ marginTop: 8 }}>
                    <CheckCircleOutlined /> Calculated from swatch
                  </Tag>
                )}
              </div>

              <Divider />

              {/* Needle Size */}
              <div>
                <Title level={5}>Needle Size</Title>
                <InputNumber
                  value={tempGauge.needleSize}
                  onChange={(value) => handleGaugeChange('needleSize', value)}
                  style={{ width: '100%' }}
                  placeholder="6 (US)"
                  addonAfter="US"
                />
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card title="Calculated Fabric Dimensions" className="preview-card">
            <Space direction="vertical" size="medium" style={{ width: '100%' }}>
              <div>
                <Title level={5}>Stitch Counts</Title>
                <Row gutter={[16, 8]}>
                  <Col span={12}>
                    <Card size="small" className="dimension-card">
                      <Text type="secondary">Chest</Text>
                      <br />
                      <Text strong style={{ fontSize: '18px', color: '#1890ff' }}>
                        {fabricDimensions.chest} stitches
                      </Text>
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card size="small" className="dimension-card">
                      <Text type="secondary">Length</Text>
                      <br />
                      <Text strong style={{ fontSize: '18px', color: '#52c41a' }}>
                        {fabricDimensions.length} rows
                      </Text>
                    </Card>
                  </Col>
                </Row>
              </div>

              <div>
                <Title level={5}>Finished Measurements</Title>
                <Row gutter={[16, 8]}>
                  <Col span={12}>
                    <Card size="small" className="dimension-card">
                      <Text type="secondary">Width</Text>
                      <br />
                      <Text strong style={{ fontSize: '16px' }}>
                        {fabricDimensions.fabricWidth}"
                      </Text>
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card size="small" className="dimension-card">
                      <Text type="secondary">Length</Text>
                      <br />
                      <Text strong style={{ fontSize: '16px' }}>
                        {fabricDimensions.fabricLength}"
                      </Text>
                    </Card>
                  </Col>
                </Row>
              </div>

              <div>
                <Title level={5}>Current Gauge</Title>
                <Card size="small" style={{ textAlign: 'center' }}>
                  <Text strong style={{ fontSize: '20px', color: '#722ed1' }}>
                    {tempGauge.stitches} × {tempGauge.rows}
                  </Text>
                  <br />
                  <Text type="secondary">stitches × rows per inch</Text>
                </Card>
              </div>

              {tempGauge.yarnWeight !== 'custom' && (
                <div>
                  <Title level={5}>Yarn Information</Title>
                  <Card size="small">
                    <Text strong>{YARN_WEIGHT_PRESETS[tempGauge.yarnWeight]?.name} Weight</Text>
                    <br />
                    <Text type="secondary">
                      Recommended: {YARN_WEIGHT_PRESETS[tempGauge.yarnWeight]?.needleSize}
                    </Text>
                  </Card>
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
            Save Gauge
          </Button>
          <Button type="primary" onClick={handleNext}>
            Next: Colorwork
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default GaugeStep;
