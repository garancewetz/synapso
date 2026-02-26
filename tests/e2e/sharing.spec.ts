import { test, expect } from '@playwright/test';
import { AuthHelper } from './helpers/auth';
import { TEST_USER } from './helpers/test-constants';

test.describe('Partage', () => {
  test.beforeEach(async ({ page }) => {
    const authHelper = new AuthHelper(page);
    await authHelper.login(TEST_USER.username, TEST_USER.password);
  });

  test('ouvre la modale de partage depuis une carte exercice puis la ferme', async ({ page }) => {
    await page.goto('/exercices/upper_body');
    await page.waitForLoadState('networkidle');

    const firstCard = page.locator('.exercise-card').first();
    await firstCard.waitFor({ state: 'visible', timeout: 15000 });
    await firstCard.getByRole('button', { name: 'Ouvrir les actions' }).click();
    const partagerButton = firstCard.getByRole('button', { name: 'Partager' });
    await partagerButton.waitFor({ state: 'visible', timeout: 5000 });
    // dispatchEvent car le bouton est couvert par d'autres éléments de la page
    await partagerButton.dispatchEvent('click');

    const modalHeading = page.getByRole('heading', { name: 'Partager avec' });
    const modalEmpty = page.getByText('Aucun utilisateur disponible');
    await expect(modalHeading.or(modalEmpty)).toBeVisible({ timeout: 10000 });

    await page.getByRole('button', { name: 'Fermer' }).first().click();
    await expect(modalHeading).not.toBeVisible({ timeout: 5000 });
  });
});
