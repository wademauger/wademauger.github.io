/**
 * Tests for colorwork compression utilities
 */

import {
  compressColorwork,
  decompressColorwork,
  getCompressionStats,
  calculateCompressionRatio
} from '../colorworkCompression';

describe('Colorwork Compression', () => {
  describe('compressColorwork', () => {
    it('should compress solid runs efficiently', () => {
      // 100 stitches of MC
      const colors = new Array(100).fill('MC');
      const compressed = compressColorwork(colors);

      expect(compressed).toHaveLength(1);
      expect(compressed[0]).toEqual({
        type: 'solid',
        color: 'MC',
        count: 100
      });
    });

    it('should compress repeating patterns', () => {
      // Pattern: MC-MC-CC1-CC1 repeated 15 times
      const pattern = ['MC', 'MC', 'CC1', 'CC1'];
      const colors = [];
      for (let i = 0; i < 15; i++) {
        colors.push(...pattern);
      }

      const compressed = compressColorwork(colors);

      expect(compressed).toHaveLength(1);
      expect(compressed[0]).toEqual({
        type: 'repeat',
        pattern: ['MC', 'MC', 'CC1', 'CC1'],
        count: 15
      });
    });

    it('should handle mixed compression types', () => {
      // 20 MC, then MC-MC-CC1-CC1 repeated 15 times, then 20 MC
      const colors = [
        ...new Array(20).fill('MC'),
        ...Array(15).fill(['MC', 'MC', 'CC1', 'CC1']).flat(),
        ...new Array(20).fill('MC')
      ];

      const compressed = compressColorwork(colors);

      // Should have 3 segments: solid MC, repeat, solid MC
      expect(compressed).toHaveLength(3);
      expect(compressed[0].type).toBe('solid');
      expect(compressed[1].type).toBe('repeat');
      expect(compressed[2].type).toBe('solid');
    });

    it('should handle complex non-compressible patterns', () => {
      const colors = ['MC', 'CC1', 'CC2', 'MC', 'CC3', 'CC1'];
      const compressed = compressColorwork(colors);

      // This should be stored as raw since no repeats or solid runs of 3+
      expect(compressed).toHaveLength(1);
      expect(compressed[0].type).toBe('raw');
      expect(compressed[0]).toEqual({
        type: 'raw',
        colors: ['MC', 'CC1', 'CC2', 'MC', 'CC3', 'CC1']
      });
    });
  });

  describe('decompressColorwork', () => {
    it('should correctly decompress solid runs', () => {
      const compressed = [{ type: 'solid' as const, color: 'MC', count: 100 }];
      const decompressed = decompressColorwork(compressed);

      expect(decompressed).toHaveLength(100);
      expect(decompressed.every(c => c === 'MC')).toBe(true);
    });

    it('should correctly decompress repeating patterns', () => {
      const compressed = [{
        type: 'repeat' as const,
        pattern: ['MC', 'MC', 'CC1', 'CC1'],
        count: 3
      }];
      const decompressed = decompressColorwork(compressed);

      expect(decompressed).toHaveLength(12);
      expect(decompressed).toEqual([
        'MC', 'MC', 'CC1', 'CC1',
        'MC', 'MC', 'CC1', 'CC1',
        'MC', 'MC', 'CC1', 'CC1'
      ]);
    });

    it('should correctly decompress raw segments', () => {
      const colors = ['MC', 'CC1', 'CC2', 'MC', 'CC3'];
      const compressed = [{ type: 'raw' as const, colors }];
      const decompressed = decompressColorwork(compressed);

      expect(decompressed).toEqual(colors);
    });

    it('should handle mixed compression types', () => {
      const compressed = [
        { type: 'solid' as const, color: 'MC', count: 20 },
        { type: 'repeat' as const, pattern: ['MC', 'CC1'], count: 5 },
        { type: 'raw' as const, colors: ['CC1', 'CC2', 'MC'] },
        { type: 'solid' as const, color: 'MC', count: 10 }
      ];

      const decompressed = decompressColorwork(compressed);

      expect(decompressed).toEqual([
        ...new Array(20).fill('MC'),
        'MC', 'CC1', 'MC', 'CC1', 'MC', 'CC1', 'MC', 'CC1', 'MC', 'CC1',
        'CC1', 'CC2', 'MC',
        ...new Array(10).fill('MC')
      ]);
    });
  });

  describe('round-trip compression', () => {
    it('should preserve data through compression and decompression', () => {
      const testCases = [
        new Array(100).fill('MC'),
        ['MC', 'CC1', 'MC', 'CC1', 'MC', 'CC1'],
        [
          ...new Array(20).fill('MC'),
          ...Array(10).fill(['MC', 'CC1']).flat(),
          ...new Array(30).fill('MC')
        ]
      ];

      for (const original of testCases) {
        const compressed = compressColorwork(original);
        const decompressed = decompressColorwork(compressed);
        expect(decompressed).toEqual(original);
      }
    });
  });

  describe('compression statistics', () => {
    it('should calculate high compression ratio for solid colors', () => {
      const colors = new Array(100).fill('MC');
      const compressed = compressColorwork(colors);
      const ratio = calculateCompressionRatio(colors, compressed);

      // 100 stitches compressed to ~2 units = 50x ratio
      expect(ratio).toBeGreaterThan(40);
    });

    it('should calculate good compression ratio for repeating patterns', () => {
      const colors = Array(20).fill(['MC', 'MC', 'CC1', 'CC1']).flat();
      const compressed = compressColorwork(colors);
      const ratio = calculateCompressionRatio(colors, compressed);

      // 80 stitches with 4-stitch pattern = good compression
      expect(ratio).toBeGreaterThan(10);
    });

    it('should provide detailed compression stats', () => {
      const colors = [
        ...new Array(20).fill('MC'),
        ...Array(10).fill(['MC', 'CC1']).flat(),
        ...new Array(30).fill('MC')
      ];

      const compressed = compressColorwork(colors);
      const stats = getCompressionStats(colors, compressed);

      expect(stats.originalStitches).toBe(70);
      expect(stats.compressedSegments).toBeGreaterThan(0);
      expect(stats.solidRuns).toBeGreaterThan(0);
      expect(stats.compressionRatio).toMatch(/\d+\.\d+x/);
    });
  });

  describe('real-world scenarios', () => {
    it('should efficiently compress a typical Fair Isle pattern', () => {
      // Background: 20 MC edges, middle: 2-color checkerboard repeated
      const colors = [
        ...new Array(20).fill('MC'),
        ...Array(15).fill(['MC', 'MC', 'CC1', 'CC1']).flat(),
        ...new Array(20).fill('MC')
      ];

      const compressed = compressColorwork(colors);
      const stats = getCompressionStats(colors, compressed);

      console.log('Fair Isle pattern stats:', stats);

      // Should achieve significant compression
      const ratio = parseFloat(stats.compressionRatio);
      expect(ratio).toBeGreaterThan(10);
    });

    it('should handle a row with no colorwork (all MC)', () => {
      const colors = new Array(96).fill('MC');
      const compressed = compressColorwork(colors);
      const stats = getCompressionStats(colors, compressed);

      console.log('All MC row stats:', stats);

      // Should compress to single segment
      expect(compressed).toHaveLength(1);
      expect(compressed[0].type).toBe('solid');

      // Should achieve massive compression
      const ratio = parseFloat(stats.compressionRatio);
      expect(ratio).toBeGreaterThan(40);
    });

    it('should handle complex multi-color stranded patterns', () => {
      // More complex pattern with 3 colors
      const colors = [
        ...new Array(10).fill('MC'),
        ...Array(5).fill(['CC1', 'CC2', 'CC1', 'CC2']).flat(),
        ...new Array(10).fill('MC'),
        ...Array(5).fill(['MC', 'CC1', 'MC', 'CC1']).flat(),
        ...new Array(10).fill('MC')
      ];

      const compressed = compressColorwork(colors);
      const stats = getCompressionStats(colors, compressed);

      console.log('Multi-color pattern stats:', stats);

      // Should still achieve decent compression
      const ratio = parseFloat(stats.compressionRatio);
      expect(ratio).toBeGreaterThan(2);
    });
  });
});
