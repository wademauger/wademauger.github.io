import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Card, Button, Select, Radio, Row, Col, Space, Typography, Divider } from 'antd';
import { ColorworkPattern } from '../models/ColorworkPattern.js';
import { PanelColorworkComposer, CombinedPattern } from '../models/PanelColorworkComposer.js';
import { InstructionGenerator } from '../models/InstructionGenerator.js';
import { Trapezoid } from '../models/Trapezoid.js';
import { Panel } from '../models/Panel.js';
import { Gauge } from '../models/Gauge.js';
import { PanelDiagram } from './PanelDiagram.js';
import ColorworkCanvasEditor from './ColorworkCanvasEditor.js';
import CombinedView from './CombinedView.js';
import InteractiveKnittingView from './InteractiveKnittingView.js';
import './ColorworkPanelEditor.css';

const { Title, Text } = Typography;
const { Option } = Select;

// Helper function for pattern configurations
function getDefaultConfigForPattern(patternType) {
    switch (patternType) {
        case 'solid':
            return { colors: [{ color: '#ffffff' }] };
        case 'stripes':
            return { 
                colors: [
                    { color: '#ffffff', rows: 2 }, 
                    { color: '#000000', rows: 2 }
                ], 
                width: 4 
            };
        case 'checkerboard':
            return { 
                cellSize: 2, 
                colors: [
                    { color: '#ffffff' }, 
                    { color: '#000000' }
                ] 
            };
        case 'argyle':
            return { 
                colors: [
                    { color: '#ffffff' }, 
                    { color: '#ff0000' }, 
                    { color: '#0000ff' }
                ] 
            };
        default:
            return { 
                colors: [
                    { color: '#ffffff' }, 
                    { color: '#000000' }
                ] 
            };
    }
}

/**
 * ColorworkPanelEditor - Main component for combining panels with colorwork
 * Now supports two-stage workflow: Settings/Preview -> Interactive Knitting
 */
const ColorworkPanelEditor = forwardRef(({ 
    initialPanel = null,
    initialColorwork = null,
    project = null,
    onSave = null,
    onCancel = null,
    onStageChange = null
}, ref) => {
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
    const [patternColors, setPatternColors] = useState(['#cfcfcf']); // Default to soft gray

    // Pattern layers state for complex colorwork compositions
    const [patternLayers, setPatternLayers] = useState(() => {
        // Default to a solid background that repeats in both directions
        const defaultSolid = new ColorworkPattern(
            0, 0,
            [
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0]
            ],
            { 0: { id: 0, label: 'Color 1', color: '#cfcfcf' } },
            { width: 4, height: 4 }
        );
        return [
            {
                id: 1,
                name: 'Base Pattern',
                pattern: defaultSolid,
                patternType: 'solid',
                patternConfig: { colors: [{ color: '#cfcfcf' }] },
                priority: 1,
                settings: {
                    repeatMode: 'both',
                    repeatCountX: 0, // 0 means infinite
                    repeatCountY: 0, // 0 means infinite
                    offsetHorizontal: 0,
                    offsetVertical: 0,
                    colorMapping: {}
                }
            }
        ];
    });

    // State for combination settings
    const [combinationSettings, setCombinationSettings] = useState({
        stretchMode: 'repeat',
        alignmentMode: 'center',
        instructionFormat: 'compact'
    });

    // State for the combined result
    const [combinedPattern, setCombinedPattern] = useState(null);
    const [instructions, setInstructions] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [renderKey, setRenderKey] = useState(0); // Force re-renders when needed

    // Composers and generators
    const [composer] = useState(new PanelColorworkComposer());
    const [instructionGenerator] = useState(new InstructionGenerator());

    // Generate combined pattern when settings change (make this synchronous and fast)
    useEffect(() => {
        generateCombinedPattern();
    }, [panelConfig, colorworkPattern, combinationSettings, patternColors]);

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
                0, 0,
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

            // Update the first layer with the new pattern and proper configuration
            setPatternLayers(prev => [...prev.map((layer, index) => 
                index === 0 ? { 
                    ...layer, 
                    pattern: selectedPattern.pattern,
                    patternType: patternKey,
                    patternConfig: getDefaultConfigForPattern(patternKey)
                } : { ...layer }
            )]);

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
        
        // Update pattern layers with new colors
        setPatternLayers(prev => [...prev.map(layer => {
            if (layer.patternConfig && layer.patternConfig.colors) {
                const updatedColors = layer.patternConfig.colors.map((colorConfig, index) => {
                    if (index === colorIndex && newColors[index]) {
                        return { ...colorConfig, color: newColors[index] };
                    }
                    return colorConfig;
                });
                return {
                    ...layer,
                    patternConfig: {
                        ...layer.patternConfig,
                        colors: updatedColors
                    }
                };
            }
            return layer;
        })]);
        
        // Force immediate update by incrementing a render key
        setRenderKey(prev => prev + 1);
    };

    const handleSave = () => {
        if (onSave && combinedPattern) {
            onSave({
                panel: panelConfig,
                colorwork: colorworkPattern,
                combined: combinedPattern,
                instructions: instructions,
                metadata: {
                    created: new Date().toISOString(),
                    settings: combinationSettings
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
        if (onStageChange) {
            onStageChange('knitting');
        }
    };

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
        startKnitting: handleStartKnitting
    }));

    const handleBackToSettings = () => {
        setCurrentStage('settings');
        if (onStageChange) {
            onStageChange('settings');
        }
    };

    const handleRowComplete = (rowIndex) => {
        setKnittingProgress(prev => ({
            ...prev,
            currentRow: Math.min(rowIndex + 1, instructions.length - 1),
            completedRows: [...prev.completedRows, rowIndex]
        }));
    };

    // Render functions for different stages
    const renderSettingsView = () => (
        <div className="colorwork-settings-view">
            <ColorworkCanvasEditor
                key={renderKey}
                shape={panelConfig.shape}
                patternLayers={patternLayers}
                gauge={panelConfig.gauge}
                onLayersChange={setPatternLayers}
                onGaugeChange={(newGauge) => handlePanelConfigChange('gauge', newGauge)}
            />
            
        </div>
    );

    const renderKnittingView = () => (
        <InteractiveKnittingView
            combinedPattern={combinedPattern}
            instructions={instructions}
            knittingProgress={knittingProgress}
            onRowComplete={handleRowComplete}
            onBackToSettings={handleBackToSettings}
        />
    );

    return (
        <div className="colorwork-panel-editor">
            {currentStage === 'settings' && renderSettingsView()}
            {currentStage === 'knitting' && renderKnittingView()}
        </div>
    );
});

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
        0, 0,
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
        0, 0,
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
        0, 0,
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
        0, 0,
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
        0, 0,
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
