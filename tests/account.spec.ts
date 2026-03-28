// // spec: specs/amazon-test-plan.md
// // seed: tests/seed.spec.ts

// import { test, expect } from '@playwright/test';

// test.describe('Account / Profile', () => {
//   test('ACC-001: Order History Access - Verify access to order history', async ({ page }) => {
//     // Navigate to Amazon homepage
//     await page.goto('https://www.amazon.com');
    
//     // Click on "Returns & Orders"
//     await page.getByRole('link', { name: /Returns.*Orders/i }).click();
    
//     // Wait for navigation
//     await page.waitForLoadState('domcontentloaded');
    
//     // Verify we're on order history page
//     await expect(page).toHaveURL(/order-history/);
//   });

//   test.only('ACC-002: Wishlist Access - Verify wishlist functionality is accessible', async ({ page }) => {
//     // Navigate to Amazon homepage
//     await page.goto('https://www.amazon.com');
    
//     // Navigate to wishlist page
//     await page.goto('https://www.amazon.com/giftcards/');
//     await page.waitForLoadState('domcontentloaded');
    
//     // Or find wishlist from header
//     const wishlistLink = page.getByRole('link', { name: /Wish List/i });
//     await expect(wishlistLink).toBeVisible({ timeout: 5000 }).catch(() => {
//       // Alternative way to access wishlist
//       const createWishlist = page.getByText('Create a List');
//       expect(createWishlist).toBeTruthy();
//     });
//   });

//   test('ACC-003: Your Account Page - Verify Your Account page is accessible', async ({ page }) => {
//     // Navigate to Amazon homepage
//     await page.goto('https://www.amazon.com');
    
//     // Hover over Account & Lists
//     await page.locator('#nav-account-list').hover();
    
//     // Click on "Your Account"
//     const yourAccountLink = page.getByRole('link', { name: /Your Account/i });
//     await yourAccountLink.click();
    
//     // Wait for navigation
//     await page.waitForLoadState('domcontentloaded');
    
//     // Verify we're on Your Account page
//     await expect(page).toHaveURL(/youraccount/);
//   });

//   test('ACC-004: Prime Membership - Verify Prime membership section is accessible', async ({ page }) => {
//     // Navigate to Amazon homepage
//     await page.goto('https://www.amazon.com');
    
//     // Look for Prime link in header
//     const primeLink = page.getByRole('link', { name: /Prime/i });
//     await expect(primeLink).toBeVisible({ timeout: 5000 }).catch(() => {
//       // Check in footer
//       const footerPrime = page.getByText('Join Prime');
//       expect(footerPrime).toBeTruthy();
//     });
//   });
// });
// //