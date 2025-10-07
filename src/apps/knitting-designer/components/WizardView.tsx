import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { InputNumber, Form, Button, Input, Divider, Select, Collapse, Space, Typography } from 'antd';
import ColorworkPanelEditor from '../../../components/ColorworkPanelEditor';
import { useDispatch, useSelector } from 'react-redux';
import { updatePatternData, selectPatternData, nextStep, previousStep, selectCurrentStep } from '../../../store/knittingDesignSlice';
import { garments } from '../../../data/garments';
import { loadFullLibrary, setFullLibrary, clearEntries } from '../../../store/librarySlice';
import { useDriveAuth } from '../../colorwork-designer/context/DriveAuthContext';
import { calculatePanelDimensions } from '../utils/panelDimensions';

const WizardView: React.FC = () => {
  const dispatch = useDispatch();
  const patternData: any = useSelector(selectPatternData);
  const currentStep: number = useSelector(selectCurrentStep) || 0;
  const [name, setName] = useState<string>(patternData?.name || '');
  
  // Get authentication state
  const { isSignedIn } = useDriveAuth();
  
  // Get library panels from global state
  const libraryData: any = useSelector((state: any) => state.library?.fullLibrary);

  // Load library when authentication state changes
  useEffect(() => {
    if (isSignedIn) {
      dispatch(loadFullLibrary() as any);
    } else {
      // Clear library data when logged out
      dispatch(setFullLibrary(null));
      dispatch(clearEntries());
    }
  }, [isSignedIn, dispatch]);

  // Build a flat list of panels from garments with unique keys
  const panelList = useMemo(() => {
    const out: Array<{ key: string; garmentTitle: string; garmentPermalink: string; panelName: string }> = [];
    
    // Add panels from built-in garments
    (garments || []).forEach((g: any) => {
      const shapes = g.shapes || {};
      Object.keys(shapes).forEach((panelName) => {
        out.push({ key: `${g.permalink}::${panelName}`, garmentTitle: g.title, garmentPermalink: g.permalink, panelName });
      });
    });
    
    // Add panels from user's library
    if (libraryData && libraryData.panels) {
      Object.keys(libraryData.panels).forEach((panelId) => {
        const panel = libraryData.panels[panelId];
        const panelName = panel.name || panelId;
        // Use 'library' as permalink to distinguish from garments
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

  // Initialize counts from patternData.panels.panelsNeeded or defaults to 0
  const initialCounts: Record<string, number> = (patternData && patternData.panels && patternData.panels.panelsNeeded) || {};
  const [panelCounts, setPanelCounts] = useState<Record<string, number>>(() => ({ ...initialCounts }));

  const setCount = (key: string, value: number | null) => {
    const v = value == null ? 0 : value;
    const next = { ...panelCounts, [key]: v };
    setPanelCounts(next);
    // Persist to redux under section 'panels'
    dispatch(updatePatternData({ section: 'panels', data: { panelsNeeded: next } }) as any);
  };

  // Selected panel for step 3 (key from panelList: `${permalink}::${panelName}`)
  // Initialize from redux if a previewPanelKey was persisted under patternData.panels
  const [selectedPanelKey, setSelectedPanelKey] = useState<string | null>(patternData?.panels?.previewPanelKey || null);

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

  const handlePreviewKeyChange = useCallback((nextKey: string | null) => {
    setSelectedPanelKey(nextKey);
    dispatch(updatePatternData({ section: 'panels', data: { previewPanelKey: nextKey } }) as any);
  }, [dispatch]);

  // Ensure selectedPanelKey stays valid when selection changes
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
      if (currentStep > 1) {
        // On transition to after step 2, expand only garments that currently have selections
        const selectedGarmentTitles = Array.from(new Set(Object.keys(panelCounts)
          .filter(k => (panelCounts[k] || 0) > 0)
          .map(k => {
            const found = panelList.find(p => p.key === k);
            return found ? found.garmentTitle : null;
          }).filter(Boolean) as string[]));
        setActiveCollapseKeys(selectedGarmentTitles);
        setShowAllGarments(false);
      } else {
        // While editing step 2, keep all garment panels collapsed by default
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
                <Input value={name} onChange={onNameChange} />
              </div>

              {/* Gauge block has fixed preferred width but can wrap under when narrow */}
              <div style={{ flex: '0 0 280px', minWidth: 200, display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 13 }}>Stitches per 4":</label>
                  <InputNumber min={1} value={patternData?.gauge?.stitchesPerFourInches} onChange={(v: number | null) => onGaugeChange('stitchesPerInch', v)} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 13 }}>Rows per 4":</label>
                  <InputNumber min={1} value={patternData?.gauge?.rowsPerFourInches} onChange={(v: number | null) => onGaugeChange('rowsPerInch', v)} />
                </div>
              </div>

              {/* Scale factor (preview moved to Step 2) */}
              <div style={{ flex: '0 0 120px', minWidth: 100, display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 13 }}>Scale</label>
                  <InputNumber min={0.1} step={0.1} value={patternData?.gauge?.scaleFactor ?? 1} onChange={(v: number | null) => onScaleChange(v)} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Select panels (moved down) */}
        {currentStep >= 1 && (
          <div
            ref={el => { stepRefs.current[1] = el; return; }}
            key="step-1"
            style={{ padding: 12, borderRadius: 6, background: '#fff', marginTop: 4 }}
          >
            {/* Group panels by garment title */}
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
                    <Collapse
                      activeKey={activeCollapseKeys}
                      onChange={(keys: any) => setActiveCollapseKeys(Array.isArray(keys) ? keys : [keys])}
                    >
                      {garmentTitles.map((garmentTitle) => (
                        // If showAllGarments is false and this garment has no selected panels, skip rendering (hidden)
                        (!showAllGarments && !groups[garmentTitle].some(gp => selectedPanels.includes(gp.key))) ? null : (
                          <Collapse.Panel header={garmentTitle} key={garmentTitle}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                              {groups[garmentTitle].map(({ key, panelName }) => (
                                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 220 }}>
                                  <div style={{ minWidth: 160 }}>
                                    <label style={{ display: 'block', fontSize: 13, color: '#333' }}>{panelName}</label>
                                    <div style={{ fontSize: 12, color: '#666' }}>
                                      <InputNumber min={0} value={panelCounts[key] || 0} onChange={(v: number | null) => setCount(key, v)} />
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </Collapse.Panel>
                        )
                      ))}
                    </Collapse>

                    {!showAllGarments && (
                      <div style={{ marginTop: 8 }}>
                        <Button type="link" onClick={() => setShowAllGarments(true)}>More...</Button>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* Step 2: Colorwork layering using existing ColorworkPanelEditor */}
        {currentStep >= 2 && (
          <div
            ref={el => { stepRefs.current[2] = el; return; }}
            key="step-2"
            style={{ padding: 8, borderRadius: 6, background: '#fff', marginTop: 4 }}
          >
            <div style={{ minHeight: 360 }}>
              <Form layout="horizontal">
                <Form.Item label="Choose panel to preview:" style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <Select
                      value={selectedPanelKey}
                      onChange={(v: string) => {
                        setSelectedPanelKey(v);
                        // persist selection so the preview is restored across navigation
                        dispatch(updatePatternData({ section: 'panels', data: { previewPanelKey: v } }) as any);
                      }}
                      placeholder={selectedPanels.length === 0 ? 'No panels selected in Step 2' : 'Select a panel'}
                      disabled={selectedPanels.length === 0}
                      style={{ width: 360 }}
                    >
                      {selectedPanels.map((key) => {
                        const [permalink, panelName] = key.split('::');
                        const g = panelList.find(p => p.key === key);
                        const label = g ? `${g.garmentTitle} — ${g.panelName}` : panelName;
                        return (
                          <Select.Option key={key} value={key}>{label}</Select.Option>
                        );
                      })}
                    </Select>

                    {/* Per-4-inch preview and panel dimensions to the right of the select */}
                    <div style={{ padding: '6px 12px', background: '#f5f5f5', borderRadius: 4, fontSize: 12, color: '#333' }}>
                      {selectedPanelKey && patternData?.gauge ? (() => {
                        try {
                          const shape = getPanelShape(selectedPanelKey);
                          if (!shape) return null;

                          const gauge = patternData.gauge || {};
                          const scalingFactorRaw = typeof gauge.scaleFactor === 'number' ? gauge.scaleFactor : 1;
                          const scalingFactor = Number.isFinite(scalingFactorRaw) && scalingFactorRaw > 0 ? scalingFactorRaw : 1;
                          const dimensions = calculatePanelDimensions(shape, scalingFactor);
                          if (!dimensions) return null;

                          const stitchesPerFour = typeof gauge.stitchesPerFourInches === 'number'
                            ? gauge.stitchesPerFourInches
                            : (typeof gauge.stitchesPerInch === 'number' ? gauge.stitchesPerInch * 4 : 0);
                          const rowsPerFour = typeof gauge.rowsPerFourInches === 'number'
                            ? gauge.rowsPerFourInches
                            : (typeof gauge.rowsPerInch === 'number' ? gauge.rowsPerInch * 4 : 0);

                          if (!stitchesPerFour || !rowsPerFour) {
                            return `@ ${Math.round(stitchesPerFour || 0)} sts × ${Math.round(rowsPerFour || 0)} rows per 4"`;
                          }

                          const stitchesPerInch = stitchesPerFour / 4;
                          const rowsPerInch = rowsPerFour / 4;

                          const totalStitches = Math.round(dimensions.widthInches * stitchesPerInch);
                          const totalRows = Math.round(dimensions.heightInches * rowsPerInch);

                          const gaugeText = `@ ${Math.round(stitchesPerFour)} sts × ${Math.round(rowsPerFour)} rows per 4"`;
                          const scaleText = scalingFactor === 1 ? '' : `, resized by ${scalingFactor}x`;

                          return `${totalStitches} stitches × ${totalRows} rows ${gaugeText}${scaleText ? `${scaleText}: ` : ': '}` +
                            `(${dimensions.widthInches.toFixed(1)}" × ${dimensions.heightInches.toFixed(1)}")`;
                        } catch (error) {
                          console.warn('Error calculating panel dimensions:', error);
                        }
                        return null;
                      })() : (patternData?.gauge ? `@ ${Math.round((patternData.gauge.stitchesPerFourInches || 0))} sts × ${Math.round((patternData.gauge.rowsPerFourInches || 0))} rows per 4"` : 'No gauge set')}
                    </div>
                  </div>
                </Form.Item>
              </Form>

              {/* If a panel is selected, pass it as initialPanel to the editor */}
              {selectedPanelKey ? (
                (() => {
                  const shape = getPanelShape(selectedPanelKey);

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
                  // Use selectedPanelKey as the key, pattern layers are now in Redux so won't be lost
                  // ColorworkPanelEditor props are not strictly typed here; cast to any
                  return <ColorworkPanelEditor 
                    key={selectedPanelKey || 'none'} 
                    {...({ 
                      initialPanel, 
                      previewKey: selectedPanelKey,
                      allSelectedPanelKeys: selectedPanels,
                      getPanelLabel: getPanelLabelForKey,
                      onRequestPreviewKeyChange: handlePreviewKeyChange 
                    } as any)} 
                  />;
                })()
              ) : (
                <div style={{ padding: '20px 0', color: '#666' }}>Select a panel above to preview and layer colorwork.</div>
              )}
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: 16 }}>
        <Button onClick={goPrev} style={{ marginRight: 8 }}>Previous</Button>
        <Button type="primary" onClick={goNext}>Next</Button>
      </div>
    </div>
  );
};

export default WizardView;
