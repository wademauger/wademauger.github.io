# New Modal System - Implementation Guide

## Overview

We've created a clean, reusable modal system for managing library entities (panels, songs, recipes, etc.) across all apps.

## New Components Created

### 1. `/src/components/modals/types.ts`
Shared TypeScript interfaces for all modals.

### 2. `/src/components/modals/LibrarySettingsModal.tsx`
**Purpose**: Configure Google Drive file location for libraries

**Props**:
- `visible`: boolean
- `jsonKey`: string (e.g., 'panels', 'songs', 'recipes')
- `displayLabel`: string (e.g., 'Panel', 'Song', 'Recipe')
- `onClose`: () => void
- `onSave?`: (settings: LibrarySettings) => void

**Example Usage**:
```tsx
<LibrarySettingsModal
  visible={showSettings}
  jsonKey="panels"
  displayLabel="Panel"
  onClose={() => setShowSettings(false)}
/>
```

### 3. `/src/components/modals/OpenModal.tsx`
**Purpose**: Load and display entities from a library JSON file

**Props**:
- `visible`: boolean
- `jsonKey`: string
- `displayLabel`: string
- `onOpen`: (entity: T) => void
- `onClose`: () => void

**Features**:
- Automatically restores Google Drive session
- Shows library file path for transparency
- Converts both object and array formats
- Handles authentication errors gracefully

**Example Usage**:
```tsx
<OpenModal
  visible={showOpen}
  jsonKey="panels"
  displayLabel="Panel"
  onOpen={(panel) => loadPanel(panel)}
  onClose={() => setShowOpen(false)}
/>
```

### 4. `/src/components/modals/SaveAsModal.tsx`
**Purpose**: Save entities to a library JSON file

**Props**:
- `visible`: boolean
- `jsonKey`: string
- `displayLabel`: string
- `entityData`: T (the data to save)
- `onSave`: (name: string, entity: T) => Promise<void>
- `onClose`: () => void

**Features**:
- Prompts for entity name
- Creates library file if it doesn't exist
- Merges entity into existing library
- Handles authentication automatically

**Example Usage**:
```tsx
<SaveAsModal
  visible={showSaveAs}
  jsonKey="panels"
  displayLabel="Panel"
  entityData={currentPanel}
  onSave={async (name, panel) => {
    console.log('Saved:', name);
  }}
  onClose={() => setShowSaveAs(false)}
/>
```

### 5. `/src/utils/mergeEntityIntoLibrary.ts`
Generic utility for merging entities into library objects.

```typescript
mergeEntityIntoLibrary(library, 'panels', 'myPanel', panelData)
// Returns: { panels: { myPanel: panelData }, lastUpdated: '...' }
```

## Migration Guide

### For Panel Shape Creator (and other apps)

#### Old Approach (Complex):
```tsx
// Old: Complex Redux dispatch, modal callbacks, file probing
const saveAs = async () => {
  const { registerCallback } = await import('@/utils/modalCallbackRegistry');
  const cbId = registerCallback(async ({ libraryData, fileStatus, panelName }) => {
    // 300+ lines of complex file handling...
  });
  
  dispatch(openModal({
    modalType: MODAL_TYPES.LIBRARY_SETTINGS,
    appContext: 'panels',
    data: { onSelectFileCallbackId: cbId }
  }));
};
```

#### New Approach (Simple):
```tsx
// New: Simple state-based modals
const [showSaveAs, setShowSaveAs] = useState(false);

const handleSavePanel = async (name: string, panelData: any) => {
  console.log(`Panel "${name}" saved`);
  // SaveAsModal handles all the Google Drive operations
};

// In dropdown menu:
{
  key: 'panel-save-as',
  label: 'Save As...',
  onClick: () => setShowSaveAs(true)
}

// In JSX:
<SaveAsModal
  visible={showSaveAs}
  jsonKey="panels"
  displayLabel="Panel"
  entityData={currentPanel}
  onSave={handleSavePanel}
  onClose={() => setShowSaveAs(false)}
/>
```

### Required Changes to PanelShapeCreator.tsx

1. **Add imports**:
```tsx
import { LibrarySettingsModal, OpenModal, SaveAsModal } from '@/components/modals';
import { SettingOutlined } from '@ant-design/icons';
```

2. **Remove old imports**:
```tsx
// REMOVE:
import { useDispatch, useSelector } from 'react-redux';
import { openModal, MODAL_TYPES } from '@/reducers/modal.reducer';
import mergePanelIntoLibrary from '@/utils/libraryMerge';
```

3. **Add state for modals**:
```tsx
const [showSettings, setShowSettings] = useState(false);
const [showOpen, setShowOpen] = useState(false);
const [showSaveAs, setShowSaveAs] = useState(false);
```

4. **Replace complex save/open functions** with simple handlers:
```tsx
const handleOpenPanel = (panelData: any) => {
  const p = Panel.fromObject(panelData);
  setRoot(assignLabelsToTrapezoids(p.shape));
  setSelectedId(p.shape.id);
  message.success(`Loaded: ${panelData.name}`);
};

const handleSavePanel = async (name: string, panelData: any) => {
  console.log(`Saved: ${name}`);
};
```

5. **Update dropdown menu**:
```tsx
const items = [
  {
    key: 'panel-settings',
    label: 'Library Settings...',
    icon: <SettingOutlined />,
    onClick: () => setShowSettings(true)
  },
  {
    key: 'panel-save-as',
    label: 'Save As...',
    icon: <SaveOutlined />,
    onClick: () => setShowSaveAs(true)
  },
  {
    key: 'panel-open',
    label: 'Open...',
    icon: <FolderOpenOutlined />,
    onClick: () => setShowOpen(true)
  }
];
```

6. **Add modals to JSX** (before closing tag):
```tsx
  </div> {/* Main content */}
  
  <LibrarySettingsModal
    visible={showSettings}
    jsonKey="panels"
    displayLabel="Panel"
    onClose={() => setShowSettings(false)}
  />
  
  <OpenModal
    visible={showOpen}
    jsonKey="panels"
    displayLabel="Panel"
    onOpen={handleOpenPanel}
    onClose={() => setShowOpen(false)}
  />
  
  <SaveAsModal
    visible={showSaveAs}
    jsonKey="panels"
    displayLabel="Panel"
    entityData={new Panel(root, undefined, 1).toJSON()}
    onSave={handleSavePanel}
    onClose={() => setShowSaveAs(false)}
  />
</>;
```

## Benefits

### Code Reduction
- **Old**: ~500 lines of save/open logic per app
- **New**: ~30 lines of handler code per app
- **Savings**: ~94% code reduction

### Maintainability
- **Before**: Bug fixes needed in 3+ places (songs, recipes, panels)
- **After**: Fix once in shared modal components
- **Result**: Centralized logic, easier debugging

### Consistency
- All apps use same UX for library operations
- Consistent error handling and authentication flow
- Unified look and feel

### Flexibility
- Easy to add new entity types (patterns, stitches, etc.)
- Just provide `jsonKey` and `displayLabel`
- Works with any JSON structure

## Testing Checklist

- [ ] Library Settings modal opens and saves
- [ ] Open modal lists panels from library file
- [ ] Save As modal creates/updates library file
- [ ] Authentication works (session restore)
- [ ] Library path displayed correctly
- [ ] Error messages are user-friendly
- [ ] Works with empty/non-existent library files
- [ ] Works with both object and array formats

## Next Steps

1. ✅ Create modal components
2. ⚠️ Complete PanelShapeCreator refactor (in progress - has compilation errors)
3. Test with panels app
4. Migrate Songs app to use new modals
5. Migrate Recipes app to use new modals
6. Remove old modal system (LibraryModalInner, LibraryOpenDialog, etc.)

## Files to Eventually Remove

Once all apps are migrated:
- `/src/components/LibraryModalInner.tsx` (907 lines)
- `/src/components/LibraryOpenDialog.tsx` (220 lines)
- `/src/components/LibrarySaveDialog.tsx`
- `/src/utils/modalCallbackRegistry.ts`
- Redux modal logic in `/src/reducers/modal.reducer.ts`

**Total lines removed**: ~1500+
**Total lines added**: ~400
**Net reduction**: ~1100 lines (73% reduction)

---

**Date**: 2025-10-02  
**Status**: Components created, migration in progress  
**Next Action**: Fix PanelShapeCreator compilation errors and test
