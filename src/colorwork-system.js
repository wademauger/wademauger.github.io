// Core Models
export { ColorworkPattern } from './models/ColorworkPattern.js';
export { ColorworkVisualizer } from './models/ColorworkVisualizer.js';
export { PanelColorworkComposer, CombinedPattern } from './models/PanelColorworkComposer.js';
export { InstructionGenerator, CombinedInstruction } from './models/InstructionGenerator.js';

// UI Components
export { default as ColorworkPanelEditor } from './components/ColorworkPanelEditor.js';
export { default as CombinedView } from './components/CombinedView.js';
export { default as ColorworkDemo } from './components/ColorworkDemo.js';

// Apps
export { default as ColorworkDesignerApp } from './apps/colorwork-designer/ColorworkDesignerApp.js';

// Re-export existing knitting models for convenience
export { Trapezoid, Panel, Gauge, defaultGauge } from './knitting.ai.js';
export { PanelDiagram } from './components/PanelDiagram.js';
