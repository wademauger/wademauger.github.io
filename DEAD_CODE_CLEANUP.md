# Dead Code Cleanup Plan

## Files to Remove

### 1. Unused Components
- [ ] `src/components/AppFrame.js` - Replaced by Layout.js
- [ ] `src/Home.js` - Replaced by pages/HomePage.js
- [ ] `src/apps/recipes/components/TestNewRecipeForm.js` - Test component

### 2. Backup Files
- [ ] `src/apps/recipes/components/RecipeAIChat.js.backup`

### 3. Root Directory Test Files (36 files)
- [ ] `test-ai-ingredient-parsing.js`
- [ ] `test-chat-history-persistence.js`
- [ ] `test-chat-ux-final.js`
- [ ] `test-constructor-fix.js`
- [ ] `test-convert.js`
- [ ] `test-enhanced-chat-ux.js`
- [ ] `test-final-validation.js`
- [ ] `test-format-detection.js`
- [ ] `test-german-chocolate-cake.js`
- [ ] `test-grouped-ingredient-tables.js`
- [ ] `test-grouped-ingredients.js`
- [ ] `test-ingredient-parser.js`
- [ ] `test-ingredient-safety.js`
- [ ] `test-json-extraction.js`
- [ ] `test-json-only-approach.js`
- [ ] `test-json-recipe.js`
- [ ] `test-json-recognition.js`
- [ ] `test-json-suggestions-detection.js`
- [ ] `test-labels-simple.js`
- [ ] `test-modal-title.js`
- [ ] `test-multiline-parsing.js`
- [ ] `test-parsing-comprehensive.js`
- [ ] `test-provider-labels.js`
- [ ] `test-quantity-fixes.js`
- [ ] `test-quantity-handling.js`
- [ ] `test-react-crash-debug.js`
- [ ] `test-react-crash-fix.js`
- [ ] `test-recipe-detection.js`
- [ ] `test-recipe-parsing.js`
- [ ] `test-specific-scenario.js`
- [ ] `test-suggestions-no-tags.js`
- [ ] `test-suggestions-ux-flow.js`
- [ ] `test-title-preservation.js`
- [ ] `test-transpose.js`
- [ ] `test-two-app-architecture.js`
- [ ] `test-worker-json.js`

### 4. Development Summary Files
- [ ] `chat-history-implementation-summary.js`
- [ ] `recipe-ai-chat-refactoring-summary.js`
- [ ] `recipe-detail-fix-summary.js`
- [ ] `json-parsing-improvements-summary.js`
- [ ] `enhanced-debugging-guide.js`
- [ ] `german-chocolate-cake-resolution.js`
- [ ] `complete-inversions.js`
- [ ] `add-inversions.js`
- [ ] `debug-parsing.js`
- [ ] `debug-german-chocolate-final.js`

### 5. Development Documentation (consider keeping or moving to docs/)
- [ ] `AI_CHAT_SETUP.md`
- [ ] `BUNDLE_OPTIMIZATION.md`
- [ ] `DEFENSIVE_PROGRAMMING_SUMMARY.md`
- [ ] `ENHANCED_CHAT_UX_COMPLETE.md`
- [ ] `INGREDIENT_QUANTITY_FIX_SUMMARY.md`
- [ ] `from-scratch-book.md`

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
