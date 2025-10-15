# Example: Concrete Stitch Plan Data Structure

## Simple Rectangle with Colorwork

```json
{
  "rows": [
    {
      "rowNumber": 1,
      "leftStitchesInWork": 10,
      "rightStitchesInWork": 10,
      "totalStitches": 20,
      "colorwork": ["MC", "MC", "CC1", "CC1", "CC1", "CC1", "CC1", "CC1", "MC", "MC", 
                    "MC", "MC", "CC1", "CC1", "CC1", "CC1", "CC1", "CC1", "MC", "MC"]
    },
    {
      "rowNumber": 2,
      "leftStitchesInWork": 10,
      "rightStitchesInWork": 10,
      "totalStitches": 20,
      "colorwork": ["MC", "CC1", "CC1", "MC", "MC", "MC", "MC", "CC1", "CC1", "MC",
                    "MC", "CC1", "CC1", "MC", "MC", "MC", "MC", "CC1", "CC1", "MC"]
    },
    {
      "rowNumber": 3,
      "leftStitchesInWork": 10,
      "rightStitchesInWork": 10,
      "totalStitches": 20,
      "colorwork": ["MC", "MC", "MC", "MC", "MC", "MC", "MC", "MC", "MC", "MC",
                    "MC", "MC", "MC", "MC", "MC", "MC", "MC", "MC", "MC", "MC"]
    }
  ],
  "colorPalette": {
    "MC": {
      "color": "#ffffff",
      "label": "Main Color"
    },
    "CC1": {
      "color": "#ff0000",
      "label": "Contrast Color 1"
    }
  },
  "metadata": {
    "totalRows": 3,
    "panelName": "Front Panel #1",
    "generatedAt": "2025-10-14T12:34:56.789Z"
  }
}
```

## Trapezoid with Shaping

```json
{
  "rows": [
    {
      "rowNumber": 1,
      "leftStitchesInWork": 8,
      "rightStitchesInWork": 8,
      "totalStitches": 16,
      "colorwork": ["MC", "MC", "MC", "MC", "MC", "MC", "MC", "MC",
                    "MC", "MC", "MC", "MC", "MC", "MC", "MC", "MC"]
    },
    {
      "rowNumber": 2,
      "leftStitchesInWork": 9,
      "rightStitchesInWork": 9,
      "totalStitches": 18,
      "colorwork": ["MC", "MC", "MC", "CC1", "CC1", "CC1", "CC1", "CC1", "MC",
                    "MC", "CC1", "CC1", "CC1", "CC1", "CC1", "MC", "MC", "MC"]
    },
    {
      "rowNumber": 3,
      "leftStitchesInWork": 10,
      "rightStitchesInWork": 10,
      "totalStitches": 20,
      "colorwork": ["MC", "MC", "CC1", "CC1", "MC", "MC", "MC", "MC", "CC1", "CC1",
                    "CC1", "CC1", "MC", "MC", "MC", "MC", "CC1", "CC1", "MC", "MC"]
    },
    {
      "rowNumber": 4,
      "leftStitchesInWork": 10,
      "rightStitchesInWork": 10,
      "totalStitches": 20,
      "colorwork": ["MC", "MC", "CC1", "CC1", "MC", "MC", "MC", "MC", "CC1", "CC1",
                    "CC1", "CC1", "MC", "MC", "MC", "MC", "CC1", "CC1", "MC", "MC"]
    }
  ],
  "colorPalette": {
    "MC": {
      "color": "#e0e0e0",
      "label": "Gray"
    },
    "CC1": {
      "color": "#003366",
      "label": "Navy Blue"
    }
  },
  "metadata": {
    "totalRows": 4,
    "panelName": "Sleeve Panel #1",
    "generatedAt": "2025-10-14T12:35:00.000Z"
  }
}
```

## Complete Project Structure

```json
{
  "id": "project-1728912345678",
  "name": "My Colorwork Sweater",
  "createdAt": "2025-10-14T12:34:56.789Z",
  "gauge": {
    "stitchesPerInch": 5,
    "rowsPerInch": 7,
    "stitchesPerFourInches": 20,
    "rowsPerFourInches": 28,
    "scaleFactor": 1
  },
  "panels": [
    {
      "instanceId": "garment::front-panel::instance-1",
      "panelKey": "garment::front-panel",
      "panelName": "Front Panel #1",
      "stitchPlan": {
        "rows": [
          {
            "rowNumber": 1,
            "leftStitchesInWork": 50,
            "rightStitchesInWork": 50,
            "totalStitches": 100,
            "colorwork": ["MC", "MC", ... ] // 100 color IDs
          },
          // ... more rows
        ],
        "colorPalette": {
          "MC": { "color": "#ffffff", "label": "White" },
          "CC1": { "color": "#000000", "label": "Black" }
        },
        "metadata": {
          "totalRows": 150,
          "panelName": "Front Panel #1",
          "generatedAt": "2025-10-14T12:34:56.789Z"
        }
      },
      "wizardOptions": {
        "shape": {
          "height": 10,
          "baseA": 10,
          "baseB": 10,
          "baseBHorizontalOffset": 0,
          "successors": [],
          "finishingSteps": [],
          "modificationScale": 1,
          "label": "body"
        },
        "colorworkLayers": [
          {
            "id": 1728912345678,
            "name": "Layer 1",
            "pattern": {
              "grid": [["MC", "CC1"], ["CC1", "MC"]],
              "colors": {
                "MC": { "id": "MC", "color": "#ffffff", "label": "White" },
                "CC1": { "id": "CC1", "color": "#000000", "label": "Black" }
              },
              "metadata": { "name": "Checkerboard" }
            },
            "patternType": "checkerboard",
            "settings": {
              "stretchMode": "repeat",
              "alignmentMode": "center"
            }
          }
        ],
        "colorworkOptions": {}
      }
    }
  ],
  "usedColorworkPatterns": {
    "checkerboard-2x2": {
      "id": "checkerboard-2x2",
      "grid": [["MC", "CC1"], ["CC1", "MC"]],
      "colors": {
        "MC": { "id": "MC", "color": "#ffffff", "label": "Main Color" },
        "CC1": { "id": "CC1", "color": "#000000", "label": "Contrast" }
      },
      "metadata": { "name": "2x2 Checkerboard" }
    }
  }
}
```

## Key Points

1. **Stitch Plan is Self-Contained**: Everything needed for knitting is in the `stitchPlan` object
2. **Wizard Options Preserved**: The `wizardOptions` field keeps all abstract configuration for re-editing
3. **Row-Level Detail**: Each row specifies exactly which stitches are in work (for shaping)
4. **Stitch-Level Color**: Every single stitch has a color ID in the `colorwork` array
5. **Color Palette**: All colors defined once in the `colorPalette` object
6. **Metadata**: Tracking info like when generated and for which panel

## Usage in Interactive Knitting

```typescript
// Load the project
const project = loadFromLibrary(projectId);

// Get the first panel
const panel = project.panels[0];

// Access the stitch plan directly
const stitchPlan = panel.stitchPlan;

// Display row 1 instructions
const row1 = stitchPlan.rows[0];
console.log(`Row ${row1.rowNumber}: ${row1.totalStitches} stitches`);

// Show colorwork for each stitch
row1.colorwork.forEach((colorId, stitchIndex) => {
  const color = stitchPlan.colorPalette[colorId];
  console.log(`  Stitch ${stitchIndex + 1}: ${color.label} (${color.color})`);
});

// Simplified instruction generation
const instructions = generateInstructionsFromStitchPlan(stitchPlan);
```

## Advantages

- **No Geometry Math**: Interactive app doesn't need to understand trapezoids
- **No Colorwork Mapping**: No need to map patterns to shapes at runtime  
- **Instant Display**: Can immediately render row-by-row instructions
- **Exportable**: Easy to convert to PDF, text pattern, or other formats
- **Testable**: Can verify exact stitch-by-stitch output
