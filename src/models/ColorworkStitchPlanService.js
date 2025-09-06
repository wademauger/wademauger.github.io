import { PanelColorworkComposer } from './PanelColorworkComposer.js';
import { InstructionGenerator } from './InstructionGenerator.js';

/**
 * ColorworkStitchPlanService - Service for creating colorwork-enhanced stitch plans
 * Handles the integration between panels, colorwork patterns, and instruction generation
 */
export class ColorworkStitchPlanService {
    constructor() {
        this.composer = new PanelColorworkComposer();
        this.instructionGenerator = new InstructionGenerator();
    }

    /**
     * Create an enhanced stitch plan with colorwork integration
     */
    createColorworkStitchPlan(panel, colorworkPattern, options = {}) {
        // Use the composer to combine panel and colorwork
        const combinedPattern = this.composer.combinePatterns(panel, colorworkPattern, options);
        
        // The stitchPlan in combinedPattern is already enhanced with colorwork data
        return combinedPattern.stitchPlan;
    }

    /**
     * Generate combined instructions for a panel with colorwork
     */
    generateCombinedInstructions(panel, colorworkPattern, options = {}) {
        const combinedPattern = this.composer.combinePatterns(panel, colorworkPattern, options);
        return this.instructionGenerator.generateCombinedInstructions(combinedPattern);
    }

    /**
     * Create a basic stitch plan without colorwork (for backward compatibility)
     */
    createBasicStitchPlan(panel) {
        if (!panel.shape) return { rows: [] };
        
        const gauge = panel.gauge;
        const sizeModifier = panel.sizeModifier;
        
        return panel.shape.getStitchPlan(gauge, sizeModifier, 1);
    }
}

export default ColorworkStitchPlanService;
