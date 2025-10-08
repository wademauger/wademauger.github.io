# 🧶 Knitting App — Copilot Testing Instructions

## Overview

This project is a **React + Redux web application** for generating interactive knitting patterns.

Users can:
1. Design **panel shapes** in the Shape Editor.
2. Create **colorwork patterns** in the Colorwork Editor.
3. Combine them into **garment plans** in the Garment Plan Editor.

All user data is persisted to Google Drive as a single JSON blob (`library.json`) with this structure:

```json
{
  "panels": [ ... ],
  "colorworkPatterns": [ ... ],
  "garmentPlans": [ ... ]
}
```

Each garment plan references one or more panels and colorwork patterns by ID.

---

## Testing Architecture

We use **three levels of testing** to ensure correctness, stability, and a smooth end-to-end user experience.

| Layer | Purpose | Tools |
|-------|----------|--------|
| **Unit Tests** | Test pure logic, reducers, and utilities | Jest |
| **Integration Tests** | Test React components interacting with Redux and context | Jest + React Testing Library |
| **E2E Tests** | Simulate user workflows through the full app | Playwright |

---

## 1️⃣ Unit Tests

**Goal:** Validate core logic (reducers, utilities, hooks).

**Tools:** Jest

**Guidelines:**
- Keep tests fast and isolated.
- Avoid DOM or network calls.
- Use descriptive test names and multiple edge cases.

**Copilot prompts:**
> Write Jest tests for `panelReducer` verifying `addPanel`, `updatePanel`, and `deletePanel` actions.

> Generate Jest unit tests for `shapeUtils.ts` that handle edge cases like negative dimensions or uneven stitch counts.

**Example Test:**
```ts
import { panelReducer, addPanel } from '../reducers/panelReducer';

test('adds a new panel to state', () => {
  const initialState = { panels: [] };
  const newState = panelReducer(initialState, addPanel({ id: '1', name: 'Front', width: 40 }));
  expect(newState.panels).toHaveLength(1);
  expect(newState.panels[0].name).toBe('Front');
});
```

---

## 2️⃣ Integration Tests

**Goal:** Verify that React components correctly connect to Redux and render expected outputs.

**Tools:** Jest + React Testing Library

**Guidelines:**
- Render components within a `<Provider>` and mock store.
- Use `screen.getByText`, `fireEvent`, or `userEvent` for realistic interaction.
- Mock Drive API calls.

**Mock Example:**
```ts
export const mockDriveClient = {
  loadLibrary: jest.fn(() => Promise.resolve(mockLibraryJson)),
  saveLibrary: jest.fn(() => Promise.resolve()),
};
```

Inject via Redux middleware:
```ts
configureStore({
  reducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: { extraArgument: { driveClient: mockDriveClient } },
    }),
});
```

**Copilot prompts:**
> Write a React Testing Library test for `<GarmentPlanEditor />` that renders with a mock store containing one panel and one colorwork pattern, and verifies both are listed.

> Generate integration tests for `<ColorworkEditor />` verifying that changing colors updates the preview grid.

**Example Test:**
```tsx
render(
  <Provider store={storeWithMockLibrary}>
    <GarmentPlanEditor />
  </Provider>
);
expect(screen.getByText('Front Panel')).toBeInTheDocument();
```

---

## 3️⃣ End-to-End (E2E) Tests

**Goal:** Confirm that a real user can perform the full workflow.

**Tools:** Playwright

**Why Playwright:** It’s faster, more reliable, and easier to maintain than Selenium for modern React SPAs.

**Workflow to cover:**
1. Log in (mock or use Playwright’s storageState).
2. Create a new shape and save it.
3. Create a colorwork pattern.
4. Combine both into a garment plan.
5. Verify the combined pattern renders.

**Copilot prompts:**
> Write a Playwright test that logs in, creates a new shape called “Front,” saves it, and confirms it appears in the Garment Plan list.

> Generate a Playwright E2E test that covers creating a shape, creating a colorwork pattern, linking them in a garment plan, and verifying their combined rendering.

**Example Test:**
```ts
test('user can create and link shape to garment plan', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.click('text=Sign in');
  await page.click('text=New Shape');
  await page.fill('input[name="name"]', 'Front');
  await page.click('text=Save');
  await page.click('text=Garment Plan');
  await expect(page.locator('text=Front Panel')).toBeVisible();
});
```

---

## 4️⃣ Mocking the Data Layer

Use **MSW (Mock Service Worker)** or a simple `driveClientMock` to isolate Google Drive behavior.

Never hit live APIs in tests.

**Mock Data Example:**
```ts
export const mockLibraryJson = {
  panels: [{ id: 'panel1', name: 'Front' }],
  colorworkPatterns: [{ id: 'color1', name: 'Checkerboard' }],
  garmentPlans: [],
};
```

---

## 📁 Recommended Folder Structure

```
src/
  __tests__/
    unit/
      panelsReducer.test.ts
      colorworkUtils.test.ts
    integration/
      GarmentPlanEditor.test.tsx
      ColorworkEditor.test.tsx
  e2e/
    createShape.spec.ts
    fullWorkflow.spec.ts
  mocks/
    mockDriveClient.ts
    mockLibraryJson.ts
```

---

## 🧩 Copilot Test Generation Style

When Copilot generates tests:
- Use clear names: `it('should add a new panel to state')`
- Prefer `await` for async code
- Include both happy and error paths
- Avoid unnecessary mocks or complexity
- Generate at least **3 test cases per reducer or component**

Copilot should infer expected behavior from:
- Function and prop names
- Reducer actions
- UI labels and DOM text

---

## ⚙️ Testing Cadence (Recommended)

| Frequency | Type | Purpose |
|------------|------|----------|
| Every commit | Unit + Integration | Fast CI feedback |
| Nightly | E2E | Workflow regression |
| Pre-release | Manual visual review | UX sanity check |

---

## 🚀 Example Usage in VS Code

In any test file, add a comment prompt to guide Copilot:

```ts
// Copilot: generate Jest tests for the garmentPlanReducer covering add, remove, and update actions
```

or

```ts
// Copilot: write a Playwright test that simulates a user creating a shape, a colorwork pattern, and linking them into a garment plan
```

Press **⌘+Enter (Mac)** or **Ctrl+Enter (Win)** to trigger Copilot inline suggestions.

---

## 🧵 Summary

**Copilot’s job** is to:
- Generate unit, integration, and E2E tests.
- Use mocks for Google Drive.
- Ensure every core editor (shape, colorwork, garment plan) has coverage.
- Validate that end-to-end user workflows remain functional and consistent.

**You** provide context via file names and comments.
**Copilot** writes clean, reliable, behavior-driven test cases.

---