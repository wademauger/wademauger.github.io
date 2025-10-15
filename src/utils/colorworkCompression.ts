/**
 * Colorwork compression utilities
 * 
 * Compresses colorwork data using:
 * 1. Run-length encoding (RLE) for solid color runs
 * 2. Pattern repeats for repeating sequences
 * 
 * Examples:
 * - ["MC", "MC", "MC", ...100 times] → { type: "solid", color: "MC", count: 100 }
 * - ["MC", "MC", "CC1", "CC1", "MC", "MC", "CC1", "CC1"] → { type: "repeat", pattern: ["MC", "MC", "CC1", "CC1"], count: 2 }
 */

/**
 * A segment of compressed colorwork data
 */
export type ColorworkSegment = 
  | { type: 'solid'; color: string; count: number }
  | { type: 'repeat'; pattern: string[]; count: number }
  | { type: 'raw'; colors: string[] }; // Fallback for complex patterns

/**
 * Compress a colorwork array for a single row
 */
export function compressColorwork(colors: string[]): ColorworkSegment[] {
  if (!colors || colors.length === 0) {
    return [];
  }

  const segments: ColorworkSegment[] = [];
  let i = 0;

  while (i < colors.length) {
    // Try to find a solid run (3+ of same color is worth compressing)
    const solidRun = findSolidRun(colors, i);
    if (solidRun.count >= 3) {
      segments.push({
        type: 'solid',
        color: solidRun.color,
        count: solidRun.count
      });
      i += solidRun.count;
      continue;
    }

    // Try to find a repeating pattern (2+ repeats worth compressing)
    const patternRepeat = findPatternRepeat(colors, i);
    if (patternRepeat.count >= 2 && patternRepeat.pattern.length >= 2) {
      segments.push({
        type: 'repeat',
        pattern: patternRepeat.pattern,
        count: patternRepeat.count
      });
      i += patternRepeat.pattern.length * patternRepeat.count;
      continue;
    }

    // No compression possible - add as raw segment
    // Collect a few stitches until we find something compressible
    const rawSegment: string[] = [];
    while (i < colors.length) {
      rawSegment.push(colors[i]);
      i++;

      // Check if next section is compressible
      if (i < colors.length) {
        const nextSolid = findSolidRun(colors, i);
        const nextPattern = findPatternRepeat(colors, i);
        if (nextSolid.count >= 3 || (nextPattern.count >= 2 && nextPattern.pattern.length >= 2)) {
          break;
        }
      }
    }

    segments.push({
      type: 'raw',
      colors: rawSegment
    });
  }

  return segments;
}

/**
 * Decompress a colorwork segment array back to a full color array
 */
export function decompressColorwork(segments: ColorworkSegment[]): string[] {
  const result: string[] = [];

  for (const segment of segments) {
    switch (segment.type) {
      case 'solid':
        for (let i = 0; i < segment.count; i++) {
          result.push(segment.color);
        }
        break;

      case 'repeat':
        for (let i = 0; i < segment.count; i++) {
          result.push(...segment.pattern);
        }
        break;

      case 'raw':
        result.push(...segment.colors);
        break;
    }
  }

  return result;
}

/**
 * Find a solid run of the same color starting at index
 */
function findSolidRun(colors: string[], startIndex: number): { color: string; count: number } {
  const color = colors[startIndex];
  let count = 1;

  for (let i = startIndex + 1; i < colors.length; i++) {
    if (colors[i] === color) {
      count++;
    } else {
      break;
    }
  }

  return { color, count };
}

/**
 * Find a repeating pattern starting at index
 * Tests pattern lengths from 2 to 20 stitches
 */
function findPatternRepeat(colors: string[], startIndex: number): { pattern: string[]; count: number } {
  const remaining = colors.length - startIndex;
  
  // Try pattern lengths from 2 to min(20, remaining/2)
  const maxPatternLength = Math.min(20, Math.floor(remaining / 2));

  for (let patternLength = 2; patternLength <= maxPatternLength; patternLength++) {
    const pattern = colors.slice(startIndex, startIndex + patternLength);
    let repeatCount = 1;

    // Check how many times this pattern repeats
    let checkIndex = startIndex + patternLength;
    while (checkIndex + patternLength <= colors.length) {
      let matches = true;
      for (let i = 0; i < patternLength; i++) {
        if (colors[checkIndex + i] !== pattern[i]) {
          matches = false;
          break;
        }
      }

      if (matches) {
        repeatCount++;
        checkIndex += patternLength;
      } else {
        break;
      }
    }

    // If we found at least 2 repeats, return this pattern
    if (repeatCount >= 2) {
      return { pattern, count: repeatCount };
    }
  }

  // No repeating pattern found
  return { pattern: [], count: 0 };
}

/**
 * Calculate compression ratio for analysis
 */
export function calculateCompressionRatio(original: string[], compressed: ColorworkSegment[]): number {
  const originalSize = original.length;
  
  // Estimate compressed size (rough approximation)
  let compressedSize = 0;
  for (const segment of compressed) {
    switch (segment.type) {
      case 'solid':
        compressedSize += 2; // color + count
        break;
      case 'repeat':
        compressedSize += segment.pattern.length + 1; // pattern + count
        break;
      case 'raw':
        compressedSize += segment.colors.length; // raw data
        break;
    }
  }

  return originalSize / compressedSize;
}

/**
 * Get human-readable compression stats
 */
export function getCompressionStats(original: string[], compressed: ColorworkSegment[]) {
  const ratio = calculateCompressionRatio(original, compressed);
  const originalSize = original.length;
  
  let solidCount = 0;
  let repeatCount = 0;
  let rawCount = 0;

  for (const segment of compressed) {
    switch (segment.type) {
      case 'solid':
        solidCount++;
        break;
      case 'repeat':
        repeatCount++;
        break;
      case 'raw':
        rawCount++;
        break;
    }
  }

  return {
    originalStitches: originalSize,
    compressedSegments: compressed.length,
    compressionRatio: ratio.toFixed(2) + 'x',
    solidRuns: solidCount,
    patterns: repeatCount,
    rawSegments: rawCount
  };
}
