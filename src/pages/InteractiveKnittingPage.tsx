import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Space, Typography, Spin, Select } from 'antd';
import { LeftOutlined } from '@ant-design/icons';
import InteractiveKnittingView from '../components/InteractiveKnittingView';
import { PanelColorworkComposer } from '../models/PanelColorworkComposer';
import { InstructionGenerator } from '../models/InstructionGenerator';
import { Panel } from '../models/Panel';
import { Trapezoid } from '../models/Trapezoid';
import { ColorworkPattern } from '../models/ColorworkPattern';
import { Gauge } from '../models/Gauge';
import { getRowColorwork } from '../utils/stitchPlanGenerator';

const { Title, Text } = Typography;

interface KnittingProgress {
    currentRow: number;
    completedRows: number[];
    currentSection: number;
}

/**
 * InteractiveKnittingPage - Dedicated page for row-by-row knitting instructions
 * Loads project data from route state and displays interactive knitting interface
 */
const InteractiveKnittingPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    const [combinedPattern, setCombinedPattern] = useState<any>(null);
    const [instructions, setInstructions] = useState<any[]>([]);
    const [knittingProgress, setKnittingProgress] = useState<KnittingProgress>({
        currentRow: 0,
        completedRows: [],
        currentSection: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPanelIndex, setSelectedPanelIndex] = useState(0);
    const [projectPanels, setProjectPanels] = useState<any[]>([]);

    // Load project from route state
    useEffect(() => {
        const project = location.state?.project;
        
        if (!project) {
            console.warn('No project data in route state, redirecting back');
            navigate(-1);
            return;
        }

        if (!project.panels || project.panels.length === 0) {
            console.error('Project has no panels');
            navigate(-1);
            return;
        }

        setProjectPanels(project.panels);
        console.log('Loaded project panels:', project.panels);
        setIsLoading(false);
    }, [location.state, navigate]);

    // Generate combined pattern when panel selection changes
    useEffect(() => {
        if (projectPanels.length === 0 || selectedPanelIndex >= projectPanels.length) {
            return;
        }

        const panelData = projectPanels[selectedPanelIndex];
        
        try {
            console.log('Panel data:', panelData);
            
            // NEW APPROACH: Check if we have a pre-generated stitch plan
            if (panelData.stitchPlan) {
                console.log('Using pre-generated stitch plan:', panelData.stitchPlan);
                
                // Convert the concrete stitch plan into the format expected by InteractiveKnittingView
                const stitchPlanObj = {
                    rows: panelData.stitchPlan.rows.map((row: any) => ({
                        rowNumber: row.rowNumber,
                        leftStitchesInWork: row.leftStitchesInWork,
                        rightStitchesInWork: row.rightStitchesInWork,
                        colorwork: getRowColorwork(row) // Use helper to handle compressed/uncompressed
                    })),
                    colorworkMapping: {
                        colorworkPattern: {
                            colors: panelData.stitchPlan.colorPalette
                        }
                    },
                    hasColorwork: () => true,
                    generateKnittingInstructions: function() {
                        return this.generateShapingInstructions();
                    },
                    generateShapingInstructions: function() {
                        // Simple instruction generation
                        const instructions: string[] = [];
                        if (this.rows.length === 0) return instructions;
                        
                        // Check if rectangular
                        const firstRow = this.rows[0];
                        const lastRow = this.rows[this.rows.length - 1];
                        const firstTotal = firstRow.leftStitchesInWork + firstRow.rightStitchesInWork;
                        const lastTotal = lastRow.leftStitchesInWork + lastRow.rightStitchesInWork;
                        
                        if (firstTotal === lastTotal) {
                            instructions.push(`Knit ${this.rows.length} rows (${firstTotal} sts in work).`);
                        } else {
                            instructions.push(`Knit panel with shaping from ${firstTotal} to ${lastTotal} stitches over ${this.rows.length} rows.`);
                        }
                        
                        return instructions;
                    }
                };
                
                const combined = {
                    stitchPlan: stitchPlanObj,
                    getRowCount: () => stitchPlanObj.rows.length
                };
                
                setCombinedPattern(combined);
                
                // Generate simple instructions directly from the stitch plan
                // No need for the complex InstructionGenerator when we have concrete data
                const generatedInstructions = stitchPlanObj.generateShapingInstructions();
                setInstructions(generatedInstructions);
                
                // Reset progress
                setKnittingProgress({
                    currentRow: 0,
                    completedRows: [],
                    currentSection: 0
                });
                
                return;
            }
            
            // LEGACY APPROACH: Reconstruct from shape and colorwork layers
            // This is for backward compatibility with old projects
            console.log('No pre-generated stitch plan, using legacy reconstruction');
            console.log('Panel shape:', panelData.shape || panelData.wizardOptions?.shape);
            
            // Try to get shape from either the new wizardOptions structure or the old direct structure
            const shape = panelData.wizardOptions?.shape || panelData.shape;
            const colorworkLayers = panelData.wizardOptions?.colorworkLayers || panelData.colorworkLayers;
            
            if (!shape) {
                console.error('No shape data available');
                return;
            }
            
            // Helper function to recursively reconstruct Trapezoid instances
            const reconstructTrapezoid = (shapeData: any): Trapezoid => {
                // Recursively reconstruct successors
                const successors = (shapeData.successors || []).map((s: any) => reconstructTrapezoid(s));
                
                return new Trapezoid(
                    shapeData.height || 0,
                    shapeData.baseA || 0,
                    shapeData.baseB || 0,
                    shapeData.baseBHorizontalOffset || 0,
                    successors,
                    shapeData.finishingSteps || [],
                    shapeData.modificationScale || 1,
                    shapeData.label || null
                );
            };
            
            // Create Panel object from shape
            const trapezoid = reconstructTrapezoid(shape);
            console.log('Trapezoid created:', trapezoid);
            
            const project = location.state?.project;
            const gaugeData = project?.gauge || { stitchesPerFourInches: 20, rowsPerFourInches: 28, scalingFactor: 1 };
            console.log('Gauge data:', gaugeData);
            
            // Create a proper Gauge instance
            const gauge = new Gauge(
                gaugeData.stitchesPerFourInches || 20,
                gaugeData.rowsPerFourInches || 28,
                gaugeData.scalingFactor || gaugeData.scaleFactor || 1
            );
            console.log('Gauge created:', gauge);
            
            const panel = new Panel(trapezoid, gauge);
            console.log('Panel created:', panel);
            console.log('Panel has shape?', !!panel.shape);
            console.log('Panel shape:', panel.shape);

            // Combine all colorwork layers into a single pattern
            // For now, use the first layer if available
            let colorworkPattern: ColorworkPattern | null = null;
            
            if (colorworkLayers && colorworkLayers.length > 0) {
                const firstLayer = colorworkLayers[0];
                console.log('First colorwork layer:', firstLayer);
                
                if (firstLayer.pattern) {
                    // The pattern is already a ColorworkPattern instance or plain object
                    // Need to ensure it's a proper ColorworkPattern instance
                    if (firstLayer.pattern instanceof ColorworkPattern) {
                        colorworkPattern = firstLayer.pattern;
                    } else {
                        // Reconstruct from plain object
                        colorworkPattern = new ColorworkPattern(
                            firstLayer.pattern.width || firstLayer.pattern.gridWidth || 10,
                            firstLayer.pattern.height || firstLayer.pattern.gridHeight || 10,
                            firstLayer.pattern.grid || firstLayer.pattern.pattern || [],
                            firstLayer.pattern.colors || firstLayer.pattern.colorPalette || {}
                        );
                    }
                    console.log('Using colorwork pattern:', colorworkPattern);
                } else {
                    // Create a simple default pattern
                    console.warn('No pattern in layer, creating default');
                    colorworkPattern = new ColorworkPattern(10, 10);
                }
            } else {
                // Create a simple default pattern if no colorwork
                console.warn('No colorwork layers, creating default');
                colorworkPattern = new ColorworkPattern(10, 10);
            }

            // Generate combined pattern
            const composer = new PanelColorworkComposer();
            const combined = composer.combinePatterns(panel, colorworkPattern);
            console.log('Combined pattern created:', combined);
            console.log('Stitch plan:', (combined as any).stitchPlan);
            console.log('Has generateKnittingInstructions?', typeof (combined as any).stitchPlan?.generateKnittingInstructions);
            setCombinedPattern(combined);

            // Generate instructions
            const generator = new InstructionGenerator();
            const generatedInstructions = generator.generateInstructions(combined);
            setInstructions(generatedInstructions);

            // Reset progress when changing panels
            setKnittingProgress({
                currentRow: 0,
                completedRows: [],
                currentSection: 0
            });

        } catch (error) {
            console.error('Error generating combined pattern:', error);
            setCombinedPattern(null);
            setInstructions([]);
        }
    }, [projectPanels, selectedPanelIndex, location.state]);

    const handleRowComplete = (rowIndex: number) => {
        // Get total row count from instructions or combined pattern
        const totalRows = instructions.length || (combinedPattern?.stitchPlan?.rows?.length) || 0;
        
        setKnittingProgress(prev => ({
            ...prev,
            currentRow: Math.min(rowIndex + 1, totalRows - 1),
            completedRows: [...prev.completedRows, rowIndex]
        }));
    };

    const handleBackToSettings = () => {
        navigate(-1);
    };

    if (isLoading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh' 
            }}>
                <Spin size="large" tip="Loading knitting instructions..." />
            </div>
        );
    }

    if (projectPanels.length === 0) {
        return (
            <div style={{ padding: 24 }}>
                <Button icon={<LeftOutlined />} onClick={handleBackToSettings}>
                    Back
                </Button>
                <div style={{ marginTop: 24, textAlign: 'center' }}>
                    <Typography.Text type="secondary">
                        No panels found in project
                    </Typography.Text>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Title level={2} style={{ margin: 0 }}>
                        Interactive Knitting Instructions
                    </Title>
                    <Space>
                        {projectPanels.length > 1 && (
                            <Select
                                value={selectedPanelIndex}
                                onChange={setSelectedPanelIndex}
                                style={{ width: 200 }}
                            >
                                {projectPanels.map((panel, index) => (
                                    <Select.Option key={index} value={index}>
                                        {panel.panelName || `Panel ${index + 1}`}
                                    </Select.Option>
                                ))}
                            </Select>
                        )}
                        <Button icon={<LeftOutlined />} onClick={handleBackToSettings}>
                            Back to Editor
                        </Button>
                    </Space>
                </div>

                {!combinedPattern ? (
                    <div style={{ textAlign: 'center', padding: 40 }}>
                        <Spin tip="Generating pattern..." />
                    </div>
                ) : (
                    <InteractiveKnittingView
                        combinedPattern={combinedPattern}
                        instructions={instructions as any}
                        knittingProgress={knittingProgress}
                        onRowComplete={handleRowComplete}
                        onBackToSettings={handleBackToSettings}
                    />
                )}
            </Space>
        </div>
    );
};

export default InteractiveKnittingPage;
