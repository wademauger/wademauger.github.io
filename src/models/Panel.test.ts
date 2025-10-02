import assert from 'assert';
import { Panel } from './Panel';
import { Trapezoid } from './Trapezoid';
import { Gauge } from './Gauge';
import testGarments from '../data/garments.testdata';

describe('Panel Model', () => {
    let panel;
    let shape;
    let gauge;

    beforeEach(() => {
        shape = new Trapezoid(10, 20, 30);
        gauge = new Gauge(10, 12);
        panel = new Panel(shape, gauge, 1.006);
    });

    it('should create a Panel instance', () => {
        assert.ok(panel instanceof Panel);
        assert.strictEqual(panel.shape, shape);
        assert.strictEqual(panel.gauge, gauge);
        assert.strictEqual(panel.sizeModifier, 1.006);
    });

    it('should generate knitting instructions', () => {
        assert.ok(Array.isArray(panel.generateKnittingInstructions()));
        for (const testcase of testGarments) {
            panel = Panel.fromObject(testcase);
            assert.deepStrictEqual(panel.generateKnittingInstructions(), testcase.expectInstructions);
        }
    });

    it('should return empty array if shape is null', () => {
        panel.shape = null;
        const instructions = panel.generateKnittingInstructions();
        assert.deepStrictEqual(instructions, []);
    });
});
