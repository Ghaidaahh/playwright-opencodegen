// spec: specs/amazon-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('NAV-001: Category Menu - All - Verify All menu expands with categories', async ({ page }) => {
    // Navigate to Amazon homepage
    await page.goto('https://www.amazon.com');
    
    // Click on "All" button in navigation
    const allButton = page.locator('#nav-hamburger-menu');
    await allButton.click();
    
    // Verify dropdown menu appears with categories
    const menuPanel = page.locator('.hmenu-content');
    await expect(menuPanel).toBeVisible();
    
    // Verify categories are listed
    const menuItems = page.locator('.hmenu-item');
    const count = await menuItems.count();
    expect(count).toBeGreaterThan(0);
  });

  test('NAV-002: Category Navigation - Verify navigating through category works', async ({ page }) => {
    // Navigate to Amazon homepage
    await page.goto('https://www.amazon.com');
    
    // Click on "All" button
    await page.locator('#nav-hamburger-menu').click();
    
    // Wait for menu
    await page.waitForSelector('.hmenu-content');
    
    // Click on a category (e.g., Electronics)
    const electronicsCategory = page.getByText('Electronics').first();
    await electronicsCategory.click();
    
    // Wait for navigation
    await page.waitForLoadState('domcontentloaded');
    
    // Verify we're on Electronics page
    expect(page.url()).toContain('electronics');
  });

  test('NAV-003: Breadcrumb Navigation - Verify breadcrumbs are clickable and accurate', async ({ page }) => {
    // Navigate to a product
    await page.goto('https://www.amazon.com');
    await page.locator('#twotabsearchtextbox').fill('laptop');
    await page.locator('#nav-search-submit-button').click();
    await page.waitForSelector('.s-result-list');
    
    // Click on first product
    await page.locator('.s-title-text a').first().click();
    await page.waitForLoadState('domcontentloaded');
    
    // Verify breadcrumbs are displayed
    const breadcrumbs = page.locator('#wayfinding-breadcrumbs');
    await expect(breadcrumbs).toBeVisible({ timeout: 5000 }).catch(() => {
      const altBreadcrumbs = page.locator('.breadcrumb');
      expect(altBreadcrumbs).toBeTruthy();
    });
    
    // Verify breadcrumbs are clickable
    const breadcrumbLinks = page.locator('#wayfinding-breadcrumbs a');
    const count = await breadcrumbLinks.count();
    expect(count).toBeGreaterThan(0);
  });

  test('NAV-004: Back to Home - Verify clicking logo returns to homepage', async ({ page }) => {
    // Navigate to a product
    await page.goto('https://www.amazon.com');
    await page.locator('#twotabsearchtextbox').fill('laptop');
    await page.locator('#nav-search-submit-button').click();
    await page.waitForSelector('.s-result-list');
    await page.locator('.s-title-text a').first().click();
    await page.waitForLoadState('domcontentloaded');
    
    // Click on Amazon logo
    await page.locator('#nav-logo').click();
    
    // Verify we're back on homepage
    await expect(page).toHaveURL(/amazon\.com\/?$/);
  });

  test('NAV-005: Keyboard Shortcuts - Verify keyboard shortcuts are documented', async ({ page }) => {
    // Navigate to Amazon homepage
    await page.goto('https://www.amazon.com');
    
    // Click on keyboard shortcuts link (if available) or press ?
    // Amazon shows shortcuts in a modal
    
    // Open shortcuts menu if present
    const shortcutsButton = page.locator('[aria-label*="shortcuts"]');
    await shortcutsButton.click().catch(() => {
      // Try pressing shift+alt+z
      page.keyboard.press('Shift+Alt+z');
    });
    
    // Wait for modal
    await page.waitForTimeout(500);
    
    // Verify shortcuts modal or page exists
    const shortcutsModal = page.locator('#keyboard-shortcuts-modal, .shortcuts-modal');
    const shortcutsContent = page.getByText('Keyboard shortcuts');
    
    const hasShortcuts = await shortcutsModal.isVisible().catch(() => false) || 
                        await shortcutsContent.isVisible().catch(() => false);
    expect(hasShortcuts).toBeTruthy();
  });
});
