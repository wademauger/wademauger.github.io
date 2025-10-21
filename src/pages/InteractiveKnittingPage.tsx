import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Space, Typography, Spin, Select, Modal, Alert, Row, Col, Card, Progress } from 'antd';
import { LeftOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import InteractiveKnittingView from '../components/InteractiveKnittingView';
import { PanelColorworkComposer } from '../models/PanelColorworkComposer';
import { InstructionGenerator } from '../models/InstructionGenerator';
import { Panel } from '../models/Panel';
import { Trapezoid } from '../models/Trapezoid';
import { ColorworkPattern } from '../models/ColorworkPattern';
import { Gauge } from '../models/Gauge';
import { HandKnittingActualizer } from '../models/HandKnittingActualizer';
import { getRowColorwork } from '../utils/stitchPlanGenerator';
import { 
    setCurrentRowIndex, 
    setCurrentPanelIndex, 
    setCurrentTrapezoidIndex,
    addCompletedRow,
    updateKnittingProgress 
} from '../store/knittingDesignSlice';
import { 
    calculateStepFromRow, 
    getProgressMapping, 
    calculateRowSkipForSteps,
    calculateDisplayProgress 
} from '../utils/knittingProgressUtils';

const { Title, Text } = Typography;
const { confirm } = Modal;

/**
 * InteractiveKnittingPage - Dedicated page for row-by-row knitting instructions
 * Loads project data from route state and displays interactive knitting interface
 * Now uses Redux for progress tracking with synchronized indicators
 */
const InteractiveKnittingPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    
    // Get knitting progress from Redux
    const knittingProgress = useSelector((state: any) => state.knittingDesign.knittingProgress);
    
    const [combinedPattern, setCombinedPattern] = useState<any>(null);
    const [instructions, setInstructions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [projectPanels, setProjectPanels] = useState<any[]>([]);
    const [knittingOptions, setKnittingOptions] = useState<any>(null);

    // Load project from route state and sync with Redux
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
        setKnittingOptions(project.knittingOptions || {});
        
        // Sync Redux panel index if needed
        if (knittingProgress.currentPanelIndex !== 0) {
            dispatch(setCurrentPanelIndex(0));
        }
        
        console.log('Loaded project panels:', project.panels);
        console.log('Loaded knitting options:', project.knittingOptions);
        setIsLoading(false);
    }, [location.state, navigate, dispatch, knittingProgress.currentPanelIndex]);

    // Generate combined pattern when panel selection changes
    useEffect(() => {
        if (projectPanels.length === 0 || knittingProgress.currentPanelIndex >= projectPanels.length) {
            return;
        }

        const panelData = projectPanels[knittingProgress.currentPanelIndex];
        
        try {
            // Check if we have a pre-generated stitch plan
            if (panelData.stitchPlan) {
                // Convert the concrete stitch plan into the format expected by InteractiveKnittingView
                const panelShape = panelData.wizardOptions?.shape || panelData.shape;
                const stitchPlanObj = {
                    rows: panelData.stitchPlan.rows.map((row: any) => ({
                        rowNumber: row.rowNumber,
                        leftStitchesInWork: row.leftStitchesInWork,
                        rightStitchesInWork: row.rightStitchesInWork,
                        colorwork: getRowColorwork(row), // Use helper to handle compressed/uncompressed
                        shortRowInfo: row.shortRowInfo, // Include short row metadata
                        sectionLabel: row.sectionLabel // Include section label for grouping
                    })),
                    colorworkMapping: {
                        colorworkPattern: {
                            colors: panelData.stitchPlan.colorPalette
                        }
                    },
                    hasColorwork: () => true,
                    knittingOptions: knittingOptions,
                    shape: panelShape,
                    generateKnittingInstructions: function() {
                        return this.generateShapingInstructions();
                    },
                    generateShapingInstructions: function() {
                        const instructions: any[] = [];
                        if (this.rows.length === 0) return instructions;
                        
                        // Create HandKnittingActualizer instance
                        const actualizer = new HandKnittingActualizer(this.knittingOptions);
                        
                        // Add cast-on instruction at the beginning
                        const firstRow = this.rows[0];
                        const initialStitches = firstRow.leftStitchesInWork + firstRow.rightStitchesInWork;
                        const initialLeftStitches = firstRow.leftStitchesInWork;
                        const initialRightStitches = firstRow.rightStitchesInWork;
                        const castOnMethod = this.knittingOptions?.castOnMethod || 'long-tail';
                        const castOnInstr = `CO ${initialStitches} stitches using ${castOnMethod} cast-on.`;
                        instructions.push({
                            text: castOnInstr,
                            stepData: {
                                text: castOnInstr,
                                startRowIndex: -1,
                                endRowIndex: -1,
                                rowsInStep: 0,
                                absolutePositioning: {
                                    totalStitches: initialStitches,
                                    leftStitches: initialLeftStitches,
                                    rightStitches: initialRightStitches
                                }
                            }
                        });
                        
                        // Check if the ENTIRE panel is rectangular (first to last row same stitch count)
                        const lowerLeft = this.rows[0].leftStitchesInWork;
                        const lowerRight = this.rows[0].rightStitchesInWork;
                        const upperLeft = this.rows[this.rows.length - 1].leftStitchesInWork;
                        const upperRight = this.rows[this.rows.length - 1].rightStitchesInWork;
                        
                        if (lowerLeft === upperLeft && lowerRight === upperRight) {
                            const rectInstr = `Knit ${this.rows.length} rows (RC=${this.rows[this.rows.length - 1].rowNumber}, ${this.rows[this.rows.length - 1].leftStitchesInWork + this.rows[this.rows.length - 1].rightStitchesInWork} sts in work).`;
                            instructions.push({
                                text: rectInstr,
                                stepData: {
                                    text: rectInstr,
                                    startRowIndex: 0,
                                    endRowIndex: this.rows.length - 1,
                                    rowsInStep: this.rows.length,
                                    absolutePositioning: actualizer.getAbsolutePosition(this.rows[this.rows.length - 1])
                                }
                            });
                        } else {
                            // Multiple sections: process by section first, then by shaping within sections
                            let currentSection: any = null;
                            let sectionStartRowIndex = 0;
                            let sectionRows: any[] = [];
                            
                            for (let i = 0; i < this.rows.length; i++) {
                                const row = this.rows[i];
                                const rowSection = row.sectionLabel || null;
                                
                                // Check if we're starting a new section
                                if (rowSection !== currentSection) {
                                    // Process the previous section if it exists
                                    if (sectionRows.length > 0) {
                                        // Use the actualizer to generate instructions for this section
                                        const sectionInstructions = actualizer.actualize(sectionRows, sectionStartRowIndex);
                                        instructions.push(...sectionInstructions);
                                    }
                                    
                                    currentSection = rowSection;
                                    sectionStartRowIndex = i;
                                    sectionRows = [row];
                                } else {
                                    sectionRows.push(row);
                                }
                            }
                            
                            // Don't forget the last section
                            if (sectionRows.length > 0) {
                                const sectionInstructions = actualizer.actualize(sectionRows, sectionStartRowIndex);
                                instructions.push(...sectionInstructions);
                            }
                        }
                        
                        // Add bind-off instruction at the end
                        const lastRow = this.rows[this.rows.length - 1];
                        const finalStitches = lastRow.leftStitchesInWork + lastRow.rightStitchesInWork;
                        const bindOffMethod = this.knittingOptions?.bindOffMethod || 'knitwise';
                        const bindOffInstr = `BO all ${finalStitches} stitches using ${bindOffMethod} bind-off.`;
                        instructions.push({
                            text: bindOffInstr,
                            stepData: {
                                text: bindOffInstr,
                                startRowIndex: -1,
                                endRowIndex: -1,
                                rowsInStep: 0,
                                absolutePositioning: actualizer.getAbsolutePosition(lastRow)
                            }
                        });
                        
                        return instructions;
                    }
                };
                
                // Extract shape and gauge for the panel diagram
                const shape = panelData.wizardOptions?.shape || panelData.shape;
                const gaugeData = location.state?.project?.gauge || { stitchesPerFourInches: 20, rowsPerFourInches: 28 };
                
                // Create gauge object for UnifiedPanelDiagram
                const gauge = {
                    stitchesPerFourInches: gaugeData.stitchesPerFourInches || 20,
                    rowsPerFourInches: gaugeData.rowsPerFourInches || 28,
                    scalingFactor: gaugeData.scalingFactor || gaugeData.scaleFactor || 1
                };
                
                // Get colorwork pattern layers for display
                const colorworkLayers = panelData.wizardOptions?.colorworkLayers || [];
                
                const combined = {
                    stitchPlan: stitchPlanObj,
                    getRowCount: () => stitchPlanObj.rows.length,
                    // Add panel info for UnifiedPanelDiagram
                    panel: {
                        shape: shape,
                        gauge: gauge
                    },
                    shape: shape,
                    gauge: gauge,
                    colorworkPattern: colorworkLayers.length > 0 ? colorworkLayers[0]?.pattern : null,
                    colorworkLayers: colorworkLayers
                };
                
                setCombinedPattern(combined);
                
                // Generate simple instructions directly from the stitch plan
                // No need for the complex InstructionGenerator when we have concrete data
                const generatedInstructions = stitchPlanObj.generateShapingInstructions();
                setInstructions(generatedInstructions);
                
                // Reset progress in Redux
                dispatch(updateKnittingProgress({
                    currentRowIndex: 0,
                    currentPanelIndex: knittingProgress.currentPanelIndex,
                    currentTrapezoidIndex: 0,
                    completedRows: []
                }));
                
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
            const combined = composer.combinePatterns(panel, colorworkPattern!);
            console.log('Combined pattern created:', combined);
            console.log('Stitch plan:', (combined as any).stitchPlan);
            console.log('Has generateKnittingInstructions?', typeof (combined as any).stitchPlan?.generateKnittingInstructions);
            setCombinedPattern(combined);

            // Generate instructions
            const generator = new InstructionGenerator();
            const generatedInstructions = generator.generateInstructions(combined);
            setInstructions(generatedInstructions);

            // Reset progress when changing panels in Redux
            dispatch(updateKnittingProgress({
                currentRowIndex: 0,
                currentPanelIndex: knittingProgress.currentPanelIndex,
                currentTrapezoidIndex: 0,
                completedRows: []
            }));

        } catch (error) {
            console.error('Error generating combined pattern:', error);
            setCombinedPattern(null);
            setInstructions([]);
        }
    }, [projectPanels, knittingProgress.currentPanelIndex, location.state, knittingOptions, dispatch]);

    const handleRowComplete = (rowIndex: number) => {
        // Add to completed rows and advance current row in Redux
        dispatch(addCompletedRow(rowIndex));
        
        const totalRows = instructions.length || (combinedPattern?.stitchPlan?.rows?.length) || 0;
        const nextRow = Math.min(rowIndex + 1, totalRows - 1);
        dispatch(setCurrentRowIndex(nextRow));
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
                                value={knittingProgress.currentPanelIndex}
                                onChange={(value: number) => dispatch(setCurrentPanelIndex(value))}
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
