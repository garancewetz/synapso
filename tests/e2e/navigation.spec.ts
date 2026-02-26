import { test, expect } from '@playwright/test';
import { AuthHelper } from './helpers/auth';
import { TEST_USER } from './helpers/test-constants';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    const authHelper = new AuthHelper(page);
    await authHelper.login(TEST_USER.username, TEST_USER.password);
  });

  test('affiche la page d\'accueil après connexion', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/Corps|Journal|Parcours|Objectif/).first()).toBeVisible({
      timeout: 10000,
    });
  });

  test('affiche la page historique', async ({ page }) => {
    await page.goto('/historique');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: /Ma progression|progression/ })).toBeVisible({
      timeout: 10000,
    });
  });

  test('affiche une page de catégorie d\'exercices', async ({ page }) => {
    await page.goto('/exercices/upper_body');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: 'Haut du corps', level: 1 })).toBeVisible({
      timeout: 10000,
    });
  });

  test('affiche la page paramètres', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('button', { name: 'Se déconnecter' })).toBeVisible({
      timeout: 10000,
    });
  });

  test('affiche la page notifications', async ({ page }) => {
    await page.goto('/notifications');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: 'Notifications' })).toBeVisible({
      timeout: 10000,
    });
  });

  test('affiche la page Vue par équipement', async ({ page }) => {
    await page.goto('/exercices/all');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: 'Vue par équipement' })).toBeVisible({
      timeout: 10000,
    });
  });

  test('affiche la page Exercices archivés', async ({ page }) => {
    await page.goto('/exercices/archived');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: 'Exercices archivés', level: 1 })).toBeVisible({
      timeout: 10000,
    });
  });
});
