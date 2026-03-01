// spec: specs/amazon-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Footer Links', () => {
  test('FOOT-001: Amazon Footer - Get to Know Us - Verify Get to Know Us section is present', async ({ page }) => {
    // Navigate to Amazon homepage
    await page.goto('https://www.amazon.com');
    
    // Scroll to footer
    await page.locator('.navFooterCopyright').scrollIntoViewIfNeeded();
    
    // Verify "Get to Know Us" section is present
    const getToKnowUs = page.getByText(/Get to Know Us/i);
    await expect(getToKnowUs).toBeVisible();
  });

  test.only('FOOT-002: Amazon Footer - Make Money - Verify Make Money with Us section is present', async ({ page }) => {
    // Navigate to Amazon homepage
    await page.goto('https://www.amazon.com');
    
    // Scroll to footer
    await page.locator('.navFooterCopyright').scrollIntoViewIfNeeded();
    
    // Verify "Make Money with Us" section is present
    const makeMoney = page.getByText(/Make Money with Us/i);
    await expect(makeMoney).toBeVisible();
  });

  test('FOOT-003: Amazon Footer - Payment - Verify Payment Products section is present', async ({ page }) => {
    // Navigate to Amazon homepage
    await page.goto('https://www.amazon.com');
    
    // Scroll to footer
    await page.locator('.navFooterCopyright').scrollIntoViewIfNeeded();
    
    // Verify "Payment Products" section is present
    const paymentProducts = page.getByText(/Payment Products/i);
    await expect(paymentProducts).toBeVisible();
  });

  test('FOOT-004: Amazon Footer - Help - Verify Let Us Help You section is present', async ({ page }) => {
    // Navigate to Amazon homepage
    await page.goto('https://www.amazon.com');
    
    // Scroll to footer
    await page.locator('.navFooterCopyright').scrollIntoViewIfNeeded();
    
    // Verify "Let Us Help You" section is present
    const helpSection = page.getByText(/Let Us Help You/i);
    await expect(helpSection).toBeVisible();
  });

  test('FOOT-005: Footer Copyright - Verify copyright information is displayed', async ({ page }) => {
    // Navigate to Amazon homepage
    await page.goto('https://www.amazon.com');
    
    // Scroll to footer
    await page.locator('.navFooterCopyright').scrollIntoViewIfNeeded();
    
    // Verify copyright information is displayed
    const copyright = page.locator('.navFooterCopyright');
    await expect(copyright).toBeVisible();
    
    // Verify copyright contains year
    const copyrightText = await copyright.textContent();
    expect(copyrightText).toContain('©');
  });
});
