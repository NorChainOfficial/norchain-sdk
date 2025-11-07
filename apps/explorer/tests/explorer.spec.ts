import { test, expect } from '@playwright/test';

test.describe('Block Explorer - Core Functionality', () => {
  test('should load homepage and display dashboard', async ({ page }) => {
    await page.goto('http://localhost:3002');

    // Check page title
    await expect(page).toHaveTitle(/NorChain/);

    // Check main heading
    const heading = page.locator('h1');
    await expect(heading).toContainText(/NorChain|Dashboard/i);

    // Check stats cards are visible
    const statsCards = page.locator('[data-testid*="stat-"]');
    expect(await statsCards.count()).toBeGreaterThan(0);
  });

  test('should display recent blocks on homepage', async ({ page }) => {
    await page.goto('http://localhost:3002');

    // Wait for blocks to load
    await page.waitForSelector('[data-testid="block-item"]', { timeout: 10000 });

    const blocks = await page.locator('[data-testid="block-item"]').count();
    expect(blocks).toBeGreaterThan(0);
    expect(blocks).toBeLessThanOrEqual(10); // Should show max 10 recent blocks
  });

  test('should display blockchain statistics', async ({ page }) => {
    await page.goto('http://localhost:3002');

    // Check for stat cards
    await expect(page.locator('[data-testid="stat-block-height"]')).toBeVisible();
    await expect(page.locator('[data-testid="stat-total-supply"]')).toBeVisible();
    await expect(page.locator('[data-testid="stat-validators"]')).toBeVisible();

    // Verify stat values are not zero/empty
    const blockHeight = await page.locator('[data-testid="stat-block-height"] >> .text-2xl').textContent();
    expect(blockHeight).toMatch(/\d+/);
  });

  test('should navigate to blocks page', async ({ page }) => {
    await page.goto('http://localhost:3002');

    // Click on "View All Blocks" or blocks navigation link
    await page.click('a[href="/blocks"]');

    await expect(page).toHaveURL(/.*blocks/);
    await expect(page.locator('h1')).toContainText(/Blocks/i);
  });

  test('should navigate to transactions page', async ({ page }) => {
    await page.goto('http://localhost:3002');

    await page.click('a[href="/transactions"]');

    await expect(page).toHaveURL(/.*transactions/);
    await expect(page.locator('h1')).toContainText(/Transactions/i);
  });

  test('should navigate to accounts page', async ({ page }) => {
    await page.goto('http://localhost:3002');

    await page.click('a[href="/accounts"]');

    await expect(page).toHaveURL(/.*accounts/);
    await expect(page.locator('h1')).toContainText(/Accounts/i);
  });

  test('should navigate to validators page', async ({ page }) => {
    await page.goto('http://localhost:3002');

    await page.click('a[href="/validators"]');

    await expect(page).toHaveURL(/.*validators/);
    await expect(page.locator('h1')).toContainText(/Validators/i);
  });

  test('should have working navigation menu', async ({ page }) => {
    await page.goto('http://localhost:3002');

    // Check all nav links are present
    await expect(page.locator('nav >> a[href="/"]')).toBeVisible();
    await expect(page.locator('nav >> a[href="/blocks"]')).toBeVisible();
    await expect(page.locator('nav >> a[href="/transactions"]')).toBeVisible();
    await expect(page.locator('nav >> a[href="/accounts"]')).toBeVisible();
    await expect(page.locator('nav >> a[href="/validators"]')).toBeVisible();
  });

  test('should display logo and branding', async ({ page }) => {
    await page.goto('http://localhost:3002');

    // Check for logo or branding
    const logo = page.locator('[data-testid="logo"], img[alt*="Bitcoin"], img[alt*="logo"]');
    expect(await logo.count()).toBeGreaterThan(0);
  });
});
