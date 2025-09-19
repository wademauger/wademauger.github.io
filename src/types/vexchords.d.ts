declare module 'vexchords' {
  export interface ChordBoxOptions {
    chord?: number[][];
    position?: number;
    barres?: number[];
    positionText?: number;
    tuning?: string[];
    width?: number;
    height?: number;
    circleRadius?: number;
    strokeWidth?: number;
    defaultColor?: string;
    bgColor?: string;
    labelColor?: string;
    numStrings?: number;
    numFrets?: number;
    showTuning?: boolean;
    [key: string]: any; // Allow any other properties
  }

  export class ChordBox {
    constructor(selector: string | HTMLElement, options?: ChordBoxOptions);
    draw(options?: ChordBoxOptions): void;
  }
}