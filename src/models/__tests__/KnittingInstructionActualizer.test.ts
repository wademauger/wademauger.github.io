import { KnittingInstructionActualizer, StitchRow, KnittingInstruction, PatternDetectionResult } from '../KnittingInstructionActualizer';

/**
 * Test Suite: KnittingInstructionActualizer Base Class
 * 
 * Tests the abstract base class functionality including:
 * - Position calculation from stitch counts
 * - Needle range calculation
 * - Constructor and options handling
 */
describe('KnittingInstructionActualizer Base Class', () => {
    // Concrete implementation for testing abstract class
    class TestActualizer extends KnittingInstructionActualizer {
        actualize(sectionRows: StitchRow[], baseRowIndex: number): KnittingInstruction[] {
            return [];
        }
    }

    describe('getAbsolutePosition()', () => {
        let actualizer: KnittingInstructionActualizer;

        beforeEach(() => {
            actualizer = new TestActualizer();
        });

        it('should calculate needle positions from stitch counts', () => {
            const row: StitchRow = {
                rowNumber: 1,
                leftStitchesInWork: 20,
                rightStitchesInWork: 20
            };

            const position = actualizer.getAbsolutePosition(row);

            expect(position).toEqual({
                totalStitches: 40,
                leftStitches: 20,
                rightStitches: 20,
                needleRange: 'L20-R20',
                description: 'Knitting across 40 stitches (20 left, 20 right)'
            });
        });

        it('should handle asymmetric stitch distribution', () => {
            const row: StitchRow = {
                rowNumber: 5,
                leftStitchesInWork: 5,
                rightStitchesInWork: 25
            };

            const position = actualizer.getAbsolutePosition(row);

            expect(position).toEqual({
                totalStitches: 30,
                leftStitches: 5,
                rightStitches: 25,
                needleRange: 'L5-R25',
                description: 'Knitting across 30 stitches (5 left, 25 right)'
            });
        });

        it('should handle zero stitches on one side', () => {
            const row: StitchRow = {
                rowNumber: 10,
                leftStitchesInWork: 0,
                rightStitchesInWork: 50
            };

            const position = actualizer.getAbsolutePosition(row);

            expect(position).toEqual({
                totalStitches: 50,
                leftStitches: 0,
                rightStitches: 50,
                needleRange: 'R1-R50',
                description: 'Knitting across 50 stitches (0 left, 50 right)'
            });
        });

        it('should handle single stitch total', () => {
            const row: StitchRow = {
                rowNumber: 1,
                leftStitchesInWork: 1,
                rightStitchesInWork: 0
            };

            const position = actualizer.getAbsolutePosition(row);

            expect(position).toEqual({
                totalStitches: 1,
                leftStitches: 1,
                rightStitches: 0,
                needleRange: 'L1-L1',
                description: 'Knitting across 1 stitches (1 left, 0 right)'
            });
        });

        it('should handle null row', () => {
            const position = actualizer.getAbsolutePosition(null as any);
            expect(position).toBeNull();
        });

        it('should handle undefined row', () => {
            const position = actualizer.getAbsolutePosition(undefined as any);
            expect(position).toBeNull();
        });

        it('should calculate correct needle range for typical full width', () => {
            const row: StitchRow = {
                rowNumber: 1,
                leftStitchesInWork: 31,
                rightStitchesInWork: 31
            };

            const position = actualizer.getAbsolutePosition(row);

            expect(position).toEqual({
                totalStitches: 62,
                leftStitches: 31,
                rightStitches: 31,
                needleRange: 'L31-R31',
                description: 'Knitting across 62 stitches (31 left, 31 right)'
            });
        });

        it('should handle large stitch counts', () => {
            // Use an actualizer configured for larger machine beds to avoid clamping
            const bigActualizer = new TestActualizer({ maxNeedlesPerSide: 200 });

            const row: StitchRow = {
                rowNumber: 1,
                leftStitchesInWork: 100,
                rightStitchesInWork: 100
            };

            const position = bigActualizer.getAbsolutePosition(row);

            expect(position).toEqual({
                totalStitches: 200,
                leftStitches: 100,
                rightStitches: 100,
                needleRange: 'L100-R100',
                description: 'Knitting across 200 stitches (100 left, 100 right)'
            });
        });
    });

    describe('Constructor', () => {
        it('should accept knitting options in constructor', () => {
            const options = {
                castOnMethod: 'long-tail',
                bindOffMethod: 'knitwise',
                shortRowTechnique: 'wraps'
            };

            const actualizer = new TestActualizer(options);
            expect((actualizer as any).knittingOptions).toEqual(options);
        });

        it('should default to empty options if not provided', () => {
            const actualizer = new TestActualizer();
            expect((actualizer as any).knittingOptions).toEqual({});
        });

        it('should use provided options with partial configuration', () => {
            const options = { castOnMethod: 'provisional' };
            const actualizer = new TestActualizer(options);
            expect((actualizer as any).knittingOptions).toEqual(options);
        });
    });

    describe('Interface Compliance', () => {
        it('should have abstract actualize method', () => {
            const actualizer = new TestActualizer();
            expect(typeof actualizer.actualize).toBe('function');
        });

        it('should have public getAbsolutePosition method', () => {
            const actualizer = new TestActualizer();
            expect(typeof actualizer.getAbsolutePosition).toBe('function');
        });
    });

    describe('Edge Cases', () => {
        let edgeActualizer: KnittingInstructionActualizer;

        beforeEach(() => {
            edgeActualizer = new TestActualizer();
        });

        it('should handle very large left side bias', () => {
            const row: StitchRow = {
                rowNumber: 1,
                leftStitchesInWork: 60,
                rightStitchesInWork: 1
            };

            const position = edgeActualizer.getAbsolutePosition(row);

            expect(position.totalStitches).toBe(61);
            expect(position.leftStitches).toBe(60);
            expect(position.rightStitches).toBe(1);
            expect(position.needleRange).toBe('L60-R1');
        });

        it('should handle very large right side bias', () => {
            const row: StitchRow = {
                rowNumber: 1,
                leftStitchesInWork: 1,
                rightStitchesInWork: 60
            };

            const position = edgeActualizer.getAbsolutePosition(row);

            expect(position.totalStitches).toBe(61);
            expect(position.leftStitches).toBe(1);
            expect(position.rightStitches).toBe(60);
            expect(position.needleRange).toBe('L1-R60');
        });
    });
});
