# Knitting Pattern Generator – Project Context

## Overview

This repository implements an interactive knitting pattern generator (TypeScript + React). It contains editors, composers, and instruction generators that transform shape and colorwork models into stitch-level, human- and machine-readable outputs.

This file intentionally uses canonical in-repo names so documentation and Copilot prompts match the codebase.

---

## Canonical models & APIs

Use the following exact names when referring to runtime models and APIs:

- `Trapezoid` — geometric primitive for panel geometry (`src/models/Trapezoid`).
- `Panel` — shape composed of one or more `Trapezoid` segments (`src/models/Panel`).
- `Gauge` — conversions for stitches/rows (`src/models/Gauge`).
- `ColorworkPattern` — pattern class containing a 2D grid and palette (`src/models/ColorworkPattern`).
- `ColorworkLayer` — wrapper used by the wizard/editor to place a `ColorworkPattern` with settings (`src/apps/knitting-designer/types/patternWizard.types.ts`).
- `PanelConfig` — editor config: { shape: Trapezoid | null; gauge: Gauge; sizeModifier: number }.
- `PanelInstance` / `PanelColorworkState` / `PanelMetadata` — wizard runtime types for instances and colorwork state.
- `PanelColorworkComposer` — composer that combines `Panel` + `ColorworkPattern` into a composed representation (`src/components/ColorworkPanelEditor.tsx`).
- `InstructionGenerator` — converts a composed result into `CombinedInstruction[]` for the runner/export.

Prefer these exact names in docs, tests, and Copilot prompts.

Note: a compact snapshot of canonical interfaces is available at `.github/copilot-types.md` (single-source snippets you can paste into prompts).

---

## StitchPlan (concept)

`StitchPlan` is the logical, per-stitch representation used by several subsystems. The canonical pipeline is:

1) compose: `PanelColorworkComposer.combinePatterns(panel, pattern, settings)`
2) generate: `InstructionGenerator.generateInstructions(combined, format)` => `CombinedInstruction[]`

Informal contract:

```ts
interface StitchPlan {
  rows: RowData[]; // compressed row-major storage
  getStitch(row: number, col: number): Stitch;
  // instruction creation is handled by InstructionGenerator in this codebase
}

Note: In this codebase `CombinedPattern` is the canonical colorwork carrier produced by `PanelColorworkComposer.combinePatterns(panel, pattern, settings)` and consumed by `InstructionGenerator.generateInstructions(combined, format)`. Prefer storing or referencing a `CombinedPattern` on the `StitchPlan` (for example as `stitchPlan.colorworkMapping`) instead of maintaining bespoke mapping shapes—this keeps the composer → instruction pipeline consistent.
```

---

## Panel and PanelConfig

Panels are the primary unit of work. Editor/wizard code uses `PanelConfig` to capture editable state.

Key runtime interfaces (canonical):

```ts
interface PanelConfig {
  shape: Trapezoid | null;
  gauge: Gauge;
  sizeModifier: number;
}

interface ColorworkLayer {
  id: string | number;
  name: string;
  pattern: ColorworkPattern;
  patternType: string;
  patternConfig?: any;
  priority?: number;
  settings?: { stretchMode?: string; alignmentMode?: string; [k:string]: any };
}
```

Notes:
- When loading saved manifests the UI may reconstruct `Gauge` instances from plain objects.
- Colorwork is stored per `PanelInstance` (see `PanelColorworkState.layers`).

---

## colorworkPatterns (library)

- Library key: `library.colorworkPatterns` (see `src/utils/libraryMergeColorwork.ts`).
- Class: `ColorworkPattern` — contains `grid` (2D array) and a `palette` mapping of tokens to colors.

Merge helper behavior: `mergeColorworkIntoLibrary(library, patternPayload)` replaces by `id` or `name` or appends a new entry.

---

## Instruction pipeline (recommended usage)

1. Materialize a `Panel` (or convert a `PanelConfig` to a `Panel`).
2. Select/create a `ColorworkPattern` and wrap in a `ColorworkLayer` if placement/settings are needed.
3. Call `PanelColorworkComposer.combinePatterns(panel, pattern, settings)` to get a combined representation.
4. Call `InstructionGenerator.generateInstructions(combined, format)` to obtain `CombinedInstruction[]` for the interactive runner or export.

---

## Project manifests (`knittingProjects`)

Manifests vary; typical fields:
- `id`, `title`, `author`
- `panels`: (Panel | { refId: string })[]
- `colorworkPatterns`: library entries or references
- `yarns`, `gauge`, `exportSettings`

Recommendation: include `schemaVersion` to make future migrations deterministic.

---

If you'd like I can now:
- copy the exact interface/type definitions from the model files into this document (single-source authoritative snippets), or
- scan other docs and replace informal names with the canonical names above.

```

---

## 🧩 Panel

A `Panel` represents a contiguous knitted surface composed of one or more trapezoid-shaped segments and optional colorwork overlays.
- Canonical export: `PanelShape` + colorwork layers + gauge metadata.
- Used by the Panel Composer and Interactive Knitting systems as the primary unit of work.

Key properties:
- `trapezoids`: array of trapezoid definitions (widths, heights, live-edge ordering).
- `overlays`: ordered colorwork layers (may be empty).
- `gauge`: stitches-per-inch and rows-per-inch used to map pattern units to real knitting counts.

Example TypeScript shape:

```ts
interface Panel {
  id: string;
  trapezoids: Trapezoid[];
  overlays?: ColorworkLayer[];
  gauge?: { stitchesPerInch: number; rowsPerInch: number };
  metadata?: Record<string, any>;
}
```

Behavioral notes:
- Panels are immutable once used to create a `StitchPlan` — the composer clones and applies transformations (scale, repeat, replace colors).
- A Panel may be materialized at different gauges; materialization recalculates absolute stitch/row counts.

---

## 🛠️ Actualizers (KnittingInstructionActualizer and variants)

Actualizers convert abstract knitting representations (for example, a `StitchPlan`) into concrete, mode-specific instructions.
- Examples: `HandKnittingActualizer`, `DomesticMachineActualizer`, `IndustrialFlatbedActualizer`, `CircularActualizer`.
- Responsibilities: map per-stitch operations to textual or machine commands, group actions into safe batches, and annotate timing/safety metadata for machines.

Core contract (informal):
- Input: `StitchPlan` or `Step` object
- Output: `KnittingInstructions` (a serializable sequence of commands or human-readable steps)
- Error modes: unsupported stitch, out-of-range index, incompatible gauge

Example interface:

```ts
interface KnittingInstructionActualizer {
  actualize(plan: StitchPlan): KnittingInstructions;
  actualizeStep?(step: Step): KnittingInstructions;
}
```

Notes:
- Actualizers should be idempotent and pure functions where possible to make testing deterministic.
- They may accept configuration (max carriage speed, yarn tension hints, safety stops) for machine modes.

---

## 🎨 colorworkPatterns

`colorworkPatterns` are reusable, named pattern tiles or sheets produced by the Colorwork Editor and consumed by the Panel Composer.
- Stored as 2D token arrays with optional metadata (repeat-mode, default color-map, alignment anchors).

Data shape:

```ts
type ColorworkPattern = {
  id: string;
  width: number;
  height: number;
  cells: string[][]; // color tokens
  defaultPalette?: Record<string, string>;
  metadata?: Record<string, any>;
};
```

Usage:
- Patterns can be tiled, stretched, or clipped when applied to a `Panel`.
- Composer supports replace-color rules and anchored placement (top-left, center, baseline offset).

---

## 🧵 knittingProjects

`knittingProjects` are top-level project descriptors that aggregate panels, yarn choices, target dimensions, and export settings.
- Purpose: provide a single-file project manifest for sharing, versioning, and resuming work.

Canonical fields:
- `id`, `title`, `author`, `panels`: Panel[] or references, `yarns` metadata, `gauge`, and `exportSettings`.

Example:

```ts
interface KnittingProject {
  id: string;
  title: string;
  author?: string;
  panels: (Panel | { refId: string })[];
  yarns?: YarnSpec[];
  gauge?: { stitchesPerInch: number; rowsPerInch: number };
  exportSettings?: { format: string; includeDiagrams: boolean };
}
```

Notes:
- Projects are intended to be serializable JSON with stable schema versioning to allow migration.
- Export tools read the project manifest to produce distribution artifacts (PDF instructions, machine command files, swatches).

````

---

## 🧩 Panel

A `Panel` represents a contiguous knitted surface composed of one or more trapezoid-shaped segments and optional colorwork overlays.
- Canonical export: `PanelShape` + colorwork layers + gauge metadata.
- Used by the Panel Composer and Interactive Knitting systems as the primary unit of work.

Key properties:
- `trapezoids`: array of trapezoid definitions (widths, heights, live-edge ordering).
- `overlays`: ordered colorwork layers (may be empty).
- `gauge`: stitches-per-inch and rows-per-inch used to map pattern units to real knitting counts.

Example TypeScript shape:

```ts
interface Panel {
  id: string;
  trapezoids: Trapezoid[];
  overlays?: ColorworkLayer[];
  gauge?: { stitchesPerInch: number; rowsPerInch: number };
  metadata?: Record<string, any>;
}
```

Behavioral notes:
- Panels are immutable once used to create a `StitchPlan` — the composer clones and applies transformations (scale, repeat, replace colors).
- A Panel may be materialized at different gauges; materialization recalculates absolute stitch/row counts.

---

## 🛠️ Actualizers (KnittingInstructionActualizer and variants)

Actualizers convert abstract knitting representations (for example, a `StitchPlan`) into concrete, mode-specific instructions.
- Examples: `HandKnittingActualizer`, `DomesticMachineActualizer`, `IndustrialFlatbedActualizer`, `CircularActualizer`.
- Responsibilities: map per-stitch operations to textual or machine commands, group actions into safe batches, and annotate timing/safety metadata for machines.

Core contract (informal):
- Input: `StitchPlan` or `Step` object
- Output: `KnittingInstructions` (a serializable sequence of commands or human-readable steps)
- Error modes: unsupported stitch, out-of-range index, incompatible gauge

Example interface:

```ts
interface KnittingInstructionActualizer {
  actualize(plan: StitchPlan): KnittingInstructions;
  actualizeStep?(step: Step): KnittingInstructions;
}
```

Notes:
- Actualizers should be idempotent and pure functions where possible to make testing deterministic.
- They may accept configuration (max carriage speed, yarn tension hints, safety stops) for machine modes.

---

## 🎨 colorworkPatterns

`colorworkPatterns` are reusable, named pattern tiles or sheets produced by the Colorwork Editor and consumed by the Panel Composer.
- Stored as 2D token arrays with optional metadata (repeat-mode, default color-map, alignment anchors).

Data shape:

```ts
type ColorworkPattern = {
  id: string;
  width: number;
  height: number;
  cells: string[][]; // color tokens
  defaultPalette?: Record<string, string>;
  metadata?: Record<string, any>;
};
```

Usage:
- Patterns can be tiled, stretched, or clipped when applied to a `Panel`.
- Composer supports replace-color rules and anchored placement (top-left, center, baseline offset).

---

## 🧵 knittingProjects

`knittingProjects` are top-level project descriptors that aggregate panels, yarn choices, target dimensions, and export settings.
- Purpose: provide a single-file project manifest for sharing, versioning, and resuming work.

Canonical fields:
- `id`, `title`, `author`, `panels`: Panel[] or references, `yarns` metadata, `gauge`, and `exportSettings`.

Example:

```ts
interface KnittingProject {
  id: string;
  title: string;
  author?: string;
  panels: (Panel | { refId: string })[];
  yarns?: YarnSpec[];
  gauge?: { stitchesPerInch: number; rowsPerInch: number };
  exportSettings?: { format: string; includeDiagrams: boolean };
}
```

Notes:
- Projects are intended to be serializable JSON with stable schema versioning to allow migration.
- Export tools read the project manifest to produce distribution artifacts (PDF instructions, machine command files, swatches).

````
