import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { InputNumber, Input, Divider, Select, Collapse, Space, Typography, Card, message, Button } from 'antd';
import { EditOutlined, PlusOutlined, CopyOutlined } from '@ant-design/icons';
import { PanelDiagram } from '../../../components/PanelDiagram';
import { useDispatch, useSelector } from 'react-redux';
import { updatePatternData, selectPatternData, nextStep, previousStep, selectCurrentStep, copyPanelPatternLayers } from '../../../store/knittingDesignSlice';
import { garments } from '../../../data/garments';
import { loadFullLibrary, setFullLibrary, clearEntries } from '../../../store/librarySlice';
import { useDriveAuth } from '../../colorwork-designer/context/DriveAuthContext';
import { calculatePanelDimensions } from '../utils/panelDimensions';
import { generateProjectTitle } from '../utils/ProjectTitlePlaceholderHelper';
import { usePanelInstances, usePanelSelection, usePanelShape } from '../hooks/usePanelState';
import PanelCard from './PanelCard';
import ColorworkEditorSection from './ColorworkEditorSection';
import PanelSummary from './PanelSummary';
import ColorworkPanelEditor from '../../../components/ColorworkPanelEditor';
import { PanelMetadata } from '../types/patternWizard.types';
import '../styles/PatternWizard.css';

const WizardView: React.FC = () => {
  const dispatch = useDispatch();
  const patternData: any = useSelector(selectPatternData);
  const currentStep: number = useSelector(selectCurrentStep) || 0;
  const [name, setName] = useState<string>(patternData?.name || '');
  
  // State for colorwork editing
  const [showColorworkSection, setShowColorworkSection] = useState(false);
  const [expandedPanelKey, setExpandedPanelKey] = useState<string | null>(null);
  const [summaryExpanded, setSummaryExpanded] = useState(false);
  
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

  // Local state: index of the currently-selected panel (for panel-level navigation)
  const [currentColorworkPanelIndex, setCurrentColorworkPanelIndex] = useState(0);

  const getCurrentColorworkPanel = useCallback(() => {
    return selectedPanels[currentColorworkPanelIndex] || null;
  }, [selectedPanels, currentColorworkPanelIndex]);

  const advanceToNextInstanceLocal = useCallback(() => {
    // delegate to hook navigation
    goToNextInstance();
  }, [goToNextInstance]);


  const advanceToPreviousInstanceLocal = useCallback(() => {
    // delegate to hook navigation
    goToPreviousInstance();
  }, [goToPreviousInstance]);

  const goToNextPanel = useCallback(() => {
    if (currentColorworkPanelIndex < selectedPanels.length - 1) {
      setCurrentColorworkPanelIndex(prev => prev + 1);
    }
  }, [currentColorworkPanelIndex, selectedPanels.length]);

  const goToPreviousPanel = useCallback(() => {
    if (currentColorworkPanelIndex > 0) {
      setCurrentColorworkPanelIndex(prev => prev - 1);
    }
  }, [currentColorworkPanelIndex]);

  // Generate panel instances for per-instance colorwork editing
  const generatePanelInstances = useCallback(() => {
    const instances: Array<{ key: string; instanceId: string; panelName: string }> = [];
    selectedPanels.forEach(panelKey => {
      const count = panelCounts[panelKey] || 0;
      const panel = panelList.find(p => p.key === panelKey);
      if (panel && count > 0) {
        for (let i = 1; i <= count; i++) {
          instances.push({
            key: panelKey,
            instanceId: `${panelKey}::instance-${i}`,
            panelName: `${panel.panelName} #${i}`
          });
        }
      }
    });
    return instances;
  }, [selectedPanels, panelCounts, panelList]);

  const toggleColorworkFlow = useCallback(() => {
    if (showColorworkSection) {
      setShowColorworkSection(false);
    } else {
      // Generate instances for per-instance colorwork editing
      // panelInstances are derived from the selection via the usePanelInstances hook,
      // so no need to set them here. Instead, reset the hook-managed index and local
      // panel index and open the editor.
      generatePanelInstances();
      setInstanceByIndex(0);
      setCurrentColorworkPanelIndex(0);
      setShowColorworkSection(true);
      // Scroll to colorwork section after a brief delay to let it render
      setTimeout(() => {
        const colorworkSection = document.querySelector('[data-colorwork-section]');
        if (colorworkSection) {
          colorworkSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, [showColorworkSection, generatePanelInstances]);

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

  const copyColorworkToCurrentPanel = useCallback((sourcePanelKey: string) => {
    const currentPanel = getCurrentColorworkPanel();
    if (!currentPanel || sourcePanelKey === currentPanel) return;
    
    // Copy pattern layers using Redux action
    dispatch(copyPanelPatternLayers({ 
      sourcePanelKey, 
      targetPanelKey: currentPanel 
    }) as any);
    
    // Mark current panel as colored after copying
    markPanelAsColored(currentPanel);
    
    // Show success message
    const sourceLabel = getPanelLabelForKey(sourcePanelKey).split(' — ')[1] || getPanelLabelForKey(sourcePanelKey);
    const targetLabel = getPanelLabelForKey(currentPanel).split(' — ')[1] || getPanelLabelForKey(currentPanel);
    message.success(`Copied colorwork from ${sourceLabel} to ${targetLabel}`);
  }, [dispatch, getCurrentColorworkPanel, markPanelAsColored, getPanelLabelForKey]);

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
      {/* Step progress indicator */}
      <div style={{ marginBottom: 16, padding: 12, backgroundColor: '#fafafa', borderRadius: 6, border: '1px solid #e8e8e8' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography.Title level={3} style={{ margin: 0 }}>
            Knitting Pattern Designer
          </Typography.Title>
          <div style={{ fontSize: 14, color: '#666' }}>
            Step {currentStep + 1} of 2: {currentStep === 0 ? 'Pattern Setup' : 'Panel Selection & Colorwork'}
          </div>
        </div>
      </div>

      {/* Render all steps up to and including currentStep so previous steps remain editable */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Step 0: Pattern name & gauge (moved up) */}
        {currentStep >= 0 && (
          <div
            ref={el => { stepRefs.current[0] = el; return; }}
            key="step-0"
            style={{ padding: 12, borderRadius: 6, background: '#fff' }}
          >
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}>
              {/* Title expands to fill available space */}
              <div style={{ flex: '1 1 320px', minWidth: 220 }}>
                <label style={{ display: 'block', fontWeight: 700, marginBottom: 6 }}>Pattern name</label>
                <Input placeholder={cachedPlaceholderTitle} value={name} onChange={onNameChange} />
              </div>

              {/* Gauge block has fixed preferred width but can wrap under when narrow */}
              <div style={{ flex: '0 0', minWidth: 200, display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 13 }}>Stitches per 4":</label>
                  <InputNumber min={1} value={patternData?.gauge?.stitchesPerFourInches} onChange={(v: number | null) => onGaugeChange('stitchesPerInch', v)} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 13 }}>Rows per 4":</label>
                  <InputNumber min={1} value={patternData?.gauge?.rowsPerFourInches} onChange={(v: number | null) => onGaugeChange('rowsPerInch', v)} />
                </div>
              </div>

              {/* Scale factor */}
              <div style={{ flex: '0 0 120px', minWidth: 100, display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 13 }}>Scale</label>
                  <InputNumber min={0.1} step={0.1} value={patternData?.gauge?.scaleFactor ?? 1} onChange={(v: number | null) => onScaleChange(v)} />
                </div>
              </div>
            </div>
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
            
            {/* Panel selection with new UX */}
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
                    {/* Selected panels section - always visible if any panels selected */}
                    {selectedPanels.length > 0 && (
                      <div style={{ marginBottom: 24 }}>
                        <Typography.Title level={5} style={{ margin: '0 0 12px 0', color: '#1890ff' }}>
                          Selected Panels ({selectedPanels.length} types, {Object.values(panelCounts).reduce((sum, count) => sum + (count || 0), 0)} total pieces)
                        </Typography.Title>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                          {selectedPanels.map(key => {
                            const panel = panelList.find(p => p.key === key);
                            if (!panel) return null;
                            const { panelName } = panel;
                            const shape = getPanelShape(key);
                            
                            return (
                              <Card
                                key={key}
                                style={{ 
                                  borderColor: '#1890ff',
                                  boxShadow: '0 2px 8px rgba(24, 144, 255, 0.2)' 
                                }}
                                bodyStyle={{ padding: 12 }}
                              >
                                {/* Panel header with name and quantity */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                  <Typography.Text strong>{panelName}</Typography.Text>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Typography.Text style={{ fontSize: 12, color: '#666' }}>Qty:</Typography.Text>
                                    <InputNumber
                                      size="small"
                                      min={0}
                                      max={10}
                                      value={panelCounts[key] || 0}
                                      onChange={(v: number | null) => setCount(key, v)}
                                      style={{ width: 60 }}
                                    />
                                  </div>
                                </div>

                                {/* Panel preview diagram */}
                                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12, minHeight: 120 }}>
                                  {shape ? (
                                    <PanelDiagram 
                                      shape={shape} 
                                      label="" 
                                      size={100} 
                                      padding={8}
                                    />
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

                                {/* Colorwork status indicator */}
                                {(() => {
                                  const panelInstanceCount = panelCounts[key] || 0;
                                  const completedInstanceCount = panelInstances.filter(inst => 
                                    inst.key === key && coloredPanels.has(inst.instanceId)
                                  ).length;
                                  const allInstancesCompleted = panelInstanceCount > 0 && completedInstanceCount === panelInstanceCount;
                                  const hasPartialProgress = completedInstanceCount > 0;

                                  return (
                                    <div style={{ 
                                      textAlign: 'center', 
                                      padding: '4px 8px', 
                                      borderRadius: 4, 
                                      fontSize: 12,
                                      backgroundColor: allInstancesCompleted ? '#f6ffed' : hasPartialProgress ? '#fff7e6' : '#fff7e6',
                                      border: `1px solid ${allInstancesCompleted ? '#b7eb8f' : hasPartialProgress ? '#ffd591' : '#ffd591'}`,
                                      color: allInstancesCompleted ? '#389e0d' : hasPartialProgress ? '#d48806' : '#d48806'
                                    }}>
                                      {showColorworkSection 
                                        ? `${completedInstanceCount} of ${panelInstanceCount} instances colored`
                                        : allInstancesCompleted 
                                          ? '✓ All Instances Colored' 
                                          : hasPartialProgress 
                                            ? `${completedInstanceCount}/${panelInstanceCount} Colored`
                                            : 'Needs Colorwork'
                                      }
                                    </div>
                                  );
                                })()}
                              </Card>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Add panels section with group selector */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                        <Typography.Title level={5} style={{ margin: 0 }}>
                          Add Panels from:
                        </Typography.Title>
                        <Select
                          placeholder="Choose a group..."
                          value={activeCollapseKeys[0] || undefined}
                          onChange={(value: string) => setActiveCollapseKeys([value])}
                          style={{ minWidth: 200 }}
                          allowClear
                        >
                          {garmentTitles.map(title => (
                            <Select.Option key={title} value={title}>
                              {title}
                            </Select.Option>
                          ))}
                        </Select>
                      </div>

                      {/* Show panels from selected group */}
                      {activeCollapseKeys.length > 0 && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                          {groups[activeCollapseKeys[0]]?.map(({ key, panelName }) => {
                            const isSelected = (panelCounts[key] || 0) > 0;
                            // Skip if already selected (shown in selected section above)
                            if (isSelected) return null;
                            
                            const shape = getPanelShape(key);
                            
                            return (
                              <Card
                                key={key}
                                style={{ 
                                  borderColor: undefined,
                                  cursor: 'pointer',
                                  transition: 'all 0.2s'
                                }}
                                bodyStyle={{ padding: 12 }}
                                hoverable
                                onClick={() => setCount(key, 1)}
                              >
                                {/* Panel header with name and add button */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                  <Typography.Text strong>{panelName}</Typography.Text>
                                  <Button size="small" type="primary" ghost onClick={(e: React.MouseEvent) => { e.stopPropagation(); setCount(key, 1); }}>
                                    Add
                                  </Button>
                                </div>

                                {/* Panel preview diagram */}
                                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12, minHeight: 120 }}>
                                  {shape ? (
                                    <PanelDiagram 
                                      shape={shape} 
                                      label="" 
                                      size={100} 
                                      padding={8}
                                    />
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
                                  <div style={{ fontSize: 11, color: '#666', textAlign: 'center' }}>
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
                              </Card>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
            
            {/* Selected panels summary and colorwork action */}
            {selectedPanels.length > 0 && (
              <div style={{ marginTop: 16, padding: 12, backgroundColor: '#f0f8ff', borderRadius: 4, border: '1px solid #d6f7ff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <Typography.Text style={{ fontSize: 13, color: '#1890ff' }}>
                      <strong>Selected panels:</strong> {selectedPanels.length} panel type{selectedPanels.length !== 1 ? 's' : ''} 
                      {' '}({Object.values(panelCounts).reduce((sum, count) => sum + (count || 0), 0)} total pieces)
                    </Typography.Text>
                    <br />
                    <Typography.Text style={{ fontSize: 12, color: '#666' }}>
                      {showColorworkSection 
                        ? `Instance colorwork progress: ${coloredPanels.size} of ${panelInstances.length} instances completed`
                        : `Colorwork progress: ${coloredPanels.size} of ${selectedPanels.length} panel types have colorwork`
                      }
                    </Typography.Text>
                  </div>
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={toggleColorworkFlow}
                  >
                    {showColorworkSection 
                      ? 'Hide Colorwork Editor' 
                      : 'Edit Colorwork - Per Panel Instance'
                    }
                  </Button>
                </div>
              </div>
            )}
            
            {/* Inline colorwork editing section */}
            {showColorworkSection && selectedPanels.length > 0 && (
              <div 
                data-colorwork-section 
                style={{ 
                  marginTop: 24,
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
                          const currentInstance = getCurrentColorworkInstance();
                          return currentInstance ? (
                            <>Edit Colorwork - {currentInstance.panelName}</>
                          ) : (
                            'Edit Colorwork'
                          );
                        })()}
                      </Typography.Title>
                      <Typography.Text style={{ fontSize: 13, color: '#666' }}>
                        Panel instance {currentInstanceIndex + 1} of {panelInstances.length}
                      </Typography.Text>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Button 
                        onClick={goToPreviousInstance}
                        disabled={currentInstanceIndex === 0}
                      >
                        Previous Instance
                      </Button>
                      <Button 
                        type="primary"
                        onClick={() => {
                          const currentInstance = getCurrentColorworkInstance();
                          if (currentInstance) {
                            // Mark this specific instance as colored
                            markPanelAsColored(currentInstance.instanceId);
                          }
                          if (currentInstanceIndex < panelInstances.length - 1) {
                            goToNextInstance();
                          } else {
                            // All instances completed
                            setShowColorworkSection(false);
                          }
                        }}
                      >
                        {currentInstanceIndex === panelInstances.length - 1 ? 'Complete All Colorwork' : 'Save & Next Instance'}
                      </Button>
                      <Button 
                        type="text" 
                        onClick={() => setShowColorworkSection(false)}
                      >
                        Close
                      </Button>
                    </div>
                  </div>

                  {/* Instance navigation and copy options */}
                  <div style={{ marginBottom: 16, padding: 12, backgroundColor: '#fafafa', borderRadius: 6 }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                      <Typography.Text style={{ fontSize: 13, marginRight: 16, fontWeight: 500 }}>
                        <strong>Panel Instances:</strong>
                      </Typography.Text>
                      {panelInstances.map((instance, index) => {
                        const isColored = coloredPanels.has(instance.instanceId);
                        const isCurrent = index === currentInstanceIndex;
                        
                        return (
                          <div key={instance.instanceId} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                            <Button
                              size="small"
                              type={isCurrent ? "primary" : "default"}
                              onClick={() => setInstanceByIndex(index)}
                              style={{ 
                                fontSize: 11,
                                minWidth: 80,
                                backgroundColor: isCurrent ? undefined : isColored ? '#f6ffed' : undefined,
                                borderColor: isCurrent ? undefined : isColored ? '#b7eb8f' : undefined,
                              }}
                            >
                              {isCurrent ? '● ' : isColored ? '✓ ' : '○ '}
                              {instance.panelName}
                            </Button>
                            {isColored && !isCurrent && (
                              <Button
                                size="small"
                                type="text"
                                icon={<CopyOutlined />}
                                onClick={() => {
                                  const currentInstance = getCurrentColorworkInstance();
                                  if (currentInstance) {
                                    // Copy colorwork from this instance to current instance
                                    dispatch(copyPanelPatternLayers({ 
                                      sourcePanelKey: instance.instanceId, 
                                      targetPanelKey: currentInstance.instanceId 
                                    }) as any);
                                    
                                    // Mark current instance as colored after copying
                                    markPanelAsColored(currentInstance.instanceId);
                                    message.success(`Copied colorwork from ${instance.panelName} to ${currentInstance.panelName}`);
                                  }
                                }}
                                style={{ fontSize: 10, height: 20, padding: '0 6px' }}
                              >
                                Copy
                              </Button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Colorwork editor for current instance */}
                  {(() => {
                    const currentInstance = getCurrentColorworkInstance();
                    if (!currentInstance) return null;

                    const shape = getPanelShape(currentInstance.key);
                    
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
                      key={`${currentInstance.instanceId}-${currentInstanceIndex}`} 
                      {...({ 
                        initialPanel, 
                        previewKey: currentInstance.instanceId,
                        allSelectedPanelKeys: panelInstances.map(inst => inst.instanceId),
                        getPanelLabel: (instanceId: string) => {
                          const inst = panelInstances.find(i => i.instanceId === instanceId);
                          return inst ? inst.panelName : instanceId;
                        },
                        onRequestPreviewKeyChange: (instanceId: string) => {
                          const instanceIndex = panelInstances.findIndex(i => i.instanceId === instanceId);
                          if (instanceIndex >= 0) {
                            setInstanceByIndex(instanceIndex);
                          }
                        } 
                      } as any)} 
                    />;
                  })()}
                </div>
              </div>
            )}
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
            onClick={() => {
              // Navigate to interactive knitting or pattern generation
              console.log('Ready for knitting with panels:', selectedPanels);
            }}
          >
            Start Knitting
          </Button>
        )}
      </div>


    </div>
  );
};

export default WizardView;
