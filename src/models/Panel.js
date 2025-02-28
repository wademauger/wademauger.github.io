import { Trapezoid } from './Trapezoid';
import { defaultGauge } from './Gauge';

class Panel {
    /**
     * Responsible for gauge and sizing, and motifs
     */
    constructor(shape, gauge = defaultGauge, sizeModifier = 1.006, visualMotif = null) {
        if (!(shape instanceof Trapezoid)) {
            shape = Trapezoid.fromObject(shape.toJSON());
        }
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

    static fromObject(json) {
        return new Panel(Trapezoid.fromObject(json.shapes), json.gauge, json.sizeModifier, json.visualMotif);
    }
}

export { Panel };