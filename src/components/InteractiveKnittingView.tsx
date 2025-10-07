import React, { useState, useEffect } from 'react';
import { Card, Button, Row, Col, Space, Typography, Progress, Tag, Divider, Radio, Alert } from 'antd';
import { LeftOutlined, RightOutlined, CheckOutlined, WarningOutlined } from '@ant-design/icons';
import RowByRowInstructions from './RowByRowInstructions';
import { ColorworkStitchPlanService } from '../models/ColorworkStitchPlanService';

const { Title, Text } = Typography;

/**
 * InteractiveKnittingView - Enhanced knitting interface with row tracking and colorwork guidance
 */
const InteractiveKnittingView = ({
    combinedPattern,
    instructions = [],
    knittingProgress,
    onRowComplete,
    onRowBack,
    onBackToSettings
}) => {
    const [enhancedStitchPlan, setEnhancedStitchPlan] = useState(null);
    const [currentRowInstructions, setCurrentRowInstructions] = useState(null);
    const [colorworkDisplayMode, setColorworkDisplayMode] = useState('repeating'); // 'repeating' or 'fullRow'

    useEffect(() => {
        if (combinedPattern) {
            // Create enhanced stitch plan with colorwork using the combined pattern's stitchPlan
            // The stitchPlan should already be enhanced with colorwork data from PanelColorworkComposer
            if (combinedPattern.stitchPlan && combinedPattern.stitchPlan.hasColorwork()) {
                setEnhancedStitchPlan(combinedPattern.stitchPlan);
            } else {
                // Fallback: create enhanced stitch plan with colorwork
                const service: any = new ColorworkStitchPlanService();
                const panel = combinedPattern.panel;
                const colorworkPattern = combinedPattern.colorworkPattern;
                
                try {
                    const enhanced = service.createColorworkStitchPlan(panel, colorworkPattern);
                    setEnhancedStitchPlan(enhanced);
                } catch (error: unknown) {
                    console.error('Error creating enhanced stitch plan:', error);
                }
            }
        }
    }, [combinedPattern]);

    useEffect(() => {
        if (enhancedStitchPlan && enhancedStitchPlan.rows[knittingProgress.currentRow]) {
            const currentRow = enhancedStitchPlan.rows[knittingProgress.currentRow];
            setCurrentRowInstructions(currentRow);
        }
    }, [enhancedStitchPlan, knittingProgress.currentRow]);

    const handlePreviousRow = () => {
        if (knittingProgress.currentRow > 0 && onRowBack) {
            onRowBack();
        }
    };

    const handleNextRow = () => {
        if (knittingProgress.currentRow < instructions.length - 1) {
            onRowComplete(knittingProgress.currentRow);
        }
    };

    // Helper function to check if a row has shaping
    const hasShaping = (rowIndex) => {
        if (!enhancedStitchPlan || rowIndex === 0) return false;
        
        const currentRow = enhancedStitchPlan.rows[rowIndex];
        const previousRow = enhancedStitchPlan.rows[rowIndex - 1];
        
        if (!currentRow || !previousRow) return false;
        
        const currentTotal = currentRow.leftStitchesInWork + currentRow.rightStitchesInWork;
        const previousTotal = previousRow.leftStitchesInWork + previousRow.rightStitchesInWork;
        
        return currentTotal !== previousTotal;
    };

    const progressPercent = Math.round((knittingProgress.completedRows.length / instructions.length) * 100);

    return (
        <div className="interactive-knitting-view" style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
            {/* Header with navigation */}
            <div className="knitting-header" style={{ marginBottom: '24px' }}>
                <Row justify="space-between" align="middle">
                    <Col>
                        <Button onClick={onBackToSettings} icon={<LeftOutlined />}>
                            Back to Settings
                        </Button>
                    </Col>
                    <Col>
                        <Title level={2} style={{ margin: 0, textAlign: 'center' }}>
                            Interactive Knitting
                        </Title>
                        <Text type="secondary" style={{ display: 'block', textAlign: 'center' }}>
                            Row {knittingProgress.currentRow + 1} of {instructions.length}
                        </Text>
                    </Col>
                    <Col>
                        <Progress 
                            type="circle" 
                            percent={progressPercent} 
                            size={60}
                            strokeColor="#52c41a"
                        />
                    </Col>
                </Row>
            </div>

            <Row gutter={[24, 24]}>
                {/* Left Column: Current Row Focus */}
                <Col xs={24} lg={8}>
                    <Space direction="vertical" style={{ width: '100%' }} size="large">
                        {/* Current Row Card */}
                        <Card 
                            title={`Row ${knittingProgress.currentRow + 1}`}
                            extra={
                                <Tag color={knittingProgress.completedRows.includes(knittingProgress.currentRow) ? 'green' : 'blue'}>
                                    {knittingProgress.completedRows.includes(knittingProgress.currentRow) ? 'Complete' : 'In Progress'}
                                </Tag>
                            }
                        >
                            {currentRowInstructions && (
                                <Space direction="vertical" style={{ width: '100%' }}>
                                    {/* Shaping Warning */}
                                    {hasShaping(knittingProgress.currentRow) && (
                                        <Alert
                                            message="Shaping Row"
                                            description="This row requires increases or decreases"
                                            type="warning"
                                            showIcon
                                            icon={<WarningOutlined />}
                                            style={{ marginBottom: 8 }}
                                        />
                                    )}

                                    {/* Shaping Instructions */}
                                    <div>
                                        <Text strong>Shaping:</Text>
                                        <div style={{ marginTop: 8, padding: 12, background: '#f0f8ff', borderRadius: 6 }}>
                                            <Text>
                                                {currentRowInstructions.leftStitchesInWork + currentRowInstructions.rightStitchesInWork} stitches total
                                                ({currentRowInstructions.leftStitchesInWork} left, {currentRowInstructions.rightStitchesInWork} right)
                                            </Text>
                                        </div>
                                    </div>

                                    {/* Colorwork Instructions */}
                                    {currentRowInstructions.getColorworkInstructions && currentRowInstructions.getColorworkInstructions() && (
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                                <Text strong>Colorwork:</Text>
                                                <Radio.Group 
                                                    size="small" 
                                                    value={colorworkDisplayMode}
                                                    onChange={(e) => setColorworkDisplayMode(e.target.value)}
                                                >
                                                    <Radio.Button value="repeating">Pattern</Radio.Button>
                                                    <Radio.Button value="fullRow">Full Row</Radio.Button>
                                                </Radio.Group>
                                            </div>
                                            <div style={{ marginTop: 8 }}>
                                                <Space wrap>
                                                    {currentRowInstructions.getColorworkInstructions().map((segment, index: number) => (
                                                        <Tag 
                                                            key={index}
                                                            style={{ 
                                                                backgroundColor: segment.colorHex,
                                                                color: getContrastColor(segment.colorHex),
                                                                fontWeight: 'bold',
                                                                border: '1px solid #d9d9d9',
                                                                fontSize: '14px',
                                                                padding: '6px 12px'
                                                            }}
                                                        >
                                                            {segment.stitchCount} {segment.colorLabel}
                                                        </Tag>
                                                    ))}
                                                </Space>
                                                
                                                {/* Visual color bar */}
                                                <div style={{ marginTop: 12 }}>
                                                    <Text strong style={{ fontSize: '12px' }}>
                                                        {colorworkDisplayMode === 'repeating' ? 'Pattern Preview:' : 'Full Row Pattern:'}
                                                    </Text>
                                                    <ColorworkRowBar 
                                                        colorworkInstructions={currentRowInstructions.getColorworkInstructions()}
                                                        totalStitches={currentRowInstructions.leftStitchesInWork + currentRowInstructions.rightStitchesInWork}
                                                        displayMode={colorworkDisplayMode}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <Divider />

                                    {/* Row Navigation */}
                                    <Row gutter={[8, 8]}>
                                        <Col span={8}>
                                            <Button 
                                                icon={<LeftOutlined />}
                                                onClick={handlePreviousRow}
                                                disabled={knittingProgress.currentRow === 0}
                                                block
                                                size="small"
                                            >
                                                Prev
                                            </Button>
                                        </Col>
                                        <Col span={8}>
                                            <Button 
                                                type="primary"
                                                icon={<CheckOutlined />}
                                                onClick={handleNextRow}
                                                disabled={knittingProgress.currentRow >= instructions.length - 1}
                                                block
                                            >
                                                Done
                                            </Button>
                                        </Col>
                                        <Col span={8}>
                                            <Button 
                                                icon={<RightOutlined />}
                                                onClick={handleNextRow}
                                                disabled={knittingProgress.currentRow >= instructions.length - 1}
                                                block
                                                size="small"
                                            >
                                                Next
                                            </Button>
                                        </Col>
                                    </Row>
                                </Space>
                            )}
                        </Card>

                        {/* Progress Overview */}
                        <Card title="Progress Overview" size="small">
                            <Space direction="vertical" style={{ width: '100%' }}>
                                <div>
                                    <Text>Completed Rows: {knittingProgress.completedRows.length}</Text>
                                    <Progress 
                                        percent={progressPercent} 
                                        showInfo={false}
                                        strokeColor="#52c41a"
                                    />
                                </div>
                                <div>
                                    <Text type="secondary" style={{ fontSize: '12px' }}>
                                        Remaining: {instructions.length - knittingProgress.completedRows.length} rows
                                    </Text>
                                </div>
                            </Space>
                        </Card>
                    </Space>
                </Col>

                {/* Right Column: Full Instructions & Panel View */}
                <Col xs={24} lg={16}>
                    <Space direction="vertical" style={{ width: '100%' }} size="large">
                        {/* Panel with Row Highlighting */}
                        <Card title="Panel with Current Row Highlighted">
                            <div style={{ 
                                background: 'white', 
                                padding: '20px', 
                                borderRadius: '8px',
                                textAlign: 'center'
                            }}>
                                <PanelRowHighlight 
                                    combinedPattern={combinedPattern}
                                    currentRow={knittingProgress.currentRow}
                                    completedRows={knittingProgress.completedRows}
                                />
                            </div>
                        </Card>

                        {/* All Instructions with Row Tracking */}
                        <Card title="All Instructions">
                            {enhancedStitchPlan && (
                                <RowByRowInstructions 
                                    stitchPlan={enhancedStitchPlan}
                                    currentRow={knittingProgress.currentRow}
                                />
                            )}
                        </Card>
                    </Space>
                </Col>
            </Row>
        </div>
    );
};

/**
 * ColorworkRowBar - Visual representation of a single row's colorwork pattern
 */
const ColorworkRowBar = ({ colorworkInstructions, totalStitches, displayMode = 'repeating' }) => {
    if (!colorworkInstructions || colorworkInstructions.length === 0) {
        return null;
    }

    // For repeating mode, show pattern with edges (limited width)
    // For fullRow mode, show entire row in scrollable container
    const isFullRow = displayMode === 'fullRow';
    
    const stitchWidth = isFullRow ? Math.max(2, Math.min(8, 300 / totalStitches)) : Math.max(4, Math.min(12, 300 / totalStitches));
    const barWidth = totalStitches * stitchWidth;
    const barHeight = 20;

    let currentPosition = 0;
    const segments = colorworkInstructions.map((segment, index: number) => {
        const segmentWidth = segment.stitchCount * stitchWidth;
        const rect = (
            <rect
                key={index}
                x={currentPosition}
                y={0}
                width={segmentWidth}
                height={barHeight}
                fill={segment.colorHex}
                stroke="#666"
                strokeWidth="0.5"
            />
        );
        currentPosition += segmentWidth;
        return rect;
    });

    const svgElement = (
        <svg 
            width={barWidth} 
            height={barHeight}
            style={{ 
                border: '1px solid #ddd', 
                borderRadius: '4px',
                display: 'block'
            }}
        >
            {segments}
        </svg>
    );

    return (
        <div style={{ marginTop: 8 }}>
            {isFullRow ? (
                <div style={{ 
                    overflowX: 'auto', 
                    maxWidth: '100%',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    padding: '4px'
                }}>
                    {svgElement}
                </div>
            ) : (
                svgElement
            )}
        </div>
    );
};

/**
 * PanelRowHighlight - Shows the panel shape with current row highlighted
 */
const PanelRowHighlight = ({ combinedPattern, currentRow, completedRows }) => {
    if (!combinedPattern || !combinedPattern.stitchPlan) {
        return <Text type="secondary">Panel visualization unavailable</Text>;
    }

    const rows = combinedPattern.stitchPlan.rows;
    const maxStitches = Math.max(...rows.map((row: any) => row.leftStitchesInWork + row.rightStitchesInWork));
    
    return (
        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
            <Text strong style={{ fontSize: '12px' }}>Panel Shape (Row {currentRow + 1} highlighted in red)</Text>
            <div style={{ marginTop: 8, position: 'relative' }}>
                {rows.map((row, index: number) => {
                    const totalStitches = row.leftStitchesInWork + row.rightStitchesInWork;
                    const widthPercent = (totalStitches / maxStitches) * 100;
                    
                    let backgroundColor = '#f0f0f0';
                    if (completedRows.includes(index)) {
                        backgroundColor = '#52c41a'; // Completed - green
                    } else if (index === currentRow) {
                        backgroundColor = '#ffe6e6'; // Current - light red background
                    }
                    
                    return (
                        <div
                            key={index}
                            style={{
                                width: `${widthPercent}%`,
                                height: '6px',
                                backgroundColor,
                                margin: '1px auto',
                                borderRadius: '3px',
                                border: index === currentRow ? '2px solid #ff0000' : 'none', // Red border for current row
                                position: 'relative'
                            }}
                            title={`Row ${index + 1}: ${totalStitches} stitches`}
                        >
                            {/* Red line overlay for current row */}
                            {index === currentRow && (
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: 0,
                                        right: 0,
                                        height: '2px',
                                        backgroundColor: '#ff0000',
                                        transform: 'translateY(-50%)',
                                        zIndex: 1
                                    }}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
            <div style={{ marginTop: 8, fontSize: '10px' }}>
                <Space>
                    <span style={{ color: '#52c41a' }}>● Completed</span>
                    <span style={{ color: '#ff0000' }}>● Current</span>
                    <span style={{ color: '#f0f0f0' }}>● Remaining</span>
                </Space>
            </div>
        </div>
    );
};

/**
 * Calculate contrast color for text visibility
 */
const getContrastColor = (hexColor) => {
    // Remove # if present
    const hex = hexColor.replace('#', '');
    
    // Convert to RGB
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    return luminance > 0.5 ? '#000000' : '#ffffff';
};

export default InteractiveKnittingView;
