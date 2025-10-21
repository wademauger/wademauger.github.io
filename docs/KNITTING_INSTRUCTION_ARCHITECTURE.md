# Knitting Instruction Actualizer Architecture

## Overview

The **KnittingInstructionActualizer** is an abstraction layer that transforms concrete stitch plans into structured, human-readable knitting instructions. This design pattern decouples the data layer (StitchPlan) from the presentation layer (UI components), allowing for:

1. **Multiple knitting styles** - Different actualizers for different techniques
2. **Reusability** - Same logic used across different UI components
3. **Testability** - Pure functions that can be tested independently
4. **Maintainability** - Clear separation of concerns

## Architecture

```
StitchPlan (raw data)
    ↓
    ↓ (contains: rows with stitch counts, short row metadata, colorwork info)
    ↓
KnittingInstructionActualizer (abstract base)
    ↓
    ├─ HandKnittingActualizer (hand needles, wraps/turns)
    ├─ MachineKnittingActualizer (machine-specific codes)
    ├─ CircularNeedleActualizer (continuous rounds)
    └─ [Custom actualizers...]
    ↓
    ↓ (produces: KnittingInstruction[] objects)
    ↓
UI Components (RowByRowInstructions, InteractiveKnittingView, etc.)
    ↓
Display (formatted with styling, state management, etc.)
```

## Class Hierarchy

### Base Class: `KnittingInstructionActualizer`

**Location:** `src/models/KnittingInstructionActualizer.ts`

**Responsibilities:**
- Define the interface for all actualizers
- Provide common utilities (needle calculation, pattern detection, text builders)
- Ensure consistent output format

**Abstract Methods (must be implemented by subclasses):**
```typescript
abstract actualize(
    sectionRows: StitchRow[], 
    baseRowIndex: number
): KnittingInstruction[]
```

**Protected Helper Methods:**
- `getAbsolutePosition(row)` - Calculate needle positions from stitch counts
- `detectShapingPattern(rows, startIndex)` - Find repeating increase/decrease patterns
- `buildShapingText(leftDiff, rightDiff)` - Generate increase/decrease phrases
- `buildKnitRowsText(count)` - Generate knit row phrases

### Concrete Implementation: `HandKnittingActualizer`

**Location:** `src/models/HandKnittingActualizer.ts`

**Specializes for:**
- Traditional hand knitting on straight or circular needles
- Row-by-row instructions
- Short row techniques (wraps, gaps, german)
- English-language knitting terminology

**Key Features:**
- Detects and collapses repeating patterns ("Every 2 rows, inc 1 each side 5 times")
- Groups consecutive non-shaping rows ("Knit 15 rows")
- Handles short rows with proper hold/turn instructions
- Updates stitch counts at each step

**Output Format:**
```typescript
{
  text: "Increase 1 stitch on the left. Knit 2 rows. (RC=4, 62 sts in work)",
  stepData: {
    text: "...",
    startRowIndex: 0,
    endRowIndex: 1,
    rowsInStep: 2,
    absolutePositioning: {
      totalStitches: 62,
      leftStitches: 31,
      rightStitches: 31,
      needleRange: "L32-L62 / R1-R31",
      description: "Knitting across 62 stitches (31 left, 31 right)"
    }
  }
}
```

## Data Structures

### Input: `StitchRow`
```typescript
interface StitchRow {
    rowNumber: number;                    // Machine row number (1-based)
    leftStitchesInWork: number;           // Stitches on left needle
    rightStitchesInWork: number;          // Stitches on right needle
    shortRowInfo?: {                      // Present if this is a short row
        shortRowId: string;
        rowInShortRowSequence: number;    // Which row in the short row group (1-15)
        totalRowsInShortRow: number;      // Total rows in this short row sequence
        heldStitchesLeft: number;         // Put on hold at start
        heldStitchesRight: number;
        activeStitchesLeft: number;       // Knit with on this row
        activeStitchesRight: number;
    };
    colorwork?: any[];                    // Optional colorwork info per stitch
}
```

### Output: `KnittingInstruction`
```typescript
interface KnittingInstruction {
    text: string;                         // Human-readable instruction
    stepData: {
        text: string;                     // Same as above (for consistency)
        startRowIndex: number;            // Index in the section
        endRowIndex: number;              // Inclusive
        rowsInStep: number;               // How many rows this instruction covers
        absolutePositioning: {
            totalStitches: number;
            leftStitches: number;
            rightStitches: number;
            needleRange: string;          // "L32-L62 / R1-R31"
            description: string;          // "Knitting across 62 stitches (31 left, 31 right)"
        };
    };
}
```

## Usage Examples

### In a React Component

```typescript
import HandKnittingActualizer from '@/models/HandKnittingActualizer';

function RowByRowInstructions({ stitchPlan, knittingOptions }) {
    // Create actualizer once (preferably memoized)
    const actualizer = useMemo(
        () => new HandKnittingActualizer(knittingOptions),
        [knittingOptions]
    );

    // Generate instructions for a section of rows
    const instructions = actualizer.actualize(
        stitchPlan.rows.slice(0, 60),  // First 60 rows
        0                              // Base index
    );

    // Display instructions
    return instructions.map((instr, idx) => (
        <StepInstruction key={idx} instruction={instr} />
    ));
}
```

### In the InteractiveKnittingPage

```typescript
const actualizer = new HandKnittingActualizer(this.knittingOptions);
const instructions = actualizer.actualize(sectionRows, baseRowIndex);
// Use instructions array instead of inline generation
```

### Creating a New Actualizer

```typescript
import KnittingInstructionActualizer, { 
    StitchRow, 
    KnittingInstruction 
} from './KnittingInstructionActualizer';

export class MachineKnittingActualizer extends KnittingInstructionActualizer {
    actualize(sectionRows: StitchRow[], baseRowIndex: number): KnittingInstruction[] {
        // Implement machine-specific logic:
        // - Use carrier threading codes
        // - Handle machine row numbering
        // - Include hook positions and gating
        // - Generate machine-specific notation
        const instructions: KnittingInstruction[] = [];
        
        // ... custom implementation ...
        
        return instructions;
    }
}
```

## Benefits of This Architecture

| Aspect | Before | After |
|--------|--------|-------|
| **Separation of Concerns** | Logic embedded in React component | Pure instruction generation |
| **Reusability** | Copy-paste logic across components | Single actualizer instance |
| **Extensibility** | Add new feature → modify all components | Create new actualizer subclass |
| **Testing** | Test React + logic together | Test logic independently |
| **Knitting Styles** | Hardcoded for one style | Easy to switch/compose styles |
| **Maintainability** | Complex nested conditionals in JSX | Clear, focused class methods |

## Migration Path

### Phase 1: Extract Logic (Current)
- ✅ Create base `KnittingInstructionActualizer` class
- ✅ Create `HandKnittingActualizer` implementation
- Document architecture

### Phase 2: Integration
- Update `InteractiveKnittingPage.tsx` to use `HandKnittingActualizer`
- Remove inline `_generateInstructionsForRows()` method
- Test that output matches current behavior

### Phase 3: Additional Actualizers
- Create `MachineKnittingActualizer`
- Create `CircularNeedleActualizer`
- Add UI controls to switch between styles

### Phase 4: Advanced Features
- Composite actualizers (e.g., hand knitting + colorwork overlay)
- Actualization pipelines with formatting/filtering stages
- Integration with knitting machine simulation

## Files Structure

```
src/models/
├── KnittingInstructionActualizer.ts    (base class + interfaces)
├── HandKnittingActualizer.ts           (hand knitting implementation)
├── MachineKnittingActualizer.ts        (future: machine knitting)
├── CircularNeedleActualizer.ts         (future: circular needles)
└── [...other actualizers...]

src/pages/
└── InteractiveKnittingPage.tsx         (uses actualizer instead of inline generation)

src/components/
└── RowByRowInstructions.tsx            (consumes instruction objects)

src/__tests__/
└── models/
    ├── KnittingInstructionActualizer.test.ts
    ├── HandKnittingActualizer.test.ts
    └── [...actualizer tests...]
```

## Next Steps

1. Update `InteractiveKnittingPage.tsx` to use `HandKnittingActualizer`
2. Write tests for the actualizer classes
3. Create UI selector for knitting style
4. Build additional actualizer subclasses as needed
