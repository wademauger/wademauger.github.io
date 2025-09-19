import React from 'react';
import { Card, Row, Col, Typography, Tag, Space } from 'antd';

const { Text, Title } = Typography;

/**
 * RowByRowInstructions - Component for displaying row-by-row knitting instructions
 * with both shaping and colorwork information
 */
const RowByRowInstructions = ({ stitchPlan, currentRow = 0 }) => {
    if (!stitchPlan || !stitchPlan.rows || stitchPlan.rows.length === 0) {
        return (
            <div className="row-by-row-instructions">
                <Text type="secondary">No instructions available</Text>
            </div>
        );
    }

    const instructions = stitchPlan.generateKnittingInstructions();

    return (
        <div className="row-by-row-instructions">
            {instructions.map((instruction, index) => {
                const isCurrentRow = index === currentRow;
                const isCompleted = index < currentRow;
                const stitchPlanRow = stitchPlan.rows[index];
                
                return (
                    <Card 
                        key={index}
                        size="small"
                        style={{
                            marginBottom: 8,
                            backgroundColor: isCurrentRow ? '#e6f7ff' : isCompleted ? '#f6ffed' : 'white',
                            border: isCurrentRow ? '2px solid #1890ff' : '1px solid #d9d9d9'
                        }}
                    >
                        <Row>
                            <Col span={24}>
                                <Title level={5}>
                                    Row {index + 1}
                                    {stitchPlanRow && stitchPlanRow.rowNumber && stitchPlanRow.rowNumber !== index + 1 && 
                                        ` (RC: ${stitchPlanRow.rowNumber})`
                                    }
                                </Title>
                            </Col>
                        </Row>

                        {/* Shaping Instructions */}
                        {typeof instruction === 'string' && (
                            <Row style={{ marginBottom: 8 }}>
                                <Col span={24}>
                                    <Text strong>Shaping: </Text>
                                    <Text>{instruction}</Text>
                                </Col>
                            </Row>
                        )}

                        {/* Combined Instructions (if using enhanced system) */}
                        {instruction.hasShaping && instruction.hasShaping() && (
                            <Row style={{ marginBottom: 8 }}>
                                <Col span={24}>
                                    <Text strong>Shaping: </Text>
                                    <Text>{instruction.shaping.description}</Text>
                                </Col>
                            </Row>
                        )}

                        {/* Colorwork Instructions */}
                        {stitchPlanRow && stitchPlanRow.getColorworkInstructions && stitchPlanRow.getColorworkInstructions() && (
                            <>
                                <Row style={{ marginBottom: 8 }}>
                                    <Col span={24}>
                                        <Text strong>Colorwork: </Text>
                                        <Space wrap>
                                            {stitchPlanRow.getColorworkInstructions().map((segment, segIndex) => (
                                                <Tag 
                                                    key={segIndex}
                                                    style={{ 
                                                        backgroundColor: segment.colorHex,
                                                        color: getContrastColor(segment.colorHex),
                                                        fontWeight: 'bold',
                                                        border: '1px solid #d9d9d9'
                                                    }}
                                                >
                                                    {segment.stitchCount} {segment.colorLabel}
                                                </Tag>
                                            ))}
                                        </Space>
                                    </Col>
                                </Row>

                                {/* Visual Chart for Row */}
                                <Row style={{ marginTop: 8 }}>
                                    <Col span={24}>
                                        <ColorworkRowChart 
                                            colorworkInstructions={stitchPlanRow.getColorworkInstructions()}
                                            totalStitches={stitchPlanRow.leftStitchesInWork + stitchPlanRow.rightStitchesInWork}
                                        />
                                    </Col>
                                </Row>
                            </>
                        )}

                        {/* Enhanced colorwork instructions */}
                        {instruction.hasColorwork && instruction.hasColorwork() && (
                            <>
                                <Row style={{ marginBottom: 8 }}>
                                    <Col span={24}>
                                        <Text strong>Colorwork: </Text>
                                        <Text>{instruction.colorwork.description}</Text>
                                    </Col>
                                </Row>

                                {/* Visual Color Sequence */}
                                <Row>
                                    <Col span={24}>
                                        <Space wrap>
                                            {instruction.colorwork.colorSequence.map((segment, segIndex) => (
                                                <Tag 
                                                    key={segIndex}
                                                    color={instruction.colorwork.pattern?.colors[segment.colorId]?.color}
                                                    style={{ 
                                                        color: 'black',
                                                        fontWeight: 'bold',
                                                        border: '1px solid #d9d9d9'
                                                    }}
                                                >
                                                    {segment.stitchCount} {segment.colorId}
                                                </Tag>
                                            ))}
                                        </Space>
                                    </Col>
                                </Row>

                                {/* Visual Chart for Row */}
                                {instruction.visualChart && (
                                    <Row style={{ marginTop: 8 }}>
                                        <Col span={24}>
                                            <div 
                                                dangerouslySetInnerHTML={{ 
                                                    __html: instruction.visualChart.svg 
                                                }}
                                                style={{ 
                                                    maxWidth: '100%', 
                                                    overflow: 'auto',
                                                    border: '1px solid #f0f0f0',
                                                    borderRadius: '4px',
                                                    padding: '4px'
                                                }}
                                            />
                                        </Col>
                                    </Row>
                                )}
                            </>
                        )}

                        {/* Stitch count information */}
                        {stitchPlanRow && (
                            <Row style={{ marginTop: 8 }}>
                                <Col span={24}>
                                    <Text type="secondary" style={{ fontSize: '12px' }}>
                                        {stitchPlanRow.leftStitchesInWork + stitchPlanRow.rightStitchesInWork} stitches 
                                        ({stitchPlanRow.leftStitchesInWork} left, {stitchPlanRow.rightStitchesInWork} right)
                                    </Text>
                                </Col>
                            </Row>
                        )}
                    </Card>
                );
            })}
        </div>
    );
};

/**
 * ColorworkRowChart - Simple visual chart showing colorwork for a single row
 */
const ColorworkRowChart = ({ colorworkInstructions, totalStitches }) => {
    if (!colorworkInstructions || colorworkInstructions.length === 0) {
        return null;
    }

    const stitchWidth = Math.max(8, Math.min(20, 400 / totalStitches)); // Adaptive stitch width
    const chartWidth = totalStitches * stitchWidth;
    const chartHeight = 20;

    let currentPosition = 0;
    const rectangles = colorworkInstructions.map((segment, index) => {
        const segmentWidth = segment.stitchCount * stitchWidth;
        const rect = (
            <rect
                key={index}
                x={currentPosition}
                y={0}
                width={segmentWidth}
                height={chartHeight}
                fill={segment.colorHex}
                stroke="#000"
                strokeWidth="0.5"
            />
        );
        currentPosition += segmentWidth;
        return rect;
    });

    return (
        <div style={{ marginTop: 4 }}>
            <Text strong style={{ fontSize: '11px' }}>Visual Pattern:</Text>
            <div style={{ marginTop: 2 }}>
                <svg 
                    width={chartWidth} 
                    height={chartHeight}
                    style={{ border: '1px solid #ddd', borderRadius: '2px' }}
                >
                    {rectangles}
                </svg>
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

export default RowByRowInstructions;
