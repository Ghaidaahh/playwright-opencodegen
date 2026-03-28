import { test, expect } from '@playwright/test';

const BASE_URL = 'https://www.saucedemo.com';
const VALID_USER = 'standard_user';
const VALID_PASS = 'secret_sauce';
const LOCKED_USER = 'locked_out_user';
const INVALID_USER = 'invalid_user';
const INVALID_PASS = 'wrong_password';

test.describe('Authentication', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  // AUTH-001
  test('AUTH-001: Valid login redirects to inventory page', async ({ page }) => {
    await page.locator('#user-name').fill(VALID_USER);
    await page.locator('#password').fill(VALID_PASS);
    await page.locator('#login-button').click();
    await expect(page).toHaveURL(`${BASE_URL}/inventory.html`);
    await expect(page.locator('.inventory_list')).toBeVisible();
  });

  // AUTH-002
  test('AUTH-002: Invalid username shows error message', async ({ page }) => {
    await page.locator('#user-name').fill(INVALID_USER);
    await page.locator('#password').fill(VALID_PASS);
    await page.locator('#login-button').click();
    await expect(page.locator('[data-test="error"]')).toBeVisible();
    await expect(page.locator('[data-test="error"]')).toContainText('Username and password do not match');
  });

  // AUTH-003
  test('AUTH-003: Invalid password shows error message', async ({ page }) => {
    await page.locator('#user-name').fill(VALID_USER);
    await page.locator('#password').fill(INVALID_PASS);
    await page.locator('#login-button').click();
    await expect(page.locator('[data-test="error"]')).toBeVisible();
    await expect(page.locator('[data-test="error"]')).toContainText('Username and password do not match');
  });

  // AUTH-004
  test('AUTH-004: Empty credentials shows error message', async ({ page }) => {
    await page.locator('#login-button').click();
    await expect(page.locator('[data-test="error"]')).toBeVisible();
    await expect(page.locator('[data-test="error"]')).toContainText('Username is required');
  });

  // AUTH-005
  test('AUTH-005: Empty password shows error message', async ({ page }) => {
    await page.locator('#user-name').fill(VALID_USER);
    await page.locator('#login-button').click();
    await expect(page.locator('[data-test="error"]')).toBeVisible();
    await expect(page.locator('[data-test="error"]')).toContainText('Password is required');
  });

  // AUTH-006
  test('AUTH-006: Locked out user sees appropriate error', async ({ page }) => {
    await page.locator('#user-name').fill(LOCKED_USER);
    await page.locator('#password').fill(VALID_PASS);
    await page.locator('#login-button').click();
    await expect(page.locator('[data-test="error"]')).toBeVisible();
    await expect(page.locator('[data-test="error"]')).toContainText('Sorry, this user has been locked out');
  });

  // AUTH-007
  test('AUTH-007: Error message can be dismissed', async ({ page }) => {
    await page.locator('#login-button').click();
    await expect(page.locator('[data-test="error"]')).toBeVisible();
    await page.locator('[data-test="error"] button').click();
    await expect(page.locator('[data-test="error"]')).not.toBeVisible();
  });

  // AUTH-008
  test('AUTH-008: Logout redirects to login page', async ({ page }) => {
    await page.locator('#user-name').fill(VALID_USER);
    await page.locator('#password').fill(VALID_PASS);
    await page.locator('#login-button').click();
    await page.locator('#react-burger-menu-btn').click();
    await page.locator('#logout_sidebar_link').click();
    await expect(page).toHaveURL(BASE_URL + '/');
    await expect(page.locator('#login-button')).toBeVisible();
  });

  // AUTH-009
  test('AUTH-009: After logout, back button does not restore session', async ({ page }) => {
    await page.locator('#user-name').fill(VALID_USER);
    await page.locator('#password').fill(VALID_PASS);
    await page.locator('#login-button').click();
    await page.locator('#react-burger-menu-btn').click();
    await page.locator('#logout_sidebar_link').click();
    await page.goBack();
    await expect(page).toHaveURL(BASE_URL + '/');
    await expect(page.locator('#login-button')).toBeVisible();
  });

  // AUTH-010
  test('AUTH-010: Login page has correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Swag Labs/);
    await expect(page.locator('.login_logo')).toContainText('Swag Labs');
  });

});

test.describe('Authentication - Expected Failures', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  // AUTH-FAIL-001 - Wrong expected URL after login
  test('AUTH-FAIL-001: Login redirects to dashboard (wrong expectation)', async ({ page }) => {
    await page.locator('#user-name').fill(VALID_USER);
    await page.locator('#password').fill(VALID_PASS);
    await page.locator('#login-button').click();
    await expect(page).toHaveURL(`${BASE_URL}/dashboard.html`); // wrong — it goes to inventory.html
  });

  // AUTH-FAIL-002 - Wrong error message text
  test('AUTH-FAIL-002: Empty login shows wrong error text (wrong expectation)', async ({ page }) => {
    await page.locator('#login-button').click();
    await expect(page.locator('[data-test="error"]')).toContainText('Invalid credentials'); // wrong text
  });

  // AUTH-FAIL-003 - Element that doesn't exist
  test('AUTH-FAIL-003: Login page has remember me checkbox (does not exist)', async ({ page }) => {
    await expect(page.locator('#rememberMe')).toBeVisible(); // doesn't exist on SauceDemo
  });

});
