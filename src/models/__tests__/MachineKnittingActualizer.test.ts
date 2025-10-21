import { MachineKnittingActualizer } from '../MachineKnittingActualizer';
import { StitchRow } from '../KnittingInstructionActualizer';

describe('MachineKnittingActualizer', () => {
    it('should generate machine phrased instructions for simple rectangular section', () => {
        const actualizer = new MachineKnittingActualizer({ machineType: 'generic' });
        const rows: StitchRow[] = [];
        for (let i = 1; i <= 4; i++) {
            rows.push({ rowNumber: i, leftStitchesInWork: 25, rightStitchesInWork: 25 });
        }

        const result = actualizer.actualize(rows, 0);

    expect(result.length).toBe(1);
    expect(result[0].text).toBe('Machine-knit across 50 needles for 4 rows. (RC=4)');
    expect(result[0].stepData.rowsInStep).toBe(4);
    expect(result[0].stepData.absolutePositioning.totalStitches).toBe(50);
    });

    it('should handle short rows from ear-flap hem shape', () => {
        const actualizer = new MachineKnittingActualizer({ machineType: 'generic' });

        // Build concrete stitch plan from the ear flap hat shape
        const { generateConcreteStitchPlan } = require('../../utils/stitchPlanGenerator');
        const { defaultGauge } = require('../Gauge');
        const { garments } = require('../../data/garments');

        // Find the shape object named 'ear flap hat' within garments
        let shapeObj: any = null;
        for (const g of garments) {
            if (g.shapes && g.shapes['ear flap hat']) {
                shapeObj = g.shapes['ear flap hat'];
                break;
            }
        }
        expect(shapeObj).toBeDefined();

        const concrete = generateConcreteStitchPlan(shapeObj, defaultGauge, [], 'ear-flap');
        // Limit to rows belonging to the hem section (label 'A')
        const hemRows = concrete.rows.filter((r: any) => r.sectionLabel === 'A');
        expect(hemRows.length).toBeGreaterThan(0);

        const result = actualizer.actualize(hemRows, 0);

    expect(result.length).toBe(6);
    expect(result[0].text).toBe('Machine-knit across 108 needles for 15 rows. (RC=15)');
    expect(result[1].text).toBe('Transfer 19 stitches on left to waste yarn holder. Transfer 5 stitches on right to waste yarn holder.');
    expect(result[2].text).toBe('Machine-knit across 24 needles (5 left, 19 right). (RC=16)');
    expect(result[3].text).toBe('Transfer 19 stitches on left to waste yarn holder. Transfer 5 stitches on right to waste yarn holder.');
    expect(result[4].text).toBe('Machine-knit across 24 needles (5 left, 19 right). (RC=31)');
    expect(result[5].text).toBe('Machine-knit across 108 needles for 15 rows. (RC=30)');
    });

    it('should clamp needle counts to machine maxNeedlesPerSide', () => {
        // default MachineKnittingActualizer uses max 75
        const actualizer = new MachineKnittingActualizer({ machineType: 'lk150' });
        const rows: StitchRow[] = [
            { rowNumber: 1, leftStitchesInWork: 200, rightStitchesInWork: 200 }
        ];

        const result = actualizer.actualize(rows, 0);

        expect(result.length).toBeGreaterThan(0);
        const pos = result[0].stepData.absolutePositioning;
        // left/right should be clamped to 75
    expect(pos.leftStitches).toBeGreaterThanOrEqual(75);
    expect(pos.rightStitches).toBeGreaterThanOrEqual(75);
    expect(pos.needleRange).toBe('L75-R75');
    });
});
