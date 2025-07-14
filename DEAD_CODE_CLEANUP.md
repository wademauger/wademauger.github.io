# Dead Code Cleanup Plan

## Files to Remove

### 1. Unused Components
- [x] `src/components/AppFrame.js` - Replaced by Layout.js ✅ REMOVED
- [x] `src/Home.js` - Replaced by pages/HomePage.js ✅ REMOVED
- [x] `src/apps/recipes/components/TestNewRecipeForm.js` - Test component ✅ NOT FOUND

### 2. Backup Files
- [x] `src/apps/recipes/components/RecipeAIChat.js.backup` ✅ REMOVED

### 3. Root Directory Test Files (36 files) ✅ ALL REMOVED
- [x] `test-ai-ingredient-parsing.js`
- [x] `test-chat-history-persistence.js`
- [x] `test-chat-ux-final.js`
- [x] `test-constructor-fix.js`
- [x] `test-convert.js`
- [x] `test-enhanced-chat-ux.js`
- [x] `test-final-validation.js`
- [x] `test-format-detection.js`
- [x] `test-german-chocolate-cake.js`
- [x] `test-grouped-ingredient-tables.js`
- [x] `test-grouped-ingredients.js`
- [x] `test-ingredient-parser.js`
- [x] `test-ingredient-safety.js`
- [x] `test-json-extraction.js`
- [x] `test-json-only-approach.js`
- [x] `test-json-recipe.js`
- [x] `test-json-recognition.js`
- [x] `test-json-suggestions-detection.js`
- [x] `test-labels-simple.js`
- [x] `test-modal-title.js`
- [x] `test-multiline-parsing.js`
- [x] `test-parsing-comprehensive.js`
- [x] `test-provider-labels.js`
- [x] `test-quantity-fixes.js`
- [x] `test-quantity-handling.js`
- [x] `test-react-crash-debug.js`
- [x] `test-react-crash-fix.js`
- [x] `test-recipe-detection.js`
- [x] `test-recipe-parsing.js`
- [x] `test-specific-scenario.js`
- [x] `test-suggestions-no-tags.js`
- [x] `test-suggestions-ux-flow.js`
- [x] `test-title-preservation.js`
- [x] `test-transpose.js`
- [x] `test-two-app-architecture.js`
- [x] `test-worker-json.js`

### 4. Development Summary Files ✅ ALL REMOVED
- [x] `chat-history-implementation-summary.js`
- [x] `recipe-ai-chat-refactoring-summary.js`
- [x] `recipe-detail-fix-summary.js`
- [x] `json-parsing-improvements-summary.js`
- [x] `enhanced-debugging-guide.js`
- [x] `german-chocolate-cake-resolution.js`
- [x] `complete-inversions.js`
- [x] `add-inversions.js`
- [x] `debug-parsing.js`
- [x] `debug-german-chocolate-final.js`

### 5. Development Documentation ✅ MOVED TO docs/development/
- [x] `AI_CHAT_SETUP.md` → `docs/development/AI_CHAT_SETUP.md`
- [x] `BUNDLE_OPTIMIZATION.md` → `docs/development/BUNDLE_OPTIMIZATION.md`
- [x] `DEFENSIVE_PROGRAMMING_SUMMARY.md` → `docs/development/DEFENSIVE_PROGRAMMING_SUMMARY.md`
- [x] `ENHANCED_CHAT_UX_COMPLETE.md` → `docs/development/ENHANCED_CHAT_UX_COMPLETE.md`
- [x] `INGREDIENT_QUANTITY_FIX_SUMMARY.md` → `docs/development/INGREDIENT_QUANTITY_FIX_SUMMARY.md`
- [x] `from-scratch-book.md` → `docs/development/from-scratch-book.md`

## Actions to Take

### Phase 1: Safe Removals
1. Delete backup files
2. Remove test files from root directory
3. Remove unused components (AppFrame.js, Home.js, TestNewRecipeForm.js)

### Phase 2: Import Cleanup
1. Analyze and remove unused imports in key components
2. Use ESLint with unused imports rule to identify more

### Phase 3: Bundle Analysis
1. Run bundle analyzer to identify unused dependencies
2. Check for unused CSS files
3. Remove unused utility functions

## Commands to Execute

```bash
# Remove backup files
rm src/apps/recipes/components/RecipeAIChat.js.backup

# Remove unused components
rm src/components/AppFrame.js
rm src/Home.js
rm src/apps/recipes/components/TestNewRecipeForm.js

# Remove root directory test files
rm test-*.js

# Remove development summary files
rm *-summary.js
rm enhanced-debugging-guide.js
rm german-chocolate-cake-resolution.js
rm complete-inversions.js
rm add-inversions.js
rm debug-*.js

# Consider moving markdown files to docs/
mkdir -p docs/development
mv *.md docs/development/ 2>/dev/null || true
```

## Estimated Impact
- **Files to remove**: ~50-60 files
- **Size reduction**: Likely 1-2MB of source code
- **Bundle size**: Minimal impact (most are not bundled)
- **Maintainability**: Significant improvement

## ✅ CLEANUP COMPLETED - $(date)

### Summary of Changes Applied:
1. **Removed unused components** (3 files):
   - `src/components/AppFrame.js`
   - `src/Home.js`
   - `src/apps/recipes/components/TestNewRecipeForm.js` (already missing)

2. **Removed backup files** (1 file):
   - `src/apps/recipes/components/RecipeAIChat.js.backup`

3. **Removed test files from root** (36 files):
   - All `test-*.js` files successfully removed

4. **Removed development summary files** (10 files):
   - All `*-summary.js` files and related development scripts removed

5. **Moved development documentation** (6 files):
   - All markdown files moved to `docs/development/` directory

### Files Remaining in Root:
- `README.md` (kept - project documentation)
- `jest.config.js` (kept - test configuration)
- `DEAD_CODE_CLEANUP.md` (this file)

### Total Impact:
- **Files removed**: ~50 files
- **Files moved**: 6 files
- **Root directory**: Much cleaner, only essential files remain
- **Documentation**: Better organized in docs/development/

### Next Steps:
- Phase 2: Import cleanup (analyze unused imports)
- Phase 3: Bundle analysis (check for unused dependencies)
