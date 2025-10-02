import { ColorworkPattern } from './ColorworkPattern.js';

describe('ColorworkPattern', () => {
  describe('constructor', () => {
    it('should create pattern with grid', () => {
      const grid = [['MC', 'CC'], ['CC', 'MC']];
      const colors = { MC: { id: 'MC', color: '#fff', label: 'Main' } };
      const pattern = new ColorworkPattern(0, 0, grid, colors);

      expect(pattern.grid).toEqual(grid);
      expect(pattern.colors).toEqual(colors);
    });

    it('should create empty grid when no grid provided', () => {
      const pattern = new ColorworkPattern(3, 2);

      expect(pattern.grid.length).toBe(2);
      expect(pattern.grid[0].length).toBe(3);
      expect(pattern.grid[0][0]).toBe('MC');
    });

    it('should use custom fill color for empty grid', () => {
      const pattern = new ColorworkPattern(2, 2, null, {}, {}, 'CC');

      expect(pattern.grid[0][0]).toBe('CC');
      expect(pattern.grid[1][1]).toBe('CC');
    });
  });

  describe('fromJSON', () => {
    it('should create pattern from JSON object', () => {
      const json = {
        grid: [['MC', 'CC']],
        colors: { MC: { id: 'MC', color: '#fff' } },
        metadata: { name: 'Test' }
      };

      const pattern = ColorworkPattern.fromJSON(json);

      expect(pattern.grid).toEqual(json.grid);
      expect(pattern.colors).toEqual(json.colors);
      expect(pattern.metadata).toEqual(json.metadata);
    });

    it('should handle JSON without grid', () => {
      const json = { colors: {}, metadata: {} };
      const pattern = ColorworkPattern.fromJSON(json);

      expect(pattern.grid).toEqual([]);
    });
  });

  describe('toJSON', () => {
    it('should serialize pattern to JSON', () => {
      const grid = [['MC', 'CC']];
      const colors = { MC: { id: 'MC', color: '#fff' } };
      const metadata = { name: 'Test' };
      const pattern = new ColorworkPattern(0, 0, grid, colors, metadata);

      const json = pattern.toJSON();

      expect(json.grid).toEqual(grid);
      expect(json.colors).toEqual(colors);
      expect(json.metadata).toEqual(metadata);
    });
  });

  describe('setColor', () => {
    it('should add a color definition', () => {
      const pattern = new ColorworkPattern(2, 2);
      pattern.setColor('CC', '#000000', 'Contrast Color');

      expect(pattern.colors.CC).toEqual({
        id: 'CC',
        color: '#000000',
        label: 'Contrast Color'
      });
    });

    it('should use id as label if not provided', () => {
      const pattern = new ColorworkPattern(2, 2);
      pattern.setColor('CC', '#000000');

      expect(pattern.colors.CC.label).toBe('CC');
    });
  });

  describe('setStitch', () => {
    it('should set stitch color at valid position', () => {
      const pattern = new ColorworkPattern(3, 2);
      pattern.setStitch(1, 2, 'CC');

      expect(pattern.grid[1][2]).toBe('CC');
    });

    it('should not set stitch at negative row', () => {
      const pattern = new ColorworkPattern(3, 2);
      pattern.setStitch(-1, 0, 'CC');

      expect(pattern.grid[0][0]).toBe('MC');
    });

    it('should not set stitch at out-of-bounds row', () => {
      const pattern = new ColorworkPattern(3, 2);
      pattern.setStitch(5, 0, 'CC');

      expect(pattern.grid[0][0]).toBe('MC');
    });

    it('should not set stitch at negative column', () => {
      const pattern = new ColorworkPattern(3, 2);
      pattern.setStitch(0, -1, 'CC');

      expect(pattern.grid[0][0]).toBe('MC');
    });

    it('should not set stitch at out-of-bounds column', () => {
      const pattern = new ColorworkPattern(3, 2);
      pattern.setStitch(0, 5, 'CC');

      expect(pattern.grid[0][0]).toBe('MC');
    });
  });

  describe('getRowCount', () => {
    it('should return number of rows', () => {
      const pattern = new ColorworkPattern(3, 5);
      expect(pattern.getRowCount()).toBe(5);
    });
  });

  describe('getStitchCount', () => {
    it('should return number of stitches per row', () => {
      const pattern = new ColorworkPattern(7, 3);
      expect(pattern.getStitchCount()).toBe(7);
    });

    it('should return 0 for empty grid', () => {
      const pattern = new ColorworkPattern(0, 0, []);
      expect(pattern.getStitchCount()).toBe(0);
    });
  });

  describe('getColorsUsed', () => {
    it('should return list of colors used in pattern', () => {
      const pattern = new ColorworkPattern(2, 2);
      pattern.setColor('MC', '#ffffff', 'Main');
      pattern.setColor('CC', '#000000', 'Contrast');
      pattern.setStitch(0, 0, 'MC');
      pattern.setStitch(0, 1, 'CC');
      pattern.setStitch(1, 0, 'CC');
      pattern.setStitch(1, 1, 'MC');

      const colorsUsed = pattern.getColorsUsed();

      expect(colorsUsed.length).toBe(2);
      expect(colorsUsed.map(c => c.id).sort()).toEqual(['CC', 'MC']);
    });

    it('should filter out undefined colors', () => {
      const grid = [['MC', 'UNKNOWN']];
      const colors = { MC: { id: 'MC', color: '#fff' } };
      const pattern = new ColorworkPattern(0, 0, grid, colors);

      const colorsUsed = pattern.getColorsUsed();

      expect(colorsUsed.length).toBe(1);
      expect(colorsUsed[0].id).toBe('MC');
    });

    it('should handle empty color ids', () => {
      const grid = [['MC', null, '']];
      const colors = { MC: { id: 'MC', color: '#fff' } };
      const pattern = new ColorworkPattern(0, 0, grid, colors);

      const colorsUsed = pattern.getColorsUsed();

      expect(colorsUsed.length).toBe(1);
    });
  });

  describe('getRowInstructions', () => {
    it('should return instructions for a row', () => {
      const pattern = new ColorworkPattern(5, 1);
      pattern.setColor('MC', '#ffffff');
      pattern.setColor('CC', '#000000');
      pattern.setStitch(0, 0, 'MC');
      pattern.setStitch(0, 1, 'MC');
      pattern.setStitch(0, 2, 'CC');
      pattern.setStitch(0, 3, 'CC');
      pattern.setStitch(0, 4, 'MC');

      const instructions = pattern.getRowInstructions(0);

      expect(instructions.length).toBe(3);
      expect(instructions[0]).toEqual({
        colorId: 'MC',
        color: pattern.colors.MC,
        stitchCount: 2
      });
      expect(instructions[1]).toEqual({
        colorId: 'CC',
        color: pattern.colors.CC,
        stitchCount: 2
      });
      expect(instructions[2]).toEqual({
        colorId: 'MC',
        color: pattern.colors.MC,
        stitchCount: 1
      });
    });

    it('should return empty array for invalid row index', () => {
      const pattern = new ColorworkPattern(3, 2);
      expect(pattern.getRowInstructions(-1)).toEqual([]);
      expect(pattern.getRowInstructions(5)).toEqual([]);
    });
  });

  describe('resizeToFit', () => {
    it('should resize pattern to target dimensions', () => {
      const pattern = new ColorworkPattern(2, 2);
      pattern.setStitch(0, 0, 'MC');
      pattern.setStitch(0, 1, 'CC');
      pattern.setStitch(1, 0, 'CC');
      pattern.setStitch(1, 1, 'MC');

      pattern.resizeToFit(4, 4);

      expect(pattern.getRowCount()).toBe(4);
      expect(pattern.getStitchCount()).toBe(4);
    });

    it('should not resize if current dimensions are zero', () => {
      const pattern = new ColorworkPattern(0, 0, []);
      pattern.resizeToFit(4, 4);

      expect(pattern.getRowCount()).toBe(0);
    });

    it('should handle resize with fill color', () => {
      const grid = [['MC', 'CC']];
      const pattern = new ColorworkPattern(0, 0, grid);
      pattern.resizeToFit(4, 2, 'BG');

      expect(pattern.getRowCount()).toBe(2);
      expect(pattern.getStitchCount()).toBe(4);
    });
  });

  describe('extractSection', () => {
    it('should extract a section of the pattern', () => {
      const pattern = new ColorworkPattern(4, 3);
      pattern.setStitch(1, 2, 'CC');

      const section = pattern.extractSection(1, 3, 0, 2);

      expect(section.grid.length).toBe(2);
      expect(section.grid[0].length).toBe(2);
      expect(section.grid[1][1]).toBe('CC');
    });

    it('should use full row count if endRow not specified', () => {
      const pattern = new ColorworkPattern(4, 3);
      const section = pattern.extractSection(0, 2);

      expect(section.grid.length).toBe(3);
      expect(section.grid[0].length).toBe(2);
    });

    it('should add metadata about being a section', () => {
      const pattern = new ColorworkPattern(4, 3);
      const section = pattern.extractSection(1, 3, 0, 2);

      expect(section.metadata.isSection).toBe(true);
      expect(section.metadata.originalStitchRange).toEqual([1, 3]);
      expect(section.metadata.originalRowRange).toEqual([0, 2]);
    });

    it('should handle extraction beyond grid bounds', () => {
      const pattern = new ColorworkPattern(2, 2);
      const section = pattern.extractSection(0, 10, 0, 10);

      expect(section.grid.length).toBe(2);
      expect(section.grid[0].length).toBe(2);
    });

    it('should use MC as fallback for missing cells', () => {
      const grid = [['CC']];
      const pattern = new ColorworkPattern(0, 0, grid);
      const section = pattern.extractSection(0, 3, 0, 2);

      expect(section.grid.length).toBe(1);
      expect(section.grid[0][0]).toBe('CC');
    });
  });
});
