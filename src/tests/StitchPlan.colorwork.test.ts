import { StitchPlan } from '../models/StitchPlan';
import { ColorworkPattern } from '../models/ColorworkPattern';

describe('Enhanced StitchPlan with Colorwork', () => {
    describe('StitchPlan colorwork integration', () => {
        it('should create a basic stitch plan without colorwork', () => {
            const stitchPlan = new StitchPlan();
            stitchPlan.addRow(new StitchPlan.Row(1, 10, 10));
            stitchPlan.addRow(new StitchPlan.Row(2, 11, 11));

            expect(stitchPlan.hasColorwork()).toBe(false);
            expect(stitchPlan.rows.length).toBe(2);
        });

        it('should add colorwork mapping to stitch plan', () => {
            const stitchPlan = new StitchPlan();
            stitchPlan.addRow(new StitchPlan.Row(1, 10, 10));

            const colorworkPattern = new ColorworkPattern(4, 2);
            colorworkPattern.setColor('MC', '#ffffff', 'Main Color');
            colorworkPattern.setColor('CC', '#000000', 'Contrast Color');

            const mappedRows = [{
                panelRow: 1,
                machineRow: 1,
                totalStitches: 20,
                colorwork: ['MC', 'CC', 'MC', 'CC']
            }];

            stitchPlan.setColorworkMapping(mappedRows, colorworkPattern);

            expect(stitchPlan.hasColorwork()).toBe(true);
            expect(stitchPlan.colorworkMapping.mappedRows).toHaveLength(1);
        });

        it('should generate colorwork instructions', () => {
            const stitchPlan = new StitchPlan();
            stitchPlan.addRow(new StitchPlan.Row(1, 10, 10));

            const colorworkPattern = new ColorworkPattern(4, 1);
            colorworkPattern.setColor('MC', '#ffffff', 'Main Color');
            colorworkPattern.setColor('CC', '#000000', 'Contrast Color');

            const mappedRows = [{
                panelRow: 1,
                machineRow: 1,
                totalStitches: 20,
                colorwork: ['MC', 'MC', 'CC', 'CC', 'MC', 'MC']
            }];

            stitchPlan.setColorworkMapping(mappedRows, colorworkPattern);

            const colorworkInstructions = stitchPlan.generateColorworkInstructions();
            expect(colorworkInstructions).toHaveLength(1);
            expect(colorworkInstructions[0].colorwork).toEqual([
                { colorId: 'MC', stitchCount: 2 },
                { colorId: 'CC', stitchCount: 2 },
                { colorId: 'MC', stitchCount: 2 }
            ]);
        });
    });

    describe('StitchPlan.Row colorwork methods', () => {
        it('should set and get colorwork instructions for a row', () => {
            const row = new StitchPlan.Row(1, 10, 10);
            const colorworkPattern = new ColorworkPattern(4, 1);
            colorworkPattern.setColor('MC', '#ffffff', 'Main Color');
            colorworkPattern.setColor('CC', '#000000', 'Contrast Color');

            const colorworkArray = ['MC', 'MC', 'CC', 'CC'];
            row.setColorwork(colorworkArray, colorworkPattern);

            const instructions = row.getColorworkInstructions();
            expect(instructions).toHaveLength(2);
            expect(instructions[0]).toEqual({
                colorId: 'MC',
                colorLabel: 'Main Color',
                colorHex: '#ffffff',
                stitchCount: 2
            });
            expect(instructions[1]).toEqual({
                colorId: 'CC',
                colorLabel: 'Contrast Color',
                colorHex: '#000000',
                stitchCount: 2
            });
        });
    });
});
