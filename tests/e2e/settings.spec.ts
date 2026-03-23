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
    const newPassword = process.env.E2E_PASSWORD_NEW;
    if (!newPassword) {
      throw new Error('E2E_PASSWORD_NEW doit être défini dans .env pour ce test.');
    }

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

      const patchPromise = page.waitForResponse(
        (res) => res.url().includes('/api/users/') && res.url().includes('/password') && res.request().method() === 'PATCH',
        { timeout: 15000 }
      );
      await page.getByRole('button', { name: 'Modifier le mot de passe' }).click();
      const patchRes = await patchPromise;
      if (patchRes.status() !== 200) {
        const body = await patchRes.json().catch(() => ({}));
        throw new Error(
          `Changement de mot de passe refusé (${patchRes.status()}). ` +
            (body?.error ?? patchRes.statusText()) +
            '. Vérifiez que E2E_PASSWORD dans .env correspond au mot de passe en base de l\'utilisateur E2E.'
        );
      }

      await expect(page.getByText(/mot de passe modifié avec succès/i)).toBeVisible({
        timeout: 5000,
      });

      await page.getByRole('button', { name: 'Changer mon mot de passe' }).click();
      await page.getByLabel('Mot de passe actuel').fill(newPassword);
      await page.getByLabel(/^Nouveau mot de passe/).fill(TEST_USER.password);
      await page.getByLabel('Confirmer le nouveau mot de passe').fill(TEST_USER.password);

      const patchPromise2 = page.waitForResponse(
        (res) => res.url().includes('/api/users/') && res.url().includes('/password') && res.request().method() === 'PATCH',
        { timeout: 15000 }
      );
      await page.getByRole('button', { name: 'Modifier le mot de passe' }).click();
      const patchRes2 = await patchPromise2;
      if (patchRes2.status() !== 200) {
        const body2 = await patchRes2.json().catch(() => ({}));
        throw new Error(
          `Restauration du mot de passe refusée (${patchRes2.status()}). ` + (body2?.error ?? patchRes2.statusText())
        );
      }

      await expect(page.getByText(/mot de passe modifié avec succès/i)).toBeVisible({
        timeout: 5000,
      });
    } finally {
      const res = await page.request.post('/api/dev/reset-e2e-password');
      if (!res.ok()) {
        console.error(`Restore E2E password failed: ${res.status()} ${await res.text()}`);
      }
    }
  });
});
