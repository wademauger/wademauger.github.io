import { Panel } from '../../models/Panel';
import { Trapezoid } from '../../models/Trapezoid';
import { defaultGauge } from '../../models/Gauge';

describe('Panel model basic behavior', () => {
  it('constructs from plain object via Trapezoid.fromObject and generates instructions', () => {
    const shapeObj = { height: 4, baseA: 4, baseB: 6, successors: [] };
    const panel = new Panel(shapeObj, defaultGauge, 1);
    const json = panel.toJSON();
    expect(json).toHaveProperty('shapes');
    const instr = panel.generateKnittingInstructions();
    expect(Array.isArray(instr)).toBe(true);
    // Should include cast on or bind off instructions for non-empty shapes
    expect(instr.length).toBeGreaterThan(0);
  });

  it('fromObject static creates Panel instance correctly', () => {
    const json = { shapes: { height: 2, baseA: 2, baseB: 2, successors: [] }, gauge: defaultGauge, sizeModifier: 1 };
    const p = Panel.fromObject(json);
    expect(p).toBeInstanceOf(Panel);
    expect(typeof p.generateKnittingInstructions).toBe('function');
  });
});
