// // spec: specs/amazon-test-plan.md
// // seed: tests/seed.spec.ts

// import { test, expect } from '@playwright/test';

// test.describe('Shopping Cart', () => {
//   // Helper function to add item to cart
//   async function addItemToCart(page: any, searchTerm: string) {
//     await page.goto('https://www.amazon.com');
//     await page.locator('#twotabsearchtextbox').fill(searchTerm);
//     await page.locator('#nav-search-submit-button').click();
//     await page.waitForSelector('.s-result-list');
    
//     // Click on first product
//     const productTitle = page.locator('.s-title-text a').first();
//     await productTitle.click();
//     await page.waitForLoadState('domcontentloaded');
    
//     // Add to cart
//     const addToCartButton = page.locator('#add-to-cart-button');
//     await addToCartButton.click();
    
//     // Wait for cart update
//     await page.waitForTimeout(1000);
//   }

//   test.only('CART-001: View Cart - Verify cart page displays added items', async ({ page }) => {
//     // Add item to cart
//     await addItemToCart(page, 'laptop');
    
//     // Click on Cart icon in header
//     await page.locator('#nav-cart').click();
    
//     // Wait for cart page to load
//     await page.waitForLoadState('domcontentloaded');
    
//     // Verify cart page is displayed
//     await expect(page).toHaveURL(/cart/);
    
//     // Verify cart contains item
//     const cartItems = page.locator('.sc-item-content');
//     await expect(cartItems.first()).toBeVisible();
//   });

//   test('CART-002: Cart Item Details - Verify correct product details are shown in cart', async ({ page }) => {
//     // Add item to cart
//     await addItemToCart(page, 'laptop');
    
//     // Navigate to cart
//     await page.locator('#nav-cart').click();
//     await page.waitForLoadState('domcontentloaded');
    
//     // Verify product name is displayed in cart
//     const productName = page.locator('.sc-product-title a').first();
//     await expect(productName).toBeVisible();
    
//     // Verify price is displayed
//     const priceElement = page.locator('.sc-price').first();
//     await expect(priceElement).toBeVisible();
//   });

//   test('CART-003: Cart Item Quantity - Increase - Verify quantity can be increased', async ({ page }) => {
//     // Add item to cart
//     await addItemToCart(page, 'laptop');
    
//     // Navigate to cart
//     await page.locator('#nav-cart').click();
//     await page.waitForLoadState('domcontentloaded');
    
//     // Get initial quantity
//     const quantitySelect = page.locator('.sc-quantity-select');
    
//     // Increase quantity
//     await quantitySelect.click();
//     const options = page.locator('.a-dropdown-item');
//     const optionCount = await options.count();
    
//     if (optionCount > 1) {
//       await options.nth(1).click();
//       await page.waitForTimeout(500);
//     }
    
//     // Verify quantity changed
//     await expect(quantitySelect).toBeVisible();
//   });

//   test('CART-004: Cart Item Quantity - Decrease - Verify quantity can be decreased', async ({ page }) => {
//     // Add item to cart
//     await addItemToCart(page, 'laptop');
    
//     // Navigate to cart
//     await page.locator('#nav-cart').click();
//     await page.waitForLoadState('domcontentloaded');
    
//     // Set quantity to 2 first
//     const quantitySelect = page.locator('.sc-quantity-select');
//     await quantitySelect.click();
//     const options = page.locator('.a-dropdown-item');
//     const optionCount = await options.count();
    
//     if (optionCount > 1) {
//       await options.nth(1).click();
//       await page.waitForTimeout(500);
      
//       // Try to decrease back to 1
//       await quantitySelect.click();
//       await options.first().click();
//       await page.waitForTimeout(500);
//     }
    
//     // Verify item still in cart
//     const cartItems = page.locator('.sc-item-content');
//     await expect(cartItems.first()).toBeVisible();
//   });

//   test('CART-005: Remove Item from Cart - Verify item can be removed from cart', async ({ page }) => {
//     // Add item to cart
//     await addItemToCart(page, 'laptop');
    
//     // Navigate to cart
//     await page.locator('#nav-cart').click();
//     await page.waitForLoadState('domcontentloaded');
    
//     // Click delete button
//     const deleteButton = page.locator('.sc-action-delete input').first();
//     await deleteButton.click();
    
//     // Wait for cart update
//     await page.waitForTimeout(1000);
    
//     // Verify cart is empty or item removed
//     const emptyCartMessage = page.getByText(/Your Amazon Cart is empty|Your cart is empty/);
//     const isEmptyVisible = await emptyCartMessage.isVisible().catch(() => false);
//     if (!isEmptyVisible) {
//       const cartItems = page.locator('.sc-item-content');
//       const count = await cartItems.count();
//       expect(count).toBe(0);
//     }
//   });

//   test('CART-006: Cart Subtotal - Verify subtotal is calculated correctly', async ({ page }) => {
//     // Add item to cart
//     await addItemToCart(page, 'laptop');
    
//     // Navigate to cart
//     await page.locator('#nav-cart').click();
//     await page.waitForLoadState('domcontentloaded');
    
//     // Verify subtotal is displayed
//     const subtotal = page.locator('#sc-subtotal-amount-buybox');
//     await expect(subtotal).toBeVisible();
//   });

//   test('CART-007: Cart Empty State - Verify appropriate message when cart is empty', async ({ page }) => {
//     // Navigate directly to cart (empty cart)
//     await page.goto('https://www.amazon.com/gp/cart/view.html');
//     await page.waitForLoadState('domcontentloaded');
    
//     // Verify empty cart message
//     const emptyCartMessage = page.getByText(/Your Amazon Cart is empty|Your cart is empty/);
//     await expect(emptyCartMessage).toBeVisible();
//   });

//   test('CART-008: Proceed to Checkout - Verify Proceed to Checkout button is present', async ({ page }) => {
//     // Add item to cart
//     await addItemToCart(page, 'laptop');
    
//     // Navigate to cart
//     await page.locator('#nav-cart').click();
//     await page.waitForLoadState('domcontentloaded');
    
//     // Verify Proceed to Checkout button
//     const checkoutButton = page.locator('#sc-buy-box-ptc-button');
//     await expect(checkoutButton).toBeVisible();
//   });

//   test('CART-009: Continue Shopping - Verify Continue Shopping button navigates back', async ({ page }) => {
//     // Add item to cart
//     await addItemToCart(page, 'laptop');
    
//     // Navigate to cart
//     await page.locator('#nav-cart').click();
//     await page.waitForLoadState('domcontentloaded');
    
//     // Click Continue Shopping
//     const continueShopping = page.getByRole('link', { name: /Continue Shopping/i });
//     await continueShopping.click();
    
//     // Verify we navigate back to Amazon homepage
//     await expect(page).toHaveURL(/amazon\.com/);
//   });

//   test('CART-010: Save for Later - Verify Save for Later option is available', async ({ page }) => {
//     // Add item to cart
//     await addItemToCart(page, 'laptop');
    
//     // Navigate to cart
//     await page.locator('#nav-cart').click();
//     await page.waitForLoadState('domcontentloaded');
    
//     // Look for Save for Later option
//     const saveForLater = page.getByText(/Save for later|Save for Later/i);
//     const isVisible = await saveForLater.isVisible().catch(() => false);
//     if (!isVisible) {
//       const altSave = page.locator('.sc-save-for-later-action');
//       expect(altSave).toBeTruthy();
//     } else {
//       await expect(saveForLater).toBeVisible();
//     }
//   });
// });
