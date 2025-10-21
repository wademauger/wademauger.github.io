# Using KnittingInstructionActualizers - Quick Start Guide

## Installation

The actualizers are already created. Import them where needed:

```typescript
import HandKnittingActualizer from '@/models/HandKnittingActualizer';
import { KnittingInstructionActualizer } from '@/models/KnittingInstructionActualizer';
```

## Basic Usage

### Simple One-Time Use

```typescript
// Create actualizer
const actualizer = new HandKnittingActualizer(knittingOptions);

// Process stitch plan
const instructions = actualizer.actualize(
    stitchPlan.rows,        // Array of StitchRow objects
    0                       // Base row index
);

// Use instructions
instructions.forEach((instr) => {
    console.log(instr.text);
    console.log(instr.stepData.absolutePositioning.needleRange);
});
```

### React Component Usage (Recommended)

```typescript
import React, { useMemo } from 'react';
import HandKnittingActualizer from '@/models/HandKnittingActualizer';

function KnittingInstructions({ stitchPlan, knittingOptions }) {
    // Create actualizer once (memoized for performance)
    const actualizer = useMemo(
        () => new HandKnittingActualizer(knittingOptions),
        [knittingOptions]
    );

    // Generate instructions
    const instructions = useMemo(
        () => actualizer.actualize(stitchPlan.rows, 0),
        [actualizer, stitchPlan]
    );

    return (
        <div>
            {instructions.map((instr, idx) => (
                <div key={idx}>
                    <p>{instr.text}</p>
                    <small>{instr.stepData.absolutePositioning.needleRange}</small>
                </div>
            ))}
        </div>
    );
}
```

### Processing Multiple Sections

```typescript
const actualizer = new HandKnittingActualizer(knittingOptions);

// Process body section (rows 0-60)
const bodyInstructions = actualizer.actualize(
    stitchPlan.rows.slice(0, 60),
    0
);

// Process sleeve section (rows 60-100)
const sleeveInstructions = actualizer.actualize(
    stitchPlan.rows.slice(60, 100),
    60  // Base index for sleeve section
);

// Combine all instructions
const allInstructions = [...bodyInstructions, ...sleeveInstructions];
```

## Output Structure

Each instruction has this structure:

```typescript
interface KnittingInstruction {
    // Human-readable instruction text
    text: string;
    // "Increase 1 stitch on the left. Knit 2 rows. (RC=4, 62 sts in work)"

    stepData: {
        // Same as text (for consistency)
        text: string;

        // Which rows this instruction covers
        startRowIndex: number;      // Index in the section
        endRowIndex: number;        // Inclusive
        rowsInStep: number;         // How many rows total

        // Positioning information
        absolutePositioning: {
            totalStitches: number;          // 62
            leftStitches: number;           // 31
            rightStitches: number;          // 31
            needleRange: string;            // "L32-L62 / R1-R31"
            description: string;            // "Knitting across 62 stitches (31 left, 31 right)"
        };
    };
}
```

## Customizing Knitting Options

```typescript
const options = {
    shortRowTechnique: 'wraps',    // 'wraps', 'gaps', or 'german'
    needleType: 'straight',         // For future use
    knittingDirection: 'rtl',       // right-to-left
    // ... other options
};

const actualizer = new HandKnittingActualizer(options);
const instructions = actualizer.actualize(rows, baseIndex);
```

## Creating a Custom Actualizer

### For Machine Knitting

```typescript
import KnittingInstructionActualizer, { 
    StitchRow, 
    KnittingInstruction,
    PatternDetectionResult 
} from '@/models/KnittingInstructionActualizer';

export class MachineKnittingActualizer extends KnittingInstructionActualizer {
    actualize(sectionRows: StitchRow[], baseRowIndex: number): KnittingInstruction[] {
        const instructions: KnittingInstruction[] = [];

        // Your machine knitting logic here
        // Access helpers:
        // - this.detectShapingPattern(rows, index)
        // - this.getAbsolutePosition(row)
        // - this.buildShapingText(leftDiff, rightDiff)
        // - this.buildKnitRowsText(count)

        for (let i = 0; i < sectionRows.length; i++) {
            const row = sectionRows[i];
            // ... generate machine-specific codes ...
            instructions.push({
                text: `Machine row code: ...`,
                stepData: {
                    text: `Machine row code: ...`,
                    startRowIndex: baseRowIndex + i,
                    endRowIndex: baseRowIndex + i,
                    rowsInStep: 1,
                    absolutePositioning: this.getAbsolutePosition(row)
                }
            });
        }

        return instructions;
    }
}
```

### For Circular Needle Knitting

```typescript
export class CircularNeedleActualizer extends KnittingInstructionActualizer {
    actualize(sectionRows: StitchRow[], baseRowIndex: number): KnittingInstruction[] {
        const instructions: KnittingInstruction[] = [];

        // Circular needle logic:
        // - Numbered rounds instead of rows
        // - No "turning" at row boundaries
        // - Different terminology ("round" vs "row")

        for (let i = 0; i < sectionRows.length; i++) {
            const row = sectionRows[i];
            const roundNumber = Math.floor(i / 2) + 1;  // Two passes per round
            
            const instruction = this.buildShapingText(
                row.leftStitchesInWork - (i > 0 ? sectionRows[i-1].leftStitchesInWork : 0),
                row.rightStitchesInWork - (i > 0 ? sectionRows[i-1].rightStitchesInWork : 0)
            );

            instructions.push({
                text: `Round ${roundNumber}: ${instruction || 'Knit'} (${row.leftStitchesInWork + row.rightStitchesInWork} sts)`,
                stepData: {
                    text: `Round ${roundNumber}: ${instruction || 'Knit'} (${row.leftStitchesInWork + row.rightStitchesInWork} sts)`,
                    startRowIndex: baseRowIndex + i,
                    endRowIndex: baseRowIndex + i,
                    rowsInStep: 1,
                    absolutePositioning: this.getAbsolutePosition(row)
                }
            });
        }

        return instructions;
    }
}
```

## Testing Your Actualizer

```typescript
import HandKnittingActualizer from '@/models/HandKnittingActualizer';

describe('HandKnittingActualizer', () => {
    it('should generate correct instructions for simple shaping', () => {
        const rows = [
            { rowNumber: 1, leftStitchesInWork: 30, rightStitchesInWork: 30 },
            { rowNumber: 2, leftStitchesInWork: 31, rightStitchesInWork: 31 },
            { rowNumber: 3, leftStitchesInWork: 32, rightStitchesInWork: 32 },
        ];

        const actualizer = new HandKnittingActualizer({});
        const instructions = actualizer.actualize(rows, 0);

        expect(instructions.length).toBe(1);
        expect(instructions[0].text).toContain('Increase');
        expect(instructions[0].text).toContain('2 rows');
        expect(instructions[0].stepData.rowsInStep).toBe(2);
    });

    it('should handle short rows correctly', () => {
        const rows = [
            { 
                rowNumber: 15, 
                leftStitchesInWork: 30, 
                rightStitchesInWork: 30,
                shortRowInfo: {
                    shortRowId: 'sr-123',
                    rowInShortRowSequence: 1,
                    totalRowsInShortRow: 15,
                    heldStitchesLeft: 5,
                    heldStitchesRight: 5,
                    activeStitchesLeft: 25,
                    activeStitchesRight: 25
                }
            }
        ];

        const actualizer = new HandKnittingActualizer({ shortRowTechnique: 'wraps' });
        const instructions = actualizer.actualize(rows, 0);

        expect(instructions.length).toBe(2);  // HOLD + KNIT
        expect(instructions[0].text).toContain('Place');
        expect(instructions[0].text).toContain('HOLD');
        expect(instructions[1].text).toContain('Knit across');
        expect(instructions[1].text).toContain('Wrap');
    });
});
```

## Integration with InteractiveKnittingPage

### Current (Before)
```typescript
_generateInstructionsForRows(sectionRows, baseRowIndex, instructions) {
    // 150+ lines of nested logic...
}
```

### Updated (After)
```typescript
_generateInstructionsForRows(sectionRows: StitchRow[], baseRowIndex: number): KnittingInstruction[] {
    const actualizer = new HandKnittingActualizer(this.knittingOptions);
    return actualizer.actualize(sectionRows, baseRowIndex);
}
```

## Switching Between Actualizers

```typescript
function getActualizer(knittingStyle: string, options: any) {
    switch(knittingStyle) {
        case 'machine':
            return new MachineKnittingActualizer(options);
        case 'circular':
            return new CircularNeedleActualizer(options);
        case 'hand':
        default:
            return new HandKnittingActualizer(options);
    }
}

// Usage
const actualizer = getActualizer(userSelectedStyle, knittingOptions);
const instructions = actualizer.actualize(rows, baseIndex);
```

## Performance Considerations

### Memoization
```typescript
const actualizer = useMemo(
    () => new HandKnittingActualizer(options),
    [options]
);

const instructions = useMemo(
    () => actualizer.actualize(rows, baseIndex),
    [actualizer, rows, baseIndex]
);
```

### Lazy Generation
```typescript
// Don't generate all instructions at once if there are many rows
const generateBySection = (rows: StitchRow[], sectionSize: number = 60) => {
    const allInstructions = [];
    for (let i = 0; i < rows.length; i += sectionSize) {
        const section = rows.slice(i, i + sectionSize);
        const sectionInstructions = actualizer.actualize(section, i);
        allInstructions.push(...sectionInstructions);
    }
    return allInstructions;
};
```

## Troubleshooting

### Instructions not appearing
1. Check `actualizer.actualize()` return value
2. Verify `StitchRow` objects have required fields
3. Check console for type errors

### Wrong needle ranges
1. Verify `leftStitchesInWork` and `rightStitchesInWork` are correct
2. Check `baseRowIndex` is correct
3. Inspect `getAbsolutePosition()` calculation in debugger

### Short rows not detected
1. Verify `shortRowInfo` object is present on rows
2. Check `rowInShortRowSequence` starts at 1
3. Verify `totalRowsInShortRow` matches actual count

## Next Steps

- Create tests for your custom actualizer
- Add UI to select knitting style
- Extend with additional knitting techniques
- Implement format pipelines (compact/detailed/visual)
