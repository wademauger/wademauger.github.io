import knittingDesignReducer, { savePattern } from '../store/knittingDesignSlice';
import { ColorworkPattern } from '../models/ColorworkPattern';

describe('Colorwork pattern create/save/load', () => {
  it('creates, saves, and loads a single red stitch', () => {
    const p = new ColorworkPattern(1, 1, null, {}, { name: 'single-red' }, 'BG');
    p.setColor('R', '#ff0000', 'Red');
    p.setStitch(0, 0, 'R');

    const payload = { id: 'single-red', ...p.toJSON() };

    const state = knittingDesignReducer(undefined, savePattern(payload));
    expect(state.patternData.colorwork.savedPatterns['single-red']).toBeDefined();
    const saved = state.patternData.colorwork.savedPatterns['single-red'];
    expect(saved.grid).toEqual([['R']]);

    const loaded = ColorworkPattern.fromJSON(saved);
    expect(loaded.grid[0][0]).toBe('R');
    expect(loaded.colors.R.color).toBe('#ff0000');
  });

  it('creates, saves, and loads 2x2, 3x3, and 4x4 checkerboards', () => {
    const sizes = [2, 3, 4];
    sizes.forEach((n) => {
      const p = new ColorworkPattern(n, n, null, {}, { name: `checker-${n}` }, 'A');
      p.setColor('A', '#ffffff', 'A');
      p.setColor('B', '#000000', 'B');

      for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
          const id = (r + c) % 2 === 0 ? 'A' : 'B';
          p.setStitch(r, c, id);
        }
      }

      const payload = { id: `checker-${n}`, ...p.toJSON() };
      const state = knittingDesignReducer(undefined, savePattern(payload));
      const saved = state.patternData.colorwork.savedPatterns[`checker-${n}`];
      expect(saved).toBeDefined();
      expect(saved.grid.length).toBe(n);
      expect(saved.grid[0].length).toBe(n);

      const loaded = ColorworkPattern.fromJSON(saved);
      for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
          const expected = (r + c) % 2 === 0 ? 'A' : 'B';
          expect(loaded.grid[r][c]).toBe(expected);
        }
      }
    });
  });

  it('creates, saves, and loads a white 4x4 with a black outline', () => {
    const n = 4;
    const p = new ColorworkPattern(n, n, null, {}, { name: 'outlined-4x4' }, 'W');
    p.setColor('W', '#ffffff', 'White');
    p.setColor('B', '#000000', 'Black');

    // set outline
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (r === 0 || r === n - 1 || c === 0 || c === n - 1) {
          p.setStitch(r, c, 'B');
        } else {
          p.setStitch(r, c, 'W');
        }
      }
    }

    const payload = { id: 'outlined-4x4', ...p.toJSON() };
    const state = knittingDesignReducer(undefined, savePattern(payload));
    const saved = state.patternData.colorwork.savedPatterns['outlined-4x4'];
    expect(saved).toBeDefined();

    const loaded = ColorworkPattern.fromJSON(saved);
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        const expected = (r === 0 || r === n - 1 || c === 0 || c === n - 1) ? 'B' : 'W';
        expect(loaded.grid[r][c]).toBe(expected);
      }
    }
  });

  it('creates, saves, and loads a 4x4 with 16 different colored stitches', () => {
    const n = 4;
    const p = new ColorworkPattern(n, n, null, {}, { name: 'unique-4x4' }, 'c1');

    let idCounter = 1;
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        const id = `c${idCounter}`;
        const hex = `#${(idCounter * 111111).toString(16).slice(0,6).padStart(6,'0')}`;
        p.setColor(id, hex, `Color ${idCounter}`);
        p.setStitch(r, c, id);
        idCounter++;
      }
    }

    const payload = { id: 'unique-4x4', ...p.toJSON() };
    const state = knittingDesignReducer(undefined, savePattern(payload));
    const saved = state.patternData.colorwork.savedPatterns['unique-4x4'];
    expect(saved).toBeDefined();

    const loaded = ColorworkPattern.fromJSON(saved);
    let check = 1;
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        expect(loaded.grid[r][c]).toBe(`c${check}`);
        check++;
      }
    }
  });

  it('creates, saves, and loads a 5x5 heart pattern', () => {
    // Heart pattern (5x5) - H for heart, BG for background
    const heartGrid = [
      ['H','H','B','H','H'],
      ['H','H','H','H','H'],
      ['H','H','H','H','H'],
      ['B','H','H','H','B'],
      ['B','B','H','B','B']
    ];

    const p = new ColorworkPattern(5,5, heartGrid, {}, { name: 'heart-5x5' }, 'B');
    p.setColor('H', '#ff0066', 'Heart');
    p.setColor('B', '#ffffff', 'BG');

    const payload = { id: 'heart-5x5', ...p.toJSON() };
    const state = knittingDesignReducer(undefined, savePattern(payload));
    const saved = state.patternData.colorwork.savedPatterns['heart-5x5'];
    expect(saved).toBeDefined();

    const loaded = ColorworkPattern.fromJSON(saved);
    expect(loaded.getRowCount()).toBe(5);
    expect(loaded.grid[0][0]).toBe('H');
    expect(loaded.grid[4][4]).toBe('B');
  });

});
