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
    // Allow additional string-keyed properties for extensibility
    [key: string]: number | number[] | number[][] | string | string[] | boolean | undefined;
  }

  export class ChordBox {
    constructor(selector: string | HTMLElement, options?: ChordBoxOptions);
    draw(options?: ChordBoxOptions): void;
  }
}