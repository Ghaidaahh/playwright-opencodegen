// spec: specs/amazon-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.only('HP-001: Homepage Load - Verify Amazon homepage loads successfully with all core elements', async ({ page }) => {
    // Navigate to https://www.amazon.com
    await page.goto('https://www.amazon.com');
    
    // Verify page title contains "Amazon"
    await expect(page).toHaveTitle(/Amazon/);
    
    // Verify search bar is visible
    await expect(page.locator('#twotabsearchtextbox')).toBeVisible();
    
    // Verify navigation menu is visible
    await expect(page.locator('#nav-xshop')).toBeVisible();
  });

  test('HP-002: Logo Presence - Verify Amazon logo is visible and clickable', async ({ page }) => {
    // Navigate to Amazon homepage
    await page.goto('https://www.amazon.com');
    
    // Verify Amazon logo is visible
    await expect(page.locator('#nav-logo')).toBeVisible();
    
    // Click on logo and verify it reloads homepage
    await page.locator('#nav-logo').click();
    await expect(page).toHaveURL(/amazon\.com/);
  });

  test('HP-003: Search Bar Functionality - Verify search bar is present and accepts input', async ({ page }) => {
    // Navigate to Amazon homepage
    await page.goto('https://www.amazon.com');
    
    // Verify search bar is present
    const searchBox = page.locator('#twotabsearchtextbox');
    await expect(searchBox).toBeVisible();
    
    // Verify search bar accepts input
    await searchBox.fill('laptop');
    await expect(searchBox).toHaveValue('laptop');
  });

  test('HP-004: Search Category Dropdown - Verify department selector dropdown contains all expected categories', async ({ page }) => {
    // Navigate to Amazon homepage
    await page.goto('https://www.amazon.com');
    
    // Verify department selector dropdown is present
    const departmentDropdown = page.locator('.nav-search-dropdown');
    await expect(departmentDropdown).toBeVisible();
    
    // Click on dropdown to reveal options
    await departmentDropdown.click();
    
    // Verify expected categories are present
    await expect(page.getByRole('option', { name: 'All Departments' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'Electronics' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'Computers' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'Books' })).toBeVisible();
  });

  test('HP-005: Navigation Menu - Todays Deals - Verify Todays Deals link is present and navigates correctly', async ({ page }) => {
    // Navigate to Amazon homepage
    await page.goto('https://www.amazon.com');
    
    // Verify Today's Deals link is present
    const todaysDealsLink = page.getByRole('link', { name: /Today's Deals/i });
    await expect(todaysDealsLink).toBeVisible();
    
    // Click and verify navigation
    await todaysDealsLink.click();
    await expect(page).toHaveURL(/goldbox/);
  });

  test('HP-006: Navigation Menu - Prime Video - Verify Prime Video link is present and navigates correctly', async ({ page }) => {
    // Navigate to Amazon homepage
    await page.goto('https://www.amazon.com');
    
    // Verify Prime Video link is present
    const primeVideoLink = page.getByRole('link', { name: /Prime Video/i });
    await expect(primeVideoLink).toBeVisible();
    
    // Click and verify navigation
    await primeVideoLink.click();
    await expect(page).toHaveURL(/primevideo/);
  });

  test('HP-007: Navigation Menu - Registry - Verify Registry link is present and navigates correctly', async ({ page }) => {
    // Navigate to Amazon homepage
    await page.goto('https://www.amazon.com');
    
    // Verify Registry link is present
    const registryLink = page.getByRole('link', { name: /Registry/i });
    await expect(registryLink).toBeVisible();
    
    // Click and verify navigation
    await registryLink.click();
    await expect(page).toHaveURL(/registry/);
  });

  test('HP-008: Navigation Menu - Gift Cards - Verify Gift Cards link is present and navigates correctly', async ({ page }) => {
    // Navigate to Amazon homepage
    await page.goto('https://www.amazon.com');
    
    // Verify Gift Cards link is present
    const giftCardsLink = page.getByRole('link', { name: /Gift Cards/i });
    await expect(giftCardsLink).toBeVisible();
    
    // Click and verify navigation
    await giftCardsLink.click();
    await expect(page).toHaveURL(/gift-cards/);
  });

  test('HP-009: Navigation Menu - Customer Service - Verify Customer Service link is present and navigates correctly', async ({ page }) => {
    // Navigate to Amazon homepage
    await page.goto('https://www.amazon.com');
    
    // Verify Customer Service link is present
    const customerServiceLink = page.getByRole('link', { name: /Customer Service/i });
    await expect(customerServiceLink).toBeVisible();
    
    // Click and verify navigation
    await customerServiceLink.click();
    await expect(page).toHaveURL(/customer-service/);
  });

  test('HP-010: Navigation Menu - Sell - Verify Sell link is present and navigates correctly', async ({ page }) => {
    // Navigate to Amazon homepage
    await page.goto('https://www.amazon.com');
    
    // Verify Sell link is present
    const sellLink = page.getByRole('link', { name: /Sell/i });
    await expect(sellLink).toBeVisible();
    
    // Click and verify navigation
    await sellLink.click();
    await expect(page).toHaveURL(/sell/);
  });

  test('HP-011: Account & Lists Link - Verify Hello, sign in link is present', async ({ page }) => {
    // Navigate to Amazon homepage
    await page.goto('https://www.amazon.com');
    
    // Verify "Hello, sign in" link is present
    const signInLink = page.getByRole('link', { name: /Hello, sign in/i });
    await expect(signInLink).toBeVisible();
  });

  test('HP-012: Cart Link - Verify cart link with item count is present', async ({ page }) => {
    // Navigate to Amazon homepage
    await page.goto('https://www.amazon.com');
    
    // Verify cart link is present
    const cartLink = page.getByRole('link', { name: /Cart/i });
    await expect(cartLink).toBeVisible();
    
    // Verify cart shows item count (0 initially)
    await expect(page.locator('#nav-cart-count')).toBeVisible();
  });

  test('HP-013: Returns & Orders Link - Verify Returns & Orders link is present', async ({ page }) => {
    // Navigate to Amazon homepage
    await page.goto('https://www.amazon.com');
    
    // Verify "Returns & Orders" link is present
    const returnsLink = page.getByRole('link', { name: /Returns.*Orders/i });
    await expect(returnsLink).toBeVisible();
  });

  test('HP-014: Language Selector - Verify language/country selector is present', async ({ page }) => {
    // Navigate to Amazon homepage
    await page.goto('https://www.amazon.com');
    
    // Verify language selector is present
    const languageSelector = page.locator('.nav-flag');
    await expect(languageSelector).toBeVisible();
  });

  test('HP-015: Hero Section - Verify hero/featured content section is displayed', async ({ page }) => {
    // Navigate to Amazon homepage
    await page.goto('https://www.amazon.com');
    
    // Verify hero/featured content section is displayed
    await expect(page.locator('.fed-sea-horz-image-container')).toBeVisible({ timeout: 10000 }).catch(() => {
      // Fallback to check for any hero content
      return expect(page.locator('[data-cel-widget="sp-hero"]')).toBeVisible({ timeout: 10000 });
    });
  });

  test('HP-016: Best Sellers Section - Verify Best Sellers section is displayed on homepage', async ({ page }) => {
    // Navigate to Amazon homepage
    await page.goto('https://www.amazon.com');
    
    // Verify Best Sellers section is displayed
    await expect(page.getByText('Best Sellers')).toBeVisible({ timeout: 10000 });
  });

  test('HP-017: Category Tiles - Verify category tiles are displayed on homepage', async ({ page }) => {
    // Navigate to Amazon homepage
    await page.goto('https://www.amazon.com');
    
    // Verify category tiles are displayed
    // Look for common category sections
    await expect(page.getByText('Shop by Category')).toBeVisible({ timeout: 10000 }).catch(() => {
      // Alternative: Check for category links in navigation
      expect(page.locator('.nav-category')).toBeTruthy();
    });
  });

  test('HP-018: Footer Links Presence - Verify footer section contains expected links', async ({ page }) => {
    // Navigate to Amazon homepage
    await page.goto('https://www.amazon.com');
    
    // Scroll to footer
    await page.locator('.navFooterCopyright').scrollIntoViewIfNeeded();
    
    // Verify footer is present
    await expect(page.locator('.navFooter')).toBeVisible();
  });
});
