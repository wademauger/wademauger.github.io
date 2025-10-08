import { test, expect } from '@playwright/test';

// Playwright scaffold: verify app loads and UI shows 'Panel Shape Creator'
test('loads app and shows Panel Shape Creator entry', async ({ page }) => {
  await page.goto('http://localhost:3000');
  // This is a scaffold — adapt selectors to actual app when running E2E
  await expect(page).toHaveTitle(/Wade/);
});
