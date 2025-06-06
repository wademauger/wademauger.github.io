import React, { useEffect } from 'react';
import { Card, Radio, Button, Row, Col, Typography, Space } from 'antd';
import { garments } from '../../../data/garments';
import { PanelDiagram } from '../../../components/PanelDiagram';

const { Title, Text } = Typography;

const PatternSetup = ({ data, onChange, onNext }) => {
  // Get garments from data and add custom option
  const availableGarments = garments.map(garment => ({
    id: garment.permalink,
    name: garment.title,
    description: garment.description,
    shapes: garment.shapes,
    sizes: garment.sizes,
    finishingSteps: garment.finishingSteps
  }));

  // Add custom option as first item
  const basePatterns = [
    { 
      id: 'custom', 
      name: 'Create Custom Pattern', 
      description: 'Design your own pattern from scratch',
      shapes: null
    },
    ...availableGarments
  ];

  // Auto-select custom pattern if none is selected
  useEffect(() => {
    if (!data.basePattern) {
      const customPattern = basePatterns.find(p => p.id === 'custom');
      onChange({ basePattern: customPattern });
    }
  }, [data.basePattern, onChange, basePatterns]);

  const handlePatternSelect = (patternId) => {
    const pattern = basePatterns.find(p => p.id === patternId);
    onChange({ basePattern: pattern });
  };

  const handleNext = () => {
    onNext();
  };

  return (
    <div className="pattern-setup">
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card>
            <Title level={2}>Choose a Pattern</Title>
            <Text type="secondary">
              Select a base pattern to modify, or create a custom pattern from scratch.
            </Text>
          </Card>
        </Col>

        <Col span={24}>
          <Card title="Available Patterns">
            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
              <Radio.Group 
                value={data.basePattern?.id || 'custom'} 
                onChange={(e) => handlePatternSelect(e.target.value)}
                style={{ width: '100%' }}
              >
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  {basePatterns.map(pattern => (
                    <Radio 
                      key={pattern.id} 
                      value={pattern.id}
                      style={{ 
                        display: 'flex',
                        alignItems: 'flex-start',
                        padding: '16px',
                        border: '1px solid #f0f0f0',
                        borderRadius: '8px',
                        marginBottom: '12px',
                        width: '100%',
                        backgroundColor: data.basePattern?.id === pattern.id ? '#f6ffed' : '#fff'
                      }}
                    >
                      <div style={{ display: 'flex', width: '100%', alignItems: 'center' }}>
                        {/* Pattern diagram on the left */}
                        {pattern.shapes && (
                          <div style={{ marginRight: '20px', flexShrink: 0 }}>
                            <div style={{ display: 'flex', gap: '10px' }}>
                              {Object.entries(pattern.shapes).slice(0, 3).map(([shapeName, shape]) => (
                                <div key={shapeName} style={{ textAlign: 'center' }}>
                                  <PanelDiagram 
                                    shape={shape} 
                                    label=""
                                    size={80}
                                    padding={8}
                                  />
                                  <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
                                    {shapeName}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Pattern info on the right */}
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 'bold', marginBottom: '6px', fontSize: '16px' }}>
                            {pattern.name}
                          </div>
                          <div style={{ color: '#666', fontSize: '14px', marginBottom: '10px' }}>
                            {pattern.description}
                          </div>
                          {pattern.sizes && (
                            <div style={{ fontSize: '12px', color: '#999' }}>
                              Available sizes: {Object.keys(pattern.sizes).join(', ')}
                            </div>
                          )}
                          {pattern.id === 'custom' && (
                            <div style={{ color: '#1890ff', fontSize: '13px', fontStyle: 'italic', fontWeight: 'bold' }}>
                              Design your own shapes and construction
                            </div>
                          )}
                        </div>
                      </div>
                    </Radio>
                  ))}
                </Space>
              </Radio.Group>
            </div>
          </Card>
        </Col>

        <Col span={24}>
          <div style={{ textAlign: 'right', marginTop: '24px' }}>
            <Button 
              type="primary" 
              size="large"
              onClick={handleNext}
              disabled={!data.basePattern}
            >
              {data.basePattern?.id === 'custom' ? 'Next: Custom Design' : 'Next: Sizing'}
            </Button>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default PatternSetup;
