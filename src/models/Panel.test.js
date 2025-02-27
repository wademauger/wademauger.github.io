const assert = require('assert');
const Panel = require('./Panel');

describe('Panel Model', () => {
    it('should create a panel with default properties', () => {
        const panel = new Panel();
        assert.strictEqual(panel.property1, 'defaultValue1');
        assert.strictEqual(panel.property2, 'defaultValue2');
    });

    it('should update properties correctly', () => {
        const panel = new Panel();
        panel.updateProperty('property1', 'newValue');
        assert.strictEqual(panel.property1, 'newValue');
    });

    it('should throw an error when invalid data is provided', () => {
        const panel = new Panel();
        assert.throws(() => {
            panel.updateProperty('property1', null);
        }, Error);
    });
});