// stepColors.test.js
import { STEP_COLORS, getStepColor, createStepGradient, getGradientButtonStyle } from './stepColors';

describe('stepColors utilities', () => {
  test('STEP_COLORS should have correct ROYGBIV mapping', () => {
    expect(STEP_COLORS[0].name).toBe('Red');
    expect(STEP_COLORS[1].name).toBe('Orange');
    expect(STEP_COLORS[2].name).toBe('Yellow');
    expect(STEP_COLORS[3].name).toBe('Green');
    expect(STEP_COLORS[4].name).toBe('Blue');
    expect(STEP_COLORS[5].name).toBe('Indigo');
    expect(STEP_COLORS[6].name).toBe('Violet');
  });

  test('getStepColor should return correct color for valid step', () => {
    const redColor = getStepColor(0);
    expect(redColor.name).toBe('Red');
    expect(redColor.primary).toBe('#ff4d4f');
  });

  test('getStepColor should fallback to step 0 for invalid step', () => {
    const fallbackColor = getStepColor(99);
    expect(fallbackColor.name).toBe('Red');
  });

  test('createStepGradient should create simple gradient for target step', () => {
    const gradient = createStepGradient(0, 1);
    expect(gradient).toContain('linear-gradient(135deg');
    expect(gradient).toContain('#fa8c16'); // Orange (target step)
  });

  test('createStepGradient should create gradient for target step only', () => {
    const gradient = createStepGradient(0, 3);
    expect(gradient).toContain('linear-gradient(135deg');
    expect(gradient).toContain('#52c41a'); // Green (target step)
    // Should not contain other step colors since it's single-color gradient
    expect(gradient).not.toContain('#ff4d4f'); // Red
    expect(gradient).not.toContain('#fa8c16'); // Orange
    expect(gradient).not.toContain('#fadb14'); // Yellow
  });

  test('getGradientButtonStyle should return disabled style when disabled=true', () => {
    const style = getGradientButtonStyle(0, 1, true);
    expect(style.background).toBe('#f5f5f5');
    expect(style.borderColor).toBe('#d9d9d9');
  });

  test('getGradientButtonStyle should return gradient style when enabled', () => {
    const style = getGradientButtonStyle(0, 1, false);
    expect(style.background).toContain('linear-gradient');
    expect(style.color).toBe('white');
    expect(style.fontWeight).toBe('bold');
  });
});
