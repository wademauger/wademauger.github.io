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

    it('should create a Panel from plain object', () => {
        const plainObject = {
            height: 10,
            baseA: 20,
            baseB: 30,
            baseBHorizontalOffset: 5,
            successors: [],
            finishingSteps: [],
            modificationScale: 1
        };
        const panelFromObject = new Panel(plainObject, gauge, 1.006);
        assert.ok(panelFromObject instanceof Panel);
        assert.ok(panelFromObject.shape instanceof Trapezoid);
    });

    it('should handle visual motif in constructor', () => {
        const motif = { type: 'stripes', colors: ['#fff', '#000'] };
        const panelWithMotif = new Panel(shape, gauge, 1.006, motif);
        assert.strictEqual(panelWithMotif.visualMotif, motif);
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

    describe('fromObject', () => {
        it('should create Panel from JSON object', () => {
            const json = {
                shapes: {
                    height: 10,
                    baseA: 20,
                    baseB: 30,
                    baseBHorizontalOffset: 5,
                    successors: [],
                    finishingSteps: [],
                    modificationScale: 1
                },
                gauge: { stitchesPer4Inches: 10, rowsPer4Inches: 12 },
                sizeModifier: 1.5,
                visualMotif: null
            };
            const panelFromJson = Panel.fromObject(json);
            assert.ok(panelFromJson instanceof Panel);
            assert.strictEqual(panelFromJson.sizeModifier, 1.5);
        });
    });

    describe('toJSON', () => {
        it('should serialize Panel to JSON', () => {
            const json = panel.toJSON();
            assert.ok(json.shapes);
            assert.strictEqual(json.gauge, gauge);
            assert.strictEqual(json.sizeModifier, 1.006);
        });

        it('should handle shape without toJSON method', () => {
            panel.shape = { height: 10, baseA: 20, baseB: 30 };
            const json = panel.toJSON();
            assert.deepStrictEqual(json.shapes, panel.shape);
        });

        it('should handle null shape', () => {
            panel.shape = null;
            const json = panel.toJSON();
            assert.strictEqual(json.shapes, null);
        });
    });
});
