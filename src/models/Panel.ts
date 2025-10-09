import { Trapezoid } from './Trapezoid';
import { defaultGauge } from './Gauge';

class Panel {
    shape: any;
    gauge: any;
    sizeModifier: number;
    visualMotif: any;
    /**
     * Responsible for gauge and sizing, and motifs
     */
    constructor(shape: any, gauge: any = defaultGauge, sizeModifier: number = 1.006, visualMotif: any = null) {
        // Accept either a Trapezoid instance or a plain object (parsed JSON)
        if (!(shape instanceof Trapezoid)) {
            // If shape is a plain object or missing, attempt to create a Trapezoid.
            // Trapezoid.fromObject may return null for invalid input; in that
            // case fall back to a minimal default trapezoid to keep the Panel
            // instance usable in UIs and tests.
            const maybeTrap = Trapezoid.fromObject(shape);
            shape = maybeTrap || new Trapezoid(0, 0, 0, 0, [], [], 1, null);
        }
        this.shape = shape;
        this.gauge = gauge;
        this.sizeModifier = sizeModifier;
        this.visualMotif = visualMotif;
        // Defensive: only call setSizeModifier if shape implements it
        if (this.shape && typeof this.shape.setSizeModifier === 'function') {
            this.shape.setSizeModifier(sizeModifier);
        }
    }

    generateKnittingInstructions() {
        if (!this.shape) return [];
        return this.shape.generateKnittingInstructions(this.gauge, this.sizeModifier, 1, true, this.visualMotif);
    }

    static fromObject(json: any): Panel {
        // Defensive: json may be the Panel.toJSON shape (with shapes key) or
        // directly the shape object in some older data formats. Attempt both.
        const shapeObj = json && (json.shapes || json.shape || json) || null;
        const trap = Trapezoid.fromObject(shapeObj) || new Trapezoid(0, 0, 0, 0, [], [], 1, null);
        return new Panel(trap, json?.gauge, json?.sizeModifier, json?.visualMotif);
    }

    toJSON(): any {
        return {
            shapes: (this.shape && typeof this.shape.toJSON === 'function') ? this.shape.toJSON() : this.shape,
            gauge: this.gauge,
            sizeModifier: this.sizeModifier,
            visualMotif: this.visualMotif
        };
    }
}

export { Panel };