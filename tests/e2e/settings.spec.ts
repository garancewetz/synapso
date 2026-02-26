import { test, expect } from '@playwright/test';
import { AuthHelper } from './helpers/auth';
import { TEST_USER } from './helpers/test-constants';

test.describe('Paramètres', () => {
  test.beforeEach(async ({ page }) => {
    const authHelper = new AuthHelper(page);
    await authHelper.login(TEST_USER.username, TEST_USER.password);
  });

  test('affiche la page paramètres avec le bouton de déconnexion', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('button', { name: 'Se déconnecter' })).toBeVisible({
      timeout: 10000,
    });
  });

  test('enregistre le profil sans modification', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('button', { name: 'Enregistrer mon profil' })).toBeVisible({
      timeout: 10000,
    });
    await page.getByRole('button', { name: 'Enregistrer mon profil' }).click();
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('button', { name: 'Se déconnecter' })).toBeVisible({
      timeout: 5000,
    });
  });
});
