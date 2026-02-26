import { test, expect } from '@playwright/test';
import { AuthHelper } from './helpers/auth';
import { TEST_USER } from './helpers/test-constants';

test.describe('Archivage', () => {
  test.beforeEach(async ({ page }) => {
    const authHelper = new AuthHelper(page);
    await authHelper.login(TEST_USER.username, TEST_USER.password);
  });

  test('archive un exercice puis le voit sur la page archivés', async ({ page }) => {
    await page.goto('/exercices/upper_body');
    await page.waitForLoadState('networkidle');

    const firstCard = page.locator('.exercise-card').first();
    await firstCard.waitFor({ state: 'visible', timeout: 15000 });
    const exerciceName = await firstCard.locator('h3').first().textContent();
    if (!exerciceName?.trim()) {
      throw new Error('Aucun exercice trouvé sur la page');
    }

    await firstCard.getByRole('button', { name: 'Ouvrir les actions' }).click();
    await page.waitForTimeout(500);
    await firstCard.getByRole('button', { name: 'Archiver' }).click({ force: true });

    await page.goto('/exercices/archived');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText(exerciceName.trim()).first()).toBeVisible({
      timeout: 10000,
    });
  });

  test('désarchive un exercice depuis la page archivés', async ({ page }) => {
    await page.goto('/exercices/archived');
    await page.waitForLoadState('networkidle');

    const firstCard = page.locator('.exercise-card').first();
    const isVisible = await firstCard.isVisible({ timeout: 5000 }).catch(() => false);
    if (!isVisible) {
      return;
    }

    const exerciceName = await firstCard.locator('h3').first().textContent();
    if (!exerciceName?.trim()) {
      return;
    }

    await firstCard.getByRole('button', { name: 'Ouvrir les actions' }).click();
    await page.waitForTimeout(500);
    await firstCard.getByRole('button', { name: 'Désarchiver' }).click({ force: true });

    await page.goto('/exercices/upper_body');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText(exerciceName.trim()).first()).toBeVisible({
      timeout: 10000,
    });
  });
});
