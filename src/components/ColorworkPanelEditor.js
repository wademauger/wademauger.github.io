import React, { useState, useEffect } from 'react';
import { Card, Button, Select, Radio, Row, Col, Space, Typography, Divider, ColorPicker, InputNumber, Switch, Collapse } from 'antd';
import { ColorworkPattern } from '../models/ColorworkPattern.js';
import { PanelColorworkComposer, CombinedPattern } from '../models/PanelColorworkComposer.js';
import { InstructionGenerator } from '../models/InstructionGenerator.js';
import { Trapezoid } from '../models/Trapezoid.js';
import { Panel } from '../models/Panel.js';
import { Gauge } from '../models/Gauge.js';
import { PanelDiagram } from './PanelDiagram.js';
import { ColorworkPanelDiagram } from './ColorworkPanelDiagram.js';
import ColorworkCanvasEditor from './ColorworkCanvasEditor.js';
import CombinedView from './CombinedView.js';
import './ColorworkPanelEditor.css';

const { Title, Text } = Typography;
const { Option } = Select;

/**
 * ColorworkPanelEditor - Main component for combining panels with colorwork
 * Now supports two-stage workflow: Settings/Preview -> Interactive Knitting
 */
const ColorworkPanelEditor = ({
    initialPanel = null,
    initialColorwork = null,
    project = null,
    onSave = null,
    onCancel = null
}) => {
    // Workflow state: 'settings' or 'knitting'
    const [currentStage, setCurrentStage] = useState('settings');

    // Progress tracking for interactive knitting
    const [knittingProgress, setKnittingProgress] = useState({
        currentRow: 0,
        completedRows: [],
        currentSection: 0
    });

    // State for panel configuration
    const [panelConfig, setPanelConfig] = useState(() => {
        // Use project.panelShape directly since that's where the garment shape data is stored
        const shape = convertToTrapezoid(project?.panelShape || initialPanel?.shape) || createDefaultShape();
        
        return {
            shape: shape,
            gauge: initialPanel?.gauge || new Gauge(19, 30),
            sizeModifier: initialPanel?.sizeModifier || 1
        };
    });

    // State for colorwork pattern
    const [colorworkPattern, setColorworkPattern] = useState(
        initialColorwork || createDefaultColorwork()
    );

    // Available colorwork patterns
    const [availablePatterns] = useState({
        'solid': { name: 'Solid Color', pattern: createSolidPattern() },
        'stripes': { name: 'Stripes', pattern: createStripesPattern() },
        'checkerboard': { name: 'Checkerboard', pattern: createCheckerboardPattern() },
        'argyle': { name: 'Argyle', pattern: createArgylePattern() }
    });

    const [selectedPatternKey, setSelectedPatternKey] = useState('checkerboard');

    // Color assignment state
    const [patternColors, setPatternColors] = useState(['#ffffff', '#000000']); // Default colors

    // Pattern layers state for complex colorwork compositions
    const [patternLayers, setPatternLayers] = useState([
        {
            id: 1,
            name: 'Base Pattern',
            pattern: null,
            priority: 1,
            settings: {
                repeatMode: 'none',
                repeatCountX: 0, // 0 means infinite
                repeatCountY: 0, // 0 means infinite
                offsetHorizontal: 0,
                offsetVertical: 0
            }
        }
    ]);

    // State for combination settings
    const [combinationSettings, setCombinationSettings] = useState({
        stretchMode: 'repeat',
        alignmentMode: 'center',
        instructionFormat: 'compact' // Default to compact as requested
    });

    // State for the combined result
    const [combinedPattern, setCombinedPattern] = useState(null);
    const [instructions, setInstructions] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);

    // Composers and generators
    const [composer] = useState(new PanelColorworkComposer());
    const [instructionGenerator] = useState(new InstructionGenerator());

    // Generate combined pattern when settings change (make this synchronous and fast)
    useEffect(() => {
        generateCombinedPattern();
    }, [panelConfig, colorworkPattern, combinationSettings, patternColors, patternLayers]);

    // Initialize with default pattern
    useEffect(() => {
        if (!colorworkPattern) {
            handlePatternChange('checkerboard');
        } else if (patternLayers[0] && !patternLayers[0].pattern) {
            // Initialize first layer with current pattern
            setPatternLayers(prev => prev.map((layer, index) => 
                index === 0 ? { ...layer, pattern: colorworkPattern } : layer
            ));
        }
    }, [colorworkPattern, patternLayers]);

    const generateCombinedPattern = () => {
        if (!panelConfig.shape || !colorworkPattern) {
            setIsGenerating(false);
            return;
        }

        setIsGenerating(true);
        try {
            // Convert patternColors array to colors object format
            const colorsObject = {};
            patternColors.forEach((color, index) => {
                colorsObject[index] = {
                    id: index,
                    label: `Color ${index + 1}`,
                    color: color
                };
            });

            // Update pattern colors
            const updatedPattern = new ColorworkPattern(
                colorworkPattern.grid,
                colorsObject,
                {
                    width: colorworkPattern.metadata?.width || colorworkPattern.getStitchCount?.() || 8,
                    height: colorworkPattern.metadata?.height || colorworkPattern.getRowCount?.() || 8
                }
            );

            const panel = new Panel(panelConfig.shape, panelConfig.gauge, panelConfig.sizeModifier);
            const combined = composer.combinePatterns(panel, updatedPattern, combinationSettings);
            const generatedInstructions = instructionGenerator.generateInstructions(
                combined,
                combinationSettings.instructionFormat
            );

            setCombinedPattern(combined);
            setInstructions(generatedInstructions);
            setColorworkPattern(updatedPattern);
        } catch (error) {
            console.error('Error generating combined pattern:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handlePanelConfigChange = (key, value) => {
        setPanelConfig(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleCombinationSettingsChange = (key, value) => {
        setCombinationSettings(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handlePatternChange = (patternKey) => {
        setSelectedPatternKey(patternKey);
        const selectedPattern = availablePatterns[patternKey];
        if (selectedPattern) {
            setColorworkPattern(selectedPattern.pattern);

            // Update the first layer with the new pattern
            setPatternLayers(prev => prev.map((layer, index) => 
                index === 0 ? { ...layer, pattern: selectedPattern.pattern } : layer
            ));

            // Set default colors based on pattern
            const colorCount = selectedPattern.pattern.getColorsUsed().length;
            const defaultColors = ['#ffffff', '#000000', '#ff0000', '#00ff00', '#0000ff'].slice(0, colorCount);
            setPatternColors(defaultColors);
        }
    };

    const handleLayerSettingChange = (layerId, settingKey, value) => {
        setPatternLayers(prev => prev.map(layer => 
            layer.id === layerId 
                ? { ...layer, settings: { ...layer.settings, [settingKey]: value } }
                : layer
        ));
    };

    const addPatternLayer = () => {
        const newLayer = {
            id: Date.now(),
            name: `Pattern ${patternLayers.length + 1}`,
            pattern: createCheckerboardPattern(),
            priority: patternLayers.length + 1,
            settings: {
                repeatHorizontal: true,
                repeatVertical: true,
                offsetHorizontal: 0,
                offsetVertical: 0
            }
        };
        setPatternLayers(prev => [...prev, newLayer]);
    };

    const removePatternLayer = (layerId) => {
        if (patternLayers.length > 1) {
            setPatternLayers(prev => prev.filter(layer => layer.id !== layerId));
        }
    };

    const handleColorChange = (colorIndex, newColor) => {
        const newColors = [...patternColors];
        newColors[colorIndex] = typeof newColor === 'string' ? newColor : newColor.toHexString();
        setPatternColors(newColors);
    };

    const handleSave = () => {
        if (onSave && combinedPattern) {
            onSave({
                combinedPattern,
                instructions,
                knittingProgress,
                metadata: {
                    created: new Date().toISOString(),
                    panelConfig,
                    combinationSettings,
                    stage: currentStage
                }
            });
        }
    };

    // Workflow transition functions
    const handleStartKnitting = () => {
        setCurrentStage('knitting');
        setKnittingProgress({
            currentRow: 0,
            completedRows: [],
            currentSection: 0
        });
    };

    const handleBackToSettings = () => {
        setCurrentStage('settings');
    };

    const handleRowComplete = (rowIndex) => {
        setKnittingProgress(prev => ({
            ...prev,
            currentRow: rowIndex + 1,
            completedRows: [...prev.completedRows, rowIndex]
        }));
    };

    // Render functions for different stages
    const renderSettingsView = () => (
        <div className="colorwork-settings-view">
            <ColorworkCanvasEditor
                shape={panelConfig.shape}
                patternLayers={patternLayers.filter(layer => layer.pattern)}
                gauge={panelConfig.gauge}
                onLayersChange={setPatternLayers}
                onGaugeChange={(newGauge) => handlePanelConfigChange('gauge', newGauge)}
            />
            
            <div className="settings-actions" style={{ 
                position: 'fixed', 
                bottom: 0, 
                left: 0, 
                right: 0, 
                padding: '16px 24px', 
                background: 'white', 
                borderTop: '1px solid #f0f0f0',
                zIndex: 1000
            }}>
                <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
                    <Space size="large">
                        <Button onClick={onCancel}>Cancel</Button>
                        <Button
                            type="primary"
                            size="large"
                            onClick={handleStartKnitting}
                            disabled={!combinedPattern || isGenerating}
                        >
                            Start Knitting →
                        </Button>
                    </Space>
                </div>
            </div>
        </div>
    );

    const renderKnittingView = () => (
        <div className="interactive-knitting-view">
            <div className="knitting-header">
                <Button onClick={handleBackToSettings}>← Back to Settings</Button>
                <Title level={2}>Interactive Knitting</Title>
                <Text>
                    Row {knittingProgress.currentRow + 1} of {instructions.length}
                </Text>
            </div>

            <Row gutter={[16, 16]}>
                {/* Progress Tracking */}
                <Col xs={24} lg={8}>
                    <Card title="Progress" className="progress-card">
                        <div className="progress-info">
                            <Text strong>Current Row: {knittingProgress.currentRow + 1}</Text>
                            <br />
                            <Text>Completed: {knittingProgress.completedRows.length} rows</Text>
                            <div style={{ marginTop: 16 }}>
                                <Button
                                    type="primary"
                                    onClick={() => handleRowComplete(knittingProgress.currentRow)}
                                    disabled={knittingProgress.currentRow >= instructions.length}
                                >
                                    Mark Row Complete
                                </Button>
                            </div>
                        </div>
                    </Card>
                </Col>

                {/* Full Instructions & Visual */}
                <Col xs={24} lg={16}>
                    <Card title="Instructions & Visual" className="instructions-card">
                        <CombinedView
                            combinedPattern={combinedPattern}
                            instructions={instructions}
                            isLoading={isGenerating}
                            currentRow={knittingProgress.currentRow}
                            completedRows={knittingProgress.completedRows}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );

    return (
        <div className="colorwork-panel-editor">
            {currentStage === 'settings' && renderSettingsView()}
            {currentStage === 'knitting' && renderKnittingView()}
        </div>
    );
};

// Helper functions
function convertToTrapezoid(shape) {
    if (!shape) return null;
    if (shape instanceof Trapezoid) return shape;

    // Convert plain object to Trapezoid - preserving the complex structure
    if (typeof shape === 'object') {
        // Handle garment shapes from garments.js - convert to proper Trapezoid instances
        // while preserving the successor structure
        const convertShapeRecursively = (shapeData) => {
            if (!shapeData) return null;
            
            const height = shapeData.height || 0;
            const baseA = shapeData.baseA || 0;
            const baseB = shapeData.baseB || 0;
            const offset = shapeData.baseBHorizontalOffset || 0;
            const finishingSteps = shapeData.finishingSteps || [];
            
            // Convert successors recursively
            const successors = [];
            if (shapeData.successors && Array.isArray(shapeData.successors)) {
                shapeData.successors.forEach(successor => {
                    const convertedSuccessor = convertShapeRecursively(successor);
                    if (convertedSuccessor) {
                        successors.push(convertedSuccessor);
                    }
                });
            }
            
            return new Trapezoid(height, baseA, baseB, offset, successors, finishingSteps);
        };
        
        return convertShapeRecursively(shape);
    }
    return null;
}

function createDefaultShape() {
    return new Trapezoid(40, 20, 30, 0);  // height=40, baseA=20, baseB=30, offset=0
}

function createDefaultColorwork() {
    return new ColorworkPattern(
        [
            [0, 1, 0, 1, 0, 1, 0, 1],
            [1, 0, 1, 0, 1, 0, 1, 0],
            [0, 1, 0, 1, 0, 1, 0, 1],
            [1, 0, 1, 0, 1, 0, 1, 0],
            [0, 1, 0, 1, 0, 1, 0, 1],
            [1, 0, 1, 0, 1, 0, 1, 0],
            [0, 1, 0, 1, 0, 1, 0, 1],
            [1, 0, 1, 0, 1, 0, 1, 0]
        ],
        { 0: { id: 0, label: 'Color 1', color: '#ffffff' }, 1: { id: 1, label: 'Color 2', color: '#000000' } },
        { width: 8, height: 8 }
    );
}

function createSolidPattern() {
    return new ColorworkPattern(
        [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ],
        { 0: { id: 0, label: 'Color 1', color: '#ffffff' } },
        { width: 4, height: 4 }
    );
}

function createStripesPattern() {
    return new ColorworkPattern(
        [
            [0, 0, 1, 1, 0, 0],
            [0, 0, 1, 1, 0, 0],
            [1, 1, 0, 0, 1, 1],
            [1, 1, 0, 0, 1, 1]
        ],
        { 0: { id: 0, label: 'Color 1', color: '#ffffff' }, 1: { id: 1, label: 'Color 2', color: '#0066cc' } },
        { width: 6, height: 4 }
    );
}

function createCheckerboardPattern() {
    return new ColorworkPattern(
        [
            [0, 1, 0, 1, 0, 1, 0, 1],
            [1, 0, 1, 0, 1, 0, 1, 0],
            [0, 1, 0, 1, 0, 1, 0, 1],
            [1, 0, 1, 0, 1, 0, 1, 0],
            [0, 1, 0, 1, 0, 1, 0, 1],
            [1, 0, 1, 0, 1, 0, 1, 0],
            [0, 1, 0, 1, 0, 1, 0, 1],
            [1, 0, 1, 0, 1, 0, 1, 0]
        ],
        { 0: { id: 0, label: 'Color 1', color: '#ffffff' }, 1: { id: 1, label: 'Color 2', color: '#000000' } },
        { width: 8, height: 8 }
    );
}

function createArgylePattern() {
    return new ColorworkPattern(
        [
            [0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0],
            [0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0],
            [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
            [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
            [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
            [0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0],
            [0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0]
        ],
        { 0: { id: 0, label: 'Color 1', color: '#ffffff' }, 1: { id: 1, label: 'Color 2', color: '#cc0000' } },
        { width: 12, height: 12 }
    );
}

export default ColorworkPanelEditor;
