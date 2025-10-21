import { Trapezoid } from '../src/models/Trapezoid';
import { Gauge } from '../src/models/Gauge';
import { Panel } from '../src/models/Panel';
import { ColorworkPattern } from '../src/models/ColorworkPattern';
import { PanelColorworkComposer } from '../src/models/PanelColorworkComposer';
import { StitchPlan } from '../src/models/StitchPlan';
import { CombinedPattern } from '../src/models/CombinedPattern';

describe('CombinedPattern integration', () => {
  it('PanelColorworkComposer.combinePatterns returns a CombinedPattern and sets it on StitchPlan', () => {
    const trapezoid = new Trapezoid(10, 20, 20, 0);
    const gauge = new Gauge(19, 30);
    const panel = new Panel(trapezoid, gauge, 1);
    const pattern = new ColorworkPattern(8, 8, [
      [0,1,0,1,0,1,0,1],
      [1,0,1,0,1,0,1,0],
      [0,1,0,1,0,1,0,1],
      [1,0,1,0,1,0,1,0],
      [0,1,0,1,0,1,0,1],
      [1,0,1,0,1,0,1,0],
      [0,1,0,1,0,1,0,1],
      [1,0,1,0,1,0,1,0]
    ], { 0: { id: 0, label: 'A', color: '#fff' }, 1: { id: 1, label: 'B', color: '#000' } }, { width: 8, height: 8 });
    const composer = new PanelColorworkComposer();
    const combined = composer.combinePatterns(panel, pattern, { stretchMode: 'repeat', alignmentMode: 'center' });
    expect(combined).toBeDefined();
    expect(combined.panel).toBe(panel);
    expect(combined.colorworkPattern).toBe(pattern);
    expect(Array.isArray(combined.mappedRows)).toBe(true);
    expect(combined.stitchPlan).toBeDefined();
    expect(combined.stitchPlan.colorworkMapping).toBe(combined);
  });

  it('StitchPlan.generateColorworkInstructions uses CombinedPattern.mappedRows', () => {
    const trapezoid = new Trapezoid(10, 20, 20, 0);
    const gauge = new Gauge(19, 30);
    const panel = new Panel(trapezoid, gauge, 1);
    const pattern = new ColorworkPattern(8, 8, [
      [0,1,0,1,0,1,0,1],
      [1,0,1,0,1,0,1,0],
      [0,1,0,1,0,1,0,1],
      [1,0,1,0,1,0,1,0],
      [0,1,0,1,0,1,0,1],
      [1,0,1,0,1,0,1,0],
      [0,1,0,1,0,1,0,1],
      [1,0,1,0,1,0,1,0]
    ], { 0: { id: 0, label: 'A', color: '#fff' }, 1: { id: 1, label: 'B', color: '#000' } }, { width: 8, height: 8 });
    const composer = new PanelColorworkComposer();
    const combined = composer.combinePatterns(panel, pattern, { stretchMode: 'repeat', alignmentMode: 'center' });
    const stitchPlan = combined.stitchPlan;
    const colorworkInstructions = stitchPlan.generateColorworkInstructions();
    expect(Array.isArray(colorworkInstructions)).toBe(true);
    expect(colorworkInstructions.length).toBe(stitchPlan.rows.length);
    expect(colorworkInstructions[0]).toHaveProperty('colorwork');
  });
});
