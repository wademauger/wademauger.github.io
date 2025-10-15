# Google Drive Adapter - Quick Reference

## Installation

```typescript
import {
  createMockAdapter,
  type LibraryData,
  type CrudResult
} from '@/services/drive';
```

## Setup

```typescript
const adapter = createMockAdapter();
await adapter.initialize({ clientId: 'your-client-id' });
await adapter.signIn();
```

## CRUD Operations

```typescript
// CREATE
const result = await adapter.createEntry('recipes', {
  name: 'My Recipe',
  ingredients: ['flour', 'sugar']
});

// READ
const recipe = await adapter.readEntry('recipes', 'recipe-id');

// UPDATE
await adapter.updateEntry('recipes', 'recipe-id', {
  name: 'Updated Recipe'
});

// DELETE
await adapter.deleteEntry('recipes', 'recipe-id');
```

## File Operations

```typescript
// Find file
const file = await adapter.findFile({ filename: 'library.json' });

// Read file
const data = await adapter.readFile(fileId);

// Write file (create or update)
const result = await adapter.writeFile({
  fileId: optionalFileId,
  filename: 'library.json',
  content: libraryData
});

// Delete file
await adapter.deleteFile(fileId);

// List files
const files = await adapter.listFiles(optionalFolderId);
```

## Library Operations

```typescript
// Load library
const library = await adapter.loadLibrary(optionalFileId);

// Save library
await adapter.saveLibrary(libraryData, optionalFileId);

// Merge libraries
const result = await adapter.mergeLibraries([
  { fileId: 'file-1' },
  { fileId: 'file-2' },
  { data: localData }
], {
  strategy: 'deep',
  conflictResolution: 'keepLast'
});
```

## Error Handling

```typescript
import {
  AuthenticationError,
  FileNotFoundError,
  NetworkError,
  MergeConflictError
} from '@/services/drive';

try {
  await adapter.readFile(fileId);
} catch (error) {
  if (error instanceof FileNotFoundError) {
    // Handle missing file
  } else if (error instanceof AuthenticationError) {
    // Handle auth error
  }
}
```

## Testing

```typescript
// Create mock adapter
const adapter = createMockAdapter();

// Configure test behavior
adapter.setNetworkDelay(true, 100);
adapter.setAuthFailure(false);
adapter.setNetworkFailure(false);

// Seed test data
adapter.seedFiles([
  { name: 'lib.json', content: { recipes: {} } }
]);

// Reset state
adapter.reset();

// Inspect files
const allFiles = adapter.getAllFiles();
```

## Library Collections

```typescript
interface LibraryData {
  recipes?: Record<string, any>;        // Recipe app
  artists?: Array<...>;                 // Music app
  panels?: Record<string, any>;         // Knitting panels
  projects?: Record<string, any>;       // Knitting projects
  knittingProjects?: Record<string, any>;
  colorworkPatterns?: Record<string, any>;
  entries?: Array<any>;                 // Legacy
  version?: string;
  lastModified?: string;
}
```

## Merge Options

```typescript
interface MergeOptions {
  strategy?: 'deep' | 'shallow' | 'replace';
  conflictResolution?: 'keepFirst' | 'keepLast' | 'error';
  preserveArrays?: boolean;
}
```

## Running Tests

```bash
# All tests
npm test

# With coverage
npm test -- --coverage

# Specific file
npm test services/drive/__tests__/merge.test.ts

# Watch mode
npm test -- --watch
```

## Common Patterns

### Complete CRUD Workflow

```typescript
// Setup
const adapter = createMockAdapter();
await adapter.initialize({ clientId: 'test' });
await adapter.signIn();

// Create
const created = await adapter.createEntry('recipes', {
  name: 'Cookies'
});

// Read
const recipe = await adapter.readEntry('recipes', created.id!);

// Update
await adapter.updateEntry('recipes', created.id!, {
  name: 'Best Cookies'
});

// Load full library
const library = await adapter.loadLibrary();

// Delete
await adapter.deleteEntry('recipes', created.id!);
```

### Merge Multiple Files

```typescript
const result = await adapter.mergeLibraries([
  { fileId: 'user-recipes' },
  { fileId: 'shared-recipes' },
  { data: importedRecipes }
], {
  strategy: 'deep',
  conflictResolution: 'keepLast'
});

if (result.conflicts) {
  console.warn('Conflicts detected:', result.conflicts);
}

// Use merged data
const merged = result.data;
```

### Efficient Partial Update

```typescript
// Only update specific fields
await adapter.updateEntry('recipes', 'recipe-1', {
  name: 'New Name'
  // All other fields preserved automatically
});
```

## Tips

- Use `fileId` parameter for operations on specific files
- Omit `fileId` to use default library file
- Check `result.success` before using `result.data`
- Handle conflicts in merge results
- Reset mock adapter between tests
- Use specific error types for error handling
- Leverage TypeScript types for safety

## See Also

- Full API docs: `src/services/drive/README.md`
- Implementation details: `src/services/drive/IMPLEMENTATION_SUMMARY.md`
- Test examples: `src/services/drive/__tests__/*.test.ts`
