import React, { useState, useCallback } from 'react';
import { Card, Button, Space, Row, Col, Typography, Slider } from 'antd';
import { ColorworkStitchPlanService } from '../models/ColorworkStitchPlanService';
import { Panel } from '../models/Panel';
import { Trapezoid } from '../models/Trapezoid';
import { Gauge } from '../models/Gauge';
import { ColorworkPattern } from '../models/ColorworkPattern';
import RowByRowInstructions from './RowByRowInstructions';

const { Title, Text } = Typography;

/**
 * ColorworkInstructionDemo - Demo component showing enhanced stitch plan with colorwork
 */
const ColorworkInstructionDemo = () => {
    const [stitchPlan, setStitchPlan] = useState(null);
    const [currentRow, setCurrentRow] = useState(0);

    // Create demo data
    const createDemoPanel = useCallback(() => {
        // Create a simple trapezoid shape
        const shape = new Trapezoid(5, 8, 12, []); // height: 5", baseA: 8", baseB: 12"
        const gauge = new Gauge(20, 28); // 20 sts/4", 28 rows/4"
        return new Panel(shape, gauge, 1.0);
    }, []);

    const createDemoColorworkPattern = useCallback(() => {
        // Create a simple checkerboard pattern
        const pattern = new ColorworkPattern(8, 8);
        
        // Set up colors
        pattern.setColor('MC', '#ffffff', 'Main Color');
        pattern.setColor('CC', '#000000', 'Contrast Color');
        
        // Create checkerboard pattern
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const isEven = (row + col) % 2 === 0;
                pattern.setStitch(row, col, isEven ? 'MC' : 'CC');
            }
        }
        
        return pattern;
    }, []);

    const handleGenerateInstructions = useCallback(() => {
        const panel = createDemoPanel();
        const colorworkPattern = createDemoColorworkPattern();
        
        const service: any = new ColorworkStitchPlanService();
        const enhancedStitchPlan = service.createColorworkStitchPlan(
            panel, 
            colorworkPattern, 
            { 
                stretchMode: 'repeat',
                alignmentMode: 'center'
            }
        );
        
        setStitchPlan(enhancedStitchPlan);
        setCurrentRow(0);
    }, [createDemoPanel, createDemoColorworkPattern]);

    const handleRowProgress = useCallback((direction) => {
        if (!stitchPlan) return;
        
        const newRow = direction === 'next' 
            ? Math.min(currentRow + 1, stitchPlan.rows.length - 1)
            : Math.max(currentRow - 1, 0);
            
        setCurrentRow(newRow);
    }, [currentRow, stitchPlan]);

    return (
        <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
            <Title level={2}>Colorwork Stitch Plan Demo</Title>
            <Text type="secondary">
                This demo shows how the enhanced stitch plan integrates shaping instructions 
                with colorwork patterns for row-by-row knitting guidance.
            </Text>

            <Card style={{ marginTop: 24, marginBottom: 24 }}>
                <Row gutter={16} align="middle">
                    <Col>
                        <Button 
                            type="primary" 
                            onClick={handleGenerateInstructions}
                        >
                            Generate Enhanced Instructions
                        </Button>
                    </Col>
                    {stitchPlan && (
                        <>
                            <Col>
                                <Button onClick={() => handleRowProgress('prev')}>
                                    Previous Row
                                </Button>
                            </Col>
                            <Col>
                                <Button onClick={() => handleRowProgress('next')}>
                                    Next Row
                                </Button>
                            </Col>
                            <Col flex="auto">
                                <Text>Progress: Row {currentRow + 1} of {stitchPlan.rows.length}</Text>
                                <Slider
                                    min={0}
                                    max={stitchPlan.rows.length - 1}
                                    value={currentRow}
                                    onChange={setCurrentRow}
                                    style={{ marginLeft: 16, width: 200 }}
                                />
                            </Col>
                        </>
                    )}
                </Row>
            </Card>

            {stitchPlan && (
                <Row gutter={24}>
                    <Col span={16}>
                        <Card title="Row-by-Row Instructions" size="small">
                            <RowByRowInstructions 
                                stitchPlan={stitchPlan} 
                                currentRow={currentRow}
                            />
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card title="Pattern Info" size="small">
                            <Space direction="vertical" style={{ width: '100%' }}>
                                <div>
                                    <Text strong>Total Rows:</Text> {stitchPlan.rows.length}
                                </div>
                                <div>
                                    <Text strong>Has Colorwork:</Text> {stitchPlan.hasColorwork() ? 'Yes' : 'No'}
                                </div>
                                {stitchPlan.hasColorwork() && (
                                    <div>
                                        <Text strong>Colorwork Rows:</Text> {stitchPlan.colorworkMapping.mappedRows.length}
                                    </div>
                                )}
                                <div>
                                    <Text strong>Current Row Stitches:</Text> {
                                        stitchPlan.rows[currentRow] ? 
                                        stitchPlan.rows[currentRow].leftStitchesInWork + stitchPlan.rows[currentRow].rightStitchesInWork : 
                                        'N/A'
                                    }
                                </div>
                            </Space>
                        </Card>

                        {stitchPlan.hasColorwork() && stitchPlan.rows[currentRow] && stitchPlan.rows[currentRow].getColorworkInstructions && (
                            <Card title="Current Row Colorwork" size="small" style={{ marginTop: 16 }}>
                                <ColorworkDetail 
                                    colorworkInstructions={stitchPlan.rows[currentRow].getColorworkInstructions()}
                                />
                            </Card>
                        )}
                    </Col>
                </Row>
            )}

            {!stitchPlan && (
                <Card>
                    <div style={{ textAlign: 'center', padding: 48 }}>
                        <Text type="secondary">
                            Click "Generate Enhanced Instructions" to see the colorwork stitch plan in action
                        </Text>
                    </div>
                </Card>
            )}
        </div>
    );
};

/**
 * ColorworkDetail - Shows detailed colorwork information for a single row
 */
const ColorworkDetail = ({ colorworkInstructions }) => {
    if (!colorworkInstructions || colorworkInstructions.length === 0) {
        return <Text type="secondary">No colorwork for this row</Text>;
    }

    return (
        <Space direction="vertical" style={{ width: '100%' }}>
            {colorworkInstructions.map((segment, index: number) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div 
                        style={{
                            width: 20,
                            height: 20,
                            backgroundColor: segment.colorHex,
                            border: '1px solid #ccc',
                            borderRadius: 2
                        }}
                    />
                    <Text>
                        {segment.stitchCount} stitches - {segment.colorLabel}
                    </Text>
                </div>
            ))}
        </Space>
    );
};

export default ColorworkInstructionDemo;
