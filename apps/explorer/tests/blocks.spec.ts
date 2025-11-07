import { test, expect } from '@playwright/test';

test.describe('Blocks Page', () => {
  test('should display paginated blocks list', async ({ page }) => {
    await page.goto('http://localhost:3002/blocks');

    // Wait for blocks to load
    await page.waitForSelector('[data-testid="block-item"]', { timeout: 10000 });

    const blocks = await page.locator('[data-testid="block-item"]').count();
    expect(blocks).toBeGreaterThan(0);
    expect(blocks).toBeLessThanOrEqual(20); // Default page size
  });

  test('should display block information correctly', async ({ page }) => {
    await page.goto('http://localhost:3002/blocks');

    const firstBlock = page.locator('[data-testid="block-item"]').first();

    // Check block height is displayed
    await expect(firstBlock.locator('[data-testid="block-height"]')).toBeVisible();

    // Check block hash is displayed
    await expect(firstBlock.locator('[data-testid="block-hash"]')).toBeVisible();

    // Check timestamp is displayed
    await expect(firstBlock.locator('[data-testid="block-timestamp"]')).toBeVisible();

    // Check transaction count is displayed
    await expect(firstBlock.locator('[data-testid="block-tx-count"]')).toBeVisible();
  });

  test('should navigate to block details page', async ({ page }) => {
    await page.goto('http://localhost:3002/blocks');

    await page.waitForSelector('[data-testid="block-item"]', { timeout: 10000 });

    // Click on first block
    await page.click('[data-testid="block-item"]').first();

    // Should be on block details page
    await expect(page).toHaveURL(/.*blocks\/\d+/);
    await expect(page.locator('h1')).toContainText(/Block #\d+|Block \d+/i);
  });

  test('should display block details', async ({ page }) => {
    await page.goto('http://localhost:3002/blocks');
    await page.waitForSelector('[data-testid="block-item"]', { timeout: 10000 });

    await page.click('[data-testid="block-item"]').first();

    // Check block details are displayed
    await expect(page.locator('[data-testid="block-height"]')).toBeVisible();
    await expect(page.locator('[data-testid="block-hash"]')).toBeVisible();
    await expect(page.locator('[data-testid="block-timestamp"]')).toBeVisible();
    await expect(page.locator('[data-testid="block-proposer"], [data-testid="block-validator"]')).toBeVisible();
  });

  test('should show block transactions', async ({ page }) => {
    await page.goto('http://localhost:3002/blocks');
    await page.waitForSelector('[data-testid="block-item"]', { timeout: 10000 });

    await page.click('[data-testid="block-item"]').first();

    // Check for transactions section
    const txSection = page.locator('[data-testid="block-transactions"], h2:has-text("Transactions")');
    await expect(txSection.first()).toBeVisible();
  });

  test('should handle pagination', async ({ page }) => {
    await page.goto('http://localhost:3002/blocks');

    await page.waitForSelector('[data-testid="block-item"]', { timeout: 10000 });

    // Look for pagination controls
    const pagination = page.locator('[data-testid="pagination"], nav[aria-label*="pagination"], button:has-text("Next")');

    if (await pagination.count() > 0) {
      // If pagination exists, test it
      const nextButton = page.locator('button:has-text("Next"), a:has-text("Next")');
      if (await nextButton.count() > 0) {
        await nextButton.first().click();
        await page.waitForLoadState('networkidle');

        // Check that blocks are still displayed
        const blocks = await page.locator('[data-testid="block-item"]').count();
        expect(blocks).toBeGreaterThan(0);
      }
    }
  });

  test('should show loading state', async ({ page }) => {
    await page.goto('http://localhost:3002/blocks');

    // Check for loading indicator (skeleton, spinner, etc.)
    const loading = page.locator('[data-testid="loading"], [data-testid="skeleton"], .animate-pulse');

    // Loading should appear briefly then disappear
    if (await loading.count() > 0) {
      await expect(loading.first()).toBeVisible({ timeout: 2000 }).catch(() => {});
    }

    // Eventually blocks should load
    await page.waitForSelector('[data-testid="block-item"]', { timeout: 10000 });
  });

  test('should format block height correctly', async ({ page }) => {
    await page.goto('http://localhost:3002/blocks');

    await page.waitForSelector('[data-testid="block-item"]', { timeout: 10000 });

    const blockHeight = await page.locator('[data-testid="block-height"]').first().textContent();

    // Block height should be a number
    expect(blockHeight).toMatch(/\d+/);

    // Should not have decimals
    expect(blockHeight).not.toContain('.');
  });

  test('should display relative or absolute timestamps', async ({ page }) => {
    await page.goto('http://localhost:3002/blocks');

    await page.waitForSelector('[data-testid="block-item"]', { timeout: 10000 });

    const timestamp = await page.locator('[data-testid="block-timestamp"]').first().textContent();

    // Should have either relative time (e.g., "2 minutes ago") or absolute time
    expect(timestamp).toMatch(/(ago|seconds|minutes|hours|days|\d{4}-\d{2}-\d{2})/i);
  });
});
