import { test, expect } from '@playwright/test'

test.describe('NorStudio IDE', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should load homepage', async ({ page }) => {
    await expect(page).toHaveTitle(/NorStudio/i)
    await expect(page.getByText(/smart contract IDE/i)).toBeVisible()
  })

  test('should navigate to IDE workspace', async ({ page }) => {
    // Click on "Get Started" or similar button
    const getStartedButton = page.getByRole('link', { name: /get started|open project/i }).first()
    await getStartedButton.click()
    
    // Should be on IDE page
    await expect(page).toHaveURL(/\/studio\//)
    
    // Should see IDE components
    await expect(page.getByText(/file/i)).toBeVisible()
    await expect(page.getByText(/compile/i)).toBeVisible()
  })

  test('should display file tree', async ({ page }) => {
    await page.goto('/studio/test-project')
    
    // Should see file tree
    const fileTree = page.getByRole('region', { name: /file explorer|files/i }).first()
    await expect(fileTree).toBeVisible()
  })

  test('should show API status indicator', async ({ page }) => {
    await page.goto('/studio/test-project')
    
    // Should see API status (Online/Offline)
    const apiStatus = page.getByText(/online|offline|checking/i).first()
    await expect(apiStatus).toBeVisible({ timeout: 10000 })
  })

  test('should toggle theme', async ({ page }) => {
    await page.goto('/studio/test-project')
    
    // Find and click theme toggle
    const themeToggle = page.getByRole('button', { name: /toggle theme/i })
    await expect(themeToggle).toBeVisible()
    
    await themeToggle.click()
    
    // Theme should change (check for light/dark mode indicators)
    await page.waitForTimeout(500)
  })

  test('should open settings', async ({ page }) => {
    await page.goto('/studio/test-project')
    
    // Look for settings button or tab
    const settingsButton = page.getByRole('button', { name: /settings/i }).first()
    await settingsButton.click()
    
    // Settings panel should be visible
    await expect(page.getByText(/editor settings|font size|tab size/i)).toBeVisible()
  })

  test('should display console panel', async ({ page }) => {
    await page.goto('/studio/test-project')
    
    // Console should be visible
    const console = page.getByRole('region', { name: /console|output/i }).first()
    await expect(console).toBeVisible()
  })

  test('should show wallet connect button', async ({ page }) => {
    await page.goto('/studio/test-project')
    
    // Wallet connect should be visible
    const walletButton = page.getByRole('button', { name: /connect wallet/i }).or(
      page.getByText(/wallet/i)
    ).first()
    await expect(walletButton).toBeVisible()
  })

  test('should display compiler tab', async ({ page }) => {
    await page.goto('/studio/test-project')
    
    // Find compiler tab
    const compilerTab = page.getByRole('tab', { name: /compiler/i }).or(
      page.getByText(/compiler/i)
    ).first()
    await compilerTab.click()
    
    // Compiler options should be visible
    await expect(page.getByText(/compiler version|optimization/i)).toBeVisible()
  })

  test('should show AI assistant tab', async ({ page }) => {
    await page.goto('/studio/test-project')
    
    // Find AI tab
    const aiTab = page.getByRole('tab', { name: /ai assistant|ai/i }).or(
      page.getByText(/ai assistant/i)
    ).first()
    await aiTab.click()
    
    // AI interface should be visible
    await expect(page.getByPlaceholder(/ask|question|message/i)).toBeVisible()
  })
})
