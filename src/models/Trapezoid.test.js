const assert = require('assert');
const Trapezoid = require('./Trapezoid');

describe('Trapezoid Model', () => {
    let trapezoid;

    beforeEach(() => {
        trapezoid = new Trapezoid(5, 10, 7);
    });

    it('should have a base1 attribute', () => {
        assert.strictEqual(trapezoid.base1, 5);
    });

    it('should have a base2 attribute', () => {
        assert.strictEqual(trapezoid.base2, 10);
    });

    it('should have a height attribute', () => {
        assert.strictEqual(trapezoid.height, 7);
    });

    it('should calculate area correctly', () => {
        const expectedArea = 0.5 * (trapezoid.base1 + trapezoid.base2) * trapezoid.height;
        assert.strictEqual(trapezoid.calculateArea(), expectedArea);
    });
});