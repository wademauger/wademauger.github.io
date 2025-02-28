
import assert from 'assert';
import { StitchPlan } from './StitchPlan';

describe('StitchPlan Model', () => {
    let stitchPlan;

    beforeEach(() => {
        stitchPlan = new StitchPlan();
    });

    it('should create a StitchPlan instance', () => {
        assert.ok(stitchPlan instanceof StitchPlan);
        assert.deepStrictEqual(stitchPlan.rows, []);
    });

    it('should add a row', () => {
        const row = new StitchPlan.Row(1, 10, 10);
        stitchPlan.addRow(row);
        assert.strictEqual(stitchPlan.rows.length, 1);
        assert.deepStrictEqual(stitchPlan.rows[0], row);
    });

    describe('generateKnittingInstructions', () => {
        it('should return an empty array if there are no rows', () => {
            const instructions = stitchPlan.generateKnittingInstructions();
            assert.deepStrictEqual(instructions, []);
        });

        it('should generate instructions for a rectangular panel', () => {
            stitchPlan.addRow(new StitchPlan.Row(1, 10, 10));
            stitchPlan.addRow(new StitchPlan.Row(2, 10, 10));
            const instructions = stitchPlan.generateKnittingInstructions();
            assert.deepStrictEqual(instructions, ['Knit 2 rows (RC=2, 20 sts in work).']);
        });

        it('should generate instructions for a trapezoidal panel', () => {
            stitchPlan.addRow(new StitchPlan.Row(1, 10, 10));
            stitchPlan.addRow(new StitchPlan.Row(2, 11, 11));
            let expectedInstructions = ['Increase 1 stitch on the left. Increase 1 stitch on the right. Knit 2 rows. (RC=2, 22 sts in work)' ];
            assert.deepStrictEqual(stitchPlan.generateKnittingInstructions(), expectedInstructions);
            stitchPlan.addRow(new StitchPlan.Row(3, 12, 12));
            expectedInstructions.push('Increase 1 stitch on the left. Increase 1 stitch on the right. Knit 1 row. (RC=3, 24 sts in work)');
            assert.deepStrictEqual(stitchPlan.generateKnittingInstructions(), expectedInstructions);
        });
    });
});

describe('StitchPlan.Row', () => {
    it('should create a Row instance', () => {
        const row = new StitchPlan.Row(1, 10, 10);
        assert.strictEqual(row.rowNumber, 1);
        assert.strictEqual(row.leftStitchesInWork, 10);
        assert.strictEqual(row.rightStitchesInWork, 10);
    });
});
