# UnifiedPanelDiagram Component

## Overview

The `UnifiedPanelDiagram` component consolidates the functionality of `PanelDiagram` and `ColorworkPanelDiagram` into a single, flexible, high-performance component for rendering knitting panel visualizations.

## Motivation

Previously, we had two separate panel rendering components:

1. **PanelDiagram** - SVG-based rendering with:
   - Trapezoid labels (A, B, C, etc.)
   - Short row section visualization
   - Click selection support
   - Simple outline rendering

2. **ColorworkPanelDiagram** - Canvas-based rendering with:
   - High-performance colorwork pattern visualization
   - Precise gauge-based stitch/row rendering
   - Border pattern support
   - Progress indicators for interactive knitting

This dual-component approach led to:
- Code duplication
- Inconsistent behavior across different pages
- Difficulty maintaining and extending features
- Need to switch between components based on use case

## Solution

`UnifiedPanelDiagram` combines the best of both worlds:
- Canvas-based rendering for high performance with complex colorwork
- All features from both components in one configurable interface
- Consistent behavior across all use cases
- Easier to maintain and extend

## Features

### Core Rendering
- **Canvas-based rendering** - High performance, especially for complex colorwork
- **Trapezoid hierarchy** - Supports nested trapezoid shapes with proper spacing
- **Hem support** - Renders folded hems at half height
- **Responsive sizing** - Configurable size and padding

### Labeling & Selection
- **Trapezoid labels** - Shows A, B, C, etc. labels on each trapezoid
- **Selection highlighting** - Visual indication of selected trapezoid
- **Click handling** - Optional callback for trapezoid selection (canvas-based selection TBD)
- **Short row markers** - Shows anchor points for selected short rows

### Short Rows
- **Short row overlays** - Renders short row sections with reduced opacity
- **Colorwork on short rows** - Short rows render with the same colorwork patterns as the main trapezoids
- **Positioning** - posX/posY positioning within parent trapezoid
- **Hem-aware** - Properly handles short rows on hemmed trapezoids
- **Configurable visibility** - Can be shown or hidden

### Colorwork
- **Pattern layers** - Supports multiple colorwork pattern layers
- **Gauge-based rendering** - Precise stitch-by-stitch and row-by-row rendering
- **Pattern repetition** - Supports various repeat modes (x, y, both, none)
- **Centered origin** - Patterns centered on the panel by default
- **Dynamic stripe patterns** - Auto-scales stripe patterns to fit panel dimensions
- **Border patterns** - Special handling for border patterns with geometric accuracy

### Progress Tracking
- **Current row highlighting** - Red horizontal line shows current knitting position
- **Completed rows** - Green lines show previously completed rows
- **Trapezoid-aware** - Works across the entire trapezoid hierarchy
- **Arrow indicators** - Visual markers at row edges

### Visual Customization
- **Fill color** - Customizable base fill color (defaults to theme primary)
- **Fill opacity** - Adjustable opacity for base shape
- **Pattern visibility** - Toggle colorwork pattern rendering
- **Label visibility** - Toggle trapezoid labels
- **Short row visibility** - Toggle short row overlays

## API

```typescript
interface UnifiedPanelDiagramProps {
  // Required
  shape: any;                              // The panel shape (trapezoid hierarchy)
  
  // Display
  size?: number;                           // Canvas size in pixels (default: 200)
  padding?: number;                        // Padding around diagram (default: 10)
  label?: string;                          // Text label below diagram
  
  // Labels & Selection
  showLabels?: boolean;                    // Show trapezoid labels (default: false)
  selectedId?: string | null;              // ID of selected trapezoid
  onSelect?: ((id: string) => void) | null; // Selection callback
  selectedShortRowId?: string | null;      // ID of selected short row
  
  // Colorwork
  patternLayers?: any[];                   // Array of pattern layer objects (default: [])
  gauge?: {                                // Gauge for stitch/row calculations
    stitchesPerFourInches: number;
    rowsPerFourInches: number;
    scalingFactor?: number;
  } | null;
  showPatterns?: boolean;                  // Render colorwork patterns (default: true)
  
  // Progress Tracking
  highlightedRow?: number | null;          // Current row (0-indexed)
  completedRows?: number[];                // Array of completed row numbers
  showProgress?: boolean;                  // Enable progress indicators (default: false)
  
  // Visual Customization
  fillColor?: string;                      // Custom fill color
  fillOpacity?: number;                    // Base fill opacity (default: 0.3)
  showShortRows?: boolean;                 // Show short row overlays (default: true)
}
```

## Usage Examples

### Panel Shape Creator (Labels + Short Rows)
```tsx
<UnifiedPanelDiagram
  shape={panelShape}
  size={560}
  padding={20}
  showLabels={true}
  showShortRows={true}
  selectedId={selectedTrapezoidId}
  selectedShortRowId={selectedShortRowId}
  onSelect={handleTrapezoidClick}
  showPatterns={false}
/>
```

### Pattern Wizard (Colorwork Preview)
```tsx
<UnifiedPanelDiagram
  shape={panelShape}
  patternLayers={colorworkLayers}
  gauge={projectGauge}
  size={100}
  padding={6}
  showPatterns={true}
  showLabels={false}
  showShortRows={true}
  label={`Instance #${instanceNumber}`}
/>
```

### Interactive Knitting (Progress Tracking)
```tsx
<UnifiedPanelDiagram
  shape={panelShape}
  patternLayers={colorworkLayers}
  gauge={projectGauge}
  size={400}
  showPatterns={true}
  showProgress={true}
  highlightedRow={currentRow}
  completedRows={completedRowNumbers}
  showLabels={false}
  showShortRows={true}
/>
```

## Implementation Details

### Canvas vs SVG
The component uses Canvas 2D rendering instead of SVG for several reasons:
1. **Performance** - Canvas is much faster for complex colorwork with thousands of stitches
2. **Pixel-perfect** - Direct pixel manipulation for precise colorwork rendering
3. **Device pixel ratio** - Automatic high-DPI support for crisp rendering
4. **Memory efficiency** - No DOM elements created for each stitch

### Coordinate System
- All measurements in inches (panel dimensions)
- Scale factor applied during rendering
- Gauge converts inches to stitches/rows
- Canvas coordinates calculated for each trapezoid

### Short Row Rendering
- Short rows are inverted trapezoids overlaid on parent
- Position calculated relative to parent trapezoid edges
- Hem-aware positioning (mirrored for folded hems)
- Rendered with reduced opacity and darker fill

### Colorwork Rendering
1. Calculate total stitches/rows from panel dimensions and gauge
2. Create combined grid from all pattern layers (by priority)
3. Render each stitch as a colored rectangle
4. Apply clipping path to match trapezoid boundaries
5. Special handling for stripe patterns (auto-scale to panel)

### Progress Indicators
- Calculate row positions across entire trapezoid hierarchy
- Interpolate X positions based on trapezoid taper
- Draw lines after main rendering (overlay)
- Completed rows: green, semi-transparent
- Current row: red, bold, with arrow markers

### Border Patterns
- Extract border configuration from pattern layers
- Use polygon clipping library for geometric unions
- Calculate inset polygon with angle-dependent offsets
- Render as filled region between outer and inner boundaries

## Migration Guide

### From PanelDiagram
```tsx
// Old
<PanelDiagram
  shape={shape}
  selectedId={selectedId}
  onSelect={onSelect}
  selectedShortRowId={shortRowId}
  size={200}
/>

// New
<UnifiedPanelDiagram
  shape={shape}
  selectedId={selectedId}
  onSelect={onSelect}
  selectedShortRowId={shortRowId}
  size={200}
  showLabels={true}      // Enable labels
  showShortRows={true}   // Enable short rows
  showPatterns={false}   // Disable colorwork
/>
```

### From ColorworkPanelDiagram
```tsx
// Old
<ColorworkPanelDiagram
  shape={shape}
  patternLayers={layers}
  gauge={gauge}
  showPatterns={true}
  highlightedRow={row}
  completedRows={rows}
  size={400}
/>

// New
<UnifiedPanelDiagram
  shape={shape}
  patternLayers={layers}
  gauge={gauge}
  showPatterns={true}
  showProgress={true}     // Enable progress tracking
  highlightedRow={row}
  completedRows={rows}
  size={400}
/>
```

## Pages Updated

1. **Panel Shape Creator** (`/crafts/knitting-pattern-designer/panel-shape-creator`)
   - Shows labeled trapezoids for editing
   - Displays short row sections (without colorwork when no gauge is set)
   - Supports trapezoid selection

2. **Pattern Wizard** (`/crafts/knitting-pattern-designer/pattern-wizard`)
   - Shows colorwork patterns on panels
   - Displays multiple instances with individual colorwork
   - **✨ NEW**: Short rows now render with colorwork patterns on the editor

3. **Interactive Knitting Page** (`/crafts/knitting-pattern-designer/interactive-knitting`)
   - Shows progress with row highlighting
   - Displays colorwork patterns including on short rows
   - Tracks current and completed rows

4. **Panel Card** (used in Pattern Wizard)
   - Simple panel preview in card format
   - Shows short rows on panel shapes
   - Used for panel selection interface

## Future Enhancements

- [ ] Canvas-based click detection for trapezoid selection
- [ ] Interactive colorwork editing directly on canvas
- [ ] Stitch-by-stitch progress tracking (not just rows)
- [ ] Animated transitions between rows
- [ ] Export panel diagram as image
- [ ] Print-optimized rendering mode
- [ ] Accessibility improvements (keyboard navigation, screen reader support)

## Performance Considerations

- Canvas rendering is cached by React (re-renders only on prop changes)
- Device pixel ratio handled automatically for high-DPI displays
- Pattern grids pre-computed before rendering
- Efficient coordinate collection with minimal passes
- No DOM manipulation for individual stitches

## Related Files

- `/src/components/UnifiedPanelDiagram.tsx` - Main component
- `/src/components/PanelDiagram.tsx` - Original SVG-based component (kept for backward compatibility)
- `/src/components/ColorworkPanelDiagram.tsx` - Original canvas component (kept for backward compatibility)
- `/src/apps/colorwork-designer/PanelShapeCreator.tsx` - Shape editor
- `/src/apps/knitting-designer/components/WizardView.tsx` - Pattern wizard
- `/src/components/InteractiveKnittingView.tsx` - Interactive knitting interface
