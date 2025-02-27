const assert = require('assert');
const Gauge = require('./Gauge');

describe('Gauge Model', () => {
    let gauge;

    beforeEach(() => {
        gauge = new Gauge();
    });

    it('should have a default value', () => {
        assert.strictEqual(gauge.value, 0);
    });

    it('should set value correctly', () => {
        gauge.setValue(10);
        assert.strictEqual(gauge.value, 10);
    });

    it('should not allow value to exceed maximum', () => {
        gauge.setValue(110);
        assert.strictEqual(gauge.value, 100); // assuming 100 is the max
    });

    it('should return correct percentage', () => {
        gauge.setValue(50);
        assert.strictEqual(gauge.getPercentage(), 50);
    });
});