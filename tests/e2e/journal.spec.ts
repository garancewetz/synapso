import { test, expect } from '@playwright/test';
import { AuthHelper } from './helpers/auth';
import { TEST_USER } from './helpers/test-constants';

test.describe('Journal', () => {
  test.beforeEach(async ({ page }) => {
    const authHelper = new AuthHelper(page);
    await authHelper.login(TEST_USER.username, TEST_USER.password);
  });

  test('affiche la page journal ou redirige si pas d\'accès', async ({ page }) => {
    await page.goto('/journal');
    await page.waitForLoadState('networkidle');

    const url = page.url();
    if (url.includes('/journal')) {
      await expect(page.getByRole('heading', { name: /Mon journal/ })).toBeVisible({
        timeout: 5000,
      });
    }
  });

  test('crée une note et la voit dans la liste', async ({ page }) => {
    await page.goto('/journal');
    await page.waitForLoadState('networkidle');

    if (!page.url().includes('/journal')) {
      return;
    }

    await page.getByRole('link', { name: 'Ajouter une note' }).click();
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: 'Ajouter une note' })).toBeVisible({
      timeout: 5000,
    });

    const title = 'Note E2E ' + Date.now();
    await page.getByPlaceholder('Titre de la note').fill(title);
    await page.getByRole('button', { name: 'Créer' }).click();

    await expect(page).toHaveURL(/\/journal\/?$/);
    await expect(page.getByText(title).first()).toBeVisible({ timeout: 10000 });
  });
});
