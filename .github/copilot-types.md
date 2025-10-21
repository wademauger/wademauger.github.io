# Canonical Type Snapshots — authoritative, compact

This file is a compact, single-source snapshot of the most helpful runtime types and public method signatures for Copilot and LLMs.
Keep these short, accurate, and easy to include in prompts.

All snippets are derived from the code under `src/models/*` and `src/apps/knitting-designer/types/*` (see file paths below each block).

---

## Trapezoid (shape primitive)

Source: `src/models/Trapezoid.ts`

```ts
interface Trapezoid {
  id?: string;
  height: number;
  baseA: number; // lower base width (in inches)
  baseB: number; // upper base width (in inches)
  baseBHorizontalOffset: number; // horizontal offset applied to upper base
  successors: Trapezoid[]; // child trapezoids for live-edge splitting
  modificationScale: number; // sizeModifier applied to geometry
  finishingSteps: any[]; // optional finishing instruction fragments
  label?: string | null;
  isHem?: boolean;
  shortRows?: any[];
}

// Factory note: Trapezoid.fromObject(json) -> Trapezoid | null
```

---

## PanelConfig / Panel (editor runtime)

Source: `src/apps/knitting-designer/types/patternWizard.types.ts`, `src/models/Panel.ts`

```ts
interface PanelConfig {
  shape: Trapezoid | null;
  gauge: Gauge; // see below
  sizeModifier: number;
}

interface Panel {
  id?: string;
  shape: Trapezoid; // Panel wraps a single root trapezoid
  gauge: Gauge;
  sizeModifier: number;
  visualMotif?: any;
  generateKnittingInstructions(): string[]; // convenience helper
}
```

Notes: The editor/wizard often serializes gauge as a plain object and reconstructs `Gauge` instances on load.

---

## Gauge

Source: `src/models/Gauge.ts`

```ts
interface Gauge {
  stitchesPerFourInches: number;
  rowsPerFourInches: number;
  scalingFactor?: number; // optional
  getStitchesPerInch(): number;
  getRowsPerInch(): number;
}

const defaultGauge: Gauge;
```

---

## ColorworkPattern & ColorworkLayer

Source: `src/models/ColorworkPattern.ts`, `src/apps/knitting-designer/types/patternWizard.types.ts`

```ts
class ColorworkPattern {
  grid: string[][]; // grid[row][col] = color token
  colors: Record<string,{ id:string; label?:string; color?:string }>; // palette
  metadata?: Record<string, any>;

  static fromJSON(json:any): ColorworkPattern;
  toJSON(): any;
  getRowCount(): number;
  getStitchCount(): number;
  getColorsUsed(): Array<any>;
  getRowInstructions(rowIndex:number): Array<{colorId:string; stitchCount:number}>;
}

interface ColorworkLayer {
  id: string | number;
  name: string;
  pattern: ColorworkPattern;
  patternType?: string;
  settings?: { stretchMode?: string; alignmentMode?: string; [k:string]: any };
  priority?: number;
}
```

---

## PanelColorworkComposer (public surface)

Source: `src/models/PanelColorworkComposer.ts`

```ts
class PanelColorworkComposer {
  constructor(options?: any);

  // Compose a panel and colorwork into a CombinedPattern-like representation
  // returns CombinedPattern { panel, colorworkPattern, mappedRows, stitchPlan }
  combinePatterns(panel: Panel, colorworkPattern: ColorworkPattern, options?: { stretchMode?:string; alignmentMode?:string }): CombinedPattern;

  // Helper: generatePanelStitchPlan(panel) -> StitchPlan
}
```

---

## StitchPlan (rows and colorwork mapping)

Source: `src/models/StitchPlan.ts`

```ts
class StitchPlan {
  rows: Array<{ rowNumber:number; leftStitchesInWork:number; rightStitchesInWork:number; colorwork?: any }>; 
  // Use CombinedPattern (panel + mappedRows + stitchPlan) as the canonical
  // colorwork carrier. This avoids a bespoke mapping type and keeps
  // the compositor/export pipeline consistent.
  colorworkMapping?: CombinedPattern | null;

  addRow(row:any): void;
  // Accept a CombinedPattern produced by PanelColorworkComposer.combinePatterns
  setColorworkMapping(combined: CombinedPattern): void;
  generateKnittingInstructions(): string[]; // shaping instructions
  generateColorworkInstructions(): any[]; // per-row colorwork sequences
}

// StitchPlan.Row: convenience class with setColorwork/getColorworkInstructions helpers
```

---

## InstructionGenerator (contract)

Source: usages across `src/components/*` (not a single file)

```ts
interface InstructionGenerator {
  generateInstructions(combined: CombinedPattern, format?: string): CombinedInstruction[];
}
```

Notes: CombinedInstruction is the export/runner format consumed by the interactive runner and exporters.

---

## CombinedPattern (shape + mapped colorwork)

```ts
interface CombinedPattern {
  panel: Panel;
  colorworkPattern: ColorworkPattern;
  mappedRows: Array<{ panelRow:number; machineRow:number; totalStitches:number; colorwork:string[] }>;
  stitchPlan: StitchPlan;
  toJSON(): any;
}
```

---

References (single-source files):
- `src/models/Trapezoid.ts`
- `src/models/Panel.ts`
- `src/models/Gauge.ts`
- `src/models/ColorworkPattern.ts`
- `src/models/PanelColorworkComposer.ts`
- `src/models/StitchPlan.ts`
- `src/apps/knitting-designer/types/patternWizard.types.ts`

If you want, I can also:
- Add a short pointer in `.github/copilot-context.md` referencing this file (small edit), or
- Expand any of the snapshots above into full single-file dumps (if you're using a large-context model).

---

Generated: October 21, 2025
