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

  test('change d\'onglet sur la page d\'accueil et affiche le contenu spécifique', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: 'Suivi' }).click();
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/Mes progrès|Mes statistiques|Journal/).first()).toBeVisible({ timeout: 5000 });

    await page.getByRole('button', { name: /Épinglé/ }).click();
    await page.waitForLoadState('networkidle');
    const pinnedContent = await page.getByText(/Épinglé|Aucun élément épinglé|Rien d'épinglé/).first().isVisible({ timeout: 5000 }).catch(() => false);
    expect(pinnedContent).toBeTruthy();

    await page.getByRole('button', { name: 'Exercices', exact: true }).click();
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/Corps|Haut du corps|Objectif/).first()).toBeVisible({ timeout: 5000 });
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
