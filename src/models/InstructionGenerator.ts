import { ColorworkVisualizer } from './ColorworkVisualizer';

/**
 * CombinedInstruction - Represents a single row instruction with both shaping and colorwork
 */
export class CombinedInstruction {
    constructor(row, machineRow, shaping, colorwork, visualChart = null) {
        this.row = row;
        this.machineRow = machineRow;
        this.shaping = shaping;
        this.colorwork = colorwork;
        this.visualChart = visualChart;
    }

    hasShaping() {
        return this.shaping && (
            this.shaping.description.includes('Increase') || 
            this.shaping.description.includes('Decrease')
        );
    }

    hasColorwork() {
        return this.colorwork && this.colorwork.colorSequence && this.colorwork.colorSequence.length > 0;
    }

    toString() {
        let instruction = `Row ${this.row}`;
        if (this.machineRow && this.machineRow !== this.row) {
            instruction += ` (RC: ${this.machineRow})`;
        }

        if (this.hasShaping()) {
            instruction += `: ${this.shaping.description}`;
        }

        if (this.hasColorwork()) {
            instruction += ` Colorwork: ${this.colorwork.description}`;
        }

        return instruction;
    }
}

/**
 * InstructionGenerator - Generates combined knitting instructions
 * Synchronizes shaping instructions with colorwork instructions
 */
export class InstructionGenerator {
    constructor() {
        this.colorworkVisualizer = new ColorworkVisualizer();
    }

    /**
     * Generate instructions in the specified format
     * @param {CombinedPattern} combinedPattern - The combined pattern
     * @param {string} format - 'compact', 'detailed', or 'visual'
     */
    generateInstructions(combinedPattern, format = 'compact') {
        const instructions = this.generateCombinedInstructions(combinedPattern);
        
        // Apply format-specific filtering/transformation
        switch (format) {
            case 'compact':
                return this.formatCompactInstructions(instructions);
            case 'detailed':
                return instructions; // Full instructions
            case 'visual':
                return this.formatVisualInstructions(instructions);
            default:
                return instructions;
        }
    }

    /**
     * Format instructions for compact display
     */
    formatCompactInstructions(instructions) {
        // Return only key instructions, skip redundant details
        return instructions.filter((instruction: any) => 
            instruction.hasShaping() || 
            instruction.hasColorwork() || 
            instruction.row % 5 === 1 // Every 5th row for reference
        ).slice(0, 10); // Limit to first 10 for preview
    }

    /**
     * Format instructions for visual display
     */
    formatVisualInstructions(instructions) {
        // Return instructions with visual charts
        return instructions.filter((instruction: any) => 
            instruction.visualChart
        ).slice(0, 5); // Limit for preview
    }

    /**
     * Generate combined instructions for a panel with colorwork
     */
    generateCombinedInstructions(combinedPattern) {
        const shapingInstructions = this.generateShapingInstructions(combinedPattern.panel);
        const colorworkInstructions = this.generateColorworkInstructions(combinedPattern);
        
        return this.synchronizeInstructions(shapingInstructions, colorworkInstructions, combinedPattern);
    }

    /**
     * Generate shaping instructions from the panel
     */
    generateShapingInstructions(panel) {
        // Reuse existing panel instruction generation
        return panel.generateKnittingInstructions();
    }

    /**
     * Generate colorwork instructions from the combined pattern
     */
    generateColorworkInstructions(combinedPattern) {
        const instructions = [];
        
        for (const mappedRow of combinedPattern.mappedRows) {
            const colorworkInstructions = this.generateRowColorworkInstructions(mappedRow);
            instructions.push({
                row: mappedRow.panelRow,
                machineRow: mappedRow.machineRow,
                colorwork: colorworkInstructions,
                stitchCount: mappedRow.totalStitches
            });
        }

        return instructions;
    }

    /**
     * Generate colorwork instructions for a single row
     */
    generateRowColorworkInstructions(mappedRow) {
        const colorSequence = [];
        let currentColor = null;
        let stitchCount = 0;

        for (const colorId of mappedRow.colorwork) {
            if (colorId === currentColor) {
                stitchCount++;
            } else {
                if (currentColor !== null) {
                    colorSequence.push({
                        colorId: currentColor,
                        stitchCount: stitchCount
                    });
                }
                currentColor = colorId;
                stitchCount = 1;
            }
        }

        // Add the last color run
        if (currentColor !== null) {
            colorSequence.push({
                colorId: currentColor,
                stitchCount: stitchCount
            });
        }

        return colorSequence;
    }

    /**
     * Synchronize shaping and colorwork instructions
     */
    synchronizeInstructions(shapingInstructions, colorworkInstructions, combinedPattern) {
        const synchronized = [];
        const colors = combinedPattern.colorworkPattern.colors;

        // Create a row mapping from shaping instructions
        const shapingByRow = this.parseShapingInstructions(shapingInstructions);
        
        for (const colorworkRow of colorworkInstructions) {
            const shapingForRow = shapingByRow[colorworkRow.machineRow] || null;
            
            const instruction = new CombinedInstruction(
                colorworkRow.row,
                colorworkRow.machineRow,
                shapingForRow,
                {
                    colorSequence: colorworkRow.colorwork,
                    totalStitches: colorworkRow.stitchCount,
                    description: this.formatColorworkDescription(colorworkRow.colorwork, colors)
                },
                this.generateRowVisualChart(combinedPattern, colorworkRow.row - 1)
            );

            synchronized.push(instruction);
        }

        // Add any remaining shaping instructions that don't have colorwork
        this.addRemainingShapingInstructions(synchronized, shapingInstructions, shapingByRow);

        return synchronized;
    }

    /**
     * Parse shaping instructions to create a row-based lookup
     */
    parseShapingInstructions(shapingInstructions) {
        const shapingByRow = {};
        
        // Simple parsing - this could be enhanced to parse more complex instruction formats
        shapingInstructions.forEach((instruction, index: number) => {
            if (typeof instruction === 'string') {
                // Extract row numbers if mentioned in the instruction
                const rowMatch = instruction.match(/(?:Row|RC[=:]?)\s*(\d+)/i);
                if (rowMatch) {
                    const rowNumber = parseInt(rowMatch[1]);
                    shapingByRow[rowNumber] = {
                        type: 'text',
                        description: instruction,
                        index: index
                    };
                } else {
                    // Instructions without specific row numbers (cast on, bind off, etc.)
                    shapingByRow[`general_${index}`] = {
                        type: 'general',
                        description: instruction,
                        index: index
                    };
                }
            }
        });

        return shapingByRow;
    }

    /**
     * Format colorwork description for display
     */
    formatColorworkDescription(colorSequence, colors) {
        if (colorSequence.length === 0) return 'No colorwork';
        
        const parts = colorSequence.map((segment: any) => {
            const color = colors[segment.colorId];
            const colorLabel = color ? color.label : segment.colorId;
            return `${segment.stitchCount} ${colorLabel}`;
        });

        return parts.join(', ');
    }

    /**
     * Generate a visual chart for a specific row
     */
    generateRowVisualChart(combinedPattern, rowIndex) {
        if (rowIndex < 0 || rowIndex >= combinedPattern.mappedRows.length) {
            return null;
        }

        const mappedRow = combinedPattern.mappedRows[rowIndex];
        
        // Create a single-row pattern for visualization
        const singleRowPattern = {
            grid: [mappedRow.colorwork],
            colors: combinedPattern.colorworkPattern.colors,
            getRowCount: () => 1,
            getStitchCount: () => mappedRow.colorwork.length
        };

        return this.colorworkVisualizer.generateChart(singleRowPattern, {
            cellSize: 15,
            showRowNumbers: false,
            showStitchNumbers: false,
            showGrid: true
        });
    }

    /**
     * Add remaining shaping instructions that don't have corresponding colorwork
     */
    addRemainingShapingInstructions(synchronized, shapingInstructions) {
        // Add cast on, bind off, and finishing instructions
        shapingInstructions.forEach((instruction, index: number) => {
            const isGeneral = typeof instruction === 'string' && 
                             (instruction.toLowerCase().includes('cast on') ||
                              instruction.toLowerCase().includes('bind off') ||
                              instruction.toLowerCase().includes('hang hem') ||
                              !instruction.match(/(?:Row|RC[=:]?)\s*(\d+)/i));
            
            if (isGeneral) {
                const combinedInstruction = new CombinedInstruction(
                    null, // No specific row
                    null, // No machine row
                    {
                        type: 'general',
                        description: instruction,
                        index: index
                    },
                    null, // No colorwork
                    null  // No visual chart
                );
                
                // Insert at appropriate position
                if (instruction.toLowerCase().includes('cast on')) {
                    synchronized.unshift(combinedInstruction);
                } else {
                    synchronized.push(combinedInstruction);
                }
            }
        });
    }
}
