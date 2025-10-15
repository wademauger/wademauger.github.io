# Knitting Pattern Data Architecture

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      PATTERN WIZARD                              │
│  (User designs pattern with shape + colorwork layers)            │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ On "Create Project"
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│               STITCH PLAN GENERATOR                              │
│  ✓ Reconstruct Trapezoid from shape data                        │
│  ✓ Create Panel with gauge                                       │
│  ✓ Use PanelColorworkComposer to map colorwork                  │
│  ✓ Generate concrete row-by-row stitch plan                     │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ Save to library
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PROJECT DATA                                  │
│  {                                                               │
│    panels: [{                                                    │
│      stitchPlan: {           ← CONCRETE PATTERN DATA            │
│        rows: [...],             (Ready for knitting)             │
│        colorPalette: {...},                                      │
│        metadata: {...}                                           │
│      },                                                          │
│      wizardOptions: {        ← ABSTRACT DESIGN DATA             │
│        shape: {...},            (For re-editing)                 │
│        colorworkLayers: [...],                                   │
│      }                                                           │
│    }]                                                            │
│  }                                                               │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ Load project
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│              INTERACTIVE KNITTING PAGE                           │
│  ✓ Check for pre-generated stitchPlan                           │
│  ✓ If found: Use directly (NEW!)                                │
│  ✓ If not found: Reconstruct (Legacy)                           │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ Display
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│              INTERACTIVE KNITTING VIEW                           │
│  ✓ Row-by-row instructions                                      │
│  ✓ Colorwork visualization                                      │
│  ✓ Progress tracking                                             │
└─────────────────────────────────────────────────────────────────┘
```

## 📁 Data Structure

### Before (Abstract)
```typescript
panel: {
  shape: Trapezoid,          // Complex geometry
  colorworkLayers: [         // Abstract layers
    {
      pattern: ColorworkPattern,
      settings: {...}
    }
  ]
}
```
**Problem**: Interactive app has to understand geometry and compose layers

### After (Concrete)
```typescript
panel: {
  stitchPlan: {              // Concrete instructions
    rows: [
      {
        rowNumber: 1,
        totalStitches: 20,
        colorwork: ['MC', 'CC1', 'MC', ...]  // Exact colors
      }
    ],
    colorPalette: {          // Color definitions
      'MC': { color: '#fff', label: 'White' }
    }
  },
  wizardOptions: {           // Preserved for editing
    shape: {...},
    colorworkLayers: [...]
  }
}
```
**Benefit**: Interactive app just reads row-by-row instructions

## 🔄 Data Flow Comparison

### Old Flow
```
Wizard → Library → Interactive Page
  ↓         ↓           ↓
shape + colorwork → reconstruct → display
         layers      everything
```

### New Flow
```
Wizard → Generate Plan → Library → Interactive Page
  ↓          ↓             ↓            ↓
shape +   concrete    store both    read plan
layers → stitch plan → plan+options → directly
```

## 💾 Storage Comparison

### Old Project (200 lines)
```json
{
  "panels": [{
    "shape": {
      "height": 10,
      "baseA": 100,
      "successors": [...],
      // ... complex nested geometry
    },
    "colorworkLayers": [{
      "pattern": { /* 10x10 grid */ },
      "settings": { /* mapping rules */ }
    }]
  }]
}
```

### New Project (500 lines but self-contained)
```json
{
  "panels": [{
    "stitchPlan": {
      "rows": [
        {"rowNumber": 1, "colorwork": ["MC","MC",...] },
        {"rowNumber": 2, "colorwork": ["CC1","MC",...] },
        // ... 200 rows with exact stitch colors
      ],
      "colorPalette": {"MC": {...}, "CC1": {...}}
    },
    "wizardOptions": {
      "shape": { /* same as before */ },
      "colorworkLayers": [ /* same as before */ ]
    }
  }]
}
```

**Trade-off**: Larger file size, but no computation needed

## 🎯 Benefits by Component

### Pattern Wizard
✅ Validates pattern generation at save time  
✅ Clear separation: design data vs. final pattern  
✅ Can preview exact stitch plan before saving  
✅ Errors caught early, not during knitting  

### Interactive Knitting
✅ No geometry calculations  
✅ No colorwork composition  
✅ Instant load and display  
✅ Focus 100% on knitting UX  
✅ Can work offline (no dependencies)  

### Data Layer
✅ Concrete, portable format  
✅ Easy to export (PDF, text, CSV)  
✅ Testable stitch-by-stitch  
✅ Backward compatible (keeps wizard options)  

## 🔧 Implementation Files

| File | Purpose | Status |
|------|---------|--------|
| `utils/stitchPlanGenerator.ts` | Generate concrete plans | ✅ New |
| `WizardView.tsx` | Call generator on save | ✅ Modified |
| `InteractiveKnittingPage.tsx` | Read concrete plan | ✅ Modified |
| `InteractiveKnittingView.tsx` | Display instructions | ✅ Compatible |

## 🧪 Testing Strategy

1. **Unit Test**: `generateConcreteStitchPlan()` with various shapes
2. **Integration Test**: Save project in wizard, verify stitch plan structure
3. **E2E Test**: Create → Save → Load → Verify instructions displayed
4. **Regression Test**: Load old project, verify legacy flow still works

## 🚀 Future Enhancements

- [ ] Multi-layer composition (blend multiple colorwork layers)
- [ ] Stitch modifications (manual edits to generated plan)
- [ ] Export to PDF written pattern
- [ ] Export to machine knitting file format
- [ ] Visual stitch-by-stitch editor
- [ ] Progress persistence (save which rows completed)
- [ ] Pattern sharing (export/import individual patterns)
