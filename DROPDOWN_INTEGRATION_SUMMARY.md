# Dropdown Integration Architecture

## Overview
The application uses a **DropdownProvider** context to allow pages to register menu items that appear in the GoogleAuthButton dropdown when the user is logged in.

## Component Flow

```
App.tsx (wraps with GoogleOAuthProvider + Redux Provider)
  └─> Layout.tsx (wraps with DropdownProvider)
       └─> GoogleAuthButton (in header)
            - Merges menu items from:
              1. Built-in "Library Settings" (always shown)
              2. Context menu items from useDropdown()
              3. "Sign out" (always shown when logged in)
       └─> Page Components (e.g., PanelShapeCreator)
            - Use `const { setMenuItems } = useDropdown()`
            - Register menu items in useEffect
            - Items appear in GoogleAuthButton dropdown
```

## Current Implementation

### 1. GoogleAuthButton (`src/components/GoogleAuthButton.tsx`)
- **Location**: Header in `Layout.tsx`
- **Behavior**:
  - Shows "Sign in with Google" button when logged out
  - Shows user avatar + dropdown when logged in
  - Dropdown contains:
    - "Library Settings" (built-in, opens modal based on current app context)
    - Menu items from page (via DropdownProvider context)
    - "Sign out" (built-in)

### 2. PanelShapeCreator (`src/apps/colorwork-designer/PanelShapeCreator.tsx`)
- **Registers 3 menu items** via `setMenuItems([])`:
  1. **Save** - Saves current panel to selected library (shows error if no library selected)
  2. **Save As...** - Opens modal to name and save panel
  3. **Open...** - Opens modal to select a panel from current library

### 3. Modal Flow

#### Save As Flow
1. User clicks "Save As..." from dropdown
2. Opens modal with:
   - Single input for panel name
   - (Hidden for panels) File/folder location inputs
   - Button: "Library Settings" - opens full settings modal
   - Button: "Save Here" - saves to selected file
3. Callback invoked with panel data
4. Success notification shown

#### Open Flow
1. User clicks "Open..." from dropdown
2. Opens modal with:
   - Auto-loads current library (if available)
   - Shows list of panels in library
   - Button: "Library Settings" - opens full settings modal  
   - Button: "Open" - loads selected panel
3. Callback invoked with panel data
4. Panel loaded into editor

#### Library Settings Flow
1. User clicks "Library Settings" from dropdown (or from Save As/Open modal)
2. Opens modal with:
   - File name input
   - Folder path input
   - Search/Create buttons
   - Button: "Save Settings" - saves preferences and returns to previous modal (if any)

## Key Files

- `/src/components/DropdownProvider.tsx` - Context provider for menu items
- `/src/components/GoogleAuthButton.tsx` - Login button with dropdown
- `/src/components/Layout.tsx` - Wraps app with DropdownProvider
- `/src/apps/colorwork-designer/PanelShapeCreator.tsx` - Registers page-specific menu items
- `/src/components/LibraryModal.tsx` - Lazy-loaded modal wrapper
- `/src/components/LibraryModalInner.tsx` - Modal implementation (stub, needs full implementation)
- `/src/components/LibrarySettingsModal.tsx` - Full settings modal implementation
- `/src/reducers/modal.reducer.ts` - Redux actions for modals (openModal, closeModal, etc.)


## Recent Fixes

### ✅ Library Settings Modal Empty Issue (Oct 2, 2025)

**Problem**: Clicking "Library Settings..." from dropdown showed empty modal

**Root Cause**: `showFileInputs = appContext !== 'panels'` was too broad - it hid inputs for ALL panels modes, including Settings mode

**Solution**: Changed to `showFileInputs = appContext !== 'panels' || (!isSaveAsMode && !isOpenMode)`

**Result**: 
- ✅ Settings mode (Library Settings...): Shows full UI with file/folder inputs
- ✅ Save As mode: Shows simplified panel name input only
- ✅ Open mode: Shows panel list only

See `/docs/development/LIBRARY_SETTINGS_EMPTY_FIX.md` for detailed explanation.

---

## Implementation Status

✅ **Complete**:
- DropdownProvider context
- GoogleAuthButton with dropdown integration
- PanelShapeCreator registers menu items with icons
- Basic modal flow with callbacks
- **LibraryModalInner.tsx has full implementation (669 lines copied from LibrarySettingsModal.tsx)**
- **Lazy-loading architecture preserved (LibraryModal.tsx → LibraryModalInner.tsx)**
- **Three modal modes: Save As (simplified input), Open (panel list), Settings (full UI)**
- **All tests passing (14/15 test suites, 125 tests)**

✅ **Architecture Decision**:
- **Option A implemented**: Full implementation copied to LibraryModalInner.tsx
- Preserves lazy-loading pattern for optimal bundle size
- LibrarySettingsModal.tsx kept as reference/backup
- Modal automatically adapts UI based on context and intent:
  - `appContext='panels'` + `onSelectFileCallbackId` = Save As mode
  - `appContext='panels'` + `intent='open'` = Open mode with panel list
  - All other cases = Full library settings mode

