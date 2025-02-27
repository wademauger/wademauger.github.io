class Panel {
    /**
     * Responsible for gauge and sizing, and motifs
     */
    constructor(shape, gauge = defaultGauge, sizeModifier = 1.006, visualMotif = null) {
        this.shape = shape;
        this.gauge = gauge;
        this.sizeModifier = sizeModifier;
        this.visualMotif = visualMotif;
        this.shape.setSizeModifier(sizeModifier);
    }

    generateKnittingInstructions() {
        if (!this.shape) return [];
        return this.shape.generateKnittingInstructions(this.gauge, this.sizeModifier, 1, true, this.visualMotif);
    }
}

export { Panel };