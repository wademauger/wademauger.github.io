# Fix: Gauge Calculation in generateConcreteStitchPlan()

## Problem

The new `generateConcreteStitchPlan()` function was generating incorrect stitch counts for certain shapes because the **sizeModifier** (default 1.006) was not being applied during gauge calculations.

**Failing Tests** (2/29):
- Rectangle (25" wide): Generated 119 stitches instead of 120
- Isosceles trapezoid (30" base): Generated 143 stitches instead of 144

## Root Cause

Two issues in `src/utils/stitchPlanGenerator.ts`:

### Issue 1: Missing `sizeModifier` Parameter
The `generateConcreteStitchPlan()` function accepted a `sizeModifier` but never passed it through to the Panel creation and stitch plan generation.

### Issue 2: Hardcoded `sizeModifier = 1` in `generateCompleteStitchPlan()`
Line 201 called `trapezoid.getStitchPlan(gauge, 1, startRow)` with a hardcoded `1` instead of using the actual `sizeModifier`.

```typescript
// BEFORE (Wrong)
function generateCompleteStitchPlan(trapezoid: Trapezoid, gauge: Gauge, startRow: number): any {
  const stitchPlan = trapezoid.getStitchPlan(gauge, 1, startRow); // ❌ Always uses 1
  // ...
}
```

## Solution

### Fix 1: Accept and Apply sizeModifier
Updated the `generateConcreteStitchPlan()` signature to include `sizeModifier` with default value 1.006:

```typescript
export function generateConcreteStitchPlan(
  shape: any,
  gauge: any,
  colorworkLayers: any[],
  panelName: string,
  sizeModifier: number = 1.006  // ✅ New parameter
): ConcreteStitchPlan {
  // ...
  const panel = new Panel(trapezoid, gaugeInstance, sizeModifier);  // ✅ Pass it through
  const fullStitchPlan = generateCompleteStitchPlan(trapezoid, gaugeInstance, sizeModifier, 1);  // ✅ Pass to helper
}
```

### Fix 2: Update Helper Function Signature
Changed `generateCompleteStitchPlan()` to accept and use the `sizeModifier`:

```typescript
function generateCompleteStitchPlan(
  trapezoid: Trapezoid, 
  gauge: Gauge, 
  sizeModifier: number,    // ✅ New parameter
  startRow: number
): any {
  const stitchPlan = trapezoid.getStitchPlan(gauge, sizeModifier, startRow);  // ✅ Use actual value
  
  if (trapezoid.successors && trapezoid.successors.length > 0) {
    for (const successor of trapezoid.successors) {
      const successorPlan = generateCompleteStitchPlan(successor, gauge, sizeModifier, lastRow + 1);  // ✅ Pass it
      stitchPlan.rows.push(...successorPlan.rows);
    }
  }
  
  return stitchPlan;
}
```

### Fix 3: Update Test Suite
Updated all test calls to pass the `sizeModifier`:

```typescript
// BEFORE
const stitchPlan = generateConcreteStitchPlan(
    testCase.shapes,
    { stitchesPerFourInches: 19, rowsPerFourInches: 30, scalingFactor: 1 },
    [],
    'test-panel'
);

// AFTER
const stitchPlan = generateConcreteStitchPlan(
    testCase.shapes,
    { stitchesPerFourInches: 19, rowsPerFourInches: 30, scalingFactor: 1 },
    [],
    'test-panel',
    defaultSizeModifier  // ✅ Pass 1.006
);
```

## Files Modified

1. **`src/utils/stitchPlanGenerator.ts`**
   - Line 52-73: Added `sizeModifier` parameter to `generateConcreteStitchPlan()`
   - Line 77: Pass `sizeModifier` to `generateCompleteStitchPlan()`
   - Line 198-216: Updated function signature to accept `sizeModifier`
   - Line 201: Use `sizeModifier` in `getStitchPlan()` call
   - Line 207: Pass `sizeModifier` to recursive calls

2. **`src/__tests__/unit/shapingInstructions.test.ts`**
   - Line 43: Pass `defaultSizeModifier` to `generateConcreteStitchPlan()`
   - Line 168: Pass `defaultSizeModifier`
   - Line 260: Pass `defaultSizeModifier`
   - Line 288: Pass `defaultSizeModifier`

## Test Results

### Before Fix
- Tests: 27 passing, 2 failing
- Failing tests both showed stitch count off by 1

### After Fix
- Tests: **29 passing, 0 failing** ✅
- All shaping instruction generation matches legacy implementation exactly

## Verification

The new implementation now produces identical results to the legacy code for:
- ✅ All 8 test garment shapes
- ✅ Simple rectangles and complex trapezoids
- ✅ Shapes with successors (stacked/nested)
- ✅ Slanted trapezoids with asymmetric shaping
- ✅ Row counts and stitch counts match exactly
- ✅ Instruction text format matches exactly

## Why This Matters

The `sizeModifier` (1.006) is a precision factor used throughout the knitting system to account for fabric properties and ensure proper scaling. Without it:
- Gauge calculations were off by small amounts
- These errors compounded across rows and shapes
- Results diverged from the well-tested legacy implementation

This fix ensures that:
1. New implementations can safely replace legacy code
2. Saved projects work consistently across versions
3. Users get the same pattern output regardless of implementation path

## Related Code

The fix aligns `generateConcreteStitchPlan()` with how `Panel.generateKnittingInstructions()` works:
- Both now use the same `sizeModifier` (default 1.006)
- Both pass it through the entire call chain
- Both produce identical stitch and row counts
