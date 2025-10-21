import { Panel } from './Panel';
import { ColorworkPattern } from './ColorworkPattern';
import { StitchPlan } from './StitchPlan';
import { Trapezoid } from './Trapezoid';
import { Gauge } from './Gauge';

/**
 * CombinedPattern - Represents a panel with applied colorwork
 * Canonical container returned by PanelColorworkComposer.combinePatterns
 */
export class CombinedPattern {
    panel: Panel;
    colorworkPattern: ColorworkPattern;
    mappedRows: any[];
    stitchPlan: StitchPlan | any;
    metadata: any;

    constructor(panel: Panel, colorworkPattern: ColorworkPattern, mappedRows: any[], stitchPlan: StitchPlan | any) {
        this.panel = panel;
        this.colorworkPattern = colorworkPattern;
        this.mappedRows = mappedRows;
        this.stitchPlan = stitchPlan;
        this.metadata = {
            created: new Date().toISOString(),
            panelType: 'shaped',
            hasColorwork: true
        };
    }

    getRowCount() {
        return this.mappedRows.length;
    }

    getRowColorwork(rowIndex: number) {
        if (rowIndex < 0 || rowIndex >= this.mappedRows.length) return null;
        return this.mappedRows[rowIndex];
    }

    getColorsUsed() {
        return this.colorworkPattern.getColorsUsed();
    }

    toJSON() {
        return {
            panel: {
                shape: this.panel.shape,
                gauge: this.panel.gauge,
                sizeModifier: this.panel.sizeModifier
            },
            colorworkPattern: this.colorworkPattern.toJSON(),
            mappedRows: this.mappedRows,
            metadata: this.metadata
        };
    }

    static fromJSON(json: any) {
        const panel = new Panel(
            Trapezoid.fromObject(json.panel.shape),
            new Gauge(json.panel.gauge?.stitchesPerFourInches || 19, json.panel.gauge?.rowsPerFourInches || 30),
            json.panel.sizeModifier
        );

        const colorworkPattern = ColorworkPattern.fromJSON(json.colorworkPattern);

        return new CombinedPattern(panel, colorworkPattern, json.mappedRows, json.stitchPlan);
    }
}
