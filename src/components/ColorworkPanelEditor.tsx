import React, { useState, useEffect, forwardRef, useImperativeHandle, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ColorworkPattern } from '../models/ColorworkPattern';
import { PanelColorworkComposer } from '../models/PanelColorworkComposer';
import { InstructionGenerator } from '../models/InstructionGenerator';
import { Trapezoid } from '../models/Trapezoid';
import { Panel } from '../models/Panel';
import { Gauge } from '../models/Gauge';
import { updatePanelPatternLayers } from '../store/knittingDesignSlice';
import ColorworkCanvasEditor from './ColorworkCanvasEditor';
import InteractiveKnittingView from './InteractiveKnittingView';
import './ColorworkPanelEditor.css';

/**
 * ColorworkPanelEditor - Main component for combining panels with colorwork
 * Now supports two-stage workflow: Settings/Preview -> Interactive Knitting
 */
const ColorworkPanelEditor = forwardRef(({ 
    initialPanel = null,
    initialColorwork = null,
    project = null,
    previewKey = null, // Panel key for storing/retrieving pattern layers
    allSelectedPanelKeys = [], // All selected panel keys for applying patterns to multiple panels
    stage, // optional controlled stage from parent: 'settings' | 'knitting'
    onStageChange = null
}, ref) => {
    const dispatch = useDispatch();
    
    // Workflow state: allow controlled via prop, fallback to internal state
    const [internalStage, setInternalStage] = useState('settings');
    const currentStage = stage ?? internalStage;
    
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

    // State for colorwork pattern (base layer); layers/editor may augment this
    const colorworkPattern = useMemo(() => initialColorwork || createDefaultColorwork(), [initialColorwork]);

    // Derive colors from global colorworkGrid Redux slice for consistency across apps
    // Falls back to a single soft gray if slice is unavailable
    const reduxColorsArray = useSelector((state: any) => {
        const colors = state?.colorworkGrid?.colors;
        return colors ? Object.values(colors) : null;
    });
    const patternColors = useMemo(() => {
        if (reduxColorsArray && reduxColorsArray.length > 0) {
            return reduxColorsArray.map((c: any) => c.color);
        }
        return ['#cfcfcf'];
    }, [reduxColorsArray]);

    // Get pattern layers from Redux, keyed by previewKey (panel identifier)
    const reduxPatternLayers = useSelector((state: any) => {
        if (!previewKey) return null;
        return state?.knittingDesign?.patternData?.panels?.patternLayers?.[previewKey];
    });

    // Initialize pattern layers from Redux or use default
    const getDefaultPatternLayers = () => {
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
    };

    // Pattern layers state - use Redux if available, otherwise local state
    const [patternLayers, setPatternLayersLocal] = useState(() => {
        return reduxPatternLayers || getDefaultPatternLayers();
    });
    
    // Update pattern layers function that syncs to Redux
    const setPatternLayers = (nextLayers: any) => {
        setPatternLayersLocal((currentLayers: any[]) => {
            const resolvedLayers = typeof nextLayers === 'function' ? nextLayers(currentLayers) : nextLayers;

            if (previewKey) {
                dispatch(updatePanelPatternLayers({ panelKey: previewKey, layers: resolvedLayers }));
            }

            return resolvedLayers;
        });
    };
    
    // Sync from Redux when previewKey or reduxPatternLayers change
    useEffect(() => {
        if (reduxPatternLayers) {
            setPatternLayersLocal(reduxPatternLayers);
        }
    }, [previewKey, reduxPatternLayers]);

    // State for combination settings (stable identity)
    const combinationSettings = useMemo(() => ({
        stretchMode: 'repeat',
        alignmentMode: 'center',
        instructionFormat: 'compact'
    }), []);

    // State for the combined result
    const [combinedPattern, setCombinedPattern] = useState(null);
    const [instructions, setInstructions] = useState([]);

    // Composers and generators
    const [composer] = useState(new PanelColorworkComposer());
    const [instructionGenerator] = useState(new InstructionGenerator());

    // Generate combined pattern when settings change (make this synchronous and fast)
    useEffect(() => {
        generateCombinedPattern();
    }, [panelConfig, colorworkPattern, combinationSettings, patternColors]);

    // When project or initialPanel changes, update panel configuration
    useEffect(() => {
        const shape = convertToTrapezoid(project?.panelShape || initialPanel?.shape) || createDefaultShape();
        setPanelConfig(prev => ({
            ...prev,
            shape,
            gauge: initialPanel?.gauge || prev.gauge,
            sizeModifier: initialPanel?.sizeModifier || prev.sizeModifier
        }));
    }, [project?.id, initialPanel?.gauge, initialPanel?.shape, initialPanel?.sizeModifier]);

    const generateCombinedPattern = () => {
        if (!panelConfig.shape || !colorworkPattern) {
            return;
        }
        try {
            // Convert patternColors array to colors object format
            const colorsObject = {};
            patternColors.forEach((color, index: number) => {
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
        } catch (error: unknown) {
            console.error('Error generating combined pattern:', error);
        }
    };

    const handlePanelConfigChange = (key, value: any) => {
        setPanelConfig(prev => ({
            ...prev,
            [key]: value
        }));
    };

    // Workflow transition functions
    const setStage = (next) => {
        if (onStageChange) onStageChange(next);
        if (stage === undefined) setInternalStage(next);
    };

    const handleStartKnitting = () => {
        setStage('knitting');
        setKnittingProgress({
            currentRow: 0,
            completedRows: [],
            currentSection: 0
        });
    };

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
        startKnitting: handleStartKnitting
    }));

    const handleBackToSettings = () => {
        setStage('settings');
    };

    const handleRowComplete = (rowIndex) => {
        setKnittingProgress(prev => ({
            ...prev,
            currentRow: Math.min(rowIndex + 1, instructions.length - 1),
            completedRows: [...prev.completedRows, rowIndex]
        }));
    };

    // Apply current pattern layers to all selected panels
    const handleApplyToAllPanels = () => {
        if (!previewKey || !allSelectedPanelKeys || allSelectedPanelKeys.length === 0) {
            return;
        }

        // Get current pattern layers from local state
        const currentLayers = patternLayers;

        // Apply to all other selected panels (excluding the current one)
        allSelectedPanelKeys.forEach((panelKey) => {
            if (panelKey !== previewKey) {
                dispatch(updatePanelPatternLayers({ panelKey, layers: currentLayers }));
            }
        });
    };

    // Render functions for different stages
    const renderSettingsView = () => (
        <div className="colorwork-settings-view">
            {allSelectedPanelKeys && allSelectedPanelKeys.length > 1 && (
                <div style={{ marginBottom: 16, padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
                    <Space>
                        <Button 
                            type="primary" 
                            onClick={handleApplyToAllPanels}
                            disabled={!previewKey}
                        >
                            Apply Pattern to All {allSelectedPanelKeys.length} Panels
                        </Button>
                        <Text type="secondary">
                            This will copy the current colorwork pattern to all selected panels
                        </Text>
                    </Space>
                </div>
            )}
            <ColorworkCanvasEditor
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
                shapeData.successors.forEach((successor: any) => {
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

export default ColorworkPanelEditor;
