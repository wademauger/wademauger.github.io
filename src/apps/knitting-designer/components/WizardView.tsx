import React, { useState, useMemo } from 'react';
import { InputNumber, Form, Button, Input, Divider } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { updatePatternData, selectPatternData, nextStep, previousStep, selectCurrentStep } from '../../../store/knittingDesignSlice';
import { garments } from '../../../data/garments';

const WizardView: React.FC = () => {
  const dispatch = useDispatch();
  const patternData: any = useSelector(selectPatternData);
  const currentStep: number = useSelector(selectCurrentStep) || 0;
  const [name, setName] = useState<string>(patternData?.name || '');

  // Build a flat list of panels from garments with unique keys
  const panelList = useMemo(() => {
    const out: Array<{ key: string; garmentTitle: string; garmentPermalink: string; panelName: string }> = [];
    (garments || []).forEach((g: any) => {
      const shapes = g.shapes || {};
      Object.keys(shapes).forEach((panelName) => {
        out.push({ key: `${g.permalink}::${panelName}`, garmentTitle: g.title, garmentPermalink: g.permalink, panelName });
      });
    });
    return out;
  }, []);

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

  const onGaugeChange = (field: 'stitchesPerInch' | 'rowsPerInch', value: number | null) => {
    if (value == null) return;
    dispatch(updatePatternData({ section: 'gauge', data: { [field]: value } }) as any);
  };

  const onNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setName(v);
    dispatch(updatePatternData({ section: 'meta', data: { name: v } }) as any);
  };

  const goNext = () => dispatch(nextStep() as any);
  const goPrev = () => dispatch(previousStep() as any);

  return (
    <div style={{ padding: 12 }}>
      <h3>Guided Wizard — Panels & Gauge</h3>

      {currentStep === 0 && (
        <Form layout="vertical">
          <Form.Item label="Select panels and quantities">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {panelList.map((p) => (
                <div key={p.key} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <strong>{p.garmentTitle}</strong> — <span style={{ color: '#666' }}>{p.panelName}</span>
                  </div>
                  <div style={{ width: 120 }}>
                    <InputNumber min={0} value={panelCounts[p.key] || 0} onChange={(v: number | null) => setCount(p.key, v)} />
                  </div>
                </div>
              ))}
            </div>
          </Form.Item>
        </Form>
      )}

      {currentStep === 1 && (
        <Form layout="vertical">
          <Form.Item label="Pattern name">
            <Input value={name} onChange={onNameChange} />
          </Form.Item>
          <Form.Item label="Stitches / inch">
            <InputNumber min={1} value={patternData?.gauge?.stitchesPerInch} onChange={(v: number | null) => onGaugeChange('stitchesPerInch', v)} />
          </Form.Item>
          <Form.Item label="Rows / inch">
            <InputNumber min={1} value={patternData?.gauge?.rowsPerInch} onChange={(v: number | null) => onGaugeChange('rowsPerInch', v)} />
          </Form.Item>
        </Form>
      )}

      <div style={{ marginTop: 16 }}>
        <Button onClick={goPrev} style={{ marginRight: 8 }}>Previous</Button>
        <Button type="primary" onClick={goNext}>Next</Button>
      </div>
    </div>
  );
};

export default WizardView;
