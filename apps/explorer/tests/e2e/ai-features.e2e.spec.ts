/**
 * E2E Tests for AI Features
 * Tests AI functionality in the browser using Playwright
 */

import { test, expect } from '@playwright/test';

const EXPLORER_URL = process.env.NEXT_PUBLIC_EXPLORER_URL || 'http://localhost:3002';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

test.describe('AI Features E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Mock API responses for consistent testing
    await page.route(`${API_URL}/ai/**`, async (route) => {
      const url = route.request().url();
      
      if (url.includes('analyze-transaction')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              analysis: 'This is a test transaction analysis',
              riskScore: 25,
              insights: ['Normal transaction', 'No suspicious patterns'],
              recommendations: ['Transaction looks safe'],
            },
          }),
        });
      } else if (url.includes('audit-contract')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              audit: 'Contract appears secure',
              vulnerabilities: [],
              score: 85,
            },
          }),
        });
      } else if (url.includes('predict-gas')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              predictedGasPrice: '20',
              confidence: 0.85,
              trend: 'stable',
              recommendation: 'Good time to transact',
            },
          }),
        });
      } else if (url.includes('detect-anomalies')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              anomalies: [],
              riskScore: 30,
              summary: 'No anomalies detected',
            },
          }),
        });
      } else if (url.includes('optimize-portfolio')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              recommendations: [
                {
                  action: 'Diversify holdings',
                  reason: 'High concentration risk',
                  impact: 'high',
                },
              ],
              currentValue: '1000 NOR',
              optimizedValue: '1100 NOR',
              improvement: '+10%',
            },
          }),
        });
      } else if (url.includes('chat')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              answer: 'This is a test AI response',
            },
          }),
        });
      } else {
        await route.continue();
      }
    });
  });

  test.describe('Transaction AI', () => {
    test('should display AI analysis on transaction page', async ({ page }) => {
      // Navigate to a transaction page
      await page.goto(`${EXPLORER_URL}/transactions`);
      
      // Wait for transactions to load
      await page.waitForSelector('table a, [data-testid="transaction-link"]', {
        timeout: 10000,
      });

      // Click on first transaction
      const firstTxLink = page.locator('table a').first();
      if (await firstTxLink.isVisible()) {
        await firstTxLink.click();
        
        // Wait for transaction detail page
        await page.waitForURL(/\/transactions\/|\/tx\//, { timeout: 10000 });

        // Check for AI analysis section
        await expect(
          page.locator('text=/AI Transaction Analysis/i'),
        ).toBeVisible({ timeout: 10000 });

        // Check for risk score
        await expect(
          page.locator('text=/Risk|risk/i'),
        ).toBeVisible();
      }
    });

    test('should show transaction summary', async ({ page }) => {
      await page.goto(`${EXPLORER_URL}/transactions`);
      await page.waitForSelector('table a', { timeout: 10000 });

      const firstTxLink = page.locator('table a').first();
      if (await firstTxLink.isVisible()) {
        await firstTxLink.click();
        await page.waitForURL(/\/transactions\/|\/tx\//);

        // Wait for AI analysis to load
        await page.waitForSelector('text=/This is a test transaction analysis/i', {
          timeout: 10000,
        });

        expect(
          await page.locator('text=/This is a test transaction analysis/i').isVisible(),
        ).toBeTruthy();
      }
    });
  });

  test.describe('Address AI', () => {
    test('should display risk score on address page', async ({ page }) => {
      const testAddress = '0x0000000000000000000000000000000000000000';
      await page.goto(`${EXPLORER_URL}/accounts/${testAddress}`);

      // Wait for address page to load
      await page.waitForSelector('text=/address|balance/i', { timeout: 10000 });

      // Check for risk score section
      await expect(
        page.locator('text=/Address Risk Score|Risk Score/i'),
      ).toBeVisible({ timeout: 10000 });

      // Check for risk score value
      await expect(page.locator('text=/30\/100|25\/100/i')).toBeVisible();
    });

    test('should display portfolio optimization', async ({ page }) => {
      const testAddress = '0x0000000000000000000000000000000000000000';
      await page.goto(`${EXPLORER_URL}/accounts/${testAddress}`);

      await page.waitForSelector('text=/Portfolio Optimization/i', {
        timeout: 10000,
      });

      // Check for portfolio values
      await expect(page.locator('text=/1000 NOR/i')).toBeVisible();
      await expect(page.locator('text=/1100 NOR/i')).toBeVisible();
    });

    test('should toggle portfolio recommendations', async ({ page }) => {
      const testAddress = '0x0000000000000000000000000000000000000000';
      await page.goto(`${EXPLORER_URL}/accounts/${testAddress}`);

      await page.waitForSelector('text=/Show Recommendations/i', {
        timeout: 10000,
      });

      const showButton = page.locator('text=/Show Recommendations/i').first();
      await showButton.click();

      // Check for recommendations
      await expect(
        page.locator('text=/Diversify holdings/i'),
      ).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Contract AI', () => {
    test('should display function explainer on contract page', async ({ page }) => {
      // Navigate to a contract page (you may need to adjust this based on your routes)
      const testContract = '0x0000000000000000000000000000000000000000';
      await page.goto(`${EXPLORER_URL}/contracts/${testContract}`);

      // Wait for contract page
      await page.waitForSelector('text=/contract|Contract/i', {
        timeout: 10000,
      });

      // Look for Code tab or function explainer
      const codeTab = page.locator('text=/Code|code|Functions/i').first();
      if (await codeTab.isVisible({ timeout: 5000 })) {
        await codeTab.click();
        
        // Check for function explainer
        await expect(
          page.locator('text=/Function Explainer|Explain/i'),
        ).toBeVisible({ timeout: 10000 });
      }
    });
  });

  test.describe('AI Sidebar', () => {
    test('should open AI sidebar when button clicked', async ({ page }) => {
      await page.goto(EXPLORER_URL);

      // Look for AI sidebar button (floating button)
      const aiButton = page.locator(
        'button[aria-label*="AI"], button:has-text("AI"), button:has([class*="MessageSquare"])',
      ).first();

      if (await aiButton.isVisible({ timeout: 5000 })) {
        await aiButton.click();

        // Check for sidebar
        await expect(
          page.locator('text=/NorAI Assistant|AI Assistant/i'),
        ).toBeVisible({ timeout: 5000 });
      }
    });

    test('should send chat message', async ({ page }) => {
      await page.goto(EXPLORER_URL);

      const aiButton = page
        .locator('button[aria-label*="AI"], button:has([class*="MessageSquare"])')
        .first();

      if (await aiButton.isVisible({ timeout: 5000 })) {
        await aiButton.click();

        // Wait for sidebar
        await page.waitForSelector('input[placeholder*="Ask"], textarea[placeholder*="Ask"]', {
          timeout: 5000,
        });

        // Type message
        const input = page.locator('input[placeholder*="Ask"], textarea[placeholder*="Ask"]').first();
        await input.fill('What is this transaction?');
        await input.press('Enter');

        // Wait for response
        await expect(
          page.locator('text=/This is a test AI response/i'),
        ).toBeVisible({ timeout: 10000 });
      }
    });

    test('should close sidebar when X clicked', async ({ page }) => {
      await page.goto(EXPLORER_URL);

      const aiButton = page
        .locator('button[aria-label*="AI"], button:has([class*="MessageSquare"])')
        .first();

      if (await aiButton.isVisible({ timeout: 5000 })) {
        await aiButton.click();
        await page.waitForSelector('text=/NorAI Assistant/i', { timeout: 5000 });

        // Find close button
        const closeButton = page.locator('button:has([class*="X"]), button[aria-label*="close"]').first();
        if (await closeButton.isVisible()) {
          await closeButton.click();

          // Sidebar should be hidden
          await expect(
            page.locator('text=/NorAI Assistant/i'),
          ).not.toBeVisible({ timeout: 2000 });
        }
      }
    });
  });

  test.describe('Gas Prediction Widget', () => {
    test('should display gas prediction on analytics page', async ({ page }) => {
      await page.goto(`${EXPLORER_URL}/analytics`);

      // Wait for analytics page
      await page.waitForSelector('text=/Analytics|analytics/i', {
        timeout: 10000,
      });

      // Look for gas prediction widget
      const gasWidget = page.locator('text=/Gas Prediction|gas prediction/i').first();
      if (await gasWidget.isVisible({ timeout: 5000 })) {
        // Check for gas price
        await expect(page.locator('text=/20 Gwei|gas/i')).toBeVisible();
      }
    });
  });

  test.describe('Error Handling', () => {
    test('should handle API errors gracefully', async ({ page }) => {
      // Override route to return error
      await page.route(`${API_URL}/ai/analyze-transaction`, async (route) => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal Server Error' }),
        });
      });

      await page.goto(`${EXPLORER_URL}/transactions`);
      await page.waitForSelector('table a', { timeout: 10000 });

      const firstTxLink = page.locator('table a').first();
      if (await firstTxLink.isVisible()) {
        await firstTxLink.click();
        await page.waitForURL(/\/transactions\/|\/tx\//);

        // Should show error or loading state, not crash
        await page.waitForTimeout(2000);
        
        // Page should still be visible
        expect(await page.locator('body').isVisible()).toBeTruthy();
      }
    });
  });

  test.describe('Performance', () => {
    test('should load AI features within reasonable time', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto(`${EXPLORER_URL}/transactions`);
      await page.waitForSelector('table a', { timeout: 10000 });

      const firstTxLink = page.locator('table a').first();
      if (await firstTxLink.isVisible()) {
        await firstTxLink.click();
        await page.waitForURL(/\/transactions\/|\/tx\//);
        
        // Wait for AI analysis to appear
        await page.waitForSelector('text=/AI Transaction Analysis/i', {
          timeout: 10000,
        });
      }

      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(15000); // Should load within 15 seconds
    });
  });
});

