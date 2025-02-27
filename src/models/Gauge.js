class Gauge {
    /**
     * Represents the knitting gauge, which defines stitch and row density.
     * @param {number} stitchesPerFourInches - The number of stitches in four inches.
     * @param {number} rowsPerFourInches - The number of rows in four inches.
     */
    constructor(stitchesPerFourInches, rowsPerFourInches) {
        this.stitchesPerFourInches = stitchesPerFourInches;
        this.rowsPerFourInches = rowsPerFourInches;
    }

    getStitchesPerInch() {
        return this.stitchesPerFourInches / 4;
    }

    getRowsPerInch() {
        return this.rowsPerFourInches / 4;
    }
}

const defaultGauge = new Gauge(19, 30);

export { Gauge, defaultGauge };