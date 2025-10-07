export type PanelBounds = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
};

export type PanelDimensions = {
  widthInches: number;
  heightInches: number;
  bounds: PanelBounds;
};

const toNumber = (value: any): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const clampNonNegative = (value: number): number => (value < 0 ? 0 : value);

const normalizeScale = (scale: number): number => {
  const numeric = toNumber(scale);
  return numeric === 0 ? 1 : Math.abs(numeric);
};

const traverseShape = (
  trap: any,
  scale: number,
  xOffset: number,
  yOffset: number,
  bounds: PanelBounds
): void => {
  if (!trap || typeof trap !== 'object') {
    return;
  }

  const baseA = clampNonNegative(toNumber(trap.baseA));
  const baseB = clampNonNegative(toNumber(trap.baseB));
  const height = clampNonNegative(toNumber(trap.height));
  const horizontalOffset = toNumber(trap.baseBHorizontalOffset);

  const scaledBaseA = baseA * scale;
  const scaledBaseB = baseB * scale;
  const scaledHeight = height * scale;
  const trapWidth = Math.max(scaledBaseA, scaledBaseB);

  const topLeftX = xOffset + (trapWidth - scaledBaseB) / 2 + horizontalOffset * scale;
  const topRightX = xOffset + (trapWidth + scaledBaseB) / 2 + horizontalOffset * scale;
  const bottomLeftX = xOffset + (trapWidth - scaledBaseA) / 2;
  const bottomRightX = xOffset + (trapWidth + scaledBaseA) / 2;
  const topY = yOffset;
  const bottomY = yOffset + scaledHeight;

  bounds.minX = Math.min(bounds.minX, topLeftX, topRightX, bottomLeftX, bottomRightX);
  bounds.maxX = Math.max(bounds.maxX, topLeftX, topRightX, bottomLeftX, bottomRightX);
  bounds.minY = Math.min(bounds.minY, topY, bottomY);
  bounds.maxY = Math.max(bounds.maxY, topY, bottomY);

  const successors = Array.isArray(trap.successors)
    ? trap.successors.filter((s: any) => s && typeof s === 'object')
    : [];

  if (!successors.length) {
    return;
  }

  const successorWidths = successors.map((successor: any) => {
    const succBaseA = clampNonNegative(toNumber(successor.baseA));
    const succBaseB = clampNonNegative(toNumber(successor.baseB));
    return Math.max(succBaseA, succBaseB) * scale;
  });

  const totalWidth = successorWidths.reduce((sum: number, w: number) => sum + w, 0);
  let childOffset = xOffset + (trapWidth - totalWidth) / 2;

  successors.forEach((successor: any, index: number) => {
    const successorHeight = clampNonNegative(toNumber(successor.height)) * scale;
    const successorWidth = successorWidths[index] || 0;
    traverseShape(successor, scale, childOffset, topY - successorHeight, bounds);
    childOffset += successorWidth;
  });
};

export const calculatePanelDimensions = (
  shape: any,
  scale = 1
): PanelDimensions | null => {
  if (!shape || typeof shape !== 'object') {
    return null;
  }

  const safeScale = normalizeScale(scale || 1);

  const bounds: PanelBounds = {
    minX: Number.POSITIVE_INFINITY,
    maxX: Number.NEGATIVE_INFINITY,
    minY: Number.POSITIVE_INFINITY,
    maxY: Number.NEGATIVE_INFINITY
  };

  traverseShape(shape, safeScale, 0, 0, bounds);

  if (!Number.isFinite(bounds.minX) || !Number.isFinite(bounds.maxX) || !Number.isFinite(bounds.minY) || !Number.isFinite(bounds.maxY)) {
    return null;
  }

  const widthInches = bounds.maxX - bounds.minX;
  const heightInches = bounds.maxY - bounds.minY;

  if (!Number.isFinite(widthInches) || !Number.isFinite(heightInches)) {
    return null;
  }

  return {
    widthInches,
    heightInches,
    bounds
  };
};

export default calculatePanelDimensions;
