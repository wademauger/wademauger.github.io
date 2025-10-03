# Library Settings Modal Fix - Empty Modal Issue

## Problem

When clicking "Library Settings..." from the dropdown menu in PanelShapeCreator, the modal appeared empty with no inputs or content.

## Root Cause

The `showFileInputs` condition was too broad:

```typescript
// WRONG - hides inputs for ALL panels modes
const showFileInputs = appContext !== 'panels';
```

This meant:
- ✅ **Save As mode**: Correctly hid file inputs (wanted simplified UI)
- ✅ **Open mode**: Correctly hid file inputs (showed panel list instead)
- ❌ **Settings mode**: **INCORRECTLY** hid file inputs (user can't see/edit library settings!)

## Solution

Changed the condition to only hide inputs for panels in Save As or Open modes:

```typescript
// CORRECT - only hides inputs for panels when in Save As or Open modes
const showFileInputs = appContext !== 'panels' || (!isSaveAsMode && !isOpenMode);
```

### Logic Breakdown

| appContext | Mode | isSaveAsMode | isOpenMode | showFileInputs | Result |
|------------|------|--------------|------------|----------------|--------|
| `songs` | Settings | false | false | **true** | Full settings UI ✅ |
| `recipes` | Settings | false | false | **true** | Full settings UI ✅ |
| `panels` | Settings | false | false | **true** | Full settings UI ✅ |
| `panels` | Save As | true | false | **false** | Simplified panel name input ✅ |
| `panels` | Open | false | true | **false** | Panel list UI ✅ |

## Truth Table Explanation

```typescript
showFileInputs = appContext !== 'panels' || (!isSaveAsMode && !isOpenMode)
```

This evaluates to `true` (show inputs) when:
1. **App is NOT panels** (songs or recipes always show inputs)
   - OR -
2. **App IS panels AND mode is Settings** (not Save As, not Open)

This evaluates to `false` (hide inputs) when:
1. **App IS panels AND (mode is Save As OR mode is Open)**

## Testing

✅ All tests pass: 14 test suites (125 tests)
✅ No compilation errors
✅ Logic verified via truth table

## Manual Testing Needed

Please test these scenarios:

1. **Library Settings from dropdown** (panels app):
   - Click dropdown → "Library Settings..."
   - ✅ Should see: Panel Library Filename input, Google Drive Folder selector, search/create buttons
   
2. **Save As flow** (panels app):
   - Click dropdown → "Save As..."
   - ✅ Should see: Only "Panel Name" input field, no file/folder inputs
   
3. **Open flow** (panels app):
   - Click dropdown → "Open..."
   - ✅ Should see: List of saved panels, no file/folder inputs

4. **Library Settings from other apps** (songs/recipes):
   - Still works as before with full settings UI

---

**Date**: October 2, 2025  
**Status**: ✅ Fixed  
**Tests**: ✅ Passing
