import { Trapezoid } from './Trapezoid';
import { defaultGauge } from './Gauge';

class Panel {
    /**
     * Responsible for gauge and sizing, and motifs
     */
    constructor(shape, gauge = defaultGauge, sizeModifier = 1.006, visualMotif = null) {
        // Accept either a Trapezoid instance or a plain object (parsed JSON)
        if (!(shape instanceof Trapezoid)) {
            // if it's already a plain object, pass it to fromObject directly
            shape = Trapezoid.fromObject(shape);
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

    toJSON() {
        return {
            shapes: (this.shape && typeof this.shape.toJSON === 'function') ? this.shape.toJSON() : this.shape,
            gauge: this.gauge,
            sizeModifier: this.sizeModifier,
            visualMotif: this.visualMotif
        };
    }
}

export { Panel };