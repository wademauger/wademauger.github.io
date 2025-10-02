import React, { useState } from 'react';
import { Card, Tabs, Steps, Space, Typography, Button, Tag, Row, Col } from 'antd';
import { EyeOutlined, PrinterOutlined, DownloadOutlined } from '@ant-design/icons';
import { ColorworkVisualizer } from '../models/ColorworkVisualizer';
import './CombinedView.css';

const { Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Step } = Steps;

/**
 * CombinedView - Displays the combined pattern with instructions and visualizations
 * Updated to support compact instructions as default and enhanced visual mode
 */
const CombinedView = ({
    combinedPattern,
    instructions = [],
    isLoading = false,
    isPreview = false
}) => {
    const [activeTab, setActiveTab] = useState(isPreview ? 'compact' : 'compact');
    const [currentStep, setCurrentStep] = useState(0);
    // Default to 'panelView' for preview, 'compact' for interactive knitting
    const [viewMode, setViewMode] = useState(isPreview ? 'panelView' : 'compact');

    const [colorworkVisualizer] = useState(() => new ColorworkVisualizer());

    if (isLoading) {
        return (
            <Card loading={true} title="Generating Combined Pattern">
                <div style={{ height: 200 }} />
            </Card>
        );
    }

    if (!combinedPattern) {
        return (
            <Card title="Combined Pattern Preview">
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <Text type="secondary">No pattern generated yet. Configure your panel and colorwork settings above.</Text>
                </div>
            </Card>
        );
    }

    const renderInstructionsTab = () => (
        <div className="instructions-container">
            <div className="instructions-header" style={{
                backgroundColor: '#fafafa',
                padding: '12px 16px',
                borderRadius: '6px',
                marginBottom: '16px',
                border: '1px solid #d9d9d9'
            }}>
                <Space size="large">
                    <Text strong>View Mode:</Text>
                    <Button.Group>
                        <Button
                            type={viewMode === 'panelView' ? 'primary' : 'default'}
                            onClick={() => setViewMode('panelView')}
                            icon={<EyeOutlined />}
                        >
                            Panel View
                        </Button>
                        <Button
                            type={viewMode === 'compact' ? 'primary' : 'default'}
                            onClick={() => setViewMode('compact')}
                        >
                            Compact
                        </Button>
                        <Button
                            type={viewMode === 'detailed' ? 'primary' : 'default'}
                            onClick={() => setViewMode('detailed')}
                        >
                            Detailed
                        </Button>
                        <Button
                            type={viewMode === 'visual' ? 'primary' : 'default'}
                            onClick={() => setViewMode('visual')}
                        >
                            Chart
                        </Button>
                    </Button.Group>
                    {!isPreview && (
                        <>
                            <Button icon={<PrinterOutlined />}>Print</Button>
                            <Button icon={<DownloadOutlined />}>Export</Button>
                        </>
                    )}
                </Space>
            </div>

            {viewMode === 'panelView' && renderPanelView()}
            {viewMode === 'compact' && renderCompactInstructions()}
            {viewMode === 'detailed' && renderDetailedInstructions()}
            {viewMode === 'visual' && renderVisualInstructions()}
        </div>
    );

    const renderPanelView = () => {
        // Check if we have the required data
        if (!combinedPattern || !combinedPattern.panel || !combinedPattern.colorworkPattern) {
            return (
                <div className="panel-view">
                    <Card title="Panel View" size="small">
                        <div style={{ textAlign: 'center', padding: '40px 0' }}>
                            <Text type="secondary">Unable to render panel view - missing pattern data</Text>
                        </div>
                    </Card>
                </div>
            );
        }

        // Create a visual representation of the panel with colorwork applied
        return (
            <div className="panel-view" style={{ width: '100%' }}>
                <div className="panel-visualization" style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '500px',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '8px',
                    position: 'relative',
                    padding: '40px',
                    width: '100%'
                }}>
                    {renderPanelWithColorwork()}
                </div>
            </div>
        );
    };

    const renderPanelWithColorwork = () => {
        try {
            const panel = combinedPattern.panel;
            const pattern = combinedPattern.colorworkPattern;
            const shape = panel.shape;

            if (!shape || !pattern) {
                return (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                        <Text type="secondary">Unable to render panel visualization</Text>
                    </div>
                );
            }

            // Calculate panel dimensions for SVG
            const svgWidth = 400;
            const svgHeight = 300;
            const panelHeight = shape.height * 4; // Scale up for visibility
            const maxPanelHeight = svgHeight * 0.7;
            const actualPanelHeight = Math.min(panelHeight, maxPanelHeight);

            // Get the correct trapezoid dimensions
            // baseA is bottom width, baseB is top width
            const bottomWidth = shape.baseA || 20;
            const topWidth = shape.baseB || 30;
            const offset = shape.baseBHorizontalOffset || 0;

            // Scale factor for display
            const scale = Math.min(svgWidth / (Math.max(bottomWidth, topWidth) * 2.5), 3);

            const centerX = svgWidth / 2;
            const bottomY = svgHeight - 30;
            const topY = bottomY - actualPanelHeight;

            // Calculate trapezoid corners
            const scaledBottomWidth = bottomWidth * scale;
            const scaledTopWidth = topWidth * scale;
            const scaledOffset = offset * scale;

            const bottomLeft = centerX - (scaledBottomWidth / 2);
            const bottomRight = centerX + (scaledBottomWidth / 2);
            const topLeft = centerX - (scaledTopWidth / 2) + scaledOffset;
            const topRight = centerX + (scaledTopWidth / 2) + scaledOffset;

            const panelPath = `M ${bottomLeft} ${bottomY} L ${bottomRight} ${bottomY} L ${topRight} ${topY} L ${topLeft} ${topY} Z`;

            return (
                <svg width={svgWidth} height={svgHeight} style={{ maxWidth: '100%' }}>
                    {/* Panel outline */}
                    <path
                        d={panelPath}
                        fill="rgba(255,255,255,0.9)"
                        stroke="#333"
                        strokeWidth="2"
                    />

                    {/* Colorwork pattern overlay */}
                    {pattern.grid && renderColorworkOverlay(pattern, bottomLeft, topLeft, bottomRight, topRight, topY, bottomY)}

                    {/* Panel label */}
                    <text
                        x={centerX}
                        y={bottomY + 20}
                        textAnchor="middle"
                        fontSize="12"
                        fill="#666"
                    >
                        Panel Shape: {bottomWidth}" bottom × {topWidth}" top × {shape.height}" tall
                    </text>

                    {/* Dimension labels */}
                    <text
                        x={centerX}
                        y={bottomY - 5}
                        textAnchor="middle"
                        fontSize="10"
                        fill="#999"
                    >
                        {bottomWidth}"
                    </text>
                    <text
                        x={centerX + scaledOffset}
                        y={topY - 5}
                        textAnchor="middle"
                        fontSize="10"
                        fill="#999"
                    >
                        {topWidth}"
                    </text>
                </svg>
            );
        } catch (error) {
            console.error('Error rendering panel with colorwork:', error);
            return (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                    <Text type="secondary">Error rendering panel visualization</Text>
                </div>
            );
        }
    };

    const renderColorworkOverlay = (pattern, bottomLeft, topLeft, bottomRight, topRight, topY, bottomY) => {
        const elements = [];
        const patternHeight = pattern.grid.length;
        const patternWidth = pattern.grid[0]?.length || 0;

        if (patternHeight === 0 || patternWidth === 0) return elements;

        // Calculate how many pattern repeats to show
        const panelWidthTop = topRight - topLeft;
        const panelWidthBottom = bottomRight - bottomLeft;
        const panelHeight = bottomY - topY;

        // Show pattern repeats based on panel height
        const repeatRows = Math.max(1, Math.floor(panelHeight / 20)); // Each pattern repeat is ~20px tall
        const cellHeight = panelHeight / (patternHeight * repeatRows);

        for (let repeatY = 0; repeatY < repeatRows; repeatY++) {
            for (let row = 0; row < patternHeight; row++) {
                const absoluteRow = repeatY * patternHeight + row;
                const yProgress = absoluteRow / (patternHeight * repeatRows);
                const currentY = topY + (yProgress * panelHeight);

                // Calculate width at this height (linear interpolation for trapezoid)
                const currentWidth = panelWidthTop + (yProgress * (panelWidthBottom - panelWidthTop));
                const currentLeft = topLeft + (yProgress * (bottomLeft - topLeft));

                // Calculate how many pattern repeats fit horizontally
                const stitchWidth = currentWidth / (patternWidth * 3); // Show ~3 horizontal repeats

                for (let repeatX = 0; repeatX < 3; repeatX++) {
                    for (let col = 0; col < patternWidth; col++) {
                        const absoluteCol = repeatX * patternWidth + col;
                        const x = currentLeft + (absoluteCol * stitchWidth);

                        // Check if this stitch is within the panel bounds
                        if (x + stitchWidth <= currentLeft + currentWidth) {
                            const colorIndex = pattern.grid[row][col];
                            const colorData = pattern.colors[colorIndex];
                            const color = colorData?.color || '#ffffff';

                            // Only render non-white colors for visibility
                            if (color && color !== '#ffffff' && color !== '#FFFFFF') {
                                elements.push(
                                    <rect
                                        key={`${absoluteRow}-${absoluteCol}`}
                                        x={x}
                                        y={currentY}
                                        width={stitchWidth}
                                        height={cellHeight}
                                        fill={color}
                                        opacity={0.7}
                                        stroke="rgba(0,0,0,0.1)"
                                        strokeWidth="0.5"
                                    />
                                );
                            }
                        }
                    }
                }
            }
        }

        return elements;
    };

    const renderDetailedInstructions = () => (
        <div className="detailed-instructions">
            <Steps
                direction="vertical"
                current={currentStep}
                onChange={setCurrentStep}
                className="instruction-steps"
            >
                {instructions.map((instruction, index) => (
                    <Step
                        key={index}
                        title={instruction.row ? `Row ${instruction.row}` : 'Setup/Finishing'}
                        description={
                            <div className="instruction-detail">
                                <div className="instruction-text">
                                    {instruction.getDescription()}
                                </div>

                                {instruction.hasColorwork() && (
                                    <div className="colorwork-detail">
                                        <div className="colorwork-sequence">
                                            {instruction.colorwork.colorSequence.map((segment, i) => (
                                                <Tag key={i} color="blue">
                                                    {segment.stitchCount} {segment.colorId}
                                                </Tag>
                                            ))}
                                        </div>

                                        {instruction.visualChart && (
                                            <div
                                                className="row-visual"
                                                dangerouslySetInnerHTML={{ __html: instruction.visualChart.svg }}
                                            />
                                        )}
                                    </div>
                                )}
                            </div>
                        }
                        status={index < currentStep ? 'finish' : index === currentStep ? 'process' : 'wait'}
                    />
                ))}
            </Steps>
        </div>
    );

    const renderCompactInstructions = () => (
        <div className="compact-instructions">
            <ol className="instruction-list">
                {instructions.map((instruction, index) => (
                    <li key={index} className={`instruction-item ${index === currentStep ? 'current' : ''}`}>
                        <span className="instruction-number">
                            {instruction.row || index + 1}.
                        </span>
                        <span className="instruction-content">
                            {instruction.getDescription()}
                        </span>
                        {instruction.hasColorwork() && (
                            <div className="colorwork-compact">
                                Colors: {instruction.colorwork.description}
                            </div>
                        )}
                    </li>
                ))}
            </ol>
        </div>
    );

    const renderVisualInstructions = () => {
        // Create a visual chart for the entire pattern
        const fullChart = colorworkVisualizer.generateChart(combinedPattern.colorworkPattern, {
            cellSize: 12,
            showRowNumbers: true,
            showStitchNumbers: false
        });

        return (
            <div className="visual-instructions">
                <Row gutter={[16, 16]}>
                    <Col xs={24} lg={12}>
                        <Card title="Full Pattern Chart" size="small">
                            <div
                                className="pattern-chart"
                                dangerouslySetInnerHTML={{ __html: fullChart.svg }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} lg={12}>
                        <Card title="Color Legend" size="small">
                            <div className="color-legend">
                                {combinedPattern.getColorsUsed().map(color => (
                                    <div key={color.id} className="legend-item">
                                        <div
                                            className="color-swatch"
                                            style={{ backgroundColor: color.color }}
                                        />
                                        <span className="color-label">{color.label}</span>
                                        <span className="color-code">({color.color})</span>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </Col>
                </Row>
            </div>
        );
    };

    const renderOverviewTab = () => (
        <div className="overview-container">
            <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                    <Card title="Pattern Summary" size="small">
                        <Space direction="vertical">
                            <div>
                                <Text strong>Total Rows:</Text> {combinedPattern.getRowCount()}
                            </div>
                            <div>
                                <Text strong>Colors Used:</Text> {combinedPattern.getColorsUsed().length}
                            </div>
                            <div>
                                <Text strong>Pattern Type:</Text> Shaped Panel with Colorwork
                            </div>
                            <div>
                                <Text strong>Gauge:</Text> {combinedPattern.panel.gauge.stitchesPerFourInches} sts × {combinedPattern.panel.gauge.rowsPerFourInches} rows per 4"
                            </div>
                        </Space>
                    </Card>
                </Col>

                <Col xs={24} md={12}>
                    <Card title="Materials Needed" size="small">
                        <div className="materials-list">
                            <div>
                                <Text strong>Yarns:</Text>
                                <ul>
                                    {combinedPattern.getColorsUsed().map(color => (
                                        <li key={color.id}>
                                            {color.label} ({color.color})
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <Text strong>Tools:</Text>
                                <ul>
                                    <li>Knitting machine with colorwork capability</li>
                                    <li>Yarn guides for multiple colors</li>
                                    <li>Row counter</li>
                                    <li>Tapestry needle for finishing</li>
                                </ul>
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );

    const renderPatternDataTab = () => (
        <div className="pattern-data-container">
            <Card title="Pattern Data" size="small">
                <Paragraph>
                    <Text strong>Export Options:</Text>
                </Paragraph>
                <Space>
                    <Button onClick={() => downloadJSON()}>Download JSON</Button>
                    <Button onClick={() => downloadCSV()}>Download CSV</Button>
                    <Button onClick={() => downloadPDF()}>Download PDF</Button>
                </Space>

                <div style={{ marginTop: 16 }}>
                    <Text strong>Raw Pattern Data:</Text>
                    <pre className="pattern-json">
                        {JSON.stringify(combinedPattern.toJSON(), null, 2)}
                    </pre>
                </div>
            </Card>
        </div>
    );

    const downloadJSON = () => {
        const data = {
            combinedPattern: combinedPattern.toJSON(),
            instructions: instructions.map(i => i.toJSON()),
            metadata: {
                exported: new Date().toISOString(),
                version: '1.0'
            }
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'colorwork-pattern.json';
        a.click();
        URL.revokeObjectURL(url);
    };

    const downloadCSV = () => {
        const csv = instructions.map((instruction, index) => {
            return [
                index + 1,
                instruction.row || '',
                instruction.machineRow || '',
                instruction.hasShaping() ? instruction.shaping.description : '',
                instruction.hasColorwork() ? instruction.colorwork.description : ''
            ].join(',');
        }).join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'colorwork-instructions.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    const downloadPDF = () => {
        // PDF generation would be implemented here
        console.log('PDF download not yet implemented');
    };

    return (
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <TabPane tab="Instructions" key="compact">
                {renderInstructionsTab()}
            </TabPane>
            <TabPane tab="Overview" key="overview">
                {renderOverviewTab()}
            </TabPane>
            <TabPane tab="Pattern Data" key="data">
                {renderPatternDataTab()}
            </TabPane>
        </Tabs>
    );
};

export default CombinedView;
