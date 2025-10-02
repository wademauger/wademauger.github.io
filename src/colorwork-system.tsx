// Core Models
export { ColorworkPattern } from './models/ColorworkPattern';
export { ColorworkVisualizer } from './models/ColorworkVisualizer';
export { PanelColorworkComposer, CombinedPattern } from './models/PanelColorworkComposer';
export { InstructionGenerator, CombinedInstruction } from './models/InstructionGenerator';

// UI Components
export { default as ColorworkPanelEditor } from './components/ColorworkPanelEditor';
export { default as CombinedView } from './components/CombinedView';
export { default as ColorworkDemo } from './components/ColorworkDemo';

// Apps
export { default as ColorworkDesignerApp } from './apps/colorwork-designer/ColorworkDesignerApp';

// Re-export existing knitting models for convenience
export { Trapezoid } from './models/Trapezoid';
export { Panel } from './models/Panel';
export { Gauge, defaultGauge } from './models/Gauge';
export { PanelDiagram } from './components/PanelDiagram';
