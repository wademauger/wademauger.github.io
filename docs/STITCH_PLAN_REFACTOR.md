# Knitting Pattern Data Structure Refactoring

## Summary
Refactored the knitting pattern wizard to generate and save concrete, stitch-by-stitch pattern data instead of abstract layer configuration. This simplifies the interactive knitting UX by providing ready-to-use pattern data.

## Changes Made

### 1. New Utility: `stitchPlanGenerator.ts`
**Location**: `/src/utils/stitchPlanGenerator.ts`

Created a utility to generate concrete stitch plans from abstract wizard data:

```typescript
interface StitchRow {
  rowNumber: number;
  leftStitchesInWork: number;
  rightStitchesInWork: number;
  totalStitches: number;
  colorwork: string[]; // Array of color IDs, one per stitch
}

interface ConcreteStitchPlan {
  rows: StitchRow[];
  colorPalette: { [colorId: string]: { color: string; label: string } };
  metadata: {
    totalRows: number;
    panelName: string;
    generatedAt: string;
  };
}
```

**Key Function**: `generateConcreteStitchPlan(shape, gauge, colorworkLayers, panelName)`
- Takes abstract panel shape, gauge, and colorwork layers
- Reconstructs Trapezoid and Panel instances
- Uses `PanelColorworkComposer` to combine shape and colorwork
- Outputs a simple row-by-row array with exact stitch colors

### 2. Updated Pattern Wizard: `WizardView.tsx`
**Location**: `/src/apps/knitting-designer/components/WizardView.tsx`

Modified the "Create Project" button handler to:
1. Generate concrete stitch plans for each panel instance
2. Save both the stitch plan AND wizard options:
   ```typescript
   {
     instanceId: string,
     panelKey: string,
     panelName: string,
     stitchPlan: ConcreteStitchPlan, // NEW: Pre-generated pattern
     wizardOptions: {               // For re-editing in wizard
       shape: {...},
       colorworkLayers: [...],
       colorworkOptions: {}
     }
   }
   ```

### 3. Simplified Interactive Knitting: `InteractiveKnittingPage.tsx`
**Location**: `/src/pages/InteractiveKnittingPage.tsx`

Updated to use pre-generated stitch plans:

**New Flow (preferred)**:
- Check if `panelData.stitchPlan` exists
- If yes, directly use it (no reconstruction needed)
- Convert to format expected by `InteractiveKnittingView`

**Legacy Flow (backward compatible)**:
- If no `stitchPlan`, fall back to old approach
- Look for `wizardOptions.shape` or old `shape` field
- Reconstruct Trapezoid → Panel → PanelColorworkComposer
- This ensures old saved projects still work

## Benefits

### For Pattern Wizard
- **Validation**: Stitch plan generation happens at save time, errors caught early
- **Debugging**: Can log the exact stitch plan being saved
- **Re-editable**: Wizard options preserved separately, can re-open for editing

### For Interactive Knitting App
- **Simplicity**: No need to understand Trapezoid geometry or colorwork composition
- **Performance**: No runtime reconstruction, instant loading
- **Reliability**: Stitch plan is exactly what wizard generated, no surprises
- **Focus on UX**: Can focus entirely on row-by-row knitting interface

### For Data Structure
- **Concrete**: `colorwork: ['MC', 'CC1', 'CC1', 'MC', ...]` per row
- **Self-contained**: Has everything needed for knitting instructions
- **Portable**: Could export to other knitting apps or formats
- **Testable**: Easy to write unit tests for specific stitch patterns

## Data Flow Diagram

```
BEFORE:
Wizard → Save {shape, colorworkLayers} → Interactive → Reconstruct everything

AFTER:
Wizard → Generate StitchPlan → Save {stitchPlan, wizardOptions} → Interactive → Read stitchPlan
```

## Backward Compatibility

The `InteractiveKnittingPage` maintains full backward compatibility:
- First checks for new `panelData.stitchPlan`
- Falls back to `wizardOptions.shape` or `panelData.shape`
- Old projects continue to work with legacy reconstruction

## Future Enhancements

1. **Multi-layer composition**: Currently uses first colorwork layer, could composite all layers
2. **Shaping instructions**: Generate detailed increase/decrease instructions from stitch plan
3. **Export formats**: Convert to PDF, written pattern, machine knitting file
4. **Progress tracking**: Store user's knitting progress with the stitch plan
5. **Stitch modifications**: Allow manual edits to generated stitch plan

## Testing Recommendations

1. **Create new project in wizard** with colorwork → Verify `stitchPlan` is saved
2. **Load in interactive knitting** → Verify uses stitch plan (check console logs)
3. **Verify old projects** still load and work with legacy reconstruction
4. **Test edge cases**: No colorwork, complex shapes, multiple panels

## Files Modified

- ✅ `/src/utils/stitchPlanGenerator.ts` (NEW)
- ✅ `/src/apps/knitting-designer/components/WizardView.tsx`
- ✅ `/src/pages/InteractiveKnittingPage.tsx`

## Files NOT Modified (but use stitch plans)

- `/src/components/InteractiveKnittingView.tsx` - Already works with stitch plans
- `/src/models/PanelColorworkComposer.ts` - Still used for generation
- `/src/models/StitchPlan.ts` - Base class, unchanged
