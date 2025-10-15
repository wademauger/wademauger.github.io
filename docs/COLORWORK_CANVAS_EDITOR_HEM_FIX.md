# ColorworkCanvasEditor Hem and Short Row Support

## Issue
The `ColorworkCanvasEditor` was not respecting hem and short row options that were working correctly in `UnifiedPanelDiagram`.

#### 3. Fixed `renderHierarchyToCanvas` Function

**Note:** This function is only used for individual trapezoid rendering (not unified panel rendering), so it's less critical but still needed for consistency.# Problems:
1. **Hemmed trapezoids** were not being "folded in half" (rendered at 50% height)
2. **Short rows** were not being displayed at all  
3. Local rendering functions didn't match the shared utility behavior
4. **Dimension calculation was wrong** - used old rendering function instead of shared utilities

## Root Cause

There were THREE separate issues:

### Issue 1: Local Rendering Functions (FIXED)
The `ColorworkCanvasEditor` had its own `renderTrapezoidWithPattern` and `renderHierarchyToCanvas` functions that didn't account for the `isHem` property on trapezoids.

### Issue 2: Wrong Dimension Calculation (FIXED)
**The CRITICAL bug:** On line 751, `ColorworkCanvasEditor` used `renderHierarchyToCanvas` to calculate the bounding box dimensions. This function didn't use `effectiveHeight`, so it calculated dimensions as if hems were FULL height. This caused:
- Scale factor calculated based on wrong dimensions
- Everything scaled incorrectly to fit the wrongly-sized bounding box
- Hemmed trapezoids appeared taller than they should be

### Issue 3: Shape Conversion Strips Properties (FIXED - THE REAL CULPRIT!)
**The ACTUAL root cause:** In `ColorworkPanelEditor.tsx`, the `convertShapeRecursively` function was creating new `Trapezoid` instances but **only copying basic properties**. It completely ignored:
- `id` ❌
- `label` ❌ (actually it was copied, but after the constructor)
- `isHem` ❌ **← This is why hems didn't work!**
- `shortRows` ❌ **← This is why short rows didn't appear!**

This meant that when the garment shape data (from `garments.js`) was converted to Trapezoid instances for the ColorworkCanvasEditor, all hem and short row information was stripped out!

### What Hems Should Do:
When a trapezoid has `isHem: true`, it should:
- Render at **50% of its height** (`effectiveHeight = height * 0.5`)
- Be positioned correctly relative to successors
- Still maintain the original height for colorwork pattern calculations

### What Short Rows Should Do:
Short rows should:
- Appear as small inverted trapezoids positioned within their parent
- Use `posX` and `posY` settings for positioning
- Respect the parent's `isHem` property for positioning calculations
- Render with colorwork patterns (newly added feature)
- Show red dashed borders for visibility

## Changes Made

### 1. Fixed Shape Property Preservation (THE KEY FIX!)

**File:** `/root/development/wademauger.github.io/src/components/ColorworkPanelEditor.tsx`
**Lines:** ~543-546

**Before:**
```typescript
const convertShapeRecursively = (shapeData: any): Trapezoid | null => {
    if (!shapeData) return null;
    
    const height = shapeData.height || 0;
    const baseA = shapeData.baseA || 0;
    const baseB = shapeData.baseB || 0;
    const offset = shapeData.baseBHorizontalOffset || 0;
    const finishingSteps = shapeData.finishingSteps || [];
    
    // Convert successors recursively
    const successors: Trapezoid[] = [];
    if (shapeData.successors && Array.isArray(shapeData.successors)) {
        shapeData.successors.forEach((successor: any) => {
            const convertedSuccessor = convertShapeRecursively(successor);
            if (convertedSuccessor) {
                successors.push(convertedSuccessor);
            }
        });
    }
    
    return new Trapezoid(height, baseA, baseB, offset, successors, finishingSteps);  // ❌ Lost all properties!
};
```

**After:**
```typescript
const convertShapeRecursively = (shapeData: any): Trapezoid | null => {
    if (!shapeData) return null;
    
    const height = shapeData.height || 0;
    const baseA = shapeData.baseA || 0;
    const baseB = shapeData.baseB || 0;
    const offset = shapeData.baseBHorizontalOffset || 0;
    const finishingSteps = shapeData.finishingSteps || [];
    
    // Convert successors recursively
    const successors: Trapezoid[] = [];
    if (shapeData.successors && Array.isArray(shapeData.successors)) {
        shapeData.successors.forEach((successor: any) => {
            const convertedSuccessor = convertShapeRecursively(successor);
            if (convertedSuccessor) {
                successors.push(convertedSuccessor);
            }
        });
    }
    
    const trap = new Trapezoid(height, baseA, baseB, offset, successors, finishingSteps);
    
    // ✅ Preserve additional properties that aren't in the Trapezoid constructor
    if (shapeData.id) trap.id = shapeData.id;
    if (shapeData.label) trap.label = shapeData.label;
    if (typeof shapeData.isHem === 'boolean') trap.isHem = shapeData.isHem;  // ✅ Keep hem flag!
    if (Array.isArray(shapeData.shortRows)) trap.shortRows = shapeData.shortRows;  // ✅ Keep short rows!
    
    return trap;
};
```

**Why this matters:** Without this fix, the garment shape data from `garments.js` loses all `isHem` and `shortRows` information when converted to Trapezoid instances. The ColorworkCanvasEditor never receives this data, so it can't render hems or short rows!

### 2. Added Missing Property Declarations

**File:** `/root/development/wademauger.github.io/src/models/Trapezoid.ts`
**Lines:** ~13-15

Added property declarations to the Trapezoid class:
```typescript
class Trapezoid {
    // ... existing properties ...
    id?: string; // Unique identifier for the trapezoid
    isHem?: boolean; // Whether this trapezoid should be folded in half (hemmed)
    shortRows?: any[]; // Array of short row sections within this trapezoid
```

These properties were being used in `fromObject` and `toJSON` but were never declared, causing TypeScript errors.

### 3. Fixed Dimension Calculation

**File:** `/root/development/wademauger.github.io/src/components/ColorworkCanvasEditor.tsx`
**Line:** ~747

**Before (line ~751):**
```typescript
let dimensions = { minX: 0, maxX: 0, minY: 0, maxY: 0 };

// First pass: Compute bounding box (dummy render to calculate dimensions)
const tempCanvas = document.createElement('canvas');
const tempCtx = tempCanvas.getContext('2d');
renderHierarchyToCanvas(tempCtx, shape, 1, 0, 0, dimensions, '#1890ff');  // ❌ Uses old function without hem support!

const width = dimensions.maxX - dimensions.minX;
const height = dimensions.maxY - dimensions.minY;
```

**After:**
```typescript
let dimensions = { minX: 0, maxX: 0, minY: 0, maxY: 0 };

// First pass: Compute bounding box using shared utility (respects isHem)
calculateTrapezoidDimensions(shape, 1, 0, 0, dimensions);  // ✅ Uses shared utility with hem support!

const width = dimensions.maxX - dimensions.minX;
const height = dimensions.maxY - dimensions.minY;
```

**Why this matters:** The dimension calculation determines the scale factor for the entire canvas. If dimensions are wrong, everything is scaled incorrectly!

### 4. Fixed `renderTrapezoidWithPattern` Function

**Note:** This function is only used for individual trapezoid rendering (not unified panel rendering), so it's less critical but still needed for consistency.

**Before:**
```typescript
const renderTrapezoidWithPattern = (ctx, trap, scale, xOffset = 0, yOffset = 0, fillColor, patternLayers = [], gauge = null) => {
    const trapWidth = Math.max(trap.baseA, trap.baseB) * scale;
    const xTopLeft = xOffset + (trapWidth - trap.baseB * scale) / 2 + (trap.baseBHorizontalOffset || 0) * scale;
    // ... more coordinate calculations ...
    const yTop = yOffset;
    const yBottom = yOffset + trap.height * scale; // ❌ Ignored isHem!
```

**After:**
```typescript
const renderTrapezoidWithPattern = (ctx, trap, scale, xOffset = 0, yOffset = 0, fillColor, patternLayers = [], gauge = null) => {
    const trapWidth = Math.max(trap.baseA, trap.baseB) * scale;
    const effectiveHeight = (trap.isHem ? (trap.height * 0.5) : trap.height) * scale; // ✅ Respect hem!
    
    const xTopLeft = xOffset + (trapWidth - trap.baseB * scale) / 2 + (trap.baseBHorizontalOffset || 0) * scale;
    // ... more coordinate calculations ...
    const yTop = yOffset;
    const yBottom = yOffset + effectiveHeight; // ✅ Use effectiveHeight
```

### 2. Fixed `renderHierarchyToCanvas` Function

**Before:**
```typescript
for (let i = trap.successors.length - 1; i >= 0; i--) {
    const successor = trap.successors[i];
    const successorWidth = successorWidths[i];

    renderHierarchyToCanvas(
        ctx,
        successor,
        scale,
        childXOffset,
        yTop - successor.height * scale, // ❌ Ignored isHem!
        dimensions,
        fillColor,
```

**After:**
```typescript
for (let i = trap.successors.length - 1; i >= 0; i--) {
    const successor = trap.successors[i];
    const successorWidth = successorWidths[i];
    const successorEffectiveHeight = (successor.isHem ? (successor.height * 0.5) : successor.height) * scale; // ✅ Respect hem!

    renderHierarchyToCanvas(
        ctx,
        successor,
        scale,
        childXOffset,
        yTop - successorEffectiveHeight, // ✅ Use effectiveHeight for positioning
        dimensions,
        fillColor,
```

### 3. Short Row Rendering (Already Implemented)

Short rows were already implemented in the previous refactoring using the shared utilities:

```typescript
// --- Render short rows with colorwork patterns ---
const shortRowCoords = [];
collectShortRowCoordinates(shape, scale, xOffset, yOffset, shortRowCoords);

shortRowCoords.forEach((srCoord: any) => {
    const { topLeft, topRight, bottomLeft, bottomRight, shortTrap } = srCoord;

    // Create clipping region for this short row
    ctx.save();
    ctx.beginPath();
    // ... draw trapezoid path ...
    ctx.clip();

    // Render colorwork inside the short row
    if (patternLayers && patternLayers.length > 0 && gauge) {
        renderColorworkLayersToCanvas(/* ... */);
    } else {
        // Fallback: darkened solid fill
        ctx.fillStyle = darkenHex(fillColor, 0.7);
        ctx.globalAlpha = 0.5;
        ctx.fill();
    }

    ctx.restore();

    // Draw short row border (red dashed line)
    ctx.strokeStyle = '#ff4d4f';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 3]);
    // ... draw border ...
});
```

## How It Works Now

### Hem Rendering:
1. When calculating trapezoid height: `effectiveHeight = isHem ? height * 0.5 : height`
2. The trapezoid is drawn at **half height** visually
3. Colorwork patterns are calculated using the **original height** (for proper stitch count)
4. But rendered into the **effective height** space (compressed vertically)

### Short Row Rendering:
1. `collectShortRowCoordinates` from shared utilities finds all short rows
2. For each short row:
   - Synthesizes a small trapezoid shape using `makeShortRowTrap`
   - Calculates position using `computeShortRowOffsets` (respects parent's `isHem`)
   - Creates clipping region
   - Renders colorwork patterns inside
   - Draws red dashed border for visibility

### Positioning Logic:
- **Without hem**: Short rows positioned relative to full trapezoid height
- **With hem**: Short rows positioned accounting for the 50% reduction
- `posY` parameter (0-1) maps to the effective height range

## Consistency with UnifiedPanelDiagram

Both components now:
- ✅ Use shared utilities from `panelRenderingUtils`
- ✅ Respect `isHem` property on trapezoids
- ✅ Render short rows with colorwork patterns
- ✅ Calculate positions identically
- ✅ Handle coordinate systems consistently

## Testing

To verify the fix:
1. Create a panel with hemmed trapezoids → should render at 50% height
2. Add short rows to a panel → should appear as small inverted trapezoids
3. Add short rows to a hemmed trapezoid → should position correctly within the folded section
4. Apply colorwork patterns → should render correctly on both main trapezoids and short rows

## Visual Examples

### Hemmed Trapezoid:
```
Before (wrong):          After (correct):
┌────────┐              ┌────────┐
│        │              │        │ <- Only 50% height
│        │              └────────┘
│        │              
└────────┘              
```

### Short Rows:
```
Main trapezoid with short rows:

    ┌─────┐  ┌─────┐  <- Short rows (red dashed)
    └─────┘  └─────┘
┌──────────────────┐
│                  │
│  Main trapezoid  │ <- Parent shape
│                  │
└──────────────────┘
```

## Files Modified

- `/root/development/wademauger.github.io/src/components/ColorworkPanelEditor.tsx`
  - **Lines ~543-546** (CRITICAL): Added property preservation to `convertShapeRecursively` function
    - Now preserves `id`, `label`, `isHem`, and `shortRows` properties
- `/root/development/wademauger.github.io/src/models/Trapezoid.ts`
  - **Lines ~13-15**: Added missing property declarations (`id`, `isHem`, `shortRows`)
- `/root/development/wademauger.github.io/src/components/ColorworkCanvasEditor.tsx`
  - **Line ~747**: Changed dimension calculation from `renderHierarchyToCanvas` to `calculateTrapezoidDimensions`
  - `renderTrapezoidWithPattern`: Added `effectiveHeight` calculation
  - `renderHierarchyToCanvas`: Added `successorEffectiveHeight` calculation

## Related Documentation

- [PANEL_RENDERING_REFACTOR.md](./PANEL_RENDERING_REFACTOR.md) - Main refactoring documentation
- [UNIFIED_PANEL_DIAGRAM.md](./UNIFIED_PANEL_DIAGRAM.md) - UnifiedPanelDiagram API reference
