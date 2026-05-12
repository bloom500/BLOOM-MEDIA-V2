import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });

  try {
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle' });

    // Wait for the relief slab to be visible
    await page.waitForSelector('.relief-slab', { state: 'visible', timeout: 30000 });

    // Wait a bit for animations/rendering
    await page.waitForTimeout(5000);

    const screenshotPath = path.join(__dirname, 'dark_luxury_verified.png');
    console.log(`Taking screenshot to: ${screenshotPath}`);

    // Take a full page screenshot
    await page.screenshot({ path: screenshotPath, fullPage: true });

    console.log('Screenshot taken successfully.');
  } catch (error) {
    console.error('Error during verification:', error);
  } finally {
    await browser.close();
  }
})();
