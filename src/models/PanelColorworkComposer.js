import { ColorworkPattern } from './ColorworkPattern.js';
import { Trapezoid } from './Trapezoid.js';
import { Panel } from './Panel.js';
import { Gauge } from './Gauge.js';

/**
 * PanelColorworkComposer - Combines panel shapes with colorwork patterns
 * Maps colorwork to panel geometry and handles shaping edge cases
 */
export class PanelColorworkComposer {
    constructor() {
        // Configuration options
        this.defaultStretchMode = 'repeat'; // 'repeat', 'stretch', 'center'
        this.defaultAlignmentMode = 'center'; // 'center', 'left', 'right'
    }

    /**
     * Combine a panel with a colorwork pattern
     */
    combinePatterns(panel, colorworkPattern, options = {}) {
        const {
            stretchMode = this.defaultStretchMode,
            alignmentMode = this.defaultAlignmentMode
        } = options;

        // Generate the stitch plan for the panel
        const stitchPlan = this.generatePanelStitchPlan(panel);
        
        // Map the colorwork to the panel shape
        const mappedPattern = this.mapColorworkToShape(stitchPlan, colorworkPattern, {
            stretchMode,
            alignmentMode
        });

        // Augment the StitchPlan with colorwork data
        stitchPlan.setColorworkMapping(mappedPattern, colorworkPattern);
        
        // Also add colorwork to individual rows
        mappedPattern.forEach((mappedRow, index) => {
            if (stitchPlan.rows[index]) {
                stitchPlan.rows[index].setColorwork(mappedRow.colorwork, colorworkPattern);
            }
        });

        return new CombinedPattern(panel, colorworkPattern, mappedPattern, stitchPlan);
    }

    /**
     * Generate a stitch plan that represents the panel's shape row by row
     */
    generatePanelStitchPlan(panel) {
        if (!panel.shape) return { rows: [] };
        
        const gauge = panel.gauge;
        const sizeModifier = panel.sizeModifier;
        
        // Use the existing trapezoid stitch plan generation
        return panel.shape.getStitchPlan(gauge, sizeModifier, 1);
    }

    /**
     * Map colorwork pattern to panel shape
     */
    mapColorworkToShape(stitchPlan, colorworkPattern, options = {}) {
        const { stretchMode, alignmentMode } = options;
        const mappedRows = [];

        if (!stitchPlan.rows || stitchPlan.rows.length === 0) {
            return mappedRows;
        }

        const patternHeight = colorworkPattern.getRowCount();

        for (let i = 0; i < stitchPlan.rows.length; i++) {
            const stitchRow = stitchPlan.rows[i];
            const totalStitches = stitchRow.leftStitchesInWork + stitchRow.rightStitchesInWork;
            
            // Determine which colorwork row to use
            const colorworkRowIndex = this.mapRowIndex(i, stitchPlan.rows.length, patternHeight, stretchMode);
            
            // Generate the colorwork for this row
            const mappedRow = this.mapRowStitches(
                colorworkPattern,
                colorworkRowIndex,
                totalStitches,
                stitchRow.leftStitchesInWork,
                { stretchMode, alignmentMode }
            );

            mappedRows.push({
                panelRow: i + 1,
                machineRow: stitchRow.rowNumber,
                leftStitches: stitchRow.leftStitchesInWork,
                rightStitches: stitchRow.rightStitchesInWork,
                totalStitches: totalStitches,
                colorwork: mappedRow,
                colorworkRowIndex: colorworkRowIndex
            });
        }

        return mappedRows;
    }

    /**
     * Map a row index from panel space to colorwork space
     */
    mapRowIndex(panelRowIndex, totalPanelRows, colorworkRows, stretchMode) {
        if (colorworkRows === 0) return 0;

        switch (stretchMode) {
            case 'stretch':
                // Stretch the colorwork to fit the panel height
                return Math.floor((panelRowIndex * colorworkRows) / totalPanelRows);
            
            case 'repeat':
                // Repeat the colorwork pattern
                return panelRowIndex % colorworkRows;
            
            case 'center': {
                // Center the colorwork in the panel
                const startOffset = Math.floor((totalPanelRows - colorworkRows) / 2);
                if (panelRowIndex < startOffset || panelRowIndex >= startOffset + colorworkRows) {
                    return -1; // No colorwork for this row
                }
                return panelRowIndex - startOffset;
            }
            
            default:
                return panelRowIndex % colorworkRows;
        }
    }

    /**
     * Map stitches for a single row
     */
    mapRowStitches(colorworkPattern, colorworkRowIndex, totalStitches, leftStitches, options = {}) {
        const { stretchMode } = options;
        
        if (colorworkRowIndex < 0 || colorworkRowIndex >= colorworkPattern.getRowCount()) {
            // Return main color for rows without colorwork
            return Array(totalStitches).fill('MC');
        }

        const patternRow = colorworkPattern.grid[colorworkRowIndex];
        const patternWidth = patternRow.length;
        const mappedStitches = [];

        for (let stitchIndex = 0; stitchIndex < totalStitches; stitchIndex++) {
            let patternStitchIndex;

            switch (stretchMode) {
                case 'stretch':
                    // Stretch the pattern to fit the row width
                    patternStitchIndex = Math.floor((stitchIndex * patternWidth) / totalStitches);
                    break;
                
                case 'repeat':
                    // Repeat the pattern across the row
                    patternStitchIndex = stitchIndex % patternWidth;
                    break;
                
                case 'center': {
                    // Center the pattern in the row
                    const startOffset = Math.floor((totalStitches - patternWidth) / 2);
                    if (stitchIndex < startOffset || stitchIndex >= startOffset + patternWidth) {
                        mappedStitches.push('MC'); // Main color outside pattern
                        continue;
                    }
                    patternStitchIndex = stitchIndex - startOffset;
                    break;
                }
                
                default:
                    patternStitchIndex = stitchIndex % patternWidth;
            }

            const colorId = patternRow[patternStitchIndex] || 'MC';
            mappedStitches.push(colorId);
        }

        return mappedStitches;
    }

    /**
     * Handle edge cases in colorwork mapping
     */
    handleShapingEdgeCases(mappedPattern) {
        // For future enhancement: Handle cases where shaping affects colorwork alignment
        // - Increases/decreases at pattern boundaries
        // - Maintaining pattern continuity across shaping
        // - Adjusting for short rows
        
        return mappedPattern;
    }
}

/**
 * CombinedPattern - Represents a panel with applied colorwork
 */
export class CombinedPattern {
    constructor(panel, colorworkPattern, mappedRows, stitchPlan) {
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

    /**
     * Get the total number of rows
     */
    getRowCount() {
        return this.mappedRows.length;
    }

    /**
     * Get colorwork for a specific row
     */
    getRowColorwork(rowIndex) {
        if (rowIndex < 0 || rowIndex >= this.mappedRows.length) return null;
        return this.mappedRows[rowIndex];
    }

    /**
     * Get all colors used in the combined pattern
     */
    getColorsUsed() {
        return this.colorworkPattern.getColorsUsed();
    }

    /**
     * Export the combined pattern as JSON
     */
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

    /**
     * Create a CombinedPattern from JSON data
     */
    static fromJSON(json) {
        const panel = new Panel(
            Trapezoid.fromJSON(json.panel.shape),
            new Gauge(json.panel.gauge.stitchesPerFourInches, json.panel.gauge.rowsPerFourInches),
            json.panel.sizeModifier
        );
        
        const colorworkPattern = ColorworkPattern.fromJSON(json.colorworkPattern);
        
        return new CombinedPattern(
            panel,
            colorworkPattern,
            json.mappedRows,
            json.stitchPlan
        );
    }
}
