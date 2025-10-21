import { PanelColorworkComposer } from './PanelColorworkComposer';
import { InstructionGenerator } from './InstructionGenerator';
import { Panel } from './Panel';
import { ColorworkPattern } from './ColorworkPattern';

/**
 * ColorworkStitchPlanService - Service for creating colorwork-enhanced stitch plans
 * Handles the integration between panels, colorwork patterns, and instruction generation
 */
export class ColorworkStitchPlanService {
    private composer: PanelColorworkComposer;
    private instructionGenerator: InstructionGenerator;

    constructor() {
        this.composer = new PanelColorworkComposer();
        this.instructionGenerator = new InstructionGenerator();
    }

    /**
     * Create an enhanced stitch plan with colorwork integration
     */
    createColorworkStitchPlan(panel: Panel, colorworkPattern: ColorworkPattern, options: any = {}): any {
        // Use the composer to combine panel and colorwork
        const combinedPattern = this.composer.combinePatterns(panel, colorworkPattern, options);
        
        // The stitchPlan in combinedPattern is already enhanced with colorwork data
        return combinedPattern.stitchPlan;
    }

    /**
     * Generate combined instructions for a panel with colorwork
     */
    generateCombinedInstructions(panel: Panel, colorworkPattern: ColorworkPattern, options: any = {}): any {
        const combinedPattern = this.composer.combinePatterns(panel, colorworkPattern, options);
        return this.instructionGenerator.generateCombinedInstructions(combinedPattern);
    }

    /**
     * Create a basic stitch plan without colorwork (for backward compatibility)
     */
    createBasicStitchPlan(panel: Panel): any {
        if (!panel.shape) return { rows: [] };
        
        const gauge = panel.gauge;
        const sizeModifier = panel.sizeModifier;
        
        return panel.shape.getStitchPlan(gauge, sizeModifier, 1);
    }
}

export default ColorworkStitchPlanService;
