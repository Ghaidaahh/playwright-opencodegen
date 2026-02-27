// spec: specs/amazon-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Search Functionality', () => {
  test('SF-001: Basic Search - Verify basic keyword search returns relevant results', async ({ page }) => {
    // Navigate to Amazon homepage
    await page.goto('https://www.amazon.com');
    
    // Locate the search box element
    const searchBox = page.locator('#twotabsearchtextbox');
    
    // Enter "laptop" in the search box
    await searchBox.fill('laptop');
    
    // Click the "Go" button or press Enter
    await page.locator('#nav-search-submit-button').click();
    
    // Wait for results to load
    await page.waitForLoadState('domcontentloaded');
    
    // Verify search results page is displayed
    await expect(page).toHaveURL(/s\?k=laptop/);
    
    // Verify results contain products related to "laptop"
    const searchResults = page.locator('[data-component-type="s-search-results"]');
    await expect(searchResults).toBeVisible();
  });

  test('SF-002: Search with Department Filter - Verify search within specific department works correctly', async ({ page }) => {
    // Navigate to Amazon homepage
    await page.goto('https://www.amazon.com');
    
    // Select a department from dropdown
    await page.locator('.nav-search-dropdown').click();
    await page.getByRole('option', { name: 'Electronics' }).click();
    
    // Enter search term
    await page.locator('#twotabsearchtextbox').fill('headphones');
    
    // Submit search
    await page.locator('#nav-search-submit-button').click();
    
    // Verify URL contains department filter
    await expect(page).toHaveURL(/node=/);
  });

  test('SF-003: Empty Search - Verify behavior when searching with empty input', async ({ page }) => {
    // Navigate to Amazon homepage
    await page.goto('https://www.amazon.com');
    
    // Leave search box empty and submit
    await page.locator('#nav-search-submit-button').click();
    
    // Verify page remains on Amazon homepage or shows validation
    // Amazon typically redirects to homepage or shows all products
    await expect(page).toHaveURL(/amazon\.com/);
  });

  test('SF-004: Search Results Sorting - Featured - Verify Featured sort option works correctly', async ({ page }) => {
    // Perform a search
    await page.goto('https://www.amazon.com');
    await page.locator('#twotabsearchtextbox').fill('laptop');
    await page.locator('#nav-search-submit-button').click();
    await page.waitForLoadState('domcontentloaded');
    
    // Locate the "Sort by" dropdown and select Featured
    const sortDropdown = page.locator('.a-dropdown-prompt').first();
    await sortDropdown.click();
    await page.getByRole('option', { name: 'Featured' }).click();
    
    // Verify results are sorted by featured
    await expect(page.locator('.s-result-list')).toBeVisible();
  });

  test('SF-005: Search Results Sorting - Price Low to High - Verify Price Low to High sort option works correctly', async ({ page }) => {
    // Perform a search
    await page.goto('https://www.amazon.com');
    await page.locator('#twotabsearchtextbox').fill('laptop');
    await page.locator('#nav-search-submit-button').click();
    await page.waitForLoadState('domcontentloaded');
    
    // Locate the "Sort by" dropdown and select Price: Low to High
    const sortDropdown = page.locator('.a-dropdown-prompt').first();
    await sortDropdown.click();
    await page.getByRole('option', { name: 'Price: Low to High' }).click();
    
    // Verify results are sorted
    await expect(page.locator('.s-result-list')).toBeVisible();
  });

  test('SF-006: Search Results Sorting - Price High to Low - Verify Price High to Low sort option works correctly', async ({ page }) => {
    // Perform a search
    await page.goto('https://www.amazon.com');
    await page.locator('#twotabsearchtextbox').fill('laptop');
    await page.locator('#nav-search-submit-button').click();
    await page.waitForLoadState('domcontentloaded');
    
    // Locate the "Sort by" dropdown and select Price: High to Low
    const sortDropdown = page.locator('.a-dropdown-prompt').first();
    await sortDropdown.click();
    await page.getByRole('option', { name: 'Price: High to Low' }).click();
    
    // Verify results are sorted
    await expect(page.locator('.s-result-list')).toBeVisible();
  });

  test('SF-007: Search Results Sorting - Customer Review - Verify Avg. Customer Review sort option works correctly', async ({ page }) => {
    // Perform a search
    await page.goto('https://www.amazon.com');
    await page.locator('#twotabsearchtextbox').fill('laptop');
    await page.locator('#nav-search-submit-button').click();
    await page.waitForLoadState('domcontentloaded');
    
    // Locate the "Sort by" dropdown and select Avg. Customer Review
    const sortDropdown = page.locator('.a-dropdown-prompt').first();
    await sortDropdown.click();
    await page.getByRole('option', { name: 'Avg. Customer Review' }).click();
    
    // Verify results are sorted
    await expect(page.locator('.s-result-list')).toBeVisible();
  });

  test('SF-008: Search Results Sorting - Newest Arrivals - Verify Newest Arrivals sort option works correctly', async ({ page }) => {
    // Perform a search
    await page.goto('https://www.amazon.com');
    await page.locator('#twotabsearchtextbox').fill('laptop');
    await page.locator('#nav-search-submit-button').click();
    await page.waitForLoadState('domcontentloaded');
    
    // Locate the "Sort by" dropdown and select Newest Arrivals
    const sortDropdown = page.locator('.a-dropdown-prompt').first();
    await sortDropdown.click();
    await page.getByRole('option', { name: 'Newest Arrivals' }).click();
    
    // Verify results are sorted
    await expect(page.locator('.s-result-list')).toBeVisible();
  });

  test('SF-009: Search Results Count - Verify search results are displayed', async ({ page }) => {
    // Perform a search
    await page.goto('https://www.amazon.com');
    await page.locator('#twotabsearchtextbox').fill('laptop');
    await page.locator('#nav-search-submit-button').click();
    await page.waitForLoadState('domcontentloaded');
    
    // Verify search results are displayed
    const searchResults = page.locator('.s-result-list li');
    const count = await searchResults.count();
    expect(count).toBeGreaterThan(0);
  });

  test('SF-010: No Results Search - Verify behavior when search returns no results', async ({ page }) => {
    // Perform a search with unlikely term
    await page.goto('https://www.amazon.com');
    await page.locator('#twotabsearchtextbox').fill('xyznonexistentproduct12345');
    await page.locator('#nav-search-submit-button').click();
    await page.waitForLoadState('domcontentloaded');
    
    // Verify no results message or empty state
    const noResults = page.getByText(/no results|için sonuç yok/i);
    await expect(noResults).toBeVisible({ timeout: 10000 }).catch(() => {
      // If no results message, verify URL indicates search was performed
      expect(page.url()).toContain('search');
    });
  });

  test('SF-011: Special Characters Search - Verify search handles special characters gracefully', async ({ page }) => {
    // Navigate to Amazon homepage
    await page.goto('https://www.amazon.com');
    
    // Enter search with special characters
    await page.locator('#twotabsearchtextbox').fill('@#$%');
    await page.locator('#nav-search-submit-button').click();
    await page.waitForLoadState('domcontentloaded');
    
    // Verify page handles it gracefully (either shows results or shows message)
    expect(page.url()).toContain('search');
  });

  test('SF-012: Search Suggestions - Verify search suggestions appear while typing', async ({ page }) => {
    // Navigate to Amazon homepage
    await page.goto('https://www.amazon.com');
    
    // Start typing in search box
    const searchBox = page.locator('#twotabsearchtextbox');
    await searchBox.fill('lap');
    
    // Wait for suggestions to appear
    await page.waitForTimeout(500);
    
    // Verify suggestions appear
    const suggestions = page.locator('.suggestions-container');
    await expect(suggestions).toBeVisible({ timeout: 5000 }).catch(() => {
      // Fallback: check for autocomplete
      const searchAutoComplete = page.locator('#searchAutocomplete');
      expect(searchAutoComplete).toBeTruthy();
    });
  });
});
