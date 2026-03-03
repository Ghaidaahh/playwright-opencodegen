// tests/seed.spec.ts
// Sauce Demo - free practice e-commerce site (no CAPTCHA, no bot detection)
// Login credentials are public: standard_user / secret_sauce
import { test, expect } from '@playwright/test';

test.only('seed', async ({ page }) => {
  await page.goto('https://www.saucedemo.com');

  // Login with public test credentials
  await page.fill('#user-name', 'standard_user');
  await page.fill('#password', 'secret_sauce');
  await page.click('#login-button');

  // Verify we're on the products page
  await expect(page).toHaveURL(/inventory/);
  await expect(page.locator('.inventory_list')).toBeVisible();
});// test
// test
