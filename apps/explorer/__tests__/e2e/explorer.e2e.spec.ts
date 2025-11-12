/**
 * Explorer E2E Tests
 * Tests the Explorer frontend integration with the API
 */

import { test, expect } from '@playwright/test';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
const EXPLORER_URL = process.env.NEXT_PUBLIC_EXPLORER_URL || 'http://localhost:4002';

test.describe('Explorer E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to Explorer homepage
    await page.goto(EXPLORER_URL);
  });

  test.describe('Homepage', () => {
    test('should load homepage successfully', async ({ page }) => {
      await expect(page).toHaveTitle(/NorChain Explorer/i);
      await expect(page.locator('h1')).toBeVisible();
    });

    test('should display network statistics', async ({ page }) => {
      // Wait for stats to load
      await page.waitForSelector('[data-testid="network-stats"], .stats-card, h1', { timeout: 10000 });
      
      // Check for stats cards or network information
      const statsVisible = await page.locator('text=/blocks|transactions|accounts/i').first().isVisible();
      expect(statsVisible).toBeTruthy();
    });

    test('should display latest blocks', async ({ page }) => {
      // Wait for blocks to load
      await page.waitForSelector('table, [data-testid="blocks-list"], .block-item', { timeout: 10000 });
      
      // Check if blocks table or list is visible
      const blocksVisible = await page.locator('text=/block|height|hash/i').first().isVisible();
      expect(blocksVisible).toBeTruthy();
    });

    test('should display latest transactions', async ({ page }) => {
      // Wait for transactions to load
      await page.waitForSelector('table, [data-testid="transactions-list"], .transaction-item', { timeout: 10000 });
      
      // Check if transactions are visible
      const transactionsVisible = await page.locator('text=/transaction|hash|from|to/i').first().isVisible();
      expect(transactionsVisible).toBeTruthy();
    });
  });

  test.describe('Navigation', () => {
    test('should navigate to blocks page', async ({ page }) => {
      await page.click('a[href="/blocks"], nav a:has-text("Blocks")');
      await expect(page).toHaveURL(/\/blocks/);
      await expect(page.locator('h1:has-text("Blocks")')).toBeVisible();
    });

    test('should navigate to transactions page', async ({ page }) => {
      await page.click('a[href="/transactions"], nav a:has-text("Transactions")');
      await expect(page).toHaveURL(/\/transactions/);
      await expect(page.locator('h1:has-text("Transactions")')).toBeVisible();
    });

    test('should navigate to accounts page', async ({ page }) => {
      await page.click('a[href="/accounts"], nav a:has-text("Accounts")');
      await expect(page).toHaveURL(/\/accounts/);
      await expect(page.locator('h1:has-text("Accounts")')).toBeVisible();
    });

    test('should navigate to API documentation', async ({ page }) => {
      await page.click('a[href="/api"], nav a:has-text("API")');
      await expect(page).toHaveURL(/\/api/);
      await expect(page.locator('h1:has-text("API")')).toBeVisible();
    });
  });

  test.describe('Blocks Page', () => {
    test('should load blocks page', async ({ page }) => {
      await page.goto(`${EXPLORER_URL}/blocks`);
      await expect(page.locator('h1:has-text("Blocks")')).toBeVisible();
    });

    test('should display blocks table', async ({ page }) => {
      await page.goto(`${EXPLORER_URL}/blocks`);
      await page.waitForSelector('table, [data-testid="blocks-table"]', { timeout: 10000 });
      
      const tableVisible = await page.locator('table').first().isVisible();
      expect(tableVisible).toBeTruthy();
    });

    test('should handle pagination', async ({ page }) => {
      await page.goto(`${EXPLORER_URL}/blocks`);
      
      // Wait for pagination controls
      await page.waitForSelector('a:has-text("Next"), button:has-text("Next")', { timeout: 10000 });
      
      const nextButton = page.locator('a:has-text("Next"), button:has-text("Next")').first();
      if (await nextButton.isVisible()) {
        await nextButton.click();
        await expect(page).toHaveURL(/\/blocks\?page=2/);
      }
    });

    test('should filter blocks', async ({ page }) => {
      await page.goto(`${EXPLORER_URL}/blocks`);
      
      // Wait for filter controls
      await page.waitForSelector('input[placeholder*="filter"], button:has-text("Filter")', { timeout: 5000 });
      
      // Try to interact with filters if available
      const filterInput = page.locator('input[placeholder*="filter"], input[placeholder*="validator"]').first();
      if (await filterInput.isVisible()) {
        await filterInput.fill('test');
        // Wait for filtered results
        await page.waitForTimeout(1000);
      }
    });

    test('should export blocks data', async ({ page }) => {
      await page.goto(`${EXPLORER_URL}/blocks`);
      
      // Wait for export button
      const exportButton = page.locator('button:has-text("Export"), button:has-text("CSV"), button:has-text("JSON")').first();
      if (await exportButton.isVisible({ timeout: 5000 })) {
        // Set up download listener
        const downloadPromise = page.waitForEvent('download');
        await exportButton.click();
        
        // Wait for download (may not always trigger in test)
        try {
          await downloadPromise;
        } catch (e) {
          // Download may not trigger in test environment
        }
      }
    });
  });

  test.describe('Transactions Page', () => {
    test('should load transactions page', async ({ page }) => {
      await page.goto(`${EXPLORER_URL}/transactions`);
      await expect(page.locator('h1:has-text("Transactions")')).toBeVisible();
    });

    test('should display transactions table', async ({ page }) => {
      await page.goto(`${EXPLORER_URL}/transactions`);
      await page.waitForSelector('table, [data-testid="transactions-table"]', { timeout: 10000 });
      
      const tableVisible = await page.locator('table').first().isVisible();
      expect(tableVisible).toBeTruthy();
    });

    test('should navigate to transaction detail', async ({ page }) => {
      await page.goto(`${EXPLORER_URL}/transactions`);
      await page.waitForSelector('table a, [data-testid="transaction-link"]', { timeout: 10000 });
      
      const firstTxLink = page.locator('table a').first();
      if (await firstTxLink.isVisible()) {
        const href = await firstTxLink.getAttribute('href');
        if (href) {
          await firstTxLink.click();
          await expect(page).toHaveURL(/\/transactions\/|\/tx\//);
        }
      }
    });
  });

  test.describe('Search Functionality', () => {
    test('should search for block by height', async ({ page }) => {
      await page.goto(EXPLORER_URL);
      
      // Find search input
      const searchInput = page.locator('input[placeholder*="search"], input[placeholder*="Search"]').first();
      if (await searchInput.isVisible({ timeout: 5000 })) {
        await searchInput.fill('1');
        await searchInput.press('Enter');
        
        // Wait for search results
        await page.waitForTimeout(2000);
        
        // Should navigate to block or show results
        const url = page.url();
        expect(url).toMatch(/\/blocks\/|\/search/);
      }
    });

    test('should search for transaction by hash', async ({ page }) => {
      await page.goto(EXPLORER_URL);
      
      const searchInput = page.locator('input[placeholder*="search"], input[placeholder*="Search"]').first();
      if (await searchInput.isVisible({ timeout: 5000 })) {
        // Use a test hash format
        await searchInput.fill('0x0000000000000000000000000000000000000000000000000000000000000000');
        await searchInput.press('Enter');
        
        await page.waitForTimeout(2000);
        
        const url = page.url();
        expect(url).toMatch(/\/transactions\/|\/tx\/|\/search/);
      }
    });

    test('should search for account by address', async ({ page }) => {
      await page.goto(EXPLORER_URL);
      
      const searchInput = page.locator('input[placeholder*="search"], input[placeholder*="Search"]').first();
      if (await searchInput.isVisible({ timeout: 5000 })) {
        await searchInput.fill('0x0000000000000000000000000000000000000000');
        await searchInput.press('Enter');
        
        await page.waitForTimeout(2000);
        
        const url = page.url();
        expect(url).toMatch(/\/accounts\/|\/address\/|\/search/);
      }
    });
  });

  test.describe('Account Detail Page', () => {
    test('should load account detail page', async ({ page }) => {
      const testAddress = '0x0000000000000000000000000000000000000000';
      await page.goto(`${EXPLORER_URL}/accounts/${testAddress}`);
      
      // Should show account information or error message
      const accountInfo = page.locator('text=/address|balance|transactions/i').first();
      await expect(accountInfo).toBeVisible({ timeout: 10000 });
    });

    test('should display account balance', async ({ page }) => {
      const testAddress = '0x0000000000000000000000000000000000000000';
      await page.goto(`${EXPLORER_URL}/accounts/${testAddress}`);
      
      await page.waitForSelector('text=/balance|NOR|wei/i', { timeout: 10000 });
      const balanceVisible = await page.locator('text=/balance|NOR|wei/i').first().isVisible();
      expect(balanceVisible).toBeTruthy();
    });

    test('should display account transactions', async ({ page }) => {
      const testAddress = '0x0000000000000000000000000000000000000000';
      await page.goto(`${EXPLORER_URL}/accounts/${testAddress}`);
      
      // Look for transactions tab or section
      await page.waitForSelector('text=/transactions|tx/i', { timeout: 10000 });
      const txSectionVisible = await page.locator('text=/transactions|tx/i').first().isVisible();
      expect(txSectionVisible).toBeTruthy();
    });
  });

  test.describe('Mobile Responsiveness', () => {
    test('should be responsive on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE size
      await page.goto(EXPLORER_URL);
      
      // Check if mobile menu is accessible
      const mobileMenuButton = page.locator('button[aria-label*="menu"], button:has-text("Menu")').first();
      const isMobile = await mobileMenuButton.isVisible({ timeout: 2000 });
      
      if (isMobile) {
        await mobileMenuButton.click();
        await expect(page.locator('nav, [role="navigation"]')).toBeVisible();
      }
    });

    test('should display tables correctly on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(`${EXPLORER_URL}/blocks`);
      
      await page.waitForSelector('table, [data-testid="blocks-table"]', { timeout: 10000 });
      
      // Table should be scrollable horizontally on mobile
      const table = page.locator('table').first();
      if (await table.isVisible()) {
        const tableWidth = await table.boundingBox().then(box => box?.width || 0);
        expect(tableWidth).toBeGreaterThan(0);
      }
    });
  });

  test.describe('API Integration', () => {
    test('should fetch stats from API', async ({ request }) => {
      const response = await request.get(`${API_URL}/stats`);
      expect(response.ok()).toBeTruthy();
      
      const data = await response.json();
      expect(data).toHaveProperty('blockHeight');
      expect(data).toHaveProperty('totalTransactions');
      expect(data).toHaveProperty('gasPrice');
    });

    test('should fetch blocks from API', async ({ request }) => {
      const response = await request.get(`${API_URL}/blocks?page=1&per_page=10`);
      expect(response.ok()).toBeTruthy();
      
      const data = await response.json();
      expect(data).toHaveProperty('data');
      expect(Array.isArray(data.data)).toBeTruthy();
    });

    test('should fetch transactions from API', async ({ request }) => {
      const response = await request.get(`${API_URL}/transactions?page=1&limit=10`);
      expect(response.ok()).toBeTruthy();
      
      const data = await response.json();
      expect(data).toHaveProperty('transactions');
      expect(Array.isArray(data.transactions)).toBeTruthy();
    });
  });

  test.describe('Error Handling', () => {
    test('should handle 404 errors gracefully', async ({ page }) => {
      await page.goto(`${EXPLORER_URL}/blocks/999999999`);
      
      // Should show error message or redirect
      const errorMessage = page.locator('text=/not found|404|error/i').first();
      await expect(errorMessage).toBeVisible({ timeout: 5000 });
    });

    test('should handle network errors gracefully', async ({ page }) => {
      // Simulate offline mode
      await page.context().setOffline(true);
      
      await page.goto(EXPLORER_URL);
      
      // Should show error or loading state
      const errorOrLoading = page.locator('text=/error|loading|offline|failed/i').first();
      await expect(errorOrLoading).toBeVisible({ timeout: 5000 });
      
      // Restore online mode
      await page.context().setOffline(false);
    });
  });

  test.describe('Performance', () => {
    test('should load homepage within 3 seconds', async ({ page }) => {
      const startTime = Date.now();
      await page.goto(EXPLORER_URL);
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      expect(loadTime).toBeLessThan(3000);
    });

    test('should load blocks page within 3 seconds', async ({ page }) => {
      const startTime = Date.now();
      await page.goto(`${EXPLORER_URL}/blocks`);
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      expect(loadTime).toBeLessThan(3000);
    });
  });
});

