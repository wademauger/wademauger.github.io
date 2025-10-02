import React, { useState, useEffect } from 'react';
import { Card, Button, Space, Typography, Row, Col, Divider } from 'antd';
import { PlayCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { ColorworkPattern } from '../models/ColorworkPattern.js';
import { PanelColorworkComposer } from '../models/PanelColorworkComposer.js';
import { InstructionGenerator } from '../models/InstructionGenerator.js';
import { Trapezoid, Panel, Gauge } from '../knitting.ai.js';
import { PanelDiagram } from './PanelDiagram.jsx';
import CombinedView from './CombinedView.jsx';

const { Title, Text, Paragraph } = Typography;

/**
 * ColorworkDemo - Demonstrates the colorwork panel design system
 */
const ColorworkDemo = () => {
    const [currentExample, setCurrentExample] = useState(0);
    const [combinedPattern, setCombinedPattern] = useState(null);
    const [instructions, setInstructions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const examples = [
        {
            name: 'Simple Striped Sweater Front',
            description: 'A basic sweater front panel with horizontal stripes',
            panel: {
                shape: new Trapezoid(20, 25, 25, 0, [
                    new Trapezoid(8, 25, 15, 0, [], [])
                ], []),
                gauge: new Gauge(19, 30),
                sizeModifier: 1
            },
            colorwork: {
                grid: [
                    ['MC', 'MC', 'MC', 'MC'],
                    ['MC', 'MC', 'MC', 'MC'],
                    ['CC1', 'CC1', 'CC1', 'CC1'],
                    ['CC1', 'CC1', 'CC1', 'CC1'],
                    ['MC', 'MC', 'MC', 'MC'],
                    ['MC', 'MC', 'MC', 'MC'],
                    ['CC2', 'CC2', 'CC2', 'CC2'],
                    ['CC2', 'CC2', 'CC2', 'CC2']
                ],
                colors: {
                    'MC': { id: 'MC', label: 'Main Color', color: '#ffffff' },
                    'CC1': { id: 'CC1', label: 'Stripe 1', color: '#1890ff' },
                    'CC2': { id: 'CC2', label: 'Stripe 2', color: '#52c41a' }
                },
                metadata: { name: 'Horizontal Stripes' }
            },
            settings: { stretchMode: 'repeat', alignmentMode: 'center' }
        },
        {
            name: 'Fair Isle Hat Crown',
            description: 'A traditional Fair Isle pattern on a hat crown with decreases',
            panel: {
                shape: new Trapezoid(6, 22, 22, 0, [
                    new Trapezoid(4, 22, 11, 0, [
                        new Trapezoid(3, 11, 2, 0, [], [])
                    ], [])
                ], []),
                gauge: new Gauge(20, 32),
                sizeModifier: 1
            },
            colorwork: {
                grid: [
                    ['MC', 'CC1', 'MC', 'CC1', 'MC', 'CC1'],
                    ['CC1', 'MC', 'CC1', 'MC', 'CC1', 'MC'],
                    ['MC', 'MC', 'CC2', 'CC2', 'MC', 'MC'],
                    ['CC2', 'CC2', 'MC', 'MC', 'CC2', 'CC2'],
                    ['MC', 'CC1', 'CC1', 'CC1', 'CC1', 'MC'],
                    ['CC1', 'MC', 'MC', 'MC', 'MC', 'CC1']
                ],
                colors: {
                    'MC': { id: 'MC', label: 'Natural', color: '#f0f0f0' },
                    'CC1': { id: 'CC1', label: 'Blue', color: '#0066cc' },
                    'CC2': { id: 'CC2', label: 'Red', color: '#cc3300' }
                },
                metadata: { name: 'Fair Isle Pattern' }
            },
            settings: { stretchMode: 'repeat', alignmentMode: 'center' }
        },
        {
            name: 'Intarsia Vest Panel',
            description: 'A geometric intarsia design on a shaped vest panel',
            panel: {
                shape: new Trapezoid(15, 20, 20, 0, [
                    new Trapezoid(10, 20, 24, 0, [
                        new Trapezoid(5, 24, 18, 0, [], [])
                    ], [])
                ], []),
                gauge: new Gauge(18, 28),
                sizeModifier: 1.1
            },
            colorwork: {
                grid: [
                    ['MC', 'MC', 'MC', 'MC', 'MC', 'MC', 'MC', 'MC'],
                    ['MC', 'CC1', 'CC1', 'CC1', 'CC1', 'CC1', 'CC1', 'MC'],
                    ['MC', 'CC1', 'MC', 'MC', 'MC', 'MC', 'CC1', 'MC'],
                    ['MC', 'CC1', 'MC', 'CC2', 'CC2', 'MC', 'CC1', 'MC'],
                    ['MC', 'CC1', 'MC', 'CC2', 'CC2', 'MC', 'CC1', 'MC'],
                    ['MC', 'CC1', 'MC', 'MC', 'MC', 'MC', 'CC1', 'MC'],
                    ['MC', 'CC1', 'CC1', 'CC1', 'CC1', 'CC1', 'CC1', 'MC'],
                    ['MC', 'MC', 'MC', 'MC', 'MC', 'MC', 'MC', 'MC']
                ],
                colors: {
                    'MC': { id: 'MC', label: 'Cream', color: '#faf8f3' },
                    'CC1': { id: 'CC1', label: 'Forest', color: '#2d5436' },
                    'CC2': { id: 'CC2', label: 'Gold', color: '#d4af37' }
                },
                metadata: { name: 'Geometric Block' }
            },
            settings: { stretchMode: 'center', alignmentMode: 'center' }
        }
    ];

    useEffect(() => {
        generateExample(currentExample);
    }, [currentExample]);

    const generateExample = async (exampleIndex) => {
        setIsLoading(true);
        try {
            const example = examples[exampleIndex];
            
            // Create panel
            const panel = new Panel(
                example.panel.shape,
                example.panel.gauge,
                example.panel.sizeModifier
            );

            // Create colorwork pattern
            const colorworkPattern = new ColorworkPattern(
                example.colorwork.grid,
                example.colorwork.colors,
                example.colorwork.metadata
            );

            // Combine them
            const composer = new PanelColorworkComposer();
            const combined = composer.combinePatterns(panel, colorworkPattern, example.settings);
            setCombinedPattern(combined);

            // Generate instructions
            const instructionGenerator = new InstructionGenerator();
            const combinedInstructions = instructionGenerator.generateCombinedInstructions(combined);
            setInstructions(combinedInstructions);

        } catch (error) {
            console.error('Error generating example:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const currentExampleData = examples[currentExample];

    return (
        <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div id="editor-toolbar" style={{ position: 'sticky', top: 0, zIndex: 1000, background: '#ffffff', padding: '8px', borderBottom: '1px solid #d9d9d9' }}>
                        <strong>Editor Toolbar</strong>
                    </div>
                    <div id="ribbon-ui" style={{ position: 'sticky', top: '48px', zIndex: 999, background: '#f0f0f0', padding: '8px', borderBottom: '1px solid #d9d9d9' }}>
                        <strong>Ribbon UI</strong>
                    </div>
                <Title level={1}>Colorwork Panel Design System Demo</Title>
                <Paragraph>
                    This demo showcases the colorwork panel design system that combines 
                    trapezoid-based panel shapes with colorwork patterns to generate 
                    complete machine knitting instructions.
                </Paragraph>

                <Card style={{ marginBottom: '24px' }}>
                    <Title level={3}>Select Example</Title>
                    <Space wrap>
                        {examples.map((example, index) => (
                            <Button
                                key={index}
                                type={currentExample === index ? 'primary' : 'default'}
                                onClick={() => setCurrentExample(index)}
                                icon={index === currentExample ? <PlayCircleOutlined /> : null}
                            >
                                {example.name}
                            </Button>
                        ))}
                        <Button 
                            icon={<ReloadOutlined />}
                            onClick={() => generateExample(currentExample)}
                            loading={isLoading}
                        >
                            Regenerate
                        </Button>
                    </Space>
                </Card>

                <Row gutter={[24, 24]}>
                    <Col xs={24} lg={12}>
                        <Card title="Current Example" loading={isLoading}>
                            <Title level={4}>{currentExampleData.name}</Title>
                            <Paragraph>{currentExampleData.description}</Paragraph>
                            
                            <Divider />
                            
                            <Row gutter={[16, 16]}>
                                <Col xs={24} md={12}>
                                    <Title level={5}>Panel Shape</Title>
                                    <div style={{ textAlign: 'center' }}>
                                        <PanelDiagram
                                            shape={currentExampleData.panel.shape}
                                            label="Panel"
                                            size={150}
                                            padding={10}
                                        />
                                    </div>
                                    <Text type="secondary">
                                        Gauge: {currentExampleData.panel.gauge.stitchesPerFourInches} × {currentExampleData.panel.gauge.rowsPerFourInches}
                                        <br />
                                        Size: {Math.round(currentExampleData.panel.sizeModifier * 100)}%
                                    </Text>
                                </Col>
                                
                                <Col xs={24} md={12}>
                                    <Title level={5}>Colorwork Pattern</Title>
                                    <div className="colorwork-preview">
                                        <Text>
                                            Size: {currentExampleData.colorwork.grid[0].length} × {currentExampleData.colorwork.grid.length}
                                            <br />
                                            Colors: {Object.keys(currentExampleData.colorwork.colors).length}
                                        </Text>
                                        <div style={{ marginTop: '8px' }}>
                                            {Object.values(currentExampleData.colorwork.colors).map(color => (
                                                <div key={color.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                                                    <div 
                                                        style={{ 
                                                            width: '16px', 
                                                            height: '16px', 
                                                            backgroundColor: color.color,
                                                            border: '1px solid #d9d9d9',
                                                            borderRadius: '2px',
                                                            marginRight: '8px'
                                                        }}
                                                    />
                                                    <Text style={{ fontSize: '12px' }}>{color.label}</Text>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <Text type="secondary">
                                        Mode: {currentExampleData.settings.stretchMode}
                                        <br />
                                        Align: {currentExampleData.settings.alignmentMode}
                                    </Text>
                                </Col>
                            </Row>
                        </Card>
                    </Col>

                    <Col xs={24} lg={12}>
                        <Card title="System Architecture">
                            <Title level={5}>Components Used</Title>
                            <ul style={{ fontSize: '14px' }}>
                                <li><strong>Trapezoid:</strong> Defines the panel geometry</li>
                                <li><strong>Panel:</strong> Combines shape with gauge and sizing</li>
                                <li><strong>ColorworkPattern:</strong> Stores the colorwork grid and colors</li>
                                <li><strong>PanelColorworkComposer:</strong> Maps colorwork to panel shape</li>
                                <li><strong>InstructionGenerator:</strong> Creates synchronized knitting instructions</li>
                                <li><strong>PanelDiagram:</strong> Visualizes the panel shape</li>
                                <li><strong>CombinedView:</strong> Displays results and instructions</li>
                            </ul>
                            
                            <Divider />
                            
                            <Title level={5}>Design Benefits</Title>
                            <ul style={{ fontSize: '14px' }}>
                                <li>Modular architecture with clear separation of concerns</li>
                                <li>Reuses existing panel and visualization components</li>
                                <li>Extensible for new panel shapes and colorwork types</li>
                                <li>Generates machine-readable knitting instructions</li>
                                <li>Handles complex shaping with colorwork alignment</li>
                            </ul>
                        </Card>
                    </Col>
                </Row>

                {combinedPattern && (
                    <CombinedView 
                        combinedPattern={combinedPattern}
                        instructions={instructions}
                        isLoading={isLoading}
                    />
                )}
            </div>
        </div>
    );
};

export default ColorworkDemo;
