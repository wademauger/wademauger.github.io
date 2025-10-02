class Gauge {
    /**
     * Represents the knitting gauge, which defines stitch and row density.
     * @param {number} stitchesPerFourInches - The number of stitches in four inches.
     * @param {number} rowsPerFourInches - The number of rows in four inches.
     * @param {number} scalingFactor - Optional scaling factor for garment size (default: 1.0).
     */
    constructor(stitchesPerFourInches, rowsPerFourInches, scalingFactor = 1.0) {
        this.stitchesPerFourInches = stitchesPerFourInches;
        this.rowsPerFourInches = rowsPerFourInches;
        this.scalingFactor = scalingFactor;
    }

    getStitchesPerInch() {
        return this.stitchesPerFourInches / 4;
    }

    getRowsPerInch() {
        return this.rowsPerFourInches / 4;
    }

    /**
     * Get the effective stitches per inch accounting for scaling factor
     */
    getEffectiveStitchesPerInch() {
        return this.getStitchesPerInch() / this.scalingFactor;
    }

    /**
     * Get the effective rows per inch accounting for scaling factor
     */
    getEffectiveRowsPerInch() {
        return this.getRowsPerInch() / this.scalingFactor;
    }
}

const defaultGauge = new Gauge(19, 30);

export { Gauge, defaultGauge };