# Issue: Shaping Instructions Not Displaying on Interactive Knitting Page

## Problem

The `/crafts/knitting-pattern-designer/interactive-knitting` page is NOT displaying detailed shaping instructions even though `generateConcreteStitchPlan()` is generating complete stitch plans.

**Current Behavior**:
- Instructions shown are basic summaries like "Knit 50 rows (60 sts in work)"
- **NOT showing** detailed increase/decrease instructions like:
  - "Increase 1 stitch on the left. Increase 1 stitch on the right. Knit 4 rows. (RC=4, 120 sts in work)"

## Root Cause

In `src/pages/InteractiveKnittingPage.tsx` (lines 106-114), the `generateShapingInstructions()` method is too simplistic:

```typescript
generateShapingInstructions: function() {
    // Simple instruction generation
    const instructions: string[] = [];
    if (this.rows.length === 0) return instructions;
    
    // Check if rectangular
    const firstRow = this.rows[0];
    const lastRow = this.rows[this.rows.length - 1];
    const firstTotal = firstRow.leftStitchesInWork + firstRow.rightStitchesInWork;
    const lastTotal = lastRow.leftStitchesInWork + lastRow.rightStitchesInWork;
    
    if (firstTotal === lastTotal) {
        instructions.push(`Knit ${this.rows.length} rows (${firstTotal} sts in work).`);
    } else {
        instructions.push(`Knit panel with shaping from ${firstTotal} to ${lastTotal} stitches over ${this.rows.length} rows.`);
    }
    
    return instructions;
}
```

This generates only:
- ✅ Cast on (handled elsewhere)
- ✅ Simple rectangle detection
- ❌ **Missing**: Row-by-row shaping details
- ✅ Bind off (handled elsewhere)

## What's Available

The stitch plan HAS all the data needed:
- `row.leftStitchesInWork` - Left side stitch count
- `row.rightStitchesInWork` - Right side stitch count
- `row.rowNumber` - Machine row counter

This is exactly what the legacy `StitchPlan.generateShapingInstructions()` uses!

## Solution

Replace the simplistic instruction generation with the proper logic from `src/models/StitchPlan.ts` (lines 73-117).

### Step 1: Import the Helper Function

Add to imports at top of `InteractiveKnittingPage.tsx`:

```typescript
import { StitchPlan } from '../models/StitchPlan';
```

### Step 2: Replace the generateShapingInstructions Method

Replace the method in the `stitchPlanObj` creation (lines 106-114) with:

```typescript
generateShapingInstructions: function() {
    // Use the same logic as StitchPlan.generateShapingInstructions()
    const instructions: string[] = [];
    
    if (this.rows.length === 0) {
        return instructions;
    }
    
    const firstRow = this.rows[0];
    const lowerLeft = firstRow.leftStitchesInWork;
    const lowerRight = firstRow.rightStitchesInWork;
    const upperLeft = this.rows[this.rows.length - 1].leftStitchesInWork;
    const upperRight = this.rows[this.rows.length - 1].rightStitchesInWork;
    
    // Case: rectangular panel, no shaping
    if (lowerLeft === upperLeft && lowerRight === upperRight) {
        instructions.push(`Knit ${this.rows.length} rows (RC=${this.rows[this.rows.length - 1].rowNumber}, ${this.rows[this.rows.length - 1].leftStitchesInWork + this.rows[this.rows.length - 1].rightStitchesInWork} sts in work).`);
    }
    // Case: trapezoidal panel with shaping
    else {
        let consecutiveRows = 1;
        let prevRow = firstRow;
        
        for (let i = 1; i < this.rows.length; i++) {
            const row = this.rows[i];
            const leftDiff = row.leftStitchesInWork - prevRow.leftStitchesInWork;
            const rightDiff = row.rightStitchesInWork - prevRow.rightStitchesInWork;
            
            if (leftDiff === 0 && rightDiff === 0) {
                // No shaping, continue counting
                consecutiveRows++;
            } else {
                // Shaping detected, output previous instruction
                let instruction = '';
                
                if (prevRow.leftStitchesInWork !== this.rows[i - consecutiveRows].leftStitchesInWork) {
                    const leftChange = prevRow.leftStitchesInWork - this.rows[i - consecutiveRows].leftStitchesInWork;
                    if (leftChange > 0) {
                        instruction += `Increase ${leftChange} stitch${leftChange > 1 ? 'es' : ''} on the left. `;
                    } else {
                        instruction += `Decrease ${-leftChange} stitch${leftChange < -1 ? 'es' : ''} on the left. `;
                    }
                }
                
                if (prevRow.rightStitchesInWork !== this.rows[i - consecutiveRows].rightStitchesInWork) {
                    const rightChange = prevRow.rightStitchesInWork - this.rows[i - consecutiveRows].rightStitchesInWork;
                    if (rightChange > 0) {
                        instruction += `Increase ${rightChange} stitch${rightChange > 1 ? 'es' : ''} on the right. `;
                    } else {
                        instruction += `Decrease ${-rightChange} stitch${rightChange < -1 ? 'es' : ''} on the right. `;
                    }
                }
                
                const rowText = consecutiveRows > 1 ? `Knit ${consecutiveRows} rows` : 'Knit 1 row';
                instruction += `${rowText}. (RC=${prevRow.rowNumber}, ${prevRow.leftStitchesInWork + prevRow.rightStitchesInWork} sts in work)`;
                instructions.push(instruction);
                
                consecutiveRows = 1;
            }
            prevRow = row;
        }
        
        // Handle final group of rows
        if (consecutiveRows > 0 && this.rows.length > 0) {
            const lastRow = this.rows[this.rows.length - 1];
            let instruction = '';
            
            const firstOfGroup = this.rows[this.rows.length - consecutiveRows];
            if (lastRow.leftStitchesInWork !== firstOfGroup.leftStitchesInWork) {
                const leftChange = lastRow.leftStitchesInWork - firstOfGroup.leftStitchesInWork;
                if (leftChange > 0) {
                    instruction += `Increase ${leftChange} stitch${leftChange > 1 ? 'es' : ''} on the left. `;
                } else {
                    instruction += `Decrease ${-leftChange} stitch${leftChange < -1 ? 'es' : ''} on the left. `;
                }
            }
            
            if (lastRow.rightStitchesInWork !== firstOfGroup.rightStitchesInWork) {
                const rightChange = lastRow.rightStitchesInWork - firstOfGroup.rightStitchesInWork;
                if (rightChange > 0) {
                    instruction += `Increase ${rightChange} stitch${rightChange > 1 ? 'es' : ''} on the right. `;
                } else {
                    instruction += `Decrease ${-rightChange} stitch${rightChange < -1 ? 'es' : ''} on the right. `;
                }
            }
            
            const rowText = consecutiveRows > 1 ? `Knit ${consecutiveRows} rows` : 'Knit 1 row';
            instruction += `${rowText}. (RC=${lastRow.rowNumber}, ${lastRow.leftStitchesInWork + lastRow.rightStitchesInWork} sts in work)`;
            instructions.push(instruction);
        }
    }
    
    return instructions;
}
```

## Expected Result

**Before Fix**:
```
Knit 50 rows (60 sts in work).
```

**After Fix**:
```
Increase 1 stitch on the left. Increase 1 stitch on the right. Knit 4 rows. (RC=4, 62 sts in work)
Increase 1 stitch on the left. Increase 1 stitch on the right. Knit 3 rows. (RC=7, 64 sts in work)
Increase 1 stitch on the left. Increase 1 stitch on the right. Knit 3 rows. (RC=10, 66 sts in work)
... (continues for all rows) ...
Knit 50 rows (RC=50, 120 sts in work).
```

## Files to Modify

1. **`src/pages/InteractiveKnittingPage.tsx`**
   - Import `StitchPlan` class (optional, for reference)
   - Replace `generateShapingInstructions` method (lines 106-114)
   - Keep the rest of the logic intact

## Testing

After making the fix:

1. Navigate to `/crafts/knitting-pattern-designer/interactive-knitting`
2. Select a knitting project with shaping
3. Verify that the instructions panel shows detailed shaping steps
4. Compare output with legacy `Panel.generateKnittingInstructions()` for identical format

## Related Code

- **Source of correct logic**: `src/models/StitchPlan.ts` lines 73-117 (`generateShapingInstructions`)
- **Test data**: `src/__tests__/unit/shapingInstructions.test.ts` - All test cases show expected output format
- **Stitch plan generation**: `src/utils/stitchPlanGenerator.ts` - Generates the rows we're analyzing

## Why This Matters

Users expect to see detailed shaping instructions like:
- "Increase 2 stitches on the left"
- "Decrease 1 stitch on the right every 3 rows"

Without this, they can't properly follow the knitting pattern on the interactive page. This is the PRIMARY PURPOSE of the stitch plan - to provide row-by-row guidance.
