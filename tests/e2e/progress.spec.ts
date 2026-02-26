import { test, expect } from '@playwright/test';
import { AuthHelper } from './helpers/auth';
import { TEST_USER } from './helpers/test-constants';

test.describe('Progrès', () => {
  test.beforeEach(async ({ page }) => {
    const authHelper = new AuthHelper(page);
    await authHelper.login(TEST_USER.username, TEST_USER.password);
  });

  test('crée un nouveau progrès', async ({ page }) => {
    await page.goto('/historique');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: 'Noter un progrès' }).first().click();

    await expect(page.getByPlaceholder('Décris ton progrès...')).toBeVisible({
      timeout: 10000,
    });

    const content = 'Progrès E2E créé';
    await page.getByPlaceholder('Décris ton progrès...').fill(content);
    await page.getByRole('button', { name: 'Noter !' }).click();

    await expect(page.getByPlaceholder('Décris ton progrès...')).not.toBeVisible({
      timeout: 5000,
    });
    await expect(page.getByText(content).first()).toBeVisible({ timeout: 10000 });
  });

  test('modifie un progrès', async ({ page }) => {
    await page.goto('/historique');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: 'Ouvrir les actions' }).first().waitFor({
      state: 'visible',
      timeout: 15000,
    });
    await page.getByRole('button', { name: 'Ouvrir les actions' }).first().click();
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: /^Modifier$/ }).first().click({ force: true });

    await expect(page.getByPlaceholder('Décris ton progrès...')).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByPlaceholder('Décris ton progrès...')).not.toHaveValue('', {
      timeout: 5000,
    });

    const newContent = 'Progrès E2E modifié';
    await page.getByPlaceholder('Décris ton progrès...').clear();
    await page.getByPlaceholder('Décris ton progrès...').fill(newContent);
    await page.getByRole('button', { name: '✅ Modifier' }).click();

    await expect(page.getByPlaceholder('Décris ton progrès...')).not.toBeVisible({
      timeout: 5000,
    });
    await expect(page.getByText(newContent).first()).toBeVisible({ timeout: 10000 });
  });

  test('supprime un progrès', async ({ page }) => {
    await page.goto('/historique');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: 'Noter un progrès' }).first().click();
    await expect(page.getByPlaceholder('Décris ton progrès...')).toBeVisible({
      timeout: 10000,
    });

    const contentToDelete = 'Progrès E2E à supprimer';
    await page.getByPlaceholder('Décris ton progrès...').fill(contentToDelete);
    await page.getByRole('button', { name: 'Noter !' }).click();

    await expect(page.getByText(contentToDelete).first()).toBeVisible({ timeout: 10000 });

    await page.getByRole('button', { name: 'Ouvrir les actions' }).first().click();
    await page.waitForTimeout(500);
    const modifierBtn = page.getByRole('button', { name: /^Modifier$/ }).first();
    await modifierBtn.scrollIntoViewIfNeeded();
    await modifierBtn.evaluate((el: HTMLElement) => el.click());

    await expect(page.getByRole('button', { name: '🗑️ Supprimer ce progrès' })).toBeVisible({
      timeout: 15000,
    });
    await page.getByRole('button', { name: '🗑️ Supprimer ce progrès' }).click();
    await page
      .getByRole('button', { name: '⚠️ Confirmer la suppression' })
      .waitFor({ state: 'visible', timeout: 5000 });
    await page.getByRole('button', { name: '⚠️ Confirmer la suppression' }).click();

    await expect(page.getByPlaceholder('Décris ton progrès...')).not.toBeVisible({
      timeout: 5000,
    });
    await page.goto('/historique');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(contentToDelete)).toHaveCount(0, { timeout: 15000 });
  });
});
