import assert from 'assert';
import VisualMotif from './VisualMotif';

describe('VisualMotif Model', () => {
    it('should create a VisualMotif instance', () => {
        const motif = new VisualMotif('type', 'primary', ['secondary'], 'main', ['contrast'], null, 0, 0, 0, 10);
        assert.ok(motif instanceof VisualMotif);
        assert.strictEqual(motif.type, 'type');
        assert.strictEqual(motif.primaryMotif, 'primary');
        assert.deepStrictEqual(motif.secondaryMotifs, ['secondary']);
        assert.strictEqual(motif.mainColor, 'main');
        assert.deepStrictEqual(motif.contrastColors, ['contrast']);
        assert.strictEqual(motif.successor, null);
        assert.strictEqual(motif.truncatedBy, 0);
        assert.strictEqual(motif.horizontalRepeat, 0);
        assert.strictEqual(motif.verticalRepeat, 0);
        assert.strictEqual(motif.height, 10);
    });

    it('should create with default values', () => {
        const motif = new VisualMotif('type', 'primary');
        assert.deepStrictEqual(motif.secondaryMotifs, []);
        assert.strictEqual(motif.mainColor, '');
        assert.deepStrictEqual(motif.contrastColors, []);
        assert.strictEqual(motif.successor, null);
        assert.strictEqual(motif.truncatedBy, 0);
        assert.strictEqual(motif.horizontalRepeat, 0);
        assert.strictEqual(motif.verticalRepeat, 0);
        assert.strictEqual(motif.height, 0);
    });

    describe('getChild', () => {
        it('should return null if row is beyond accumulated height', () => {
            const motif = new VisualMotif('type', 'primary', [], 'main', [], null, 0, 0, 0, 10);
            const child = motif.getChild(10);
            assert.strictEqual(child, null);
        });

        it('should return null if row is beyond accumulated height without successor', () => {
            const motif = new VisualMotif('type', 'primary', [], 'main', [], null, 0, 0, 0, 10);
            const child = motif.getChild(15);
            assert.strictEqual(child, null);
        });

        it('should return a child motif with truncatedBy set to row', () => {
            const motif = new VisualMotif('type', 'primary', [], 'main', [], null, 0, 0, 0, 10);
            const child = motif.getChild(5);
            assert.ok(child instanceof VisualMotif);
            assert.strictEqual(child.truncatedBy, 5);
        });

        it('should return a child motif at row 0', () => {
            const motif = new VisualMotif('type', 'primary', [], 'main', [], null, 0, 0, 0, 10);
            const child = motif.getChild(0);
            assert.ok(child instanceof VisualMotif);
            assert.strictEqual(child.truncatedBy, 0);
        });

        it('should traverse successors to find the correct child', () => {
            const motif1 = new VisualMotif('type', 'primary', [], 'main', [], null, 0, 0, 0, 5);
            const motif2 = new VisualMotif('type', 'primary', [], 'main', [], null, 0, 0, 0, 5);
            motif1.successor = motif2;
            const motif = new VisualMotif('type', 'primary', [], 'main', [], motif1, 0, 0, 0, 5);
            const child = motif.getChild(7);
            assert.ok(child instanceof VisualMotif);
            assert.strictEqual(child.truncatedBy, 2);
        });

        it('should handle multiple successors', () => {
            const motif3 = new VisualMotif('type3', 'primary3', [], 'main', [], null, 0, 0, 0, 10);
            const motif2 = new VisualMotif('type2', 'primary2', [], 'main', [], motif3, 0, 0, 0, 10);
            const motif1 = new VisualMotif('type1', 'primary1', [], 'main', [], motif2, 0, 0, 0, 10);
            
            const child = motif1.getChild(25);
            assert.ok(child instanceof VisualMotif);
            assert.strictEqual(child.type, 'type3');
            assert.strictEqual(child.truncatedBy, 5);
        });

        it('should preserve motif properties in child', () => {
            const motif = new VisualMotif('type', 'primary', ['sec1', 'sec2'], 'main', ['cc1', 'cc2'], null, 5, 3, 4, 10);
            const child = motif.getChild(5);
            assert.strictEqual(child.type, 'type');
            assert.strictEqual(child.primaryMotif, 'primary');
            assert.deepStrictEqual(child.secondaryMotifs, ['sec1', 'sec2']);
            assert.strictEqual(child.mainColor, 'main');
            assert.deepStrictEqual(child.contrastColors, ['cc1', 'cc2']);
            assert.strictEqual(child.horizontalRepeat, 3);
            assert.strictEqual(child.verticalRepeat, 4);
            assert.strictEqual(child.height, 10);
        });
    });
});
