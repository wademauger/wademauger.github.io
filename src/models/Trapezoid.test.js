import assert from 'assert';
import { Trapezoid } from './Trapezoid';
import { Gauge } from './Gauge';
import { StitchPlan } from './StitchPlan';

describe('Trapezoid Model', () => {
    let trapezoid;

    beforeEach(() => {
        trapezoid = new Trapezoid(10, 20, 30, 5, [], [], 1);
    });

    it('should create a Trapezoid instance', () => {
        assert.ok(trapezoid instanceof Trapezoid);
        assert.strictEqual(trapezoid.height, 10);
        assert.strictEqual(trapezoid.baseA, 20);
        assert.strictEqual(trapezoid.baseB, 30);
        assert.strictEqual(trapezoid.baseBHorizontalOffset, 5);
        assert.deepStrictEqual(trapezoid.successors, []);
        assert.deepStrictEqual(trapezoid.finishingSteps, []);
        assert.strictEqual(trapezoid.modificationScale, 1);
    });

    it('should set size modifier', () => {
        trapezoid.setSizeModifier(1.5);
        assert.strictEqual(trapezoid.modificationScale, 1.5);
    });

    it('should get height with size modifier', () => {
        trapezoid.setSizeModifier(1.5);
        assert.strictEqual(trapezoid.getHeight(), 15);
    });

    it('should get lower base with size modifier', () => {
        trapezoid.setSizeModifier(1.5);
        assert.strictEqual(trapezoid.getLowerBase(), 30);
    });

    it('should get upper base with size modifier', () => {
        trapezoid.setSizeModifier(1.5);
        assert.strictEqual(trapezoid.getUpperBase(), 45);
    });

    it('should get offset with size modifier', () => {
        trapezoid.setSizeModifier(1.5);
        assert.strictEqual(trapezoid.getOffset(), 7.5);
    });

    describe('fromJSON', () => {
        it('should create a Trapezoid instance from JSON', () => {
            const json = {
                height: 10,
                baseA: 20,
                baseB: 30,
                baseBHorizontalOffset: 5,
                successors: [],
                finishingSteps: []
            };
            const trapezoid = Trapezoid.fromJSON(json);
            assert.ok(trapezoid instanceof Trapezoid);
            assert.strictEqual(trapezoid.height, 10);
            assert.strictEqual(trapezoid.baseA, 20);
            assert.strictEqual(trapezoid.baseB, 30);
            assert.strictEqual(trapezoid.baseBHorizontalOffset, 5);
            assert.deepStrictEqual(trapezoid.successors, []);
            assert.deepStrictEqual(trapezoid.finishingSteps, []);
        });

        it('should handle empty JSON', () => {
            assert.strictEqual(Trapezoid.fromJSON(null), null);
            assert.strictEqual(Trapezoid.fromJSON([]), null);
        });

        it('should handle successors', () => {
            const json = {
                height: 10,
                baseA: 20,
                baseB: 30,
                baseBHorizontalOffset: 5,
                successors: [{ height: 5, baseA: 10, baseB: 15 }],
                finishingSteps: []
            };
            const trapezoid = Trapezoid.fromJSON(json);
            assert.ok(trapezoid instanceof Trapezoid);
            assert.strictEqual(trapezoid.successors.length, 1);
            assert.ok(trapezoid.successors[0] instanceof Trapezoid);
            assert.strictEqual(trapezoid.successors[0].height, 5);
            assert.strictEqual(trapezoid.successors[0].baseA, 10);
            assert.strictEqual(trapezoid.successors[0].baseB, 15);
        });
    });

    describe('getBaseWidthInStitches', () => {
        it('should calculate base width in stitches', () => {
            const gauge = new Gauge(10, 10);
            const stitches = trapezoid.getBaseWidthInStitches(gauge, 1);
            assert.strictEqual(stitches, 50);
        });
    });

    describe('getStitchPlan', () => {
        it('should generate a stitch plan', () => {
            const gauge = new Gauge(10, 10);
            const stitchPlan = trapezoid.getStitchPlan(gauge, 1, 1);
            assert.ok(stitchPlan instanceof StitchPlan);
        });
    });

    describe('generateKnittingInstructions', () => {
        it('should generate knitting instructions', () => {
            const gauge = new Gauge(10, 10);
            const instructions = trapezoid.generateKnittingInstructions(gauge, 1, 1, true);
            assert.ok(Array.isArray(instructions));
        });
    });
});
