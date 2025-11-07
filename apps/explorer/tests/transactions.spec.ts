import { test, expect } from '@playwright/test';

test.describe('Transactions Page', () => {
  test('should display transactions list', async ({ page }) => {
    await page.goto('http://localhost:3002/transactions');

    await page.waitForSelector('[data-testid="transaction-item"], h2:has-text("No transactions")', { timeout: 10000 });

    const txs = await page.locator('[data-testid="transaction-item"]').count();

    if (txs > 0) {
      expect(txs).toBeGreaterThan(0);
      expect(txs).toBeLessThanOrEqual(20); // Default page size
    }
  });

  test('should display transaction information', async ({ page }) => {
    await page.goto('http://localhost:3002/transactions');

    await page.waitForLoadState('networkidle');

    const txs = await page.locator('[data-testid="transaction-item"]').count();

    if (txs > 0) {
      const firstTx = page.locator('[data-testid="transaction-item"]').first();

      // Check transaction hash
      await expect(firstTx.locator('[data-testid="tx-hash"]')).toBeVisible();

      // Check from/to addresses
      const from = firstTx.locator('[data-testid="tx-from"]');
      const to = firstTx.locator('[data-testid="tx-to"]');

      if (await from.count() > 0) {
        await expect(from).toBeVisible();
      }
      if (await to.count() > 0) {
        await expect(to).toBeVisible();
      }
    }
  });

  test('should format NOR amounts correctly', async ({ page }) => {
    await page.goto('http://localhost:3002/transactions');

    await page.waitForLoadState('networkidle');

    const txs = await page.locator('[data-testid="transaction-item"]').count();

    if (txs > 0) {
      const amount = page.locator('[data-testid="tx-amount"]').first();

      if (await amount.count() > 0) {
        const amountText = await amount.textContent();

        // Should include NOR
        expect(amountText).toMatch(/NOR/i);

        // Should be a number
        expect(amountText).toMatch(/\d+/);
      }
    }
  });

  test('should navigate to transaction details', async ({ page }) => {
    await page.goto('http://localhost:3002/transactions');

    await page.waitForLoadState('networkidle');

    const txs = await page.locator('[data-testid="transaction-item"]').count();

    if (txs > 0) {
      await page.click('[data-testid="transaction-item"]').first();

      // Should navigate to transaction details
      await expect(page).toHaveURL(/.*transactions\/\w+/);
      await expect(page.locator('h1')).toContainText(/Transaction|Tx/i);
    }
  });

  test('should show transaction details', async ({ page }) => {
    await page.goto('http://localhost:3002/transactions');

    await page.waitForLoadState('networkidle');

    const txs = await page.locator('[data-testid="transaction-item"]').count();

    if (txs > 0) {
      await page.click('[data-testid="transaction-item"]').first();

      // Check details are displayed
      await expect(page.locator('[data-testid="tx-hash"]')).toBeVisible();
      await expect(page.locator('[data-testid="tx-block"], [data-testid="tx-block-height"]')).toBeVisible();
    }
  });

  test('should display transaction status', async ({ page }) => {
    await page.goto('http://localhost:3002/transactions');

    await page.waitForLoadState('networkidle');

    const txs = await page.locator('[data-testid="transaction-item"]').count();

    if (txs > 0) {
      const status = page.locator('[data-testid="tx-status"]').first();

      if (await status.count() > 0) {
        await expect(status).toBeVisible();

        const statusText = await status.textContent();
        expect(statusText).toMatch(/(success|failed|pending)/i);
      }
    }
  });
});
