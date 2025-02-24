class Gauge {
    rowsPerFourInches;
    stitchesPerFourInches;
    constructor(s, r) {
        this.stitchesPerFourInches = s;
        this.rowsPerFourInches = r;
    }
    getStitchesPerInch() {
        return this.stitchesPerFourInches / 4;
    }
    getRowsPerInch() {
        return this.rowsPerFourInches / 4;
    }
}

const defaultGauge = new Gauge(19, 30);

class Stitch {
    isPurl;
    width;
    height;
    constructor(type) {
        this.isPurl = !type;
        this.width
    }
}

class Row {
    stitches;
    constructor(initial) {
        this.stitches = initial;
    }
}

class Trapezoid {
    height;
    baseA;
    baseB;
    successors;
    constructor(height, a, b){
        this.height = height;
        this.a = a;
        this.b = b;
    }
    getRows(gauge=defaultGauge) {
        // TODO: return the appropriate rows of stitches for the geometry of this trapezoid   
        const firstRowStitchCount = this.baseA * 
    }
    getSuccessors() {
    }
}

// new Trapezoid(10, 10, 10)
// new Trapezoid(10, )