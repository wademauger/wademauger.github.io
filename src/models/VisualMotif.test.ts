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

    describe('getChild', () => {
        it('should return null if row is beyond accumulated height', () => {
            const motif = new VisualMotif('type', 'primary', [], 'main', [], null, 0, 0, 0, 10);
            const child = motif.getChild(10);
            assert.strictEqual(child, null);
        });

        it('should return a child motif with truncatedBy set to row', () => {
            const motif = new VisualMotif('type', 'primary', [], 'main', [], null, 0, 0, 0, 10);
            const child = motif.getChild(5);
            assert.ok(child instanceof VisualMotif);
            assert.strictEqual(child.truncatedBy, 5);
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
    });
});
