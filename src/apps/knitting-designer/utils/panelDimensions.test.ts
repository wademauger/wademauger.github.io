import { calculatePanelDimensions } from './panelDimensions';

describe('calculatePanelDimensions', () => {
  it('computes width and height for a basic trapezoid', () => {
    const shape = {
      height: 10,
      baseA: 8,
      baseB: 6,
      successors: []
    };

    const result = calculatePanelDimensions(shape, 1);

    expect(result).not.toBeNull();
    expect(result?.widthInches).toBeGreaterThan(0);
    expect(result?.heightInches).toBeCloseTo(10, 5);
  });

  it('ignores null successors without throwing', () => {
    const shape = {
      height: 12,
      baseA: 8,
      baseB: 8,
      successors: [
        null,
        {
          height: 4,
          baseA: 4,
          baseB: 4,
          successors: [null]
        }
      ]
    };

    const result = calculatePanelDimensions(shape, 1.25);

    expect(result).not.toBeNull();
    expect(result?.widthInches).toBeGreaterThan(0);
    expect(result?.heightInches).toBeGreaterThan(0);
  });

  it('returns null for invalid shape input', () => {
    expect(calculatePanelDimensions(null)).toBeNull();
    expect(calculatePanelDimensions(undefined)).toBeNull();
    expect(calculatePanelDimensions('invalid')).toBeNull();
  });
});
