# Enhanced StitchPlan with Colorwork Support

This implementation augments the existing StitchPlan data structure with colorwork information, enabling row-by-row instructions that combine both shaping and colorwork guidance for machine knitting.

## Overview

The enhanced system provides:

1. **Colorwork-aware StitchPlan**: The core `StitchPlan` class now supports colorwork mapping
2. **Enhanced Row instructions**: Individual rows can contain both shaping and colorwork data
3. **Integration service**: `ColorworkStitchPlanService` coordinates between panels, patterns, and instructions
4. **UI components**: React components for displaying row-by-row instructions with visual feedback

## Key Components

### 1. Enhanced StitchPlan Model (`src/models/StitchPlan.js`)

**New Properties:**
- `colorworkMapping`: Stores mapped colorwork data and pattern reference
- `hasColorwork()`: Method to check if colorwork is available

**New Methods:**
- `setColorworkMapping(mappedRows, colorworkPattern)`: Adds colorwork data to the plan
- `generateColorworkInstructions()`: Generates colorwork-specific instructions
- `generateRowColorworkSequence(colorworkRow)`: Converts color arrays to instruction sequences

### 2. Enhanced StitchPlan.Row Model

**New Properties:**
- `colorwork`: Stores colorwork data for the specific row

**New Methods:**
- `setColorwork(colorworkArray, colorworkPattern)`: Associates colorwork with the row
- `getColorworkInstructions()`: Returns formatted colorwork instructions with color info

### 3. ColorworkStitchPlanService (`src/models/ColorworkStitchPlanService.js`)

Central service that coordinates the integration:

```javascript
const service = new ColorworkStitchPlanService();

// Create enhanced stitch plan with colorwork
const enhancedStitchPlan = service.createColorworkStitchPlan(
    panel, 
    colorworkPattern, 
    { stretchMode: 'repeat', alignmentMode: 'center' }
);

// Generate combined instructions
const instructions = service.generateCombinedInstructions(panel, colorworkPattern);
```

### 4. Enhanced PanelColorworkComposer (`src/models/PanelColorworkComposer.js`)

Updated to work with the enhanced StitchPlan:
- Automatically adds colorwork mapping to StitchPlan instances
- Sets colorwork data on individual rows
- Maintains backward compatibility

### 5. UI Components

#### RowByRowInstructions Component (`src/components/RowByRowInstructions.js`)

Displays comprehensive row-by-row instructions:

```javascript
<RowByRowInstructions 
    stitchPlan={enhancedStitchPlan} 
    currentRow={currentRowIndex}
/>
```

Features:
- Visual progress indicators
- Shaping instruction display
- Colorwork sequence visualization
- Color-coded tags showing stitch counts
- SVG-based visual pattern charts

#### ColorworkInstructionDemo Component (`src/components/ColorworkInstructionDemo.js`)

Complete demo showing the system in action:
- Panel creation with trapezoid shapes
- Colorwork pattern generation
- Enhanced stitch plan creation
- Interactive row-by-row navigation

## Usage Examples

### Basic Integration

```javascript
import { ColorworkStitchPlanService } from './models/ColorworkStitchPlanService.js';
import { Panel } from './models/Panel.js';
import { Trapezoid } from './models/Trapezoid.js';
import { Gauge } from './models/Gauge.js';
import { ColorworkPattern } from './models/ColorworkPattern.js';

// Create panel
const shape = new Trapezoid(5, 8, 12, []); // 5" high, 8" to 12" wide
const gauge = new Gauge(20, 28); // 20 sts/4", 28 rows/4"
const panel = new Panel(shape, gauge, 1.0);

// Create colorwork pattern
const pattern = new ColorworkPattern(8, 8);
pattern.setColor('MC', '#ffffff', 'Main Color');
pattern.setColor('CC', '#000000', 'Contrast Color');

// Set up checkerboard pattern
for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
        const isEven = (row + col) % 2 === 0;
        pattern.setStitch(row, col, isEven ? 'MC' : 'CC');
    }
}

// Create enhanced stitch plan
const service = new ColorworkStitchPlanService();
const stitchPlan = service.createColorworkStitchPlan(panel, pattern);

// Check if colorwork is available
if (stitchPlan.hasColorwork()) {
    console.log('Colorwork instructions available!');
    
    // Get instructions for specific row
    const row = stitchPlan.rows[0];
    const colorworkInstructions = row.getColorworkInstructions();
    console.log(colorworkInstructions);
    // Output: [
    //   { colorId: 'MC', colorLabel: 'Main Color', colorHex: '#ffffff', stitchCount: 2 },
    //   { colorId: 'CC', colorLabel: 'Contrast Color', colorHex: '#000000', stitchCount: 2 },
    //   ...
    // ]
}
```

### Row-by-Row Instruction Access

```javascript
// Iterate through all rows
stitchPlan.rows.forEach((row, index) => {
    console.log(`Row ${index + 1} (RC: ${row.rowNumber}):`);
    console.log(`  Stitches: ${row.leftStitchesInWork + row.rightStitchesInWork}`);
    
    if (row.colorwork) {
        const instructions = row.getColorworkInstructions();
        console.log(`  Colorwork: ${instructions.map(inst => 
            `${inst.stitchCount} ${inst.colorLabel}`
        ).join(', ')}`);
    }
});
```

## Data Flow

1. **Panel Creation**: Standard panel with trapezoid shape and gauge
2. **Colorwork Pattern**: Grid-based pattern with color definitions
3. **Composition**: `PanelColorworkComposer` maps pattern to panel shape
4. **Enhancement**: Service augments StitchPlan with colorwork data
5. **Display**: UI components render combined instructions

## Pattern Mapping Options

The system supports various mapping strategies:

- **Stretch Mode**: `'stretch' | 'repeat' | 'center'`
  - `stretch`: Pattern stretches to fit panel dimensions
  - `repeat`: Pattern repeats/tiles across panel
  - `center`: Pattern centers with background color outside

- **Alignment Mode**: `'center' | 'left' | 'right'`
  - Controls horizontal alignment of pattern within panel

## Backward Compatibility

All existing StitchPlan functionality remains unchanged:
- Original `generateKnittingInstructions()` still works
- Existing tests continue to pass
- New functionality is additive only

## Testing

Tests are provided in `src/tests/StitchPlan.colorwork.test.js`:

```bash
npm test StitchPlan.colorwork.test.js
```

Tests cover:
- Basic StitchPlan colorwork integration
- Row-level colorwork instruction generation
- Colorwork mapping and sequence generation
- Backward compatibility

## Future Enhancements

This foundation supports future enhancements:

1. **Machine-specific instructions**: Generate format-specific output for different knitting machines
2. **Pattern libraries**: Save/load colorwork patterns
3. **Advanced mapping**: Support for more complex pattern mapping algorithms
4. **Visual editing**: Interactive colorwork pattern editing within the canvas
5. **Export formats**: Generate PDFs, charts, or machine files

## Integration with Existing Components

The enhanced system integrates seamlessly with:
- **ColorworkCanvasEditor**: Visual pattern design and editing
- **InstructionGenerator**: Combined instruction generation
- **ColorworkVisualizer**: SVG chart generation
- **PanelColorworkComposer**: Pattern-to-shape mapping

This implementation provides a solid foundation for comprehensive knitting instruction generation that combines both structural shaping and decorative colorwork in a unified, user-friendly interface.
