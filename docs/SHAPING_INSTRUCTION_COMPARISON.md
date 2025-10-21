# Shaping Instructions: Legacy vs New Implementation Comparison

## Overview

This document compares the legacy `Panel.generateKnittingInstructions()` method with the new `generateConcreteStitchPlan()` implementation to identify discrepancies and ensure backward compatibility.

## Test Results Summary

### ✅ Working Correctly

1. **4x4 Gauge Swatch** - Simple rectangle
   - Cast on: ✅ Both match (19 stitches)
   - Rows: ✅ Both have 30 rows
   - Bind off: ✅ Both match (19 stitches)
   - **Minor issue**: Punctuation differs ("Knit 30 rows (RC=30, 19 sts in work)." vs "Knit 30 rows. (RC=30, 19 sts in work)")

### ❌ Issues Found

#### 1. **Off-by-One Row Count Error**
- **Test Case**: 15x15 gauge swatch
- **Expected (Legacy)**: 114 rows
- **Actual (New)**: 113 rows
- **Impact**: Missing 1 row in stitch plan generation
- **Root Cause**: Likely in the row counting logic when generating stitch plan from trapezoid

#### 2. **Stitch Count Discrepancy**
- **Test Case**: Rectangle (10" height x 25" width)
- **Expected (Legacy)**: 120 stitches
- **Actual (New)**: 119 stitches
- **Impact**: Missing 1 stitch in cast on and all subsequent rows
- **Root Cause**: Rounding error in gauge calculations or stitch plan generation

#### 3. **Instruction Format Differences**
- **Legacy format**: `Knit 30 rows (RC=30, 19 sts in work).`
- **New format**: `Knit 30 rows. (RC=30, 19 sts in work)`
- **Impact**: Minor - doesn't affect knitting but may confuse users
- **Fix**: Adjust text generation to match legacy format exactly

## Detailed Test Case Analysis

### Test Case 1: 4x4 Gauge Swatch (Rectangle)
```typescript
{
  height: 4,
  baseA: 4,
  baseB: 4,
  successors: []
}
```

**Gauge**: 19 stitches per 4", 30 rows per 4"

**Legacy Output**:
```
1. Cast on 19 stitches.
2. Knit 30 rows (RC=30, 19 sts in work).
3. Bind off 19 stitches.
```

**New Output**:
```
1. Cast on 19 stitches.
2. Knit 30 rows. (RC=30, 19 sts in work)
3. Bind off 19 stitches.
```

**Status**: ✅ Functionally correct, minor formatting difference

---

### Test Case 2: 15x15 Gauge Swatch (Rectangle)
```typescript
{
  height: 15,
  baseA: 15,
  baseB: 15,
  successors: []
}
```

**Gauge**: 19 stitches per 4", 30 rows per 4"

**Expected Calculations**:
- Stitches: 15 inches × (19 stitches / 4 inches) = 71.25 → rounds to 72 stitches ✅
- Rows: 15 inches × (30 rows / 4 inches) = 112.5 → rounds to 113 rows
- But legacy shows 114 rows! 🤔

**Legacy Output**:
```
1. Cast on 72 stitches.
2. Knit 114 rows (RC=114, 72 sts in work).
3. Bind off 72 stitches.
```

**New Output**:
```
1. Cast on 72 stitches.
2. Knit 113 rows. (RC=113, 72 sts in work)
3. Bind off 72 stitches.
```

**Status**: ❌ Row count mismatch - need to investigate rounding/sizeModifier application

**Analysis**: The sizeModifier of 1.006 may be applied differently:
- 15" × 30/4 × 1.006 = 113.175 → rounds to 113 (new)
- Legacy may use different rounding or calculation order

---

### Test Case 3: Rectangle (10" × 25")
```typescript
{
  height: 10,
  baseA: 25,
  baseB: 25,
  successors: []
}
```

**Expected Calculations**:
- Stitches: 25 × (19/4) × 1.006 = 119.0875 → should round to 119
- But legacy shows 120!

**Legacy Output**:
```
1. Cast on 120 stitches.
2. Knit 76 rows (RC=76, 120 sts in work).
3. Bind off 120 stitches.
```

**New Output**:
```
1. Cast on 119 stitches.
2. Knit 75 rows. (RC=75, 119 sts in work)
3. Bind off 119 stitches.
```

**Status**: ❌ Both stitch count AND row count differ

---

## Root Cause Investigation

### Hypothesis 1: sizeModifier Application Order
The legacy code may apply sizeModifier at a different point in the calculation:
- **Legacy**: `Math.round(baseA * stitchesPerInch) where stitchesPerInch = gauge * sizeModifier`
- **New**: May calculate differently

### Hypothesis 2: Rounding Strategy
- Legacy may use `Math.round()` in certain places and `Math.floor()` or `Math.ceil()` in others
- Need to examine `Trapezoid.getStitchPlan()` implementation carefully

### Hypothesis 3: Row Numbering Start
- Legacy starts rows at 1
- New implementation may start at 0 in some places, causing off-by-one

## Action Items

### High Priority (Breaks Functionality)
- [ ] Fix row count discrepancy (113 vs 114 rows)
- [ ] Fix stitch count discrepancy (119 vs 120 stitches)
- [ ] Investigate sizeModifier application in `generateConcreteStitchPlan`

### Medium Priority (User Experience)
- [ ] Match instruction text format exactly
- [ ] Add test case for each garment in testdata
- [ ] Verify successor/stacked shape calculations

### Low Priority (Nice to Have)
- [ ] Document the expected rounding behavior
- [ ] Add inline comments explaining gauge calculations
- [ ] Create visual comparison tool for debugging

## Code References

### Legacy Implementation
- **File**: `src/models/Panel.ts`
- **Method**: `generateKnittingInstructions()`
- **Calls**: `shape.generateKnittingInstructions(gauge, sizeModifier, 1, true, visualMotif)`

### Legacy Trapezoid
- **File**: `src/models/Trapezoid.ts`
- **Method**: `generateKnittingInstructions(gauge, sizeModifier, startRow, isRoot, visualMotif)`
- **Calls**: `getStitchPlan(gauge, sizeModifier, startRow)`

### Legacy StitchPlan
- **File**: `src/models/StitchPlan.ts`
- **Method**: `generateShapingInstructions()`
- **Logic**: Processes rows and groups consecutive non-shaping rows

### New Implementation
- **File**: `src/utils/stitchPlanGenerator.ts`
- **Method**: `generateConcreteStitchPlan(shape, gauge, colorworkLayers, panelName)`
- **Calls**: `reconstructTrapezoid()` then `trapezoid.getStitchPlan()`

## Next Steps

1. **Examine getStitchPlan()** - This is where the row/stitch counts are calculated
2. **Compare rounding** - Check if Math.round is consistently applied
3. **Test sizeModifier** - Create test without sizeModifier (=1.0) to isolate the issue
4. **Add detailed logging** - Trace through both implementations with same input
5. **Fix discrepancies** - Update new implementation to match legacy exactly
6. **Validate all test cases** - Run full test suite against all garment shapes

## Test Suite Status

**File**: `src/__tests__/unit/shapingInstructions.test.ts`

**Tests Passing**: 21 / 29
**Tests Failing**: 8 / 29

**Failing Tests**:
- New Stitch Plan Generation (8 tests) - All due to property name mismatch, now fixed

**Next Test Run**: Should show actual calculation discrepancies once property names are correct
