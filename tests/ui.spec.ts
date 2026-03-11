import { test, expect } from '@playwright/test';

const BASE_URL = 'https://www.saucedemo.com';
const VALID_USER = 'standard_user';
const VALID_PASS = 'secret_sauce';

test.describe('UI Elements & Interactions', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.locator('#user-name').fill(VALID_USER);
    await page.locator('#password').fill(VALID_PASS);
    await page.locator('#login-button').click();
    await expect(page).toHaveURL(`${BASE_URL}/inventory.html`);
  });

  // UI-001
  test('UI-001: Inventory page displays all 6 products', async ({ page }) => {
    const items = page.locator('.inventory_item');
    await expect(items).toHaveCount(6);
  });

  // UI-002
  test('UI-002: Each product has name, description, price and add to cart button', async ({ page }) => {
    const items = page.locator('.inventory_item');
    const count = await items.count();
    for (let i = 0; i < count; i++) {
      const item = items.nth(i);
      await expect(item.locator('.inventory_item_name')).toBeVisible();
      await expect(item.locator('.inventory_item_desc')).toBeVisible();
      await expect(item.locator('.inventory_item_price')).toBeVisible();
      await expect(item.locator('button')).toBeVisible();
    }
  });

  // UI-003
  test('UI-003: Sort by Name A-Z works correctly', async ({ page }) => {
    await page.locator('[data-test="product-sort-container"]').selectOption('az');
    const names = await page.locator('.inventory_item_name').allTextContents();
    const sorted = [...names].sort();
    expect(names).toEqual(sorted);
  });

  // UI-004
  test('UI-004: Sort by Name Z-A works correctly', async ({ page }) => {
    await page.locator('[data-test="product-sort-container"]').selectOption('za');
    const names = await page.locator('.inventory_item_name').allTextContents();
    const sorted = [...names].sort().reverse();
    expect(names).toEqual(sorted);
  });

  // UI-005
  test('UI-005: Sort by Price low to high works correctly', async ({ page }) => {
    await page.locator('[data-test="product-sort-container"]').selectOption('lohi');
    const prices = await page.locator('.inventory_item_price').allTextContents();
    const nums = prices.map(p => parseFloat(p.replace('$', '')));
    const sorted = [...nums].sort((a, b) => a - b);
    expect(nums).toEqual(sorted);
  });

  // UI-006
  test('UI-006: Sort by Price high to low works correctly', async ({ page }) => {
    await page.locator('[data-test="product-sort-container"]').selectOption('hilo');
    const prices = await page.locator('.inventory_item_price').allTextContents();
    const nums = prices.map(p => parseFloat(p.replace('$', '')));
    const sorted = [...nums].sort((a, b) => b - a);
    expect(nums).toEqual(sorted);
  });

  // UI-007
  test('UI-007: Add item to cart updates cart badge', async ({ page }) => {
    await page.locator('.inventory_item button').first().click();
    await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
  });

  // UI-008
  test('UI-008: Remove item from cart updates cart badge', async ({ page }) => {
    await page.locator('.inventory_item button').first().click();
    await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
    await page.locator('.inventory_item button').first().click();
    await expect(page.locator('.shopping_cart_badge')).not.toBeVisible();
  });

  // UI-009
  test('UI-009: Adding multiple items updates cart count correctly', async ({ page }) => {
    const buttons = page.locator('.inventory_item button');
    await buttons.nth(0).click();
    await buttons.nth(1).click();
    await buttons.nth(2).click();
    await expect(page.locator('.shopping_cart_badge')).toHaveText('3');
  });

  // UI-010
  test('UI-010: Clicking product name opens product detail page', async ({ page }) => {
    const firstName = await page.locator('.inventory_item_name').first().textContent();
    await page.locator('.inventory_item_name').first().click();
    await expect(page).toHaveURL(/inventory-item/);
    await expect(page.locator('.inventory_details_name')).toContainText(firstName!);
  });

  // UI-011
  test('UI-011: Product detail page has Back button that returns to inventory', async ({ page }) => {
    await page.locator('.inventory_item_name').first().click();
    await page.locator('[data-test="back-to-products"]').click();
    await expect(page).toHaveURL(`${BASE_URL}/inventory.html`);
  });

  // UI-012
  test('UI-012: Hamburger menu opens and shows all nav links', async ({ page }) => {
    await page.locator('#react-burger-menu-btn').click();
    await expect(page.locator('.bm-menu')).toBeVisible();
    await expect(page.locator('#inventory_sidebar_link')).toBeVisible();
    await expect(page.locator('#about_sidebar_link')).toBeVisible();
    await expect(page.locator('#logout_sidebar_link')).toBeVisible();
    await expect(page.locator('#reset_sidebar_link')).toBeVisible();
  });

  // UI-013
  test('UI-013: Hamburger menu closes when X is clicked', async ({ page }) => {
    await page.locator('#react-burger-menu-btn').click();
    await expect(page.locator('.bm-menu')).toBeVisible();
    await page.locator('#react-burger-cross-btn').click();
    await expect(page.locator('.bm-menu')).not.toBeVisible();
  });

  // UI-014
  test('UI-014: Cart icon navigates to cart page', async ({ page }) => {
    await page.locator('.shopping_cart_link').click();
    await expect(page).toHaveURL(`${BASE_URL}/cart.html`);
  });

  // UI-015
  test('UI-015: Cart page shows added items with correct details', async ({ page }) => {
    const itemName = await page.locator('.inventory_item_name').first().textContent();
    const itemPrice = await page.locator('.inventory_item_price').first().textContent();
    await page.locator('.inventory_item button').first().click();
    await page.locator('.shopping_cart_link').click();
    await expect(page.locator('.cart_item')).toHaveCount(1);
    await expect(page.locator('.inventory_item_name')).toContainText(itemName!);
    await expect(page.locator('.inventory_item_price')).toContainText(itemPrice!);
  });

  // UI-016
  test('UI-016: Checkout flow completes successfully', async ({ page }) => {
    await page.locator('.inventory_item button').first().click();
    await page.locator('.shopping_cart_link').click();
    await page.locator('[data-test="checkout"]').click();
    await expect(page).toHaveURL(`${BASE_URL}/checkout-step-one.html`);
    await page.locator('[data-test="firstName"]').fill('John');
    await page.locator('[data-test="lastName"]').fill('Doe');
    await page.locator('[data-test="postalCode"]').fill('12345');
    await page.locator('[data-test="continue"]').click();
    await expect(page).toHaveURL(`${BASE_URL}/checkout-step-two.html`);
    await page.locator('[data-test="finish"]').click();
    await expect(page).toHaveURL(`${BASE_URL}/checkout-complete.html`);
    await expect(page.locator('.complete-header')).toContainText('Thank you for your order');
  });

});

test.describe('UI Elements - Expected Failures', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.locator('#user-name').fill(VALID_USER);
    await page.locator('#password').fill(VALID_PASS);
    await page.locator('#login-button').click();
    await expect(page).toHaveURL(`${BASE_URL}/inventory.html`);
  });

  // UI-FAIL-001 - Wrong product count
  test('UI-FAIL-001: Inventory page displays 10 products (wrong count)', async ({ page }) => {
    const items = page.locator('.inventory_item');
    await expect(items).toHaveCount(10); // wrong — there are only 6
  });

  // UI-FAIL-002 - Wrong cart badge after adding 1 item
  test('UI-FAIL-002: Cart badge shows 5 after adding 1 item (wrong count)', async ({ page }) => {
    await page.locator('.inventory_item button').first().click();
    await expect(page.locator('.shopping_cart_badge')).toHaveText('5'); // wrong — should be 1
  });

  // UI-FAIL-003 - Element that doesn't exist
  test('UI-FAIL-003: Wishlist button exists on product (does not exist)', async ({ page }) => {
    await expect(page.locator('.wishlist-button')).toBeVisible(); // doesn't exist on SauceDemo
  });

});
