import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { InputNumber, Input, Divider, Select, Collapse, Space, Typography, Card, message, Button, Spin } from 'antd';
import { EditOutlined, PlusOutlined, CopyOutlined, LoadingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { UnifiedPanelDiagram } from '../../../components/UnifiedPanelDiagram';
import { useDispatch, useSelector } from 'react-redux';
import { updatePatternData, selectPatternData, nextStep, previousStep, selectCurrentStep, copyPanelPatternLayers } from '../../../store/knittingDesignSlice';
import { garments } from '../../../data/garments';
import { loadFullLibrary, setFullLibrary, clearEntries } from '../../../store/librarySlice';
import { saveKnittingProject } from '../../../utils/libraryThunks';
import { useDriveAuth } from '../../colorwork-designer/context/DriveAuthContext';
import { calculatePanelDimensions } from '../utils/panelDimensions';
import { generateProjectTitle } from '../utils/ProjectTitlePlaceholderHelper';
import { usePanelInstances, usePanelSelection, usePanelShape } from '../hooks/usePanelState';
import PanelCard from './PanelCard';
import ColorworkEditorSection from './ColorworkEditorSection';
import PanelSummary from './PanelSummary';
import ColorworkPanelEditor from '../../../components/ColorworkPanelEditor';
import { PanelMetadata } from '../types/patternWizard.types';
import { generateConcreteStitchPlan, ConcreteStitchPlan } from '../../../utils/stitchPlanGenerator';
import '../styles/PatternWizard.css';

const WizardView: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const patternData: any = useSelector(selectPatternData);
  const currentStep: number = useSelector(selectCurrentStep) || 0;
  const [name, setName] = useState<string>(patternData?.name || '');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  
  // Get authentication state
  const { isSignedIn } = useDriveAuth();
  
  // Get library panels from global state
  const libraryData: any = useSelector((state: any) => state.library?.fullLibrary);

  // Load library when authentication state changes
  useEffect(() => {
    if (isSignedIn) {
      dispatch(loadFullLibrary() as any);
    } else {
      dispatch(setFullLibrary(null));
      dispatch(clearEntries());
    }
  }, [isSignedIn, dispatch]);

  // Build a flat list of panels from garments with unique keys
  const panelList = useMemo<PanelMetadata[]>(() => {
    const out: PanelMetadata[] = [];
    
    // Add panels from built-in garments
    (garments || []).forEach((g: any) => {
      const shapes = g.shapes || {};
      Object.keys(shapes).forEach((panelName) => {
        out.push({ 
          key: `${g.permalink}::${panelName}`, 
          garmentTitle: g.title, 
          garmentPermalink: g.permalink, 
          panelName 
        });
      });
    });
    
    // Add panels from user's library
    if (libraryData && libraryData.panels) {
      Object.keys(libraryData.panels).forEach((panelId) => {
        const panel = libraryData.panels[panelId];
        const panelName = panel.name || panelId;
        out.push({ 
          key: `library::${panelId}`, 
          garmentTitle: 'My Library', 
          garmentPermalink: 'library', 
          panelName 
        });
      });
    }
    
    return out;
  }, [libraryData]);

  // Use custom hooks for panel management
  const {
    panelCounts,
    selectedPanels: hookSelectedPanels,
    totalInstanceCount,
    updatePanelCount,
    addPanel,
    removePanel
  } = usePanelSelection(panelList);

  // Helper to set the count for a panel (wraps hook's updatePanelCount)
  const setCount = useCallback((panelKey: string, value: number | null) => {
    const next = typeof value === 'number' ? value : 0;
    updatePanelCount(panelKey, next);
  }, [updatePanelCount]);

  const {
    panelInstances,
    currentInstance,
    currentInstanceIndex,
    coloredInstances,
    markInstanceColored,
    goToNextInstance,
    goToPreviousInstance,
    setInstanceByIndex,
    copyInstanceColorwork,
    getPanelTypeStats,
    resetToFirstInstance
  } = usePanelInstances(hookSelectedPanels, panelCounts, panelList);

  const resolveLibraryPanel = useCallback((panels: any, panelId: string) => {
    if (!panels) return null;
    if (Array.isArray(panels)) {
      return panels.find((panel: any) => panel && (panel.id === panelId || panel.name === panelId));
    }
    if (typeof panels === 'object') {
      if (panels[panelId]) return panels[panelId];
      const asArray = Object.values(panels);
      return asArray.find((panel: any) => panel && (panel.id === panelId || panel.name === panelId)) || null;
    }
    return null;
  }, []);

  const getPanelShape = useCallback((panelKey: string | null) => {
    if (!panelKey) return null;
    const [permalink, rawPanelId = ''] = panelKey.split('::');

    if (permalink === 'library') {
      const panelData = resolveLibraryPanel(libraryData?.panels, rawPanelId);
      if (!panelData) return null;
      return panelData.shapes || panelData.shape || panelData.panelShape || null;
    }

    const garment = garments.find((g: any) => g.permalink === permalink);
    const garmentShapes = garment?.shapes || {};
    return garmentShapes ? (garmentShapes as any)[rawPanelId as any] : null;
  }, [libraryData?.panels, resolveLibraryPanel]);

  // Compute currently selected panel keys (where count > 0)
  const selectedPanels = useMemo(() => {
    return Object.keys(panelCounts).filter(k => (panelCounts[k] || 0) > 0);
  }, [panelCounts]);

  const getPanelLabelForKey = useCallback((panelKey: string) => {
    if (!panelKey) return '';
    const match = panelList.find(p => p.key === panelKey);
    if (match) {
      return `${match.garmentTitle} — ${match.panelName}`;
    }
    const [, panelName = 'Panel'] = panelKey.split('::');
    return panelName;
  }, [panelList]);

  // generate a placeholder string and cache it so it doesn't change on every render
  const cachedPlaceholderTitle = useMemo(() => generateProjectTitle(), []);

  // Helper functions for sequential colorwork editing
  // Helper functions for instance-based colorwork editing
  const getCurrentColorworkInstance = useCallback(() => {
    return panelInstances[currentInstanceIndex] || null;
  }, [panelInstances, currentInstanceIndex]);

  // Local set of colored panel instance ids (keeps parity with earlier code that
  // expected a `coloredPanels` set). The usePanelInstances hook also tracks
  // colored instances (coloredInstances) and exposes markInstanceColored; we can
  // mark both places for compatibility.
  const [coloredPanels, setColoredPanels] = useState<Set<string>>(new Set());
  const markPanelAsColored = useCallback((instanceId: string) => {
    setColoredPanels(prev => new Set([...Array.from(prev), instanceId]));
    try {
      // If the hook-provided marker exists, call it as well
      if (typeof markInstanceColored === 'function') markInstanceColored(instanceId);
    } catch (e) {
      // ignore
    }
  }, [markInstanceColored]);

  const handlePreviewKeyChange = useCallback((nextKey: string | null) => {
    setSelectedPanelKey(nextKey);
    dispatch(updatePatternData({ section: 'panels', data: { previewPanelKey: nextKey } }) as any);
  }, [dispatch]);

  // Ensure selectedPanelKey stays valid when selection changes
  const [selectedPanelKey, setSelectedPanelKey] = useState<string | null>(patternData?.panels?.previewPanelKey || null);
  useEffect(() => {
    // If the user has a persisted preview selection in redux and it's still available, respect it.
    const persisted = patternData?.panels?.previewPanelKey;
    if (persisted && selectedPanels.includes(persisted)) {
      if (selectedPanelKey !== persisted) setSelectedPanelKey(persisted);
      return;
    }

    if (!selectedPanelKey && selectedPanels.length > 0) {
      const pick = selectedPanels[0];
      setSelectedPanelKey(pick);
      // Persist a default preview selection so the choice survives navigation/reloads
      dispatch(updatePatternData({ section: 'panels', data: { previewPanelKey: pick } }) as any);
    }
    if (selectedPanelKey && !selectedPanels.includes(selectedPanelKey)) {
      // selected panel was removed, pick another or null and persist
      const pick = selectedPanels[0] || null;
      setSelectedPanelKey(pick);
      dispatch(updatePatternData({ section: 'panels', data: { previewPanelKey: pick } }) as any);
    }
  }, [selectedPanels, selectedPanelKey, patternData?.panels?.previewPanelKey]);

  // Collapsible state handled by AntD Collapse; 'more' toggle controls whether to show all garments
  const [showAllGarments, setShowAllGarments] = useState<boolean>(true);
  const [activeCollapseKeys, setActiveCollapseKeys] = useState<string[]>([]);

  // Keep track of previous step so we only initialize collapse keys on step transitions
  const prevStepRef = useRef<number | null>(null);
  useEffect(() => {
    const allTitles = Array.from(new Set(panelList.map(p => p.garmentTitle)));

    // Only run when currentStep or panelList change. Do NOT depend on panelCounts/selectedPanels
    // so that editing inputs inside a panel doesn't collapse it.
    if (prevStepRef.current === null || prevStepRef.current !== currentStep) {
      if (currentStep >= 1) {
        // On panel selection step, expand only garments that currently have selections
        const selectedGarmentTitles = Array.from(new Set(Object.keys(panelCounts)
          .filter(k => (panelCounts[k] || 0) > 0)
          .map(k => {
            const found = panelList.find(p => p.key === k);
            return found ? found.garmentTitle : null;
          }).filter(Boolean) as string[]));
        setActiveCollapseKeys(selectedGarmentTitles);
        setShowAllGarments(false);
      } else {
        // On setup step, keep all garment panels collapsed by default
        setActiveCollapseKeys([]);
        setShowAllGarments(true);
      }
      prevStepRef.current = currentStep;
    }
  }, [panelList, currentStep, panelCounts]);

  // Refs for each step so we can autoscroll when a new step appears
  const stepRefs = useRef<Array<HTMLDivElement | null>>([]);

  // When currentStep changes, scroll the bottom-most rendered step into view
  useEffect(() => {
    // Scroll to the currently-visible last step
    const ref = stepRefs.current[currentStep];
    if (ref && typeof ref.scrollIntoView === 'function') {
      // center the new section in view
      ref.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentStep]);

  // Persist full gauge (including derived per-4-inch values and scaleFactor) to redux
  const persistGauge = (nextFields: Partial<{ stitchesPerInch: number; rowsPerInch: number; scaleFactor: number }>) => {
    const current = (patternData && patternData.gauge) || {};
    const merged = { ...current, ...nextFields } as { stitchesPerInch?: number; rowsPerInch?: number; scaleFactor?: number };
    const scale = typeof merged.scaleFactor === 'number' ? merged.scaleFactor : (merged.scaleFactor ?? 1);
    const sPerInch = typeof merged.stitchesPerInch === 'number' ? merged.stitchesPerInch : (current.stitchesPerInch || 0);
    const rPerInch = typeof merged.rowsPerInch === 'number' ? merged.rowsPerInch : (current.rowsPerInch || 0);
    // Store base gauge (without scale applied) - scale is applied separately when rendering
    const stitchesPerFourInches = sPerInch * 4;
    const rowsPerFourInches = rPerInch * 4;

    const toPersist = {
      stitchesPerInch: sPerInch,
      rowsPerInch: rPerInch,
      scaleFactor: scale,
      stitchesPerFourInches,
      rowsPerFourInches
    };

    dispatch(updatePatternData({ section: 'gauge', data: toPersist }) as any);
  };

  const onGaugeChange = (field: 'stitchesPerInch' | 'rowsPerInch', value: number | null) => {
    if (value == null) return;
    // User enters per-4-inches, divide by 4 to get per-inch for storage
    const perInchValue = value / 4;
    persistGauge({ [field]: perInchValue } as any);
  };

  const onScaleChange = (value: number | null) => {
    if (value == null) return;
    persistGauge({ scaleFactor: value });
  };

  const onNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setName(v);
    dispatch(updatePatternData({ section: 'meta', data: { name: v } }) as any);
  };

  // Wrap navigation so we can jump and then scroll
  const goNext = () => {
    dispatch(nextStep() as any);
    // scrolling is handled by effect when currentStep updates from redux
  };
  const goPrev = () => dispatch(previousStep() as any);

  return (
    <div style={{ padding: 12 }}>
      {/* Render all steps up to and including currentStep so previous steps remain editable */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Step 0: Pattern name & gauge moved into the ColorworkDesigner toolbar.
            Keep a compact placeholder here so the step ref and scrolling behavior remain identical. */}
        {currentStep >= 0 && (
          <div
            ref={el => { stepRefs.current[0] = el; return; }}
            key="step-0"
            style={{ padding: 6, borderRadius: 6, background: 'transparent' }}
          >
            {/* Empty placeholder - controls are now rendered in the ColorworkDesignerApp toolbar */}
          </div>
        )}

        {/* Step 1: Select panels with previews and colorwork editing */}
        {currentStep >= 1 && (
          <div
            ref={el => { stepRefs.current[1] = el; return; }}
            key="step-1"
            style={{ padding: 12, borderRadius: 6, background: '#fff', marginTop: 4 }}
          >
            <Typography.Title level={4} style={{ margin: '0 0 16px 0' }}>
              Select Panels for Your Project
            </Typography.Title>
            
            {/* Panel selection with simplified UX */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {(() => {
                const groups: Record<string, Array<{ key: string; panelName: string }>> = {};
                panelList.forEach(p => {
                  if (!groups[p.garmentTitle]) groups[p.garmentTitle] = [];
                  groups[p.garmentTitle].push({ key: p.key, panelName: p.panelName });
                });

                const garmentTitles = Object.keys(groups);

                return (
                  <div>
                    {/* Group selector at the top */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                      <Typography.Title level={5} style={{ margin: 0 }}>
                        Add panels from:
                      </Typography.Title>
                      <Select
                        mode="multiple"
                        placeholder="Choose groups..."
                        value={activeCollapseKeys}
                        onChange={(values: string[]) => setActiveCollapseKeys(values)}
                        style={{ minWidth: 200, flex: 1 }}
                        allowClear
                        maxTagCount="responsive"
                      >
                        {garmentTitles.map(title => (
                          <Select.Option key={title} value={title}>
                            {title}
                          </Select.Option>
                        ))}
                      </Select>
                    </div>

                    {/* Grid showing all panels from all selected groups */}
                    {activeCollapseKeys.length > 0 && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                        {activeCollapseKeys.flatMap(groupTitle => 
                          (groups[groupTitle] || []).map(({ key, panelName }) => ({
                            key,
                            panelName,
                            groupTitle
                          }))
                        ).map(({ key, panelName, groupTitle }) => {
                          const isSelected = (panelCounts[key] || 0) > 0;
                          const count = panelCounts[key] || 0;
                          const shape = getPanelShape(key);
                          
                          return (
                            <Card
                              key={key}
                              style={{ 
                                borderColor: isSelected ? '#1890ff' : undefined,
                                boxShadow: isSelected ? '0 2px 8px rgba(24, 144, 255, 0.2)' : undefined,
                                cursor: !isSelected ? 'pointer' : undefined,
                                transition: 'all 0.2s'
                              }}
                              bodyStyle={{ padding: 12 }}
                              hoverable={!isSelected}
                              onClick={() => !isSelected && setCount(key, 1)}
                            >
                              {/* Group label when multiple groups selected */}
                              {activeCollapseKeys.length > 1 && (
                                <div style={{ fontSize: 10, color: '#999', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                  {groupTitle}
                                </div>
                              )}
                              {/* Panel header with name and quantity */}
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                <Typography.Text strong>{panelName}</Typography.Text>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <Typography.Text style={{ fontSize: 12, color: '#666' }}>Qty:</Typography.Text>
                                  <InputNumber
                                    size="small"
                                    min={0}
                                    max={10}
                                    value={count}
                                    onChange={(v: number | null) => setCount(key, v)}
                                    style={{ width: 60 }}
                                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
                                  />
                                </div>
                              </div>

                              {/* Panel preview diagram(s) - always show colorwork diagram */}
                              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12, minHeight: 120, flexWrap: 'wrap', gap: 8 }}>
                                {shape ? (
                                  count > 0 ? (
                                    // Show multiple instances with their individual colorwork
                                    Array.from({ length: count }, (_, i) => {
                                      const instanceId = `${key}::instance-${i + 1}`;
                                      // instancePatternData is the layers array directly, not an object with .layers property
                                      const instancePatternLayers = patternData?.panels?.patternLayers?.[instanceId] || [];
                                      
                                      // Prepare gauge with scale factor for ColorworkPanelDiagram
                                      const wizardGauge = patternData?.gauge || null;
                                      const stitchesPerFour = wizardGauge && typeof wizardGauge.stitchesPerFourInches === 'number'
                                        ? wizardGauge.stitchesPerFourInches
                                        : (wizardGauge && typeof wizardGauge.stitchesPerInch === 'number' ? wizardGauge.stitchesPerInch * 4 : undefined);
                                      const rowsPerFour = wizardGauge && typeof wizardGauge.rowsPerFourInches === 'number'
                                        ? wizardGauge.rowsPerFourInches
                                        : (wizardGauge && typeof wizardGauge.rowsPerInch === 'number' ? wizardGauge.rowsPerInch * 4 : undefined);
                                      const normalizedGauge = wizardGauge && typeof stitchesPerFour === 'number' && typeof rowsPerFour === 'number'
                                        ? {
                                            stitchesPerFourInches: stitchesPerFour,
                                            rowsPerFourInches: rowsPerFour,
                                            scalingFactor: typeof wizardGauge.scaleFactor === 'number' && wizardGauge.scaleFactor > 0 ? wizardGauge.scaleFactor : 1
                                          }
                                        : null;
                                      
                                      return (
                                        <div key={instanceId} style={{ position: 'relative', display: 'inline-block' }}>
                                          <UnifiedPanelDiagram
                                            shape={shape}
                                            patternLayers={normalizedGauge ? instancePatternLayers : []}
                                            gauge={normalizedGauge as any}
                                            label={count > 1 ? `#${i + 1}` : ''}
                                            size={count > 1 ? 80 : 100}
                                            padding={6}
                                            showPatterns={!!normalizedGauge}
                                            showLabels={false}
                                            showShortRows={true}
                                          />
                                        </div>
                                      );
                                    })
                                  ) : (
                                    // No instances selected, show preview with gauge if available
                                    (() => {
                                      const wizardGauge = patternData?.gauge || null;
                                      const stitchesPerFour = wizardGauge && typeof wizardGauge.stitchesPerFourInches === 'number'
                                        ? wizardGauge.stitchesPerFourInches
                                        : (wizardGauge && typeof wizardGauge.stitchesPerInch === 'number' ? wizardGauge.stitchesPerInch * 4 : undefined);
                                      const rowsPerFour = wizardGauge && typeof wizardGauge.rowsPerFourInches === 'number'
                                        ? wizardGauge.rowsPerFourInches
                                        : (wizardGauge && typeof wizardGauge.rowsPerInch === 'number' ? wizardGauge.rowsPerInch * 4 : undefined);
                                      const normalizedGauge = wizardGauge && typeof stitchesPerFour === 'number' && typeof rowsPerFour === 'number'
                                        ? {
                                            stitchesPerFourInches: stitchesPerFour,
                                            rowsPerFourInches: rowsPerFour,
                                            scalingFactor: typeof wizardGauge.scaleFactor === 'number' && wizardGauge.scaleFactor > 0 ? wizardGauge.scaleFactor : 1
                                          }
                                        : null;
                                      
                                      return (
                                        <UnifiedPanelDiagram
                                          shape={shape}
                                          patternLayers={normalizedGauge ? [] : []}
                                          gauge={normalizedGauge as any}
                                          label=""
                                          size={100}
                                          padding={8}
                                          showPatterns={!!normalizedGauge}
                                          showLabels={false}
                                          showShortRows={true}
                                        />
                                      );
                                    })()
                                  )
                                ) : (
                                  <div style={{ 
                                    width: 100, 
                                    height: 100, 
                                    backgroundColor: '#f5f5f5', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    borderRadius: 4,
                                    color: '#999'
                                  }}>
                                    No Preview
                                  </div>
                                )}
                              </div>

                              {/* Panel dimensions and gauge info */}
                              {shape && patternData?.gauge && (
                                <div style={{ fontSize: 11, color: '#666', marginBottom: 8, textAlign: 'center' }}>
                                  {(() => {
                                    try {
                                      const gauge = patternData.gauge || {};
                                      const scalingFactor = typeof gauge.scaleFactor === 'number' ? gauge.scaleFactor : 1;
                                      const dimensions = calculatePanelDimensions(shape, scalingFactor);
                                      if (!dimensions) return null;

                                      const stitchesPerInch = gauge.stitchesPerInch || 0;
                                      const rowsPerInch = gauge.rowsPerInch || 0;
                                      
                                      if (!stitchesPerInch || !rowsPerInch) return null;

                                      const totalStitches = Math.round(dimensions.widthInches * stitchesPerInch);
                                      const totalRows = Math.round(dimensions.heightInches * rowsPerInch);

                                      return `${totalStitches} × ${totalRows} stitches (${dimensions.widthInches.toFixed(1)}" × ${dimensions.heightInches.toFixed(1)}")`;
                                    } catch (error) {
                                      return null;
                                    }
                                  })()}
                                </div>
                              )}

                              {/* Instance buttons when count > 0 */}
                              {count > 0 && (
                                <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                                  {Array.from({ length: count }, (_, i) => {
                                    const instanceId = `${key}::instance-${i + 1}`;
                                    const isColored = coloredPanels.has(instanceId);
                                    const isCurrent = currentInstance?.instanceId === instanceId;
                                    
                                    return (
                                      <div key={instanceId} style={{ 
                                        display: 'flex', 
                                        gap: 4, 
                                        padding: 6, 
                                        backgroundColor: isCurrent ? '#e6f7ff' : isColored ? '#f6ffed' : '#fafafa',
                                        borderRadius: 4,
                                        border: `1px solid ${isCurrent ? '#91d5ff' : isColored ? '#b7eb8f' : '#d9d9d9'}`
                                      }}>
                                        <Typography.Text style={{ fontSize: 11, flex: 1, alignSelf: 'center' }}>
                                          {isColored ? '✓' : '○'} Instance {i + 1}
                                        </Typography.Text>
                                        <Button
                                          size="small"
                                          type={isCurrent ? 'primary' : 'default'}
                                          onClick={(e: React.MouseEvent) => {
                                            e.stopPropagation();
                                            const idx = panelInstances.findIndex(inst => inst.instanceId === instanceId);
                                            if (idx >= 0) setInstanceByIndex(idx);
                                          }}
                                          style={{ fontSize: 10, height: 24, padding: '0 8px' }}
                                        >
                                          Edit
                                        </Button>
                                        {isColored && !isCurrent && currentInstance && (
                                          <Button
                                            size="small"
                                            type="text"
                                            icon={<CopyOutlined />}
                                            title="Copy styles from this instance to the active one"
                                            onClick={(e: React.MouseEvent) => {
                                              e.stopPropagation();
                                              dispatch(copyPanelPatternLayers({ 
                                                sourcePanelKey: instanceId, 
                                                targetPanelKey: currentInstance.instanceId 
                                              }) as any);
                                              markPanelAsColored(currentInstance.instanceId);
                                              message.success(`Copied colorwork from Instance ${i + 1} to ${currentInstance.panelName}`);
                                            }}
                                            style={{ fontSize: 10, height: 24, padding: '0 6px' }}
                                          >
                                            Copy from
                                          </Button>
                                        )}
                                        {isColored && (
                                          <Button
                                            size="small"
                                            type="text"
                                            onClick={(e: React.MouseEvent) => {
                                              e.stopPropagation();
                                              // Apply this instance's colorwork to all selected instances
                                              panelInstances.forEach(inst => {
                                                if (inst.instanceId !== instanceId) {
                                                  dispatch(copyPanelPatternLayers({ 
                                                    sourcePanelKey: instanceId, 
                                                    targetPanelKey: inst.instanceId 
                                                  }) as any);
                                                  markPanelAsColored(inst.instanceId);
                                                }
                                              });
                                              message.success(`Applied colorwork to all ${panelInstances.length} instances`);
                                            }}
                                            style={{ fontSize: 10, height: 24, padding: '0 6px' }}
                                          >
                                            Apply All
                                          </Button>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </Card>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
            
            {/* Colorwork editing section - always visible */}
            <div style={{ marginTop: 24 }}>
              <Typography.Title level={5} style={{ margin: '0 0 16px 0' }}>
                Colorwork Editor
              </Typography.Title>
              {selectedPanels.length > 0 ? (
                <div 
                  data-colorwork-section 
                  style={{ 
                    animation: 'fadeInUp 0.3s ease-out'
                  }}
                >
                  <style>
                    {`
                      @keyframes fadeInUp {
                        from {
                          opacity: 0;
                          transform: translateY(20px);
                        }
                        to {
                          opacity: 1;
                          transform: translateY(0);
                        }
                      }
                    `}
                  </style>
                  <div style={{ 
                    padding: 16, 
                    backgroundColor: '#fff', 
                    borderRadius: 8, 
                    border: '2px solid #1890ff',
                    boxShadow: '0 4px 12px rgba(24, 144, 255, 0.15)' 
                  }}>
                    {/* Colorwork section header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <div>
                        <Typography.Title level={4} style={{ margin: 0, color: '#1890ff' }}>
                          {(() => {
                            const currentInst = getCurrentColorworkInstance();
                            return currentInst ? (
                              <>Editing: {currentInst.panelName}</>
                            ) : (
                              'Select a panel instance to edit'
                            );
                          })()}
                        </Typography.Title>
                        {currentInstance && (
                          <Typography.Text style={{ fontSize: 13, color: '#666' }}>
                            Instance {currentInstanceIndex + 1} of {panelInstances.length} total
                          </Typography.Text>
                        )}
                      </div>
                    </div>

                    {/* Colorwork editor for current instance */}
                    {(() => {
                      const currentInst = getCurrentColorworkInstance();
                      if (!currentInst) {
                        return (
                          <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>
                            <Typography.Text style={{ fontSize: 14 }}>
                              Use the "Edit" buttons in the panel cards above to select an instance to edit
                            </Typography.Text>
                          </div>
                        );
                      }

                      const shape = getPanelShape(currentInst.key);
                      
                      // Pass gauge with scale factor to the editor
                      const wizardGauge = patternData?.gauge || null;
                      const stitchesPerFour = wizardGauge && typeof wizardGauge.stitchesPerFourInches === 'number'
                        ? wizardGauge.stitchesPerFourInches
                        : (wizardGauge && typeof wizardGauge.stitchesPerInch === 'number' ? wizardGauge.stitchesPerInch * 4 : undefined);
                      const rowsPerFour = wizardGauge && typeof wizardGauge.rowsPerFourInches === 'number'
                        ? wizardGauge.rowsPerFourInches
                        : (wizardGauge && typeof wizardGauge.rowsPerInch === 'number' ? wizardGauge.rowsPerInch * 4 : undefined);
                      const normalizedGauge = wizardGauge && typeof stitchesPerFour === 'number' && typeof rowsPerFour === 'number'
                        ? {
                            stitchesPerFourInches: stitchesPerFour,
                            rowsPerFourInches: rowsPerFour,
                            scalingFactor: typeof wizardGauge.scaleFactor === 'number' && wizardGauge.scaleFactor > 0 ? wizardGauge.scaleFactor : 1
                          }
                        : null;

                      const initialPanel = {
                        shape: shape || null,
                        gauge: normalizedGauge
                      };
                      
                      return <ColorworkPanelEditor 
                        key={`${currentInst.instanceId}-${currentInstanceIndex}`} 
                        {...({ 
                          initialPanel, 
                          previewKey: currentInst.instanceId,
                          allSelectedPanelKeys: panelInstances.map(inst => inst.instanceId),
                          getPanelLabel: (instanceId: string) => {
                            const inst = panelInstances.find(i => i.instanceId === instanceId);
                            return inst ? inst.panelName : instanceId;
                          },
                          onRequestPreviewKeyChange: (instanceId: string) => {
                            const instanceIdx = panelInstances.findIndex(i => i.instanceId === instanceId);
                            if (instanceIdx >= 0) {
                              setInstanceByIndex(instanceIdx);
                            }
                          } 
                        } as any)} 
                      />;
                    })()}
                  </div>
                </div>
              ) : (
                <div style={{ 
                  padding: 40, 
                  textAlign: 'center', 
                  backgroundColor: '#fafafa', 
                  borderRadius: 8,
                  border: '1px dashed #d9d9d9'
                }}>
                  <Typography.Text style={{ fontSize: 14, color: '#999' }}>
                    No panels selected. Choose panels from the groups above to begin editing colorwork.
                  </Typography.Text>
                </div>
              )}
            </div>
          </div>
        )}


      </div>

      <div style={{ marginTop: 16 }}>
        <Button onClick={goPrev} disabled={currentStep === 0} style={{ marginRight: 8 }}>
          Previous
        </Button>
        <Button 
          type="primary" 
          onClick={goNext}
          disabled={currentStep >= 1}
        >
          {currentStep >= 1 ? 'Complete' : 'Next'}
        </Button>
        
        {selectedPanels.length > 0 && currentStep >= 1 && (
          <Button 
            type="default"
            style={{ marginLeft: 8 }}
            disabled={isSaving}
            icon={isSaving ? <LoadingOutlined /> : undefined}
            onClick={async () => {
              setIsSaving(true);
              try {
                // Build knitting project JSON with deep copy of all data
                const projectId = `project-${Date.now()}`;
                
                // Collect all unique patterns used across all panel instances
                const usedPatterns: Record<string, any> = {};
                panelInstances.forEach(instance => {
                  const panelPatternLayers = patternData?.panels?.patternLayers?.[instance.instanceId] || [];
                  panelPatternLayers.forEach((layer: any) => {
                    // Check if this layer uses a custom pattern from the library
                    if (layer.patternKey && layer.patternKey.startsWith('custom-')) {
                      const patternId = layer.patternKey.replace('custom-', '');
                      // Get the pattern from library if not already collected
                      if (!usedPatterns[patternId] && libraryData?.colorworkPatterns?.[patternId]) {
                        usedPatterns[patternId] = libraryData.colorworkPatterns[patternId];
                      }
                    }
                  });
                });
                
                // Generate concrete stitch plans for each panel
                const panelsWithStitchPlans = panelInstances.map(instance => {
                  const shape = getPanelShape(instance.key);
                  // Get colorwork pattern layers from redux state (stored directly as array, not as object.layers)
                  const panelPatternLayers = patternData?.panels?.patternLayers?.[instance.instanceId] || [];
                  
                  // Generate the concrete stitch plan
                  let stitchPlan: ConcreteStitchPlan | null = null;
                  try {
                    stitchPlan = generateConcreteStitchPlan(
                      shape,
                      patternData?.gauge || {},
                      panelPatternLayers,
                      instance.panelName
                    );
                    console.log(`Generated stitch plan for ${instance.panelName}:`, stitchPlan);
                  } catch (error) {
                    console.error(`Failed to generate stitch plan for ${instance.panelName}:`, error);
                  }
                  
                  return {
                    instanceId: instance.instanceId,
                    panelKey: instance.key,
                    panelName: instance.panelName,
                    // Store the concrete stitch plan as the main pattern data
                    stitchPlan: stitchPlan,
                    // Keep the wizard options separate for editing later
                    wizardOptions: {
                      shape: JSON.parse(JSON.stringify(shape || {})),
                      colorworkLayers: JSON.parse(JSON.stringify(panelPatternLayers)),
                      colorworkOptions: {} // Options are not currently stored separately
                    }
                  };
                });
                
                const knittingProject = {
                  id: projectId,
                  name: name.trim() || cachedPlaceholderTitle,
                  createdAt: new Date().toISOString(),
                  gauge: {
                    stitchesPerInch: patternData?.gauge?.stitchesPerInch || 0,
                    rowsPerInch: patternData?.gauge?.rowsPerInch || 0,
                    stitchesPerFourInches: patternData?.gauge?.stitchesPerFourInches || 0,
                    rowsPerFourInches: patternData?.gauge?.rowsPerFourInches || 0,
                    scaleFactor: patternData?.gauge?.scaleFactor || 1
                  },
                  panels: panelsWithStitchPlans,
                  // Include only the patterns used in this project
                  usedColorworkPatterns: Object.keys(usedPatterns).length > 0 ? usedPatterns : undefined
                };

                // Use the library adapter to properly merge the project without replacing other entries
                await saveKnittingProject(knittingProject);
                
                message.success(`Project "${knittingProject.name}" saved to library!`);
                // Navigate back to the knitting pattern designer home
                navigate('/crafts/knitting-pattern-designer');
              } catch (error: any) {
                message.error(`Failed to save project: ${error.message || 'Unknown error'}`);
                // Stay on the current page when there's an error
              } finally {
                setIsSaving(false);
              }
            }}
          >
            {isSaving ? 'Saving...' : 'Create Project'}
          </Button>
        )}
      </div>


    </div>
  );
};

export default WizardView;
