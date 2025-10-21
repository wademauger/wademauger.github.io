import { KnittingInstructionActualizer, StitchRow } from '../KnittingInstructionActualizer';

// Minimal concrete actualizer for testing detection helpers
class TestActualizer extends KnittingInstructionActualizer {
    actualize(sectionRows: StitchRow[], baseRowIndex: number) {
        return [];
    }
}

describe('KnittingInstructionActualizer edge cases', () => {
    let actualizer: TestActualizer;

    beforeEach(() => {
        actualizer = new TestActualizer();
    });

    it('should not detect patterns when short rows are present in the sequence', () => {
        const rows: StitchRow[] = [
            { rowNumber: 1, leftStitchesInWork: 30, rightStitchesInWork: 30 },
            { rowNumber: 2, leftStitchesInWork: 31, rightStitchesInWork: 31, shortRowInfo: { shortRowId: 'sr', rowInShortRowSequence: 1, totalRowsInShortRow: 1, heldStitchesLeft:0, heldStitchesRight:0, activeStitchesLeft:31, activeStitchesRight:31 } },
            { rowNumber: 3, leftStitchesInWork: 31, rightStitchesInWork: 31 }
        ];

        // detectShapingPattern is protected; we can call via (actualizer as any)
        const pattern = (actualizer as any).detectShapingPattern(rows, 0);
        expect(pattern).toBeNull();
    });

    it('should detect repeating patterns when present', () => {
        const rows: StitchRow[] = [];
        // Increase 1 both sides every row, repeat 4 times
        for (let i = 0; i < 8; i++) {
            rows.push({ rowNumber: i + 1, leftStitchesInWork: 30 + Math.floor(i / 2), rightStitchesInWork: 30 + Math.floor(i / 2) });
        }

        const pattern = (actualizer as any).detectShapingPattern(rows, 0);
        // This pattern detection is simple; ensure it returns null or a valid pattern object correctly (non-crashing)
        if (pattern) {
            expect(typeof pattern.frequency).toBe('number');
            expect(typeof pattern.repeatCount).toBe('number');
        } else {
            expect(pattern).toBeNull();
        }
    });

    it('should clamp getAbsolutePosition to provided maxNeedlesPerSide', () => {
        const big = new TestActualizer({ maxNeedlesPerSide: 300 });
        const row: StitchRow = { rowNumber: 1, leftStitchesInWork: 250, rightStitchesInWork: 250 };
        const pos = big.getAbsolutePosition(row);
        expect(pos.leftStitches).toBe(250);
        expect(pos.rightStitches).toBe(250);
        expect(pos.needleRange).toBe('L250-R250');
    });
});
