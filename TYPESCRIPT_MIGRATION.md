# TypeScript Migration Guide

This project is now configured for **gradual TypeScript migration**. You can continue using `.js` files while progressively converting components to TypeScript.

## 📋 What's Been Set Up

### TypeScript Configuration
- ✅ **tsconfig.json** - Strict TypeScript config with path aliases
- ✅ **Type definitions** - Common types in `src/types/`
- ✅ **Path aliases** - Clean imports like `@/components/*`
- ✅ **Build integration** - Works with existing React Scripts

### Available Scripts
```bash
npm run type-check        # Check TypeScript types without building
npm run type-check:watch   # Watch mode for type checking
npm run migrate-file       # Helper script to convert .js to .tsx
```

### Path Aliases Available
```typescript
import Component from '@/components/MyComponent';     // src/components/
import { useMyHook } from '@/hooks/useMyHook';        // src/hooks/
import { myUtil } from '@/utils/myUtil';              // src/utils/
import { MyModel } from '@/models/MyModel';           // src/models/
import store from '@/store';                          // src/store/
import type { Song } from '@/types';                  // src/types/
```

## 🔄 Migration Strategy

### 1. Gradual Approach
- Keep existing `.js` files working
- Convert components one by one to `.tsx`
- Start with simple components
- Add types incrementally

### 2. Migration Priority Order
1. **Utility functions** (`src/utils/`) → `.ts`
2. **Type definitions** (`src/types/`) → `.ts` 
3. **Simple components** → `.tsx`
4. **Complex components** → `.tsx`
5. **Store slices** → `.ts`

### 3. How to Migrate a Component

**Option A: Use the migration script**
```bash
npm run migrate-file src/components/MyComponent.js
```

**Option B: Manual migration**
1. Rename `.js` to `.tsx` (or `.ts` for non-React files)
2. Add interface for props:
   ```typescript
   interface MyComponentProps {
     title: string;
     onClick?: () => void;
     children?: React.ReactNode;
   }
   
   const MyComponent: React.FC<MyComponentProps> = ({ title, onClick, children }) => {
     // component code
   };
   ```
3. Add type annotations for state and functions
4. Import types: `import type { Song, Artist } from '@/types';`

## 📚 Type Examples

### Component Props
```typescript
interface SongDetailProps {
  song: Song;
  artist: Artist;
  onPinChord: (chord: string) => void;
  onUpdateSong: (song: Song) => Promise<void>;
  editingEnabled?: boolean;
}
```

### Event Handlers
```typescript
const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
  // handle click
};

const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  setValue(event.target.value);
};
```

### State with Types
```typescript
const [songs, setSongs] = useState<Song[]>([]);
const [loading, setLoading] = useState<boolean>(false);
const [error, setError] = useState<string | null>(null);
```

### Async Functions
```typescript
const fetchSongs = async (): Promise<Song[]> => {
  const response = await api.getSongs();
  return response.data;
};
```

## 🎯 Current Status

- ✅ **TypeScript configured** and ready
- ✅ **Example migration** completed (`MinimalLayout.tsx`)
- ✅ **Type definitions** created for common data structures
- ✅ **Build process** verified working
- ⏳ **Gradual migration** can begin

## 🚀 Next Steps

1. **Start migrating simple components** to get familiar with TypeScript
2. **Add path aliases** to reduce deep import paths
3. **Set up ESLint with TypeScript rules** for better code quality
4. **Add type safety** to Redux store and async operations

## 🔧 Troubleshooting

### Common Issues
- **Import errors**: Use path aliases like `@/components/` instead of `../../../`
- **Type errors**: Add `// @ts-ignore` temporarily, then fix properly
- **Missing types**: Install with `npm install @types/package-name`

### VS Code Setup
Make sure VS Code is using the workspace TypeScript version:
1. Open any `.ts` file
2. Press `Ctrl+Shift+P` (or `Cmd+Shift+P`)
3. Type "TypeScript: Select TypeScript Version"
4. Choose "Use Workspace Version"