import React, { useState, useEffect, forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import { Button, Space, Typography } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { ColorworkPattern } from '../models/ColorworkPattern';
import { CombinedPattern, PanelColorworkComposer } from '../models/PanelColorworkComposer';
import { CombinedInstruction, InstructionGenerator } from '../models/InstructionGenerator';
import { Trapezoid } from '../models/Trapezoid';
import { Panel } from '../models/Panel';
import { Gauge } from '../models/Gauge';
import { updatePanelPatternLayers } from '../store/knittingDesignSlice';
import ColorworkCanvasEditor from './ColorworkCanvasEditor';
import InteractiveKnittingView from './InteractiveKnittingView';
import { ColorworkPanelDiagram } from './ColorworkPanelDiagram';
import './ColorworkPanelEditor.css';

const { Text } = Typography;

type StageType = 'settings' | 'knitting';

export interface ColorworkPanelEditorHandle {
    startKnitting: () => void;
}

interface PanelLike {
    shape?: Trapezoid | unknown;
    gauge?: Gauge;
    sizeModifier?: number;
}

interface ProjectLike {
    id?: string;
    panelShape?: unknown;
}

interface ColorworkPanelEditorProps {
    initialPanel?: PanelLike | null;
    initialColorwork?: ColorworkPattern | null;
    project?: ProjectLike | null;
    previewKey?: string | null;
    allSelectedPanelKeys?: string[];
    stage?: StageType;
    onStageChange?: (nextStage: StageType) => void;
    getPanelLabel?: (panelKey: string) => string;
    onRequestPreviewKeyChange?: (panelKey: string | null) => void;
}

interface PanelConfig {
    shape: Trapezoid | null;
    gauge: Gauge;
    sizeModifier: number;
}

interface CombinationSettings {
    stretchMode: 'repeat' | 'stretch' | 'center';
    alignmentMode: 'center' | 'left' | 'right';
    instructionFormat: string;
}

interface KnittingProgress {
    currentRow: number;
    completedRows: number[];
    currentSection: number;
}

type PatternLayer = {
    id: string | number;
    name: string;
    pattern: ColorworkPattern;
    patternType: string;
    patternConfig?: any;
    priority?: number;
    settings?: any;
};

interface PanelSnapshot {
    panelKey: string;
    label: string;
    layers: PatternLayer[];
    gauge: { stitchesPerFourInches: number; rowsPerFourInches: number; scalingFactor?: number } | null;
    shape: any;
    timestamp: number;
}

/**
 * ColorworkPanelEditor - Main component for combining panels with colorwork
 * Now supports two-stage workflow: Settings/Preview -> Interactive Knitting
 */
const ColorworkPanelEditor = forwardRef<ColorworkPanelEditorHandle, ColorworkPanelEditorProps>((props, ref) => {
    const {
        initialPanel = null,
        initialColorwork = null,
        project = null,
        previewKey = null,
        allSelectedPanelKeys = [],
        stage,
        onStageChange,
        getPanelLabel,
        onRequestPreviewKeyChange
    } = props;
    const dispatch = useDispatch();

    const [capturedPanels, setCapturedPanels] = useState<PanelSnapshot[]>([]);
    const lastAppliedLayersRef = useRef<PatternLayer[] | null>(null);
    const templateLayersRef = useRef<PatternLayer[] | null>(null);
    const prevPreviewKeyRef = useRef<string | null>(previewKey ?? null);
    
    // Workflow state: allow controlled via prop, fallback to internal state
    const [internalStage, setInternalStage] = useState<StageType>('settings');
    const currentStage: StageType = stage ?? internalStage;
    
    // Progress tracking for interactive knitting
    const [knittingProgress, setKnittingProgress] = useState<KnittingProgress>({
        currentRow: 0,
        completedRows: [],
        currentSection: 0
    });

    // State for panel configuration
    const [panelConfig, setPanelConfig] = useState<PanelConfig>(() => {
        // Use project.panelShape directly since that's where the garment shape data is stored
        const shape = convertToTrapezoid(project?.panelShape || initialPanel?.shape) || createDefaultShape();
        
        return {
            shape: shape,
            gauge: initialPanel?.gauge || new Gauge(19, 30),
            sizeModifier: initialPanel?.sizeModifier || 1
        };
    });

    // State for colorwork pattern (base layer); layers/editor may augment this
    const colorworkPattern = useMemo<ColorworkPattern>(() => initialColorwork || createDefaultColorwork(), [initialColorwork]);

    // Derive colors from global colorworkGrid Redux slice for consistency across apps
    // Falls back to a single soft gray if slice is unavailable
    const reduxColorsMap = useSelector((state: any) => state?.colorworkGrid?.colors);
    const patternColors = useMemo(() => {
        const colorsArray = reduxColorsMap ? Object.values(reduxColorsMap) : null;
        if (colorsArray && colorsArray.length > 0) {
            return colorsArray.map((c: any) => c.color);
        }
        return ['#cfcfcf'];
    }, [reduxColorsMap]);

    const currentPanelIndex = useMemo(() => {
        if (!previewKey) return -1;
        return allSelectedPanelKeys.findIndex((key) => key === previewKey);
    }, [previewKey, allSelectedPanelKeys]);

    const hasNextPanel = currentPanelIndex > -1 && currentPanelIndex < allSelectedPanelKeys.length - 1;
    const nextPanelKey = hasNextPanel ? allSelectedPanelKeys[currentPanelIndex + 1] : null;

    const currentPanelLabel = useMemo(() => {
        if (!previewKey) return '';
        if (getPanelLabel) {
            return getPanelLabel(previewKey) || previewKey;
        }
        return previewKey;
    }, [previewKey, getPanelLabel]);

    const currentPanelPosition = currentPanelIndex >= 0 ? currentPanelIndex + 1 : 0;

    const defaultGaugeSnapshot = useMemo(() => {
        if (!panelConfig.gauge) return null;
        const gaugeAny = panelConfig.gauge as any;
        return {
            stitchesPerFourInches: typeof gaugeAny?.stitchesPerFourInches === 'number'
                ? gaugeAny.stitchesPerFourInches
                : panelConfig.gauge.getStitchesPerInch() * 4,
            rowsPerFourInches: typeof gaugeAny?.rowsPerFourInches === 'number'
                ? gaugeAny.rowsPerFourInches
                : panelConfig.gauge.getRowsPerInch() * 4,
            scalingFactor: typeof gaugeAny?.scalingFactor === 'number' ? gaugeAny.scalingFactor : 1
        };
    }, [panelConfig.gauge]);

    // Get pattern layers from Redux, keyed by previewKey (panel identifier)
    const reduxPatternLayers = useSelector((state: any) => {
        if (!previewKey) return null;
        return state?.knittingDesign?.patternData?.panels?.patternLayers?.[previewKey];
    }) as PatternLayer[] | null;

    // Initialize pattern layers from Redux or use default
    const getDefaultPatternLayers = (): PatternLayer[] => {
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
    const [patternLayers, setPatternLayersLocal] = useState<PatternLayer[]>(() => {
        return reduxPatternLayers || getDefaultPatternLayers();
    });
    
    // Update pattern layers function that syncs to Redux
    const setPatternLayers = (nextLayers: PatternLayer[] | ((currentLayers: PatternLayer[]) => PatternLayer[])) => {
        setPatternLayersLocal((currentLayers) => {
            const resolvedLayers = typeof nextLayers === 'function' ? nextLayers(currentLayers) : nextLayers;

            if (previewKey) {
                dispatch(updatePanelPatternLayers({ panelKey: previewKey, layers: resolvedLayers }));
            }

            return resolvedLayers;
        });
    };
    
    // Sync from Redux when previewKey or reduxPatternLayers change
    useEffect(() => {
        if (!previewKey) {
            prevPreviewKeyRef.current = null;
            return;
        }

        if (reduxPatternLayers) {
            setPatternLayersLocal(reduxPatternLayers);
            lastAppliedLayersRef.current = clonePatternLayersForDispatch(reduxPatternLayers);
            templateLayersRef.current = null;
        } else if (previewKey !== prevPreviewKeyRef.current) {
            const sourceLayers = templateLayersRef.current || lastAppliedLayersRef.current;
            const fallbackLayers = sourceLayers && Array.isArray(sourceLayers)
                ? clonePatternLayersForDispatch(sourceLayers)
                : getDefaultPatternLayers();
            setPatternLayers(fallbackLayers);
            templateLayersRef.current = null;
        }

        prevPreviewKeyRef.current = previewKey;
    }, [previewKey, reduxPatternLayers]);

    useEffect(() => {
        lastAppliedLayersRef.current = clonePatternLayersForDispatch(patternLayers);
    }, [patternLayers]);

    // State for combination settings (stable identity)
    const combinationSettings = useMemo<CombinationSettings>(() => ({
        stretchMode: 'repeat',
        alignmentMode: 'center',
        instructionFormat: 'compact'
    }), []);

    // State for the combined result
    const [combinedPattern, setCombinedPattern] = useState<CombinedPattern | null>(null);
    const [instructions, setInstructions] = useState<CombinedInstruction[]>([]);

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
            const colorsObject: Record<number, { id: number; label: string; color: string }> = {};
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
            ) as CombinedInstruction[];

            setCombinedPattern(combined);
            setInstructions(generatedInstructions);
        } catch (error: unknown) {
            console.error('Error generating combined pattern:', error);
        }
    };

    const handlePanelConfigChange = <K extends keyof PanelConfig>(key: K, value: PanelConfig[K]) => {
        setPanelConfig(prev => ({
            ...prev,
            [key]: value
        }));
    };

    // Workflow transition functions
    const setStage = (next: StageType) => {
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

    const handleRowComplete = (rowIndex: number) => {
        setKnittingProgress(prev => ({
            ...prev,
            currentRow: Math.min(rowIndex + 1, instructions.length - 1),
            completedRows: [...prev.completedRows, rowIndex]
        }));
    };

    const captureCurrentPanel = (layersOverride?: PatternLayer[]) => {
        if (!previewKey) {
            return;
        }

        const clonedLayers = clonePatternLayersForDispatch(layersOverride && Array.isArray(layersOverride) ? layersOverride : patternLayers);
        const gaugeAny = panelConfig.gauge as any;
        const gaugeSnapshot = panelConfig.gauge
            ? {
                stitchesPerFourInches: typeof gaugeAny?.stitchesPerFourInches === 'number'
                    ? gaugeAny.stitchesPerFourInches
                    : panelConfig.gauge.getStitchesPerInch() * 4,
                rowsPerFourInches: typeof gaugeAny?.rowsPerFourInches === 'number'
                    ? gaugeAny.rowsPerFourInches
                    : panelConfig.gauge.getRowsPerInch() * 4,
                scalingFactor: typeof gaugeAny?.scalingFactor === 'number' ? gaugeAny.scalingFactor : 1
            }
            : null;
        const shapeSnapshot = panelConfig.shape && typeof (panelConfig.shape as any)?.toJSON === 'function'
            ? (panelConfig.shape as any).toJSON()
            : panelConfig.shape;
        const label = currentPanelLabel || previewKey;

        setCapturedPanels((prev) => {
            const filtered = prev.filter((snapshot) => snapshot.panelKey !== previewKey);
            const nextSnapshots = [
                ...filtered,
                {
                    panelKey: previewKey,
                    label,
                    layers: clonedLayers,
                    gauge: gaugeSnapshot,
                    shape: shapeSnapshot,
                    timestamp: Date.now()
                }
            ];

            return nextSnapshots.sort((a, b) => {
                const indexA = allSelectedPanelKeys.indexOf(a.panelKey);
                const indexB = allSelectedPanelKeys.indexOf(b.panelKey);
                const safeIndexA = indexA === -1 ? Number.MAX_SAFE_INTEGER : indexA;
                const safeIndexB = indexB === -1 ? Number.MAX_SAFE_INTEGER : indexB;
                if (safeIndexA === safeIndexB) {
                    return a.timestamp - b.timestamp;
                }
                return safeIndexA - safeIndexB;
            });
        });
    };

    const handleNextPanel = () => {
        if (!previewKey) {
            return;
        }

        const template = clonePatternLayersForDispatch(patternLayers);
        templateLayersRef.current = template;
        captureCurrentPanel(template);

        if (hasNextPanel && nextPanelKey) {
            onRequestPreviewKeyChange?.(nextPanelKey);
        } else {
            templateLayersRef.current = null;
        }
    };

    // Render functions for different stages
    const renderSettingsView = () => (
        <div className="colorwork-settings-view">
            {capturedPanels.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                    <Text strong style={{ display: 'block', marginBottom: 8 }}>Captured panels</Text>
                    <Space size={16} wrap>
                        {capturedPanels.map((snapshot) => {
                            const hydratedShape = snapshot.shape instanceof Trapezoid
                                ? snapshot.shape
                                : (snapshot.shape ? Trapezoid.fromObject(snapshot.shape) : null);
                            const snapshotGauge = snapshot.gauge || defaultGaugeSnapshot;
                            return hydratedShape ? (
                                <ColorworkPanelDiagram
                                    key={snapshot.panelKey}
                                    shape={hydratedShape as any}
                                    patternLayers={snapshot.layers as any}
                                    gauge={snapshotGauge as any}
                                    label={snapshot.label}
                                    size={140}
                                    padding={8}
                                />
                            ) : null;
                        })}
                    </Space>
                </div>
            )}

            <div style={{
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 12
            }}>
                <Text strong>
                    {currentPanelLabel
                        ? `Editing ${currentPanelLabel}${allSelectedPanelKeys.length > 1 ? ` (${currentPanelPosition} of ${allSelectedPanelKeys.length})` : ''}`
                        : 'Select a panel to edit'}
                </Text>
                <Space>
                    {!hasNextPanel && previewKey && (
                        <Text type="secondary">All selected panels captured</Text>
                    )}
                    <Button
                        type="primary"
                        onClick={handleNextPanel}
                        disabled={!previewKey}
                    >
                        {hasNextPanel ? 'Save & Next Panel' : 'Save Panel'}
                    </Button>
                </Space>
            </div>

            <ColorworkCanvasEditor
                shape={panelConfig.shape as any}
                patternLayers={patternLayers as any}
                gauge={panelConfig.gauge as any}
                onLayersChange={(nextLayers: any) => setPatternLayers(nextLayers)}
                onGaugeChange={(newGauge: Gauge) => handlePanelConfigChange('gauge', newGauge)}
            />
        </div>
    );

    const renderKnittingView = () => (
        <InteractiveKnittingView
            combinedPattern={combinedPattern as any}
            instructions={instructions as any}
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
function convertToTrapezoid(shape: unknown): Trapezoid | null {
    if (!shape) return null;
    if (shape instanceof Trapezoid) return shape;

    // Convert plain object to Trapezoid - preserving the complex structure
    if (typeof shape === 'object') {
        // Handle garment shapes from garments.js - convert to proper Trapezoid instances
        // while preserving the successor structure
        const convertShapeRecursively = (shapeData: any): Trapezoid | null => {
            if (!shapeData) return null;
            
            const height = shapeData.height || 0;
            const baseA = shapeData.baseA || 0;
            const baseB = shapeData.baseB || 0;
            const offset = shapeData.baseBHorizontalOffset || 0;
            const finishingSteps = shapeData.finishingSteps || [];
            
            // Convert successors recursively
            const successors: Trapezoid[] = [];
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

function createDefaultShape(): Trapezoid {
    return new Trapezoid(40, 20, 30, 0);  // height=40, baseA=20, baseB=30, offset=0
}

function createDefaultColorwork(): ColorworkPattern {
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

function clonePatternLayersForDispatch(layers: PatternLayer[] | null | undefined): PatternLayer[] {
    if (!Array.isArray(layers)) {
        return [];
    }

    return layers.map((layer) => {
        const pattern = layer?.pattern;
        let clonedPattern = pattern;

        if (pattern instanceof ColorworkPattern) {
            clonedPattern = ColorworkPattern.fromJSON(pattern.toJSON());
        } else if (pattern && typeof pattern === 'object' && 'grid' in pattern) {
            clonedPattern = ColorworkPattern.fromJSON(pattern);
        }

        return {
            ...layer,
            pattern: clonedPattern,
            patternConfig: clonePlainObject(layer?.patternConfig),
            settings: clonePlainObject(layer?.settings)
        };
    });
}

function clonePlainObject<T>(value: T): T {
    if (value === null || value === undefined) {
        return value;
    }
    try {
        return JSON.parse(JSON.stringify(value)) as T;
    } catch (error) {
        console.warn('Failed to clone value, returning original reference', error);
        return value;
    }
}

export default ColorworkPanelEditor;
