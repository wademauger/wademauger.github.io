# Knitting Instruction Actualizer - Visual Architecture

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    DATA LAYER                                   │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  StitchPlan                                            │   │
│  │  ├─ rows: StitchRow[]                                  │   │
│  │  │  ├─ rowNumber                                       │   │
│  │  │  ├─ leftStitchesInWork                              │   │
│  │  │  ├─ rightStitchesInWork                             │   │
│  │  │  ├─ shortRowInfo (optional)                         │   │
│  │  │  └─ colorwork (optional)                            │   │
│  │  └─ metadata                                           │   │
│  │     └─ panelName, gauge, etc.                          │   │
│  └────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│         TRANSFORMATION LAYER (Actualizers)                      │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  KnittingInstructionActualizer (ABSTRACT BASE)         │   │
│  │                                                         │   │
│  │  + actualize(rows, baseIndex)                          │   │
│  │  # getAbsolutePosition(row)                            │   │
│  │  # detectShapingPattern(rows, idx)                     │   │
│  │  # buildShapingText(leftDiff, rightDiff)               │   │
│  │  # buildKnitRowsText(count)                            │   │
│  └────────────────────────────────────────────────────────┘   │
│            ↑              ↑              ↑                      │
│            │ extends     │ extends      │ extends              │
│            │             │              │                      │
│  ┌─────────┴────┐  ┌────┴─────────┐  ┌┴──────────────┐       │
│  │ HandKnitting │  │   Machine    │  │  Circular     │       │
│  │  Actualizer  │  │  Knitting    │  │   Needle      │       │
│  │              │  │  Actualizer  │  │   Actualizer  │       │
│  │ (HAND KNIT)  │  │ (MACHINE)    │  │ (ROUNDS)      │       │
│  └──────────────┘  └──────────────┘  └───────────────┘       │
│                                                                 │
│  [Extensible - add new types as needed]                        │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                   OUTPUT LAYER                                  │
│                                                                 │
│  KnittingInstruction[]                                          │
│                                                                 │
│  [                                                              │
│    {                                                            │
│      text: "Increase 1 on each side. Knit 2 rows...",         │
│      stepData: {                                                │
│        startRowIndex: 0,                                       │
│        endRowIndex: 1,                                         │
│        rowsInStep: 2,                                          │
│        absolutePositioning: {                                  │
│          totalStitches: 62,                                    │
│          needleRange: "L32-L62 / R1-R31"                      │
│        }                                                        │
│      }                                                          │
│    },                                                           │
│    { ... }                                                      │
│  ]                                                              │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│              PRESENTATION LAYER (React)                         │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  RowByRowInstructions.tsx                              │   │
│  │  ├─ Display instruction text                           │   │
│  │  ├─ Show needle position                               │   │
│  │  ├─ Highlight current row                              │   │
│  │  └─ Handle row navigation                              │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  InteractiveKnittingView.tsx                           │   │
│  │  ├─ Panel diagram with progress                        │   │
│  │  ├─ Row-by-row instructions                            │   │
│  │  ├─ Step navigation controls                           │   │
│  │  └─ Colorwork visualization                            │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [Other components using KnittingInstructions...]              │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

```
StitchPlan.rows
(60 rows of data)
       │
       │ [Row 0]: left=30, right=30
       │ [Row 1]: left=31, right=31 (diff: +1 each)
       │ [Row 2]: left=31, right=31 (diff: 0)
       │ [Row 3]: left=32, right=32 (diff: +1 each)
       │ [Row 4]: left=32, right=32 (diff: 0)
       │ ... (repeats pattern)
       │
       ↓
detectShapingPattern()
       │
       ├─ Finds frequency: 2 rows between +1 changes
       ├─ Counts repetitions: 5 times
       └─ Returns: { leftDiff: 1, rightDiff: 1, frequency: 2, repeatCount: 5, totalRows: 10 }
       │
       ↓
buildInstructions()
       │
       ├─ If pattern found & repeatCount >= 2:
       │  └─ "Every 2 rows, increase 1 on each side 5 times"
       │
       ├─ Else:
       │  ├─ Group consecutive rows
       │  ├─ Build shaping text
       │  └─ "Increase 1 on each side. Knit 2 rows."
       │
       ↓
KnittingInstruction object
{
    text: "Every 2 rows, increase 1 on each side 5 times...",
    stepData: {
        startRowIndex: 0,
        endRowIndex: 9,
        rowsInStep: 10,
        absolutePositioning: {
            totalStitches: 62,
            needleRange: "L32-L62 / R1-R31"
        }
    }
}
```

## Class Hierarchy

```
KnittingInstructionActualizer (ABSTRACT)
│
├─ HandKnittingActualizer (CONCRETE)
│  ├─ Method: actualize()
│  ├─ Implementation: Hand knitting logic
│  └─ Features:
│     ├─ Pattern detection
│     ├─ Short row handling
│     ├─ Pattern collapsing
│     └─ English terminology
│
├─ MachineKnittingActualizer (FUTURE)
│  ├─ Method: actualize()
│  ├─ Implementation: Machine knitting logic
│  └─ Features:
│     ├─ Carrier threading codes
│     ├─ Hook positions
│     ├─ Gating instructions
│     └─ Machine row numbering
│
├─ CircularNeedleActualizer (FUTURE)
│  ├─ Method: actualize()
│  ├─ Implementation: Circular needle logic
│  └─ Features:
│     ├─ Round-based instructions
│     ├─ No row turns
│     ├─ Continuous knitting
│     └─ Round terminology
│
└─ [Custom actualizers...]
```

## Processing Pipeline

```
┌──────────────┐
│  StitchPlan  │
│  (raw data)  │
└───────┬──────┘
        │
        ├─ Extract section (e.g., first 60 rows)
        │
        ↓
┌──────────────────────────┐
│ HandKnittingActualizer   │
│ .actualize()             │
└──────┬───────────────────┘
       │
       ├─ Loop through rows (i=0 to 60)
       │
       ├─ Check if short row? → YES
       │  └─ _generateShortRowInstructions()
       │     ├─ Generate HOLD instruction
       │     ├─ Generate KNIT instruction
       │     └─ Skip all rows in sequence
       │
       ├─ Check if short row? → NO
       │  ├─ Count consecutive non-shaping rows
       │  ├─ Detect repeating patterns
       │  ├─ Check if rectangular section
       │  │
       │  ├─ Pattern found? → YES
       │  │  └─ Collapse and generate pattern instruction
       │  │
       │  ├─ Pattern found? → NO
       │  │  └─ Generate individual instruction
       │  │     ├─ Check for zero-shaping
       │  │     ├─ Build shaping text
       │  │     ├─ Build knit text
       │  │     └─ Calculate needle position
       │
       ↓
┌─────────────────────────────┐
│ KnittingInstruction[]       │
│ (structured output)         │
│                             │
│ [                           │
│   { text, stepData },       │
│   { text, stepData },       │
│   { text, stepData },       │
│   ...                       │
│ ]                           │
└─────────────────────────────┘
        │
        ↓
┌──────────────────────────┐
│  React Components        │
│  (Display & Interact)    │
└──────────────────────────┘
```

## Decision Tree for Instruction Type

```
                     Row i
                      │
         ┌────────────┴────────────┐
         │                         │
      Has shortRowInfo?          No shortRowInfo
         │ (YES)                    │ (NO)
         │                          │
         ├─ HOLD instruction        ├─ Count consecutive rows
         │  (if row 1 of sequence)  │  (until next shaping or short row)
         │                          │
         └─ KNIT instruction        ├─ Detect pattern
            (for each short row)    │  (repeating increases/decreases)
                                    │
                                    ├─ Pattern found?
                                    │  │ (YES)
                                    │  ├─ repeatCount >= 2?
                                    │  │  │ (YES)
                                    │  │  └─ PATTERN instruction
                                    │  │     ("Every N rows, inc/dec...")
                                    │  │
                                    │  │  (NO)
                                    │  └─ Fall through
                                    │
                                    ├─ Is rectangular?
                                    │  │ (YES - no shaping, all consecutive)
                                    │  └─ RECTANGULAR instruction
                                    │     ("Knit N rows")
                                    │
                                    └─ INDIVIDUAL instruction
                                       ├─ Zero shaping?
                                       │  └─ "Knit across N stitches"
                                       │
                                       └─ With shaping?
                                          └─ "Inc/Dec X. Knit N rows."
```

## Short Row Processing Example

```
Input Section (rows 15-29):
┌─────┬─────────────────┬──────────────┐
│ Idx │ Row Number      │ Type         │
├─────┼─────────────────┼──────────────┤
│ 15  │ 16              │ ShortRow #1  │
│ 16  │ 17              │ ShortRow #2  │
│ 17  │ 18              │ ShortRow #3  │
│ ... │ ...             │ ...          │
│ 29  │ 30              │ ShortRow #15 │
│ 30  │ 31 (regular)    │ Regular      │
└─────┴─────────────────┴──────────────┘

Processing:
i=15: Detect shortRowInfo, rowInShortRowSequence=1
  → Generate HOLD instruction
  → Generate KNIT instruction for short row 1
  → i += 15 (skip to row 30)

i=30: No shortRowInfo
  → Process as regular row...

Output:
[
  {
    text: "Place 5 stitches on left on HOLD...",
    stepData: { startRowIndex: 15, endRowIndex: 15, rowsInStep: 1 }
  },
  {
    text: "Knit across 25 stitches... Wrap last stitch and turn.",
    stepData: { startRowIndex: 15, endRowIndex: 29, rowsInStep: 15 }
  },
  {
    text: "Knit 1 row...",
    stepData: { startRowIndex: 30, endRowIndex: 30, rowsInStep: 1 }
  }
]
```

## Extension Points

```
KnittingInstructionActualizer
│
├─ Override: getAbsolutePosition()
│  └─ Customize needle numbering (e.g., for DK machine vs hand knitting)
│
├─ Override: detectShapingPattern()
│  └─ Implement different pattern detection algorithms
│
├─ Override: actualize()
│  └─ Completely custom instruction generation for new techniques
│
└─ Use: buildShapingText(), buildKnitRowsText()
   └─ Reuse common text formatting logic
```

## Dependency Graph

```
React Components
    │
    ├─ RowByRowInstructions.tsx
    │  └─ depends on KnittingInstruction[]
    │
    ├─ InteractiveKnittingView.tsx
    │  └─ depends on KnittingInstruction[]
    │
    └─ [other components]
         └─ depends on KnittingInstruction[]

InteractiveKnittingPage.tsx
    │
    ├─ creates HandKnittingActualizer
    │  └─ extends KnittingInstructionActualizer
    │
    ├─ calls actualizer.actualize()
    │  └─ processes StitchRow[] → KnittingInstruction[]
    │
    └─ passes instructions to React components

Configuration
    │
    └─ knittingOptions
       └─ passed to actualizer constructor
          ├─ shortRowTechnique: 'wraps' | 'gaps' | 'german'
          ├─ needleType: 'straight' | 'circular'
          └─ [future options]
```

## State Management Integration (Redux)

```
Redux Store
│
├─ knittingDesign
│  ├─ projectPanels[i]
│  │  ├─ stitchPlan: StitchPlan
│  │  └─ knittingOptions
│  │
│  └─ knittingProgress
│     ├─ currentRowIndex
│     ├─ currentPanelIndex
│     └─ completedRows[]

Components
│
├─ select knittingOptions
├─ select stitchPlan
├─ select knittingProgress
│
└─ useMemo(() => {
     const actualizer = new HandKnittingActualizer(knittingOptions)
     const instructions = actualizer.actualize(stitchPlan.rows, 0)
     return instructions
   }, [knittingOptions, stitchPlan])
```

This architecture provides:
- **Clarity**: Data flows through clearly defined layers
- **Extensibility**: New actualizers are simple to add
- **Testability**: Each layer can be tested independently
- **Maintainability**: Changes localized to appropriate layer
- **Reusability**: Actualizers work across different components
