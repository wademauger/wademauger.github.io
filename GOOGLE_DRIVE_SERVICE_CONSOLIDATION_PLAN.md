# Google Drive Service Consolidation Plan

## Overview

This document outlines a plan to consolidate `GoogleDriveServiceModern.ts` and `GoogleDriveRecipeService.ts` into a unified service with app-specific configurations.

## Current State

### GoogleDriveServiceModern.ts (2,791 lines)
- **Used by:** Songs app, Panels/Colorwork apps, shared components
- **Scopes:** `openid`, `userinfo.email`, `userinfo.profile`, `drive`, `drive.metadata.readonly`
- **Storage Keys:** `googleDrive_*` prefix
- **Library Format:** Songs/tabs format with artists, albums, versions
- **Special Features:**
  - Upload fallback mechanism
  - Legacy settings cleanup
  - Folder navigation and multi-file management
  - Library merging and conflict resolution

### GoogleDriveRecipeService.ts (1,563 lines)
- **Used by:** Recipes app
- **Scopes:** `drive`, `drive.metadata.readonly` (no OpenID/userinfo)
- **Storage Keys:** `googleDriveRecipes_*` prefix
- **Library Format:** Recipes format with recipe objects
- **Special Features:**
  - Recipe-specific CRUD operations
  - Permalink validation
  - Recipe-specific folder management

## Proposed Architecture

### 1. Base Service Class: `GoogleDriveBaseService`

Core functionality shared by all apps:

```typescript
class GoogleDriveBaseService {
  // Core properties
  protected isSignedIn: boolean;
  protected tokenClient: any;
  protected accessToken: string | null;
  protected userEmail: string | null;
  protected userName: string | null;
  protected userPicture: string | null;
  
  // Configuration (injected via constructor)
  protected config: GoogleDriveServiceConfig;
  
  // Core authentication methods
  async initialize(clientId: string): Promise<void>
  async signIn(): Promise<void>
  async signOut(): Promise<void>
  async loadUserProfile(): Promise<void>
  async validateToken(): Promise<boolean>
  
  // Session management
  saveSession(): void
  restoreSession(): boolean
  clearSession(): void
  
  // Proactive token validation
  isTokenExpired(): boolean
  async ensureValidToken(): Promise<boolean>
  async withAutoAuth(operation, operationName, ...args): Promise<any>
  
  // File operations (generic)
  async findFile(fileName: string, folderPath?: string): Promise<any>
  async createFile(fileName: string, content: any, folderPath?: string): Promise<any>
  async updateFile(fileId: string, content: any): Promise<any>
  async deleteFile(fileId: string): Promise<void>
  async listFiles(folderPath?: string): Promise<any[]>
}
```

### 2. Configuration Interface

```typescript
interface GoogleDriveServiceConfig {
  // App identifier
  appName: 'songs' | 'recipes' | 'panels';
  
  // OAuth scopes
  scopes: string;
  
  // Storage key prefix
  storagePrefix: string;
  
  // Library settings
  defaultLibraryFilename: string;
  libraryFormat: LibraryFormat;
  
  // Optional features
  enableUserInfo?: boolean;  // Load name/picture
  enableFolderNavigation?: boolean;
  enableUploadFallback?: boolean;
}

interface LibraryFormat {
  validateStructure(data: any): boolean;
  normalizePayload(data: any): any;
  createEmpty(): any;
}
```

### 3. App-Specific Service Classes

```typescript
class GoogleDriveSongsService extends GoogleDriveBaseService {
  constructor() {
    super({
      appName: 'songs',
      scopes: 'openid https://www.googleapis.com/auth/userinfo.email ...',
      storagePrefix: 'googleDrive_',
      defaultLibraryFilename: 'library.json',
      libraryFormat: new SongsLibraryFormat(),
      enableUserInfo: true,
      enableFolderNavigation: true,
      enableUploadFallback: true
    });
  }
  
  // Songs-specific methods
  async updateSong(libraryData, artistName, albumTitle, songTitle, songData)
  async deleteSong(libraryData, artistName, albumTitle, songTitle)
  // ... other songs-specific methods
}

class GoogleDriveRecipesService extends GoogleDriveBaseService {
  constructor() {
    super({
      appName: 'recipes',
      scopes: 'https://www.googleapis.com/auth/drive ...',
      storagePrefix: 'googleDriveRecipes_',
      defaultLibraryFilename: 'library.json',
      libraryFormat: new RecipesLibraryFormat(),
      enableUserInfo: false,
      enableFolderNavigation: true,
      enableUploadFallback: false
    });
  }
  
  // Recipe-specific methods
  async addRecipe(recipeData)
  async updateRecipe(recipeId, updatedData)
  async deleteRecipe(recipeId)
  async isPermalinkAvailable(permalink)
  validatePermalinkFormat(permalink)
}
```

## Migration Strategy

### Phase 1: Create Base Service (Week 1)
1. Create `GoogleDriveBaseService.ts` with core functionality
2. Extract common methods from both services
3. Create configuration interface
4. Write comprehensive unit tests for base service

**Files to create:**
- `src/services/google-drive/GoogleDriveBaseService.ts`
- `src/services/google-drive/types.ts`
- `src/services/google-drive/formats/LibraryFormat.ts`
- `src/services/google-drive/formats/SongsLibraryFormat.ts`
- `src/services/google-drive/formats/RecipesLibraryFormat.ts`
- `src/services/google-drive/__tests__/GoogleDriveBaseService.test.ts`

### Phase 2: Create App-Specific Services (Week 2)
1. Implement `GoogleDriveSongsService` extending base
2. Implement `GoogleDriveRecipesService` extending base
3. Keep existing services in place (parallel implementation)
4. Write integration tests

**Files to create:**
- `src/services/google-drive/GoogleDriveSongsService.ts`
- `src/services/google-drive/GoogleDriveRecipesService.ts`
- `src/services/google-drive/__tests__/GoogleDriveSongsService.test.ts`
- `src/services/google-drive/__tests__/GoogleDriveRecipesService.test.ts`

### Phase 3: Update Import Paths (Week 3)
1. Update all imports to use new services (one app at a time)
2. Test each app thoroughly
3. Fix any issues discovered

**Files to update (Songs app):**
- `src/apps/songs/SongTabsAppModern.tsx`
- `src/apps/colorwork-designer/context/DriveAuthContext.tsx`
- `src/components/modals/*.tsx` (OpenModal, SaveAsModal, LibrarySettingsModal)
- `src/hooks/useLibraryQuery.ts`
- `src/store/librarySlice.ts`
- `src/store/songsSlice.ts`

**Files to update (Recipes app):**
- `src/apps/recipes/RecipesApp.tsx`
- `src/apps/recipes/ExampleIntegration.tsx`
- `src/components/RecipeLibraryModal.tsx`
- `src/components/LibraryModalInner.tsx`

### Phase 4: Remove Old Services (Week 4)
1. Delete `GoogleDriveServiceModern.ts`
2. Delete `GoogleDriveRecipeService.ts`
3. Update all documentation
4. Final regression testing

### Phase 5: Re-export for Convenience (Optional)
Create convenience exports to maintain clean import paths:

```typescript
// src/apps/songs/services/GoogleDriveService.ts (NEW)
export { GoogleDriveSongsService as default } from '../../../services/google-drive/GoogleDriveSongsService';

// src/apps/recipes/services/GoogleDriveService.ts (NEW)
export { GoogleDriveRecipesService as default } from '../../../services/google-drive/GoogleDriveRecipesService';
```

## Key Differences to Handle

### 1. OAuth Scopes
- **Songs:** Includes OpenID and userinfo scopes for profile data
- **Recipes:** Only Drive scopes
- **Solution:** Configure via `config.scopes` and `config.enableUserInfo`

### 2. Storage Keys
- **Songs:** `googleDrive_*` prefix
- **Recipes:** `googleDriveRecipes_*` prefix
- **Solution:** Configure via `config.storagePrefix`

### 3. Library Format
- **Songs:** Complex nested structure (artists → albums → songs)
- **Recipes:** Flat array of recipe objects
- **Solution:** Use `LibraryFormat` strategy pattern

### 4. Special Features
- **Songs:** Upload fallback, legacy cleanup, folder query generation
- **Recipes:** Permalink validation, recipe-specific CRUD
- **Solution:** Keep app-specific methods in subclasses

## Benefits

1. **Reduced Code Duplication:** ~1,000+ lines of duplicated code eliminated
2. **Easier Maintenance:** Bug fixes and improvements in one place
3. **Consistent Behavior:** Authentication, caching, error handling unified
4. **Type Safety:** Shared types and interfaces
5. **Better Testing:** Test base functionality once, app-specific logic separately
6. **Extensibility:** Easy to add new apps (e.g., ColorworkService, KnittingService)

## Risks & Mitigation

### Risk 1: Breaking Existing Functionality
**Mitigation:**
- Parallel implementation during migration
- Comprehensive test suite before switching
- Gradual rollout (one app at a time)
- Easy rollback if issues found

### Risk 2: Complex Inheritance Hierarchy
**Mitigation:**
- Keep inheritance to 2 levels max (Base → App-specific)
- Use composition over inheritance where appropriate
- Clear documentation of method overrides

### Risk 3: Configuration Complexity
**Mitigation:**
- Provide sensible defaults
- Validate configuration at initialization
- Clear error messages for misconfiguration

## Testing Strategy

### Unit Tests
- Base service: 100+ tests covering all core methods
- App-specific services: 50+ tests each for specialized methods
- Configuration validation tests
- Library format tests

### Integration Tests
- Full authentication flow for each app
- File operations for each library format
- Session persistence and restoration
- Token expiry and renewal
- Error handling and recovery

### Manual Testing Checklist
- [ ] Songs app: Sign in, load library, save song, sign out
- [ ] Recipes app: Sign in, load recipes, add recipe, sign out
- [ ] Panels app: Sign in, load patterns, save pattern, sign out
- [ ] Cross-app: Sign in to songs, switch to recipes (session preserved)
- [ ] Token expiry: Let session expire, verify auto-renewal
- [ ] Network errors: Disconnect network, verify error handling
- [ ] Profile cache: Verify profile persists across refreshes

## Timeline

- **Week 1:** Base service implementation and tests
- **Week 2:** App-specific services and tests
- **Week 3:** Migration and import updates
- **Week 4:** Cleanup and final testing
- **Week 5:** Documentation and code review

**Total: 5 weeks** (can be parallelized with other work)

## Next Steps

1. **Review this plan** with the team
2. **Create GitHub issue** for tracking
3. **Set up feature branch** (`feature/consolidate-drive-services`)
4. **Begin Phase 1** implementation
5. **Regular check-ins** to ensure progress

## Questions to Answer

- [ ] Should we maintain backward compatibility with old storage keys?
- [ ] Do we need a migration script for existing localStorage data?
- [ ] Should panels/colorwork get their own service or share songs service?
- [ ] Do we want to support multiple simultaneous logins (different accounts)?
- [ ] Should we extract the profile cache into a separate service?

## Related Files

- `src/utils/userProfileCache.ts` - User profile caching (already shared)
- `src/utils/GoogleDriveErrorHandler.ts` - Error handling (already shared)
- `src/utils/libraryFormat.ts` - Library formatting utilities
- `src/store/authSlice.ts` - Redux auth state management

## Success Metrics

- Lines of code reduced by >30%
- Test coverage increased to >95%
- Zero regressions in functionality
- Improved developer experience (easier to understand and modify)
- Faster onboarding for new contributors
