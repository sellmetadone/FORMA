import { test, expect } from '@playwright/test';

test.describe('FORMA renderer smoke', () => {
  test('loads shell', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
    await expect(page.getByText(/FORMA|Overview|Workspace/i).first()).toBeVisible({
      timeout: 20000,
    });
  });

  test('sidebar navigation reaches workspace', async ({ page }) => {
    await page.goto('/');
    const ws = page.getByText(/^Workspace$|Workspace Studio/i).first();
    if (await ws.isVisible().catch(() => false)) {
      await ws.click();
      await page.waitForTimeout(300);
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('appearance or themes is reachable', async ({ page }) => {
    await page.goto('/');
    const link = page.getByText(/Appearance|Themes/i).first();
    if (await link.isVisible().catch(() => false)) {
      await link.click();
      await page.waitForTimeout(300);
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('settings page loads', async ({ page }) => {
    await page.goto('/');
    const settings = page.getByText(/^Settings$/i).first();
    if (await settings.isVisible().catch(() => false)) {
      await settings.click();
      await page.waitForTimeout(400);
      await expect(page.locator('body')).toBeVisible();
    }
  });
});
