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

  test('change le mot de passe et affiche le message de succès', async ({ page }) => {
    const newPassword = 'NouveauMotDePasseE2E123';
    let needRevert = false;
    let userId: number | null = null;

    // Récupérer l'ID utilisateur pour le revert API
    const checkRes = await page.request.get('/api/auth/check');
    const checkData = await checkRes.json();
    userId = checkData.user?.id ?? null;

    try {
      await page.goto('/settings');
      await page.waitForLoadState('networkidle');

      await page.getByRole('button', { name: 'Changer mon mot de passe' }).click();
      await expect(page.getByRole('heading', { name: 'Changer mon mot de passe' })).toBeVisible({
        timeout: 5000,
      });

      await page.getByLabel('Mot de passe actuel').fill(TEST_USER.password);
      await page.getByLabel(/^Nouveau mot de passe/).fill(newPassword);
      await page.getByLabel('Confirmer le nouveau mot de passe').fill(newPassword);
      await page.getByRole('button', { name: 'Modifier le mot de passe' }).click();

      await expect(page.getByText('Mot de passe modifié avec succès')).toBeVisible({
        timeout: 10000,
      });
      needRevert = true;

      await page.getByRole('button', { name: 'Changer mon mot de passe' }).click();
      await page.getByLabel('Mot de passe actuel').fill(newPassword);
      await page.getByLabel(/^Nouveau mot de passe/).fill(TEST_USER.password);
      await page.getByLabel('Confirmer le nouveau mot de passe').fill(TEST_USER.password);
      await page.getByRole('button', { name: 'Modifier le mot de passe' }).click();

      await expect(page.getByText('Mot de passe modifié avec succès')).toBeVisible({
        timeout: 10000,
      });
      needRevert = false;
    } finally {
      // Revert via appel API direct (beaucoup plus fiable que via l'UI)
      if (needRevert && userId) {
        try {
          const res = await page.request.patch(`/api/users/${userId}/password`, {
            data: { currentPassword: newPassword, newPassword: TEST_USER.password },
          });
          if (!res.ok()) {
            console.error(`Revert password API failed: ${res.status()} ${await res.text()}`);
          }
        } catch (e) {
          console.error('Revert password failed:', e);
        }
      }
    }
  });
});
