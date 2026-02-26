import { test, expect } from '@playwright/test';
import { AuthHelper } from './helpers/auth';
import { TEST_USER } from './helpers/test-constants';

test.describe('Exercices', () => {
  test.beforeEach(async ({ page }) => {
    const authHelper = new AuthHelper(page);
    await authHelper.login(TEST_USER.username, TEST_USER.password);
  });

  test('crée un nouvel exercice', async ({ page }) => {
    await page.goto('/exercice/add');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: 'Ajouter un exercice' })).toBeVisible({
      timeout: 10000,
    });

    // Étape 1 : Nom et description
    await page.getByPlaceholder('Ex: Montée de genoux').fill('Exercice E2E créé');
    await page.getByPlaceholder('Décrivez comment réaliser l\'exercice...').fill('Description du test');
    await page.getByRole('button', { name: 'Suivant →' }).click();

    // Étape 2 : Catégorie et parties du corps
    await page.getByRole('button', { name: 'Haut' }).click();
    await page.getByRole('button', { name: 'Bras' }).click();
    await page.getByRole('button', { name: 'Suivant →' }).click();

    // Étape 3 : Paramètres workout et soumission
    await page.getByPlaceholder('Ex: 10').fill('12');
    await page.getByPlaceholder('Ex: 3', { exact: true }).fill('2');
    await page.getByPlaceholder('Ex: 30 secondes').fill('45 secondes');

    await page.getByRole('button', { name: "Créer l'exercice" }).click();

    await expect(page).not.toHaveURL(/\/exercice\/add/);
    await page.goto('/exercices/upper_body');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Exercice E2E créé').first()).toBeVisible({ timeout: 10000 });
  });

  test('modifie un exercice et vérifie que chaque champ se met à jour', async ({ page }) => {
    await page.goto('/exercices/upper_body');
    await page.waitForLoadState('networkidle');

    const firstCard = page.locator('.exercise-card').first();
    await firstCard.waitFor({ state: 'visible', timeout: 15000 });
    await firstCard.getByRole('button', { name: 'Ouvrir les actions' }).click();
    await page.waitForTimeout(500);
    await firstCard.getByRole('button', { name: 'Modifier' }).click({ force: true });

    await expect(page).toHaveURL(/\/exercice\/edit\/\d+/, { timeout: 10000 });
    await expect(page.getByRole('heading', { name: "Modifier l'exercice" })).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByPlaceholder('Ex: Montée de genoux')).not.toHaveValue('', {
      timeout: 10000,
    });

    const newName = 'Exercice E2E modifié';
    const newDescription = 'Description modifiée';
    const newComment = 'Conseil modifié';
    const newRepeat = '15';
    const newSeries = '4';
    const newDuration = '60 secondes';

    // Étape 1 : Modifier nom, description, conseil
    await page.getByPlaceholder('Ex: Montée de genoux').clear();
    await page.getByPlaceholder('Ex: Montée de genoux').fill(newName);
    await page.getByPlaceholder('Décrivez comment réaliser l\'exercice...').clear();
    await page.getByPlaceholder('Décrivez comment réaliser l\'exercice...').fill(newDescription);
    await page.getByPlaceholder('Ajoutez un conseil ou une remarque...').clear();
    await page.getByPlaceholder('Ajoutez un conseil ou une remarque...').fill(newComment);
    await page.getByRole('button', { name: 'Suivant →' }).click();

    // Étape 2 : Modifier catégorie et parties du corps
    await page.getByRole('button', { name: 'Milieu' }).click();
    await page.getByRole('button', { name: 'Dos' }).click();
    await page.getByRole('button', { name: 'Suivant →' }).click();

    // Étape 3 : Modifier paramètres workout et enregistrer
    await page.getByPlaceholder('Ex: 10').clear();
    await page.getByPlaceholder('Ex: 10').fill(newRepeat);
    await page.getByPlaceholder('Ex: 3', { exact: true }).clear();
    await page.getByPlaceholder('Ex: 3', { exact: true }).fill(newSeries);
    await page.getByPlaceholder('Ex: 30 secondes').clear();
    await page.getByPlaceholder('Ex: 30 secondes').fill(newDuration);

    await page.getByRole('button', { name: 'Enregistrer les modifications' }).click();

    await expect(page).not.toHaveURL(/\/exercice\/edit/);
    await page.goto('/exercices/core');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(newName).first()).toBeVisible({ timeout: 10000 });

    // Vérification : rouvrir l'exercice et parcourir les étapes
    const cardWithNewName = page.locator('.exercise-card').filter({ hasText: newName }).first();
    await cardWithNewName.getByRole('button', { name: 'Ouvrir les actions' }).click();
    await page.waitForTimeout(500);
    await cardWithNewName.getByRole('button', { name: 'Modifier' }).click({ force: true });

    // Vérifier étape 1 : textes
    await expect(page.getByPlaceholder('Ex: Montée de genoux')).toHaveValue(newName);
    await expect(page.getByPlaceholder('Décrivez comment réaliser l\'exercice...')).toHaveValue(
      newDescription
    );
    await expect(page.getByPlaceholder('Ajoutez un conseil ou une remarque...')).toHaveValue(
      newComment
    );
    await page.getByRole('button', { name: 'Suivant →' }).click();

    // Vérifier étape 2 : catégorie
    await expect(page.getByRole('button', { name: 'Milieu' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    await page.getByRole('button', { name: 'Suivant →' }).click();

    // Vérifier étape 3 : workout
    await expect(page.getByPlaceholder('Ex: 10')).toHaveValue(newRepeat);
    await expect(page.getByPlaceholder('Ex: 3', { exact: true })).toHaveValue(newSeries);
    await expect(page.getByPlaceholder('Ex: 30 secondes')).toHaveValue(newDuration);
  });

  test('supprime un exercice', async ({ page }) => {
    // Créer d'abord un exercice à supprimer
    await page.goto('/exercice/add');
    await page.waitForLoadState('networkidle');

    const nameToDelete = 'Exercice E2E à supprimer';
    // Étape 1 : Nom
    await page.getByPlaceholder('Ex: Montée de genoux').fill(nameToDelete);
    await page.getByRole('button', { name: 'Suivant →' }).click();
    // Étape 2 : Catégorie (Haut du corps par défaut)
    await page.getByRole('button', { name: 'Suivant →' }).click();
    // Étape 3 : Créer
    await page.getByRole('button', { name: "Créer l'exercice" }).click();

    await expect(page).not.toHaveURL(/\/exercice\/add/);
    await page.goto('/exercices/upper_body');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(nameToDelete).first()).toBeVisible({ timeout: 10000 });

    // Ouvrir la page d'édition
    const cardToDelete = page.locator('.exercise-card').filter({ hasText: nameToDelete }).first();
    await cardToDelete.getByRole('button', { name: 'Ouvrir les actions' }).click();
    await page.waitForTimeout(500);
    await cardToDelete.getByRole('button', { name: 'Modifier' }).click({ force: true });

    await expect(page).toHaveURL(/\/exercice\/edit\/\d+/);

    // Le bouton supprimer est accessible depuis n'importe quelle étape
    await page.getByRole('button', { name: "Supprimer l'exercice" }).click();
    await page
      .getByRole('button', { name: '⚠️ Confirmer la suppression' })
      .waitFor({ state: 'visible', timeout: 5000 });
    await page.getByRole('button', { name: '⚠️ Confirmer la suppression' }).click();

    await expect(page).not.toHaveURL(/\/exercice\/edit/);
    await page.goto('/exercices/upper_body');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(nameToDelete)).toHaveCount(0, { timeout: 15000 });
  });
});
