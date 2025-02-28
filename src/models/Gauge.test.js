import assert from 'assert';
import { Gauge } from './Gauge';

describe('Gauge Model', () => {
    let gauge;

    beforeEach(() => {
        gauge = new Gauge();
    });

    describe('getStitchesPerInch', () => {
        it('should return the number of stitches per four inches divided by 4', () => {
            gauge.stitchesPerFourInches = 20;
            assert.strictEqual(gauge.getStitchesPerInch(), 5);
            gauge.stitchesPerFourInches = 40;
            assert.strictEqual(gauge.getStitchesPerInch(), 10);
            gauge.stitchesPerFourInches = 200;
            assert.strictEqual(gauge.getStitchesPerInch(), 50);
        });  
    });

    describe('getRowsPerInch', () => {
        it('should return the number of rows per four inches divided by 4', () => {
            gauge.rowsPerFourInches = 20;
            assert.strictEqual(gauge.getRowsPerInch(), 5);
            gauge.rowsPerFourInches = 40;
            assert.strictEqual(gauge.getRowsPerInch(), 10);
            gauge.rowsPerFourInches = 200;
            assert.strictEqual(gauge.getRowsPerInch(), 50);
        });
    });
});