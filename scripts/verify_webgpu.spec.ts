import { test, expect } from '@playwright/test';

test('verify 3d background rendering with webgpu', async ({ page }) => {
  // Set a large viewport
  await page.setViewportSize({ width: 1280, height: 800 });

  // Navigate to the homepage (check port from dev_server.log)
  await page.goto('http://localhost:3001');

  // Wait for the relief-slab to be visible
  const reliefSlab = page.locator('.relief-slab');
  await expect(reliefSlab).toBeVisible();

  // Wait for some time to let the 3D scene initialize and render
  await page.waitForTimeout(5000);

  // Take a screenshot of the whole page
  await page.screenshot({ path: 'verification/webgpu_relief_slab_dark.png', fullPage: true });
});
