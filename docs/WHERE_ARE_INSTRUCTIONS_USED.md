# Where Are the Shaping Instructions Being Used?

## Short Answer

✅ `generateConcreteStitchPlan()` IS being used and IS generating stitch plans.
❌ BUT the shaping instructions are NOT being fully generated/displayed.

## Data Flow

### 1. **Where it's Generated** ✅
**File**: `src/apps/knitting-designer/components/WizardView.tsx` (lines 797-815)

```typescript
stitchPlan = generateConcreteStitchPlan(
  shape,
  patternData?.gauge || {},
  panelPatternLayers,
  instance.panelName
);
```

**Result**: Stitch plan with all row data is created and saved to the project.

### 2. **Where it's Loaded** ✅
**File**: `src/pages/InteractiveKnittingPage.tsx` (lines 75-129)

```typescript
if (panelData.stitchPlan) {
    console.log('Using pre-generated stitch plan:', panelData.stitchPlan);
    
    const stitchPlanObj = {
        rows: panelData.stitchPlan.rows.map((row: any) => ({
            rowNumber: row.rowNumber,
            leftStitchesInWork: row.leftStitchesInWork,
            rightStitchesInWork: row.rightStitchesInWork,
            colorwork: getRowColorwork(row)
        })),
        // ...
        generateShapingInstructions: function() {
            // PROBLEM: Only generates simple summaries
        }
    };
```

### 3. **Where it's Displayed** ✅
**File**: `src/components/InteractiveKnittingView.tsx` (lines 253-256)

```typescript
{enhancedStitchPlan && (
    <RowByRowInstructions 
        stitchPlan={enhancedStitchPlan}
        currentRow={knittingProgress.currentRow}
    />
)}
```

**File**: `src/components/RowByRowInstructions.tsx` (line 18)

```typescript
const instructions = stitchPlan.generateKnittingInstructions();
```

## The Problem

### Current Behavior
In `InteractiveKnittingPage.tsx` lines 106-114:

```typescript
generateShapingInstructions: function() {
    // Simple instruction generation
    const instructions: string[] = [];
    if (this.rows.length === 0) return instructions;
    
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

**Output on `/crafts/knitting-pattern-designer/interactive-knitting`**:
```
Row 1: Knit 50 rows with shaping from 60 to 120 stitches over 50 rows.
```

❌ This completely ignores row-by-row shaping details!

### What Should Be Displayed
Looking at `src/models/StitchPlan.ts` lines 73-117, the legacy code generates:

```
Row 1 (RC=1): Increase 1 stitch on the left. Increase 1 stitch on the right. Knit 4 rows. (RC=4, 62 sts in work)
Row 5 (RC=5): Increase 1 stitch on the left. Increase 1 stitch on the right. Knit 3 rows. (RC=8, 64 sts in work)
Row 8 (RC=8): Increase 1 stitch on the left. Increase 1 stitch on the right. Knit 3 rows. (RC=11, 66 sts in work)
... (continues for all rows with shaping details) ...
Row 50 (RC=50): Knit 50 rows. (RC=50, 120 sts in work)
```

✅ This is what users need to follow the pattern!

## Root Cause

The `generateShapingInstructions` method in `InteractiveKnittingPage.tsx` doesn't use the row-by-row analysis logic. It just looks at first and last rows and generates a summary.

The proper logic is in `src/models/StitchPlan.ts:generateShapingInstructions()` but it's not being used when creating the stitch plan object in `InteractiveKnittingPage.tsx`.

## Files Involved

### Stitch Plan Generation (Working ✅)
- `src/utils/stitchPlanGenerator.ts` - Creates concrete stitch plans
- `src/apps/knitting-designer/components/WizardView.tsx` - Calls it and saves project

### Stitch Plan Loading (Partially Working ⚠️)
- `src/pages/InteractiveKnittingPage.tsx` - Loads and recreates stitch plan object

### Instruction Display (Using Incomplete Data ❌)
- `src/components/InteractiveKnittingView.tsx` - Passes stitch plan to RowByRowInstructions
- `src/components/RowByRowInstructions.tsx` - Calls generateKnittingInstructions()

### Legacy Reference (Has Correct Logic ✅)
- `src/models/StitchPlan.ts` - Lines 73-117 contain proper shaping instruction generation

## The Fix Needed

Replace the `generateShapingInstructions` method in `InteractiveKnittingPage.tsx` (lines 106-114) with the actual logic from `StitchPlan.generateShapingInstructions()`.

See: `docs/INTERACTIVE_KNITTING_MISSING_INSTRUCTIONS.md` for detailed fix with complete code.

## Verification

After the fix is applied:

1. Navigate to `/crafts/knitting-pattern-designer`
2. Create a new knitting project with a trapezoid panel
3. Save the project
4. Open it in "Start Knitting"
5. ✅ Should see detailed shaping instructions like:
   ```
   Increase 1 stitch on the left. Increase 1 stitch on the right. Knit 4 rows. (RC=4, 62 sts in work)
   ```
   Instead of:
   ```
   Knit 50 rows with shaping from 60 to 120 stitches.
   ```

## Architecture Summary

```
WizardView.tsx
    ↓ generateConcreteStitchPlan()
    ↓ (saves to project)
InteractiveKnittingPage.tsx
    ↓ (loads stitch plan)
    ↓ (creates simplified stitchPlanObj with bad generateShapingInstructions)
InteractiveKnittingView.tsx
    ↓ passes enhancedStitchPlan
RowByRowInstructions.tsx
    ↓ calls generateKnittingInstructions()
    ❌ Gets incomplete summary instead of detailed rows
```

The data IS being generated correctly by `generateConcreteStitchPlan()`, but it's being undersold by the simplified instruction generation in `InteractiveKnittingPage.tsx`.
