import { test, expect, type Page } from '@playwright/test';

const stakeholderPassword = process.env.STAKEHOLDER_PASSWORD || 'manager123';

async function openStakeholderDashboard(page: Page) {
  await page.goto('/stakeholder.html');
  await page.getByLabel('Stakeholder Password').fill(stakeholderPassword);
  await page.getByRole('button', { name: 'Open Dashboard' }).click();
  await expect(page.getByRole('heading', { name: 'Quality Health Overview' })).toBeVisible();
}

test.describe('Stakeholder dashboard', () => {
  test('loads the executive dashboard after password login @smoke', async ({ page }) => {
    await openStakeholderDashboard(page);

    await expect(page.getByText('Quality health is at risk')).toBeVisible();
    await expect(page.locator('#status-badge')).toContainText(/At risk|Needs attention|On track/);
    await expect(page.locator('#repo-filter')).toHaveValue('all');
    await expect(page.locator('#range-filter')).toHaveValue('day');
    await expect(page.locator('#calendar-filter')).toHaveValue(/\d{4}-\d{2}-\d{2}/);
  });

  test('switches between calendar day, week, month, and year filters @sanity', async ({ page }) => {
    await openStakeholderDashboard(page);

    await expect(page.locator('#calendar-filter-label')).toContainText('Calendar Day');

    await page.locator('#range-filter').selectOption('week');
    await expect(page.locator('#calendar-filter-label')).toContainText('Calendar Week');
    await expect(page.locator('#calendar-filter')).toHaveJSProperty('type', 'week');

    await page.locator('#range-filter').selectOption('month');
    await expect(page.locator('#calendar-filter-label')).toContainText('Calendar Month');
    await expect(page.locator('#calendar-filter')).toHaveJSProperty('type', 'month');

    await page.locator('#range-filter').selectOption('year');
    await expect(page.locator('#calendar-filter-label')).toContainText('Calendar Year');
    await expect(page.locator('#calendar-filter')).toHaveValue(/\d{4}/);
  });

  test('renders repository cards and current build details @regression', async ({ page }) => {
    await openStakeholderDashboard(page);

    await expect(page.locator('.repo-card').first()).toBeVisible();
    await expect(page.locator('.repo-card .name').first()).toContainText(/playwright-opencodegen/i);
    await expect(page.locator('#build-title')).toContainText(/Checkout|Portfolio|Release|quality/i);
    await expect(page.locator('#failure-source-copy')).toContainText(/Product|Automation|Unknown/);
  });

  test('switches the environment dropdown and updates the summary @sanity', async ({ page }) => {
    await openStakeholderDashboard(page);

    await page.locator('#env-filter').selectOption('production');
    await expect(page.locator('#summary-grid')).toContainText('Production');
    await expect(page.locator('#env-production-copy')).toBeVisible();
  });

  test('switches from all repos to a specific repo @sanity', async ({ page }) => {
    await openStakeholderDashboard(page);

    const repoOptions = await page.locator('#repo-filter option').allTextContents();
    expect(repoOptions.length).toBeGreaterThan(1);

    const specificRepoValue = await page.locator('#repo-filter option').nth(1).getAttribute('value');
    if (!specificRepoValue) throw new Error('Expected a repository option after "All repos".');

    await page.locator('#repo-filter').selectOption(specificRepoValue);
    await expect(page.locator('#summary-grid')).not.toContainText('All repos');
    await expect(page.locator('.repo-card')).toHaveCount(1);
  });

  test('renders the trend chart with datasets @regression', async ({ page }) => {
    await openStakeholderDashboard(page);

    await expect(page.locator('#trend-chart')).toBeVisible();
    const datasetCount = await page.evaluate(() => {
      const canvas = document.getElementById('trend-chart');
      const chart = window.Chart?.getChart?.(canvas);
      return chart?.data?.datasets?.length || 0;
    });
    expect(datasetCount).toBeGreaterThan(0);
  });

  test('can intentionally fail to exercise the dashboard pipeline @regression', async ({ page }) => {
    test.skip(process.env.SIMULATE_FAILING_DASHBOARD_TEST !== 'true', 'Set SIMULATE_FAILING_DASHBOARD_TEST=true when you want an intentional failing run.');

    await openStakeholderDashboard(page);
    await expect(page.getByText('This text should never exist')).toBeVisible();
  });
});
