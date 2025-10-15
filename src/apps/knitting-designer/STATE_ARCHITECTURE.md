# State Management Architecture

This document explains why we use both Redux and Zustand in the Knitting Designer application.

## TL;DR

- **Redux**: For persistent business state (patterns, colors, library, projects)
- **Zustand**: For ephemeral viewport UI state (pan, zoom, hover, drag)

## Why Two State Management Libraries?

### The Problem

The knitting designer renders large grids (100x100+ cells) with interactive features like:
- Pan and zoom (updates 60 times per second during interaction)
- Cell hover effects (updates on every mouse move)
- Drag selection (updates continuously while dragging)

If these high-frequency updates went through Redux:
1. Redux DevTools would be flooded with thousands of actions
2. Every pan/zoom would trigger middleware and reducer logic
3. Connected components across the app would re-render unnecessarily
4. Performance would degrade, especially on larger patterns

### The Solution

**Redux handles persistent state** - things that need to be:
- Saved to Google Drive
- Included in undo/redo history
- Debugged in Redux DevTools
- Serialized when exporting projects

**Zustand handles ephemeral UI state** - things that:
- Change many times per second
- Don't need to persist across page reloads
- Shouldn't clutter Redux DevTools
- Are purely visual/interaction concerns

## State Ownership Guide

### ✅ Redux (Persistent Business State)

Located in `/src/store/knittingDesignSlice.ts`

```typescript
// Project metadata
- Project name/title
- Creation date, modified date
- Project ID

// Pattern data  
- Grid dimensions (width, height)
- Cell color data (the actual pattern)
- Colorwork layers
- Pattern configuration

// Color palette
- Color definitions (id, hex, label)
- Active/selected colors
- Color history

// Library content
- Saved projects
- Custom panels
- Colorwork patterns

// User preferences
- Default gauge settings
- UI mode preferences
```

**Rule of thumb**: If it appears in the JSON when you save a project, it belongs in Redux.

### ✅ Zustand (Ephemeral Viewport State)

Located in `/src/apps/knitting-designer/store/viewportStore.ts`

```typescript
// Pan/zoom transforms
- offsetX, offsetY (viewport position)
- scale (zoom level)

// Hover state
- hoveredCell (which cell the mouse is over)

// Active drag/selection
- isDragging (whether user is currently dragging)
- selectionStart, selectionEnd (drag selection boundaries)

// Temporary UI feedback
- pastePreviewPosition (where paste would occur)
```

**Rule of thumb**: If it resets to default on page reload (and that's fine), it belongs in Zustand.

## Component Integration Examples

### Reading from Redux
```typescript
import { useSelector, useDispatch } from 'react-redux';
import { selectPattern, updatePattern } from '../store/knittingDesignSlice';

function PatternEditor() {
  const pattern = useSelector(selectPattern);
  const dispatch = useDispatch();
  
  const handleCellClick = (row, col, colorId) => {
    dispatch(updatePattern({ row, col, colorId }));
  };
  
  // ... render pattern
}
```

### Reading from Zustand
```typescript
import { useViewportStore } from '../store/viewportStore';

function GridCanvas() {
  const { offsetX, offsetY, scale, setPan } = useViewportStore();
  
  const handlePan = (deltaX, deltaY) => {
    setPan(offsetX + deltaX, offsetY + deltaY);
  };
  
  // ... render with transform
}
```

### Reading from Both
```typescript
import { useSelector } from 'react-redux';
import { useViewportStore } from '../store/viewportStore';

function VirtualizedGrid() {
  // Pattern data from Redux (persistent)
  const pattern = useSelector(selectPattern);
  const colors = useSelector(selectColorPalette);
  
  // Viewport state from Zustand (ephemeral)
  const { scale, hoveredCell } = useViewportStore();
  
  // Render only visible cells based on viewport
  return <Grid pattern={pattern} scale={scale} />;
}
```

## Performance Benefits

### Before (Everything in Redux)
```
User pans the viewport:
1. Dispatch PAN_VIEWPORT action
2. Redux middleware processes action
3. Reducer updates state
4. All connected components check for updates
5. Redux DevTools logs action
6. Result: 60 actions/second during pan = lag

Redux DevTools history after 10 seconds of panning:
[600 PAN actions, 200 HOVER actions, 1 SAVE_PROJECT action] 😵
```

### After (Split Architecture)
```
User pans the viewport:
1. Call zustand setPan() directly
2. Only viewport-dependent components re-render
3. Result: Smooth 60fps interaction

Redux DevTools history after 10 seconds of panning:
[1 SAVE_PROJECT action] ✅ Clean and debuggable
```

## Common Questions

### Q: Why not use multiple Redux stores?
**A**: Redux best practices recommend a single store per app. Multiple stores break:
- Redux DevTools time-travel debugging
- Middleware integration
- State hydration/persistence
- Most Redux ecosystem tools

### Q: Should form inputs use Zustand?
**A**: No. Even "unsaved" form data (like project name before saving) should stay in Redux because:
- It needs to be included when you save
- Users expect it to persist if they navigate away and come back
- It's not high-frequency (typing is ~5 chars/second max)

### Q: What about selection state?
**A**: It depends:
- **Committed selection** (stored in pattern) → Redux
- **In-progress drag selection** (while mouse is down) → Zustand
- **Selection converted to pattern data** (on mouse up) → Redux

### Q: Can we consolidate to just Redux?
**A**: Technically yes, but you'd lose performance. You'd need to:
- Add throttling/debouncing to viewport actions
- Accept Redux DevTools pollution
- Deal with unnecessary re-renders
- Add complexity elsewhere to recover lost performance

The current split is the recommended approach from Redux maintainers.

## Related Files

- Redux store: `/src/store/store.ts`
- Redux slices: `/src/store/knittingDesignSlice.ts`, `/src/store/librarySlice.ts`
- Zustand store: `/src/apps/knitting-designer/store/viewportStore.ts`
- Virtualized grid: `/src/apps/knitting-designer/components/VirtualizedColorworkGrid.tsx`

## Further Reading

- [Redux: Do I have to put all my state into Redux?](https://redux.js.org/faq/organizing-state#do-i-have-to-put-all-my-state-into-redux)
- [Zustand: When to use](https://github.com/pmndrs/zustand#when-to-use)
- [React RFC: useSyncExternalStore](https://github.com/reactwg/react-18/discussions/86)
