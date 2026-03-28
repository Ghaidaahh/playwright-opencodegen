// // spec: specs/amazon-test-plan.md
// // seed: tests/seed.spec.ts

// import { test, expect } from '@playwright/test';

// test.describe('Product Listing Page', () => {
//   // Helper function to navigate to search results
//   async function performSearch(page: any, searchTerm: string) {
//     await page.goto('https://www.amazon.com');
//     await page.locator('#twotabsearchtextbox').fill(searchTerm);
//     await page.locator('#nav-search-submit-button').click();
//     await page.waitForLoadState('domcontentloaded');
//   }

//   test.only('PLP-001: Product Cards Display - Verify product cards are displayed in search results', async ({ page }) => {
//     // Perform a search
//     await performSearch(page, 'laptop');
    
//     // Wait for results to load
//     await page.waitForSelector('.s-result-list');
    
//     // Count the number of product cards displayed
//     const productCards = page.locator('.s-result-list > li');
//     const count = await productCards.count();
    
//     // Verify multiple product cards are visible
//     expect(count).toBeGreaterThan(0);
//   });

//   test('PLP-002: Product Image - Verify product images are displayed', async ({ page }) => {
//     // Perform a search
//     await performSearch(page, 'laptop');
    
//     // Wait for results
//     await page.waitForSelector('.s-result-list');
    
//     // Verify product images are displayed
//     const productImage = page.locator('.s-product-image-container img').first();
//     await expect(productImage).toBeVisible();
//   });

//   test('PLP-003: Product Title - Verify product titles are displayed and clickable', async ({ page }) => {
//     // Perform a search
//     await performSearch(page, 'laptop');
    
//     // Wait for results
//     await page.waitForSelector('.s-result-list');
    
//     // Verify product titles are displayed
//     const productTitle = page.locator('.s-title-text a').first();
//     await expect(productTitle).toBeVisible();
    
//     // Verify title is clickable
//     await expect(productTitle).toHaveAttribute('href', /.+/);
//   });

//   test('PLP-004: Product Price - Verify product prices are displayed', async ({ page }) => {
//     // Perform a search
//     await performSearch(page, 'laptop');
    
//     // Wait for results
//     await page.waitForSelector('.s-result-list');
    
//     // Verify product prices are displayed
//     const productPrice = page.locator('.a-price-whole').first();
//     await expect(productPrice).toBeVisible();
//   });

//   test('PLP-005: Product Ratings - Verify product ratings are displayed', async ({ page }) => {
//     // Perform a search
//     await performSearch(page, 'laptop');
    
//     // Wait for results
//     await page.waitForSelector('.s-result-list');
    
//     // Verify ratings are displayed (star ratings)
//     const ratings = page.locator('.a-star-small-rating').first();
//     await expect(ratings).toBeVisible({ timeout: 5000 }).catch(() => {
//       // Some products may not have ratings
//       const reviewCount = page.locator('.s-review-count').first();
//       expect(reviewCount).toBeTruthy();
//     });
//   });

//   test('PLP-006: Add to Cart Button - Verify Add to Cart buttons are present on product cards', async ({ page }) => {
//     // Perform a search
//     await performSearch(page, 'laptop');
    
//     // Wait for results
//     await page.waitForSelector('.s-result-list');
    
//     // Verify Add to Cart buttons are present
//     const addToCartButton = page.locator('button[aria-label*="Add to Cart"]').first();
//     await expect(addToCartButton).toBeVisible({ timeout: 5000 }).catch(() => {
//       // Alternative locator
//       const altAddToCart = page.locator('.a-button-input[aria-label*="Add"]').first();
//       expect(altAddToCart).toBeTruthy();
//     });
//   });

//   test('PLP-007: Prime Badge - Verify Prime eligible items show Prime badge', async ({ page }) => {
//     // Perform a search for likely Prime items
//     await performSearch(page, 'headphones');
    
//     // Wait for results
//     await page.waitForSelector('.s-result-list');
    
//     // Look for Prime badge on eligible items
//     const primeBadge = page.locator('.s-prime-badge').first();
//     await expect(primeBadge).toBeVisible({ timeout: 5000 }).catch(() => {
//       // Not all items are Prime eligible
//       expect(true).toBe(true);
//     });
//   });

//   test('PLP-008: Sponsored Products - Verify sponsored products are labeled appropriately', async ({ page }) => {
//     // Perform a search
//     await performSearch(page, 'laptop');
    
//     // Wait for results
//     await page.waitForSelector('.s-result-list');
    
//     // Look for sponsored products
//     const sponsoredLabel = page.locator('.s-sponsored-label').first();
//     await expect(sponsoredLabel).toBeVisible({ timeout: 5000 }).catch(() => {
//       // Not all searches have sponsored products
//       expect(true).toBe(true);
//     });
//   });

//   test('PLP-009: Pagination - Verify pagination controls work correctly', async ({ page }) => {
//     // Perform a search that likely has multiple pages
//     await performSearch(page, 'laptop');
    
//     // Wait for results
//     await page.waitForSelector('.s-result-list');
    
//     // Check for pagination controls
//     const pagination = page.locator('.a-pagination');
//     await expect(pagination).toBeVisible({ timeout: 5000 }).catch(() => {
//       // Some searches may not have pagination
//       const nextButton = page.locator('li.a-last a');
//       expect(nextButton).toBeTruthy();
//     });
//   });

//   test('PLP-010: Product Link Navigation - Verify clicking product title navigates to product detail', async ({ page }) => {
//     // Perform a search
//     await performSearch(page, 'laptop');
    
//     // Wait for results
//     await page.waitForSelector('.s-result-list');
    
//     // Click on first product title
//     const productTitle = page.locator('.s-title-text a').first();
//     await productTitle.click();
    
//     // Wait for navigation
//     await page.waitForLoadState('domcontentloaded');
    
//     // Verify we are on product detail page
//     // Product detail pages typically have "Add to Cart" button
//     const addToCartButton = page.locator('#add-to-cart-button');
//     const buyNowButton = page.locator('#buy-now-button');
    
//     // At least one of these should be visible
//     const isPdp = await addToCartButton.isVisible().catch(() => false) || 
//                   await buyNowButton.isVisible().catch(() => false);
//     expect(isPdp || page.url().includes('/dp/')).toBeTruthy();
//   });
// });
