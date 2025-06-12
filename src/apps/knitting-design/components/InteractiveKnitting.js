import React, { useState, useEffect, useRef } from 'react';
import { Card, Row, Col, Button, Progress, Typography, Space, Input, Select, Switch, Tag, message, Popover, Modal, List } from 'antd';
import { 
  PlayCircleOutlined, 
  PauseOutlined, 
  StepForwardOutlined, 
  StepBackwardOutlined,
  FastForwardOutlined,
  FastBackwardOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  BookOutlined,
  ClockCircleOutlined,
  AimOutlined
} from '@ant-design/icons';


const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// Knitting stitch symbols
const STITCH_SYMBOLS = {
  k: { symbol: '□', name: 'Knit', color: '#e6f7ff' },
  p: { symbol: '●', name: 'Purl', color: '#fff2e8' },
  yo: { symbol: '○', name: 'Yarn Over', color: '#f6ffed' },
  k2tog: { symbol: '/', name: 'Knit 2 Together', color: '#fff1f0' },
  ssk: { symbol: '\\', name: 'Slip Slip Knit', color: '#fff1f0' },
  sl: { symbol: '|', name: 'Slip Stitch', color: '#f9f0ff' }
};

// Row instructions generator
const generateRowInstructions = (rowNumber, patternData) => {
  const { gauge, sizing, colorwork } = patternData;
  const stitchCount = Math.round((sizing.customDimensions?.chest || 40) * gauge.stitches);
  
  if (colorwork?.enabled && colorwork.type === 'fairisle') {
    return {
      instruction: `Row ${rowNumber}: *K2 MC, K2 CC, repeat from * to end (${stitchCount} sts)`,
      stitches: Array.from({ length: stitchCount }, (_, i) => 
        i % 4 < 2 ? { type: 'k', color: colorwork.colors[0] } : { type: 'k', color: colorwork.colors[1] }
      ),
      notes: 'Carry yarn loosely across back'
    };
  }
  
  // Basic stockinette pattern
  const isKnitRow = rowNumber % 2 === 1;
  return {
    instruction: `Row ${rowNumber}: ${isKnitRow ? 'Knit' : 'Purl'} all stitches (${stitchCount} sts)`,
    stitches: Array.from({ length: stitchCount }, () => ({ 
      type: isKnitRow ? 'k' : 'p', 
      color: colorwork?.colors?.[0] || '#ffffff' 
    })),
    notes: isKnitRow ? 'Right side row' : 'Wrong side row'
  };
};

const InteractiveKnitting = ({ data, onUpdate, onPrev }) => {
  const [currentRow, setCurrentRow] = useState(1);
  const [currentStitch, setCurrentStitch] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1000); // ms per stitch
  const [showChart, setShowChart] = useState(true);
  const [showInstructions, setShowInstructions] = useState(true);
  const [completedStitches, setCompletedStitches] = useState(new Set());
  const [sessionNotes, setSessionNotes] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [knittingLog, setKnittingLog] = useState([]);
  
  const intervalRef = useRef();
  const timerRef = useRef();

  const totalRows = Math.round((data.sizing?.customDimensions?.length || 24) * data.gauge?.rows);
  const rowInstructions = generateRowInstructions(currentRow, data);
  const totalStitches = rowInstructions.stitches.length;
  const progressPercent = ((currentRow - 1) * 100) / totalRows;

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(advanceStitch, playbackSpeed);
      if (!startTime) setStartTime(Date.now());
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isPlaying, playbackSpeed, currentStitch]);

  useEffect(() => {
    if (startTime) {
      timerRef.current = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [startTime]);

  const advanceStitch = () => {
    setCurrentStitch(prev => {
      const newStitch = prev + 1;
      setCompletedStitches(prevCompleted => new Set([...prevCompleted, prev]));
      
      if (newStitch >= totalStitches) {
        completeRow();
        return 0;
      }
      return newStitch;
    });
  };

  const completeRow = () => {
    const logEntry = {
      row: currentRow,
      completedAt: new Date().toLocaleTimeString(),
      notes: sessionNotes
    };
    
    setKnittingLog(prev => [...prev, logEntry]);
    setCurrentRow(prev => prev + 1);
    setCompletedStitches(new Set());
    setSessionNotes('');
    
    message.success(`Row ${currentRow} completed!`);
    
    if (currentRow >= totalRows) {
      setIsPlaying(false);
      message.success('Congratulations! Pattern completed!');
    }
  };

  const goToRow = (rowNumber) => {
    setCurrentRow(Math.max(1, Math.min(rowNumber, totalRows)));
    setCurrentStitch(0);
    setCompletedStitches(new Set());
    setIsPlaying(false);
  };

  const goToStitch = (stitchNumber) => {
    setCurrentStitch(Math.max(0, Math.min(stitchNumber, totalStitches - 1)));
    setIsPlaying(false);
  };

  const handleKeyPress = (e) => {
    switch (e.key) {
      case ' ':
        e.preventDefault();
        setIsPlaying(!isPlaying);
        break;
      case 'ArrowRight':
        advanceStitch();
        break;
      case 'ArrowLeft':
        setCurrentStitch(Math.max(0, currentStitch - 1));
        break;
      case 'ArrowUp':
        goToRow(currentRow - 1);
        break;
      case 'ArrowDown':
        goToRow(currentRow + 1);
        break;
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="interactive-knitting" onKeyDown={handleKeyPress} tabIndex={0}>
      <Row gutter={[24, 24]}>
        {/* Left Panel - Controls and Progress */}
        <Col xs={24} lg={8}>
          <Card title="Knitting Progress" className="progress-card" style={{ marginBottom: 16 }}>
            <Space direction="vertical" size="medium" style={{ width: '100%' }}>
              <div>
                <Text type="secondary">Overall Progress</Text>
                <Progress 
                  percent={progressPercent} 
                  status={currentRow >= totalRows ? 'success' : 'active'}
                  strokeColor={{
                    '0%': '#108ee9',
                    '100%': '#87d068',
                  }}
                />
                <Text strong>Row {currentRow} of {totalRows}</Text>
              </div>

              <div>
                <Text type="secondary">Current Row Progress</Text>
                <Progress 
                  percent={(currentStitch * 100) / totalStitches} 
                  size="small"
                  showInfo={false}
                />
                <Text>Stitch {currentStitch + 1} of {totalStitches}</Text>
              </div>

              <div>
                <Row gutter={16}>
                  <Col span={12}>
                    <Card size="small" className="stat-card">
                      <ClockCircleOutlined style={{ color: '#1890ff' }} />
                      <br />
                      <Text type="secondary">Time</Text>
                      <br />
                      <Text strong>{formatTime(elapsedTime)}</Text>
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card size="small" className="stat-card">
                      <AimOutlined style={{ color: '#52c41a' }} />
                      <br />
                      <Text type="secondary">Completed</Text>
                      <br />
                      <Text strong>{currentRow - 1} rows</Text>
                    </Card>
                  </Col>
                </Row>
              </div>
            </Space>
          </Card>

          <Card title="Playback Controls" className="controls-card" style={{ marginBottom: 16 }}>
            <Space direction="vertical" size="medium" style={{ width: '100%' }}>
              <Row gutter={8}>
                <Col span={6}>
                  <Button
                    icon={<FastBackwardOutlined />}
                    onClick={() => goToRow(currentRow - 1)}
                    disabled={currentRow <= 1}
                    block
                  />
                </Col>
                <Col span={6}>
                  <Button
                    icon={<StepBackwardOutlined />}
                    onClick={() => setCurrentStitch(Math.max(0, currentStitch - 1))}
                    disabled={currentStitch <= 0}
                    block
                  />
                </Col>
                <Col span={6}>
                  <Button
                    type="primary"
                    icon={isPlaying ? <PauseOutlined /> : <PlayCircleOutlined />}
                    onClick={() => setIsPlaying(!isPlaying)}
                    block
                  />
                </Col>
                <Col span={6}>
                  <Button
                    icon={<StepForwardOutlined />}
                    onClick={advanceStitch}
                    disabled={currentStitch >= totalStitches}
                    block
                  />
                </Col>
              </Row>

              <div>
                <Text>Playback Speed</Text>
                <Select
                  value={playbackSpeed}
                  onChange={setPlaybackSpeed}
                  style={{ width: '100%' }}
                >
                  <Option value={2000}>Very Slow (2s)</Option>
                  <Option value={1000}>Slow (1s)</Option>
                  <Option value={500}>Normal (0.5s)</Option>
                  <Option value={250}>Fast (0.25s)</Option>
                  <Option value={100}>Very Fast (0.1s)</Option>
                </Select>
              </div>

              <div>
                <Text>Jump to Row</Text>
                <Input
                  type="number"
                  min={1}
                  max={totalRows}
                  value={currentRow}
                  onChange={(e) => goToRow(parseInt(e.target.value) || 1)}
                  style={{ width: '100%' }}
                />
              </div>
            </Space>
          </Card>

          <Card title="Session Notes" className="notes-card">
            <TextArea
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
              placeholder="Add notes about this row..."
              rows={3}
            />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Notes will be saved when row is completed
            </Text>
          </Card>
        </Col>

        {/* Right Panel - Pattern View */}
        <Col xs={24} lg={16}>
          <Card 
            title={
              <Space>
                <Text>Row {currentRow} Instructions</Text>
                <Switch 
                  checkedChildren="Chart" 
                  unCheckedChildren="Text"
                  checked={showChart}
                  onChange={setShowChart}
                />
              </Space>
            }
            className="pattern-view-card"
          >
            {showInstructions && (
              <div className="row-instructions" style={{ marginBottom: 16, padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
                <Text strong style={{ fontSize: '16px' }}>
                  {rowInstructions.instruction}
                </Text>
                {rowInstructions.notes && (
                  <div style={{ marginTop: 8 }}>
                    <InfoCircleOutlined style={{ color: '#1890ff', marginRight: 8 }} />
                    <Text type="secondary">{rowInstructions.notes}</Text>
                  </div>
                )}
              </div>
            )}

            {showChart ? (
              <div className="stitch-chart" style={{ 
                display: 'grid', 
                gridTemplateColumns: `repeat(${Math.min(totalStitches, 40)}, 1fr)`,
                gap: '2px',
                padding: '16px',
                background: 'white',
                borderRadius: '8px',
                border: '1px solid #e8e8e8',
                maxHeight: '400px',
                overflowY: 'auto'
              }}>
                {rowInstructions.stitches.slice(0, Math.min(totalStitches, 40)).map((stitch, index) => {
                  const isCompleted = completedStitches.has(index);
                  const isCurrent = index === currentStitch;
                  const stitchInfo = STITCH_SYMBOLS[stitch.type] || STITCH_SYMBOLS.k;
                  
                  return (
                    <Popover
                      key={index}
                      content={
                        <div>
                          <Text strong>{stitchInfo.name}</Text>
                          <br />
                          <Text type="secondary">Stitch {index + 1}</Text>
                          {stitch.color !== '#ffffff' && (
                            <>
                              <br />
                              <div style={{ 
                                width: 16, 
                                height: 16, 
                                backgroundColor: stitch.color, 
                                border: '1px solid #ccc',
                                display: 'inline-block',
                                marginTop: 4
                              }} />
                            </>
                          )}
                        </div>
                      }
                      trigger="hover"
                    >
                      <div
                        className={`stitch-cell ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
                        onClick={() => goToStitch(index)}
                        style={{
                          width: '24px',
                          height: '24px',
                          backgroundColor: isCompleted ? '#52c41a' : isCurrent ? '#1890ff' : stitchInfo.color,
                          border: `2px solid ${isCurrent ? '#1890ff' : isCompleted ? '#52c41a' : '#d9d9d9'}`,
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          color: isCompleted || isCurrent ? 'white' : '#333',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {isCompleted ? '✓' : isCurrent ? '●' : stitchInfo.symbol}
                      </div>
                    </Popover>
                  );
                })}
                {totalStitches > 40 && (
                  <div style={{ 
                    gridColumn: '1 / -1', 
                    textAlign: 'center', 
                    padding: '8px',
                    color: '#666',
                    fontSize: '12px'
                  }}>
                    Showing first 40 of {totalStitches} stitches
                  </div>
                )}
              </div>
            ) : (
              <div className="written-instructions" style={{ 
                fontSize: '16px', 
                lineHeight: '28px',
                padding: '24px',
                background: 'white',
                borderRadius: '8px',
                border: '1px solid #e8e8e8'
              }}>
                <Paragraph>
                  {rowInstructions.instruction}
                </Paragraph>
                {data.colorwork?.enabled && (
                  <div style={{ marginTop: 16 }}>
                    <Text strong>Color Key:</Text>
                    <div style={{ marginTop: 8 }}>
                      {data.colorwork.colors.map((color, index) => (
                        <Space key={index} style={{ marginRight: 16 }}>
                          <div style={{ 
                            width: 16, 
                            height: 16, 
                            backgroundColor: color, 
                            border: '1px solid #ccc',
                            borderRadius: '2px'
                          }} />
                          <Text>Color {index + 1}</Text>
                        </Space>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Keyboard shortcuts help */}
            <div style={{ marginTop: 16, padding: 12, background: '#fafafa', borderRadius: 6 }}>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                <BookOutlined /> Keyboard: Space (play/pause), ← → (stitch), ↑ ↓ (row)
              </Text>
            </div>
          </Card>

          {knittingLog.length > 0 && (
            <Card title="Knitting Log" style={{ marginTop: 16 }}>
              <List
                size="small"
                dataSource={knittingLog.slice(-5)}
                renderItem={item => (
                  <List.Item>
                    <Space>
                      <CheckCircleOutlined style={{ color: '#52c41a' }} />
                      <Text strong>Row {item.row}</Text>
                      <Text type="secondary">{item.completedAt}</Text>
                      {item.notes && <Text type="secondary">- {item.notes}</Text>}
                    </Space>
                  </List.Item>
                )}
              />
            </Card>
          )}
        </Col>
      </Row>

      <div className="step-actions" style={{ marginTop: 24 }}>
        <Space>
          <Button 
            size="large" 
            onClick={onPrev}
          >
            Back to Preview
          </Button>
          {currentRow >= totalRows && (
            <Button 
              size="large"
              style={{
                background: 'linear-gradient(90deg, #52c41a, #73d13d)',
                borderColor: 'transparent',
                color: 'white',
                fontWeight: 'bold'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
              }}
            >
              Pattern Complete! 🎉
            </Button>
          )}
        </Space>
      </div>
    </div>
  );
};

export default InteractiveKnitting;
