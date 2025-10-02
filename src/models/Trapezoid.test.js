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

    describe('fromObject', () => {
        it('should create a Trapezoid instance from JSON', () => {
            const json = {
                height: 10,
                baseA: 20,
                baseB: 30,
                baseBHorizontalOffset: 5,
                successors: [],
                finishingSteps: []
            };
            const trapezoid = Trapezoid.fromObject(json);
            assert.ok(trapezoid instanceof Trapezoid);
            assert.strictEqual(trapezoid.height, 10);
            assert.strictEqual(trapezoid.baseA, 20);
            assert.strictEqual(trapezoid.baseB, 30);
            assert.strictEqual(trapezoid.baseBHorizontalOffset, 5);
            assert.deepStrictEqual(trapezoid.successors, []);
            assert.deepStrictEqual(trapezoid.finishingSteps, []);
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
            const trapezoid = Trapezoid.fromObject(json);
            assert.ok(trapezoid instanceof Trapezoid);
            assert.strictEqual(trapezoid.successors.length, 1);
            assert.ok(trapezoid.successors[0] instanceof Trapezoid);
            assert.strictEqual(trapezoid.successors[0].height, 5);
            assert.strictEqual(trapezoid.successors[0].baseA, 10);
            assert.strictEqual(trapezoid.successors[0].baseB, 15);
        });

        it('should return null for invalid input', () => {
            assert.strictEqual(Trapezoid.fromObject(null), null);
            assert.strictEqual(Trapezoid.fromObject([]), null);
        });

        it('should filter out null successors', () => {
            const json = {
                height: 10,
                baseA: 20,
                baseB: 30,
                successors: [{ height: 5, baseA: 10, baseB: 15 }, null, []]
            };
            const trapezoid = Trapezoid.fromObject(json);
            assert.strictEqual(trapezoid.successors.length, 1);
        });

        it('should parse string numeric fields', () => {
            const json = {
                height: '10',
                baseA: '20',
                baseB: '30',
                baseBHorizontalOffset: '5'
            };
            const trapezoid = Trapezoid.fromObject(json);
            assert.strictEqual(trapezoid.height, 10);
            assert.strictEqual(trapezoid.baseA, 20);
            assert.strictEqual(trapezoid.baseB, 30);
            assert.strictEqual(trapezoid.baseBHorizontalOffset, 5);
        });

        it('should handle non-array finishingSteps', () => {
            const json = {
                height: 10,
                baseA: 20,
                baseB: 30,
                finishingSteps: 'single step'
            };
            const trapezoid = Trapezoid.fromObject(json);
            assert.deepStrictEqual(trapezoid.finishingSteps, ['single step']);
        });

        it('should use default values for missing numeric fields', () => {
            const json = {};
            const trapezoid = Trapezoid.fromObject(json);
            assert.strictEqual(trapezoid.height, 0);
            assert.strictEqual(trapezoid.baseA, 0);
            assert.strictEqual(trapezoid.baseB, 0);
            assert.strictEqual(trapezoid.baseBHorizontalOffset, 0);
        });

        it('should preserve id from json', () => {
            const json = { height: 10, baseA: 20, baseB: 30, id: 'test-id' };
            const trapezoid = Trapezoid.fromObject(json);
            assert.strictEqual(trapezoid.id, 'test-id');
        });

        it('should use _id as fallback for id', () => {
            const json = { height: 10, baseA: 20, baseB: 30, _id: 'alt-id' };
            const trapezoid = Trapezoid.fromObject(json);
            assert.strictEqual(trapezoid.id, 'alt-id');
        });

        it('should generate id when not provided', () => {
            const json = { height: 10, baseA: 20, baseB: 30 };
            const trapezoid = Trapezoid.fromObject(json);
            assert.ok(trapezoid.id);
            assert.ok(trapezoid.id.startsWith('trap-'));
        });

        it('should preserve isHem flag', () => {
            const json = { height: 10, baseA: 20, baseB: 30, isHem: true };
            const trapezoid = Trapezoid.fromObject(json);
            assert.strictEqual(trapezoid.isHem, true);
        });

        it('should preserve shortRows', () => {
            const shortRows = [{ row: 1, stitches: 10 }];
            const json = { height: 10, baseA: 20, baseB: 30, shortRows };
            const trapezoid = Trapezoid.fromObject(json);
            assert.strictEqual(trapezoid.shortRows.length, 1);
            assert.strictEqual(trapezoid.shortRows[0].row, 1);
        });

        it('should convert label to string', () => {
            const json = { height: 10, baseA: 20, baseB: 30, label: 123 };
            const trapezoid = Trapezoid.fromObject(json);
            assert.strictEqual(trapezoid.label, '123');
        });

        it('should set label to null when undefined', () => {
            const json = { height: 10, baseA: 20, baseB: 30 };
            const trapezoid = Trapezoid.fromObject(json);
            assert.strictEqual(trapezoid.label, null);
        });
    });

    describe('getUpperBaseWidthInStitches', () => {
        it('should calculate base width in stitches', () => {
            const gauge = new Gauge(10, 10);
            const stitches = trapezoid.getUpperBaseWidthInStitches(gauge, 1);
            assert.strictEqual(stitches, 75);
        });
    });

    describe('getStitchPlan', () => {
        it('should generate a stitch plan', () => {
            const gauge = new Gauge(10, 10);
            const plan = trapezoid.getStitchPlan(gauge, 1, 1);
            assert.ok(plan instanceof StitchPlan);
        });
    });

    describe('toJSON', () => {
        it('should serialize Trapezoid to JSON', () => {
            const json = trapezoid.toJSON();
            assert.strictEqual(json.height, 10);
            assert.strictEqual(json.baseA, 20);
            assert.strictEqual(json.baseB, 30);
            assert.strictEqual(json.baseBHorizontalOffset, 5);
        });

        it('should serialize successors with toJSON method', () => {
            const successor = new Trapezoid(5, 10, 15);
            trapezoid.successors = [successor];
            const json = trapezoid.toJSON();
            assert.ok(Array.isArray(json.successors));
            assert.strictEqual(json.successors.length, 1);
            assert.strictEqual(json.successors[0].height, 5);
        });

        it('should serialize successors without toJSON method', () => {
            trapezoid.successors = [{ height: 5, baseA: 10 }];
            const json = trapezoid.toJSON();
            assert.ok(Array.isArray(json.successors));
            assert.strictEqual(json.successors[0].height, 5);
        });

        it('should handle null successors', () => {
            trapezoid.successors = null;
            const json = trapezoid.toJSON();
            assert.deepStrictEqual(json.successors, []);
        });

        it('should handle null finishingSteps', () => {
            trapezoid.finishingSteps = null;
            const json = trapezoid.toJSON();
            assert.deepStrictEqual(json.finishingSteps, []);
        });

        it('should handle null modificationScale', () => {
            trapezoid.modificationScale = null;
            const json = trapezoid.toJSON();
            assert.strictEqual(json.sizeModifier, 1);
        });

        it('should handle null label', () => {
            trapezoid.label = null;
            const json = trapezoid.toJSON();
            assert.strictEqual(json.label, null);
        });

        it('should serialize isHem flag', () => {
            trapezoid.isHem = true;
            const json = trapezoid.toJSON();
            assert.strictEqual(json.isHem, true);
        });

        it('should serialize shortRows', () => {
            trapezoid.shortRows = [{ row: 1, stitches: 10 }];
            const json = trapezoid.toJSON();
            assert.strictEqual(json.shortRows.length, 1);
            assert.strictEqual(json.shortRows[0].row, 1);
        });

        it('should handle non-array shortRows', () => {
            trapezoid.shortRows = null;
            const json = trapezoid.toJSON();
            assert.deepStrictEqual(json.shortRows, []);
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
