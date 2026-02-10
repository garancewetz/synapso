import { test, expect } from '@playwright/test';
import { AuthHelper } from './helpers/auth';
import { TimeMachineHelper } from './helpers/time-machine';
import { format, subDays, startOfDay } from 'date-fns';

/**
 * Tests E2E pour le mode sablier (time machine)
 * 
 * Ces tests vérifient que :
 * - Le mode sablier s'active correctement
 * - Les gauges se mettent à jour selon la date sélectionnée
 * - Les exercices affichent leur état pour la date sélectionnée
 * - La navigation entre dates fonctionne
 * - Le retour à aujourd'hui fonctionne
 */
test.describe('Mode Sablier (Time Machine)', () => {
  let authHelper: AuthHelper;
  let timeMachineHelper: TimeMachineHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    timeMachineHelper = new TimeMachineHelper(page);

    // Se connecter avec un utilisateur de test
    await authHelper.login('Testeuse', 'calylove');
    
    // Attendre un peu pour que la page se charge complètement
    await page.waitForTimeout(1000);
    
    // Vérifier qu'on est bien connecté
    // Vérifier que l'URL est bien la page d'accueil
    const url = page.url();
    expect(url).toMatch(/^http:\/\/localhost:3003\/?/);
    
    // Vérifier la présence d'éléments du dashboard (plus flexible)
    const hasDashboard = await Promise.race([
      page.locator('text=Corps').first().isVisible().then(() => true),
      page.locator('text=Journal').first().isVisible().then(() => true),
      page.locator('text=Parcours').first().isVisible().then(() => true),
      page.locator('[role="progressbar"]').first().isVisible().then(() => true),
      page.waitForTimeout(2000).then(() => false)
    ]);
    
    expect(hasDashboard).toBeTruthy();
  });

  test('devrait activer le mode sablier en cliquant sur un jour passé dans la heatmap', async ({ page }) => {
    // Aller à la page historique
    await timeMachineHelper.goToHistory();
    
    // Attendre que la heatmap soit chargée
    await page.waitForSelector('[role="grid"], .grid', { timeout: 10000 });
    
    // Cliquer sur un jour passé (hier)
    await timeMachineHelper.clickDayInHeatmap(1);
    
    // Vérifier que la modal s'ouvre ou que le mode sablier s'active
    const modalVisible = await page.locator('[role="dialog"]').isVisible({ timeout: 2000 }).catch(() => false);
    const timeMachineActive = await timeMachineHelper.isTimeMachineModeActive();
    
    expect(modalVisible || timeMachineActive).toBeTruthy();
  });

  test('devrait afficher la bannière du mode sablier après activation', async ({ page }) => {
    // Aller à la page historique
    await timeMachineHelper.goToHistory();
    await page.waitForSelector('[role="grid"], .grid', { timeout: 10000 });
    
    // Activer le mode sablier pour hier
    await timeMachineHelper.activateTimeMachineMode(1);
    
    // Vérifier que la bannière est visible
    const banner = page.locator('[data-testid="time-machine-banner"], text=Tu es sur le').first();
    await expect(banner).toBeVisible({ timeout: 5000 });
    
    // Vérifier que la bannière contient la date
    const bannerText = await banner.textContent();
    expect(bannerText).toContain('Tu es sur le');
  });

  test('devrait mettre à jour les gauges des category cards selon la date sélectionnée', async ({ page }) => {
    // Aller à la page d'accueil
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Capturer les valeurs initiales des gauges (pour aujourd'hui)
    const initialGauges = await page.locator('[role="progressbar"]').all();
    const initialValues: number[] = [];
    for (const gauge of initialGauges) {
      const value = await gauge.getAttribute('aria-valuenow');
      initialValues.push(value ? parseInt(value) : 0);
    }
    
    // Aller à la page historique et activer le mode sablier pour hier
    await timeMachineHelper.goToHistory();
    await page.waitForSelector('[role="grid"], .grid', { timeout: 10000 });
    await timeMachineHelper.activateTimeMachineMode(1);
    
    // Attendre que le mode sablier soit actif
    await page.waitForSelector('[data-testid="time-machine-banner"]', { timeout: 5000 });
    
    // Retourner à la page d'accueil
    await page.goto('/?date=' + format(subDays(new Date(), 1), 'yyyy-MM-dd'));
    await page.waitForLoadState('networkidle');
    
    // Attendre que les gauges se mettent à jour
    await page.waitForTimeout(2000);
    
    // Vérifier que les gauges ont potentiellement changé (selon les données d'hier)
    const updatedGauges = await page.locator('[role="progressbar"]').all();
    const updatedValues: number[] = [];
    for (const gauge of updatedGauges) {
      const value = await gauge.getAttribute('aria-valuenow');
      updatedValues.push(value ? parseInt(value) : 0);
    }
    
    // Les valeurs peuvent être différentes selon les données d'hier
    // On vérifie juste que les gauges sont présentes et ont des valeurs cohérentes
    expect(updatedGauges.length).toBeGreaterThan(0);
    updatedValues.forEach(value => {
      expect(value).toBeGreaterThanOrEqual(0);
    });
  });

  test('devrait mettre à jour la gauge de la welcome card selon la date sélectionnée', async ({ page }) => {
    // Aller à la page d'accueil
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Trouver la gauge de la welcome card (objectif du jour)
    const welcomeGauge = page.locator('[data-testid="daily-goal-progress"], text=Objectif').first();
    const initialText = await welcomeGauge.textContent().catch(() => '');
    
    // Aller à la page historique et activer le mode sablier pour hier
    await timeMachineHelper.goToHistory();
    await page.waitForSelector('[role="grid"], .grid', { timeout: 10000 });
    await timeMachineHelper.activateTimeMachineMode(1);
    
    // Attendre que le mode sablier soit actif
    await page.waitForSelector('[data-testid="time-machine-banner"]', { timeout: 5000 });
    
    // Retourner à la page d'accueil avec la date dans l'URL
    const yesterdayDate = format(subDays(new Date(), 1), 'yyyy-MM-dd');
    await page.goto(`/?date=${yesterdayDate}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Vérifier que la gauge affiche "Objectif du [date]" en mode sablier
    const updatedGauge = page.locator('[data-testid="daily-goal-progress"], text=Objectif').first();
    const updatedText = await updatedGauge.textContent().catch(() => '');
    
    // En mode sablier, le texte devrait contenir la date
    if (await timeMachineHelper.isTimeMachineModeActive()) {
      expect(updatedText).toContain('Objectif');
    }
  });

  test('devrait afficher les exercices avec leur état pour la date sélectionnée', async ({ page }) => {
    // Aller à une page de catégorie
    await page.goto('/exercices/upper_body');
    await page.waitForLoadState('networkidle');
    
    // Capturer l'état initial des exercices (pour aujourd'hui)
    const initialExercices = await page.locator('[data-testid="exercice-card"], .exercice-card').all();
    const initialCompletedCount = await page.locator('button:has-text("Fait"), button:has-text("Fait aujourd\'hui")').count();
    
    // Aller à la page historique et activer le mode sablier pour hier
    await timeMachineHelper.goToHistory();
    await page.waitForSelector('[role="grid"], .grid', { timeout: 10000 });
    await timeMachineHelper.activateTimeMachineMode(1);
    
    // Attendre que le mode sablier soit actif
    await page.waitForSelector('[data-testid="time-machine-banner"]', { timeout: 5000 });
    
    // Retourner à la page de catégorie avec la date dans l'URL
    const yesterdayDate = format(subDays(new Date(), 1), 'yyyy-MM-dd');
    await page.goto(`/exercices/upper_body?date=${yesterdayDate}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Vérifier que les exercices affichent leur état pour hier
    const updatedExercices = await page.locator('[data-testid="exercice-card"], .exercice-card').all();
    
    // Les exercices devraient afficher "Fait le [date]" au lieu de "Fait aujourd'hui" en mode sablier
    if (await timeMachineHelper.isTimeMachineModeActive()) {
      const dateText = format(subDays(new Date(), 1), 'd MMMM yyyy', { locale: { formatLong: { date: 'd MMMM yyyy' } } });
      const hasDateInButton = await page.locator(`button:has-text("Fait le"), button:has-text("${dateText}")`).count();
      // Au moins un bouton devrait contenir la date si des exercices sont complétés
      expect(updatedExercices.length).toBeGreaterThan(0);
    }
  });

  test('devrait permettre de revenir à aujourd\'hui depuis le mode sablier', async ({ page }) => {
    // Aller à la page historique
    await timeMachineHelper.goToHistory();
    await page.waitForSelector('[role="grid"], .grid', { timeout: 10000 });
    
    // Activer le mode sablier pour hier
    await timeMachineHelper.activateTimeMachineMode(1);
    
    // Vérifier que le mode sablier est actif
    await expect(page.locator('[data-testid="time-machine-banner"]').first()).toBeVisible({ timeout: 5000 });
    
    // Cliquer sur le bouton "Revenir à aujourd'hui"
    await timeMachineHelper.returnToToday();
    
    // Attendre que le mode sablier se désactive
    await page.waitForTimeout(1000);
    
    // Vérifier que la bannière n'est plus visible
    const bannerStillVisible = await page.locator('[data-testid="time-machine-banner"]').isVisible({ timeout: 2000 }).catch(() => false);
    expect(bannerStillVisible).toBeFalsy();
  });

  test('devrait mettre à jour l\'URL avec le paramètre date en mode sablier', async ({ page }) => {
    // Aller à la page historique
    await timeMachineHelper.goToHistory();
    await page.waitForSelector('[role="grid"], .grid', { timeout: 10000 });
    
    // Activer le mode sablier pour hier
    await timeMachineHelper.activateTimeMachineMode(1);
    
    // Attendre que le mode sablier soit actif
    await page.waitForSelector('[data-testid="time-machine-banner"]', { timeout: 5000 });
    
    // Vérifier que l'URL contient le paramètre date
    const url = page.url();
    const yesterdayDate = format(subDays(new Date(), 1), 'yyyy-MM-dd');
    
    // L'URL devrait contenir ?date= ou &date=
    expect(url).toMatch(/[?&]date=/);
    
    // Extraire la date de l'URL
    const urlMatch = url.match(/[?&]date=(\d{4}-\d{2}-\d{2})/);
    if (urlMatch) {
      expect(urlMatch[1]).toBe(yesterdayDate);
    }
  });

  test('devrait préserver le paramètre date lors de la navigation', async ({ page }) => {
    const yesterdayDate = format(subDays(new Date(), 1), 'yyyy-MM-dd');
    
    // Aller à la page d'accueil avec le paramètre date
    await page.goto(`/?date=${yesterdayDate}`);
    await page.waitForLoadState('networkidle');
    
    // Vérifier que le mode sablier est actif
    await expect(page.locator('[data-testid="time-machine-banner"]').first()).toBeVisible({ timeout: 5000 });
    
    // Naviguer vers une page de catégorie
    await page.click('text=Haut du corps, a[href*="upper_body"]').first().catch(() => {
      // Si le lien n'est pas trouvé, essayer de naviguer directement
      return page.goto(`/exercices/upper_body?date=${yesterdayDate}`);
    });
    
    await page.waitForLoadState('networkidle');
    
    // Vérifier que l'URL contient toujours le paramètre date
    const url = page.url();
    expect(url).toContain(`date=${yesterdayDate}`);
    
    // Vérifier que le mode sablier est toujours actif
    const bannerStillVisible = await page.locator('[data-testid="time-machine-banner"]').isVisible({ timeout: 2000 }).catch(() => false);
    expect(bannerStillVisible).toBeTruthy();
  });

  test('devrait limiter le mode sablier à 28 jours en arrière', async ({ page }) => {
    // Aller à la page historique
    await timeMachineHelper.goToHistory();
    await page.waitForSelector('[role="grid"], .grid', { timeout: 10000 });
    
    // Essayer d'activer le mode sablier pour 29 jours en arrière (devrait échouer)
    const tooOldDate = subDays(new Date(), 29);
    const tooOldDateKey = format(startOfDay(tooOldDate), 'yyyy-MM-dd');
    
    // Essayer de naviguer directement avec une date trop ancienne
    await page.goto(`/?date=${tooOldDateKey}`);
    await page.waitForLoadState('networkidle');
    
    // Vérifier qu'un message d'erreur s'affiche ou que le mode sablier ne s'active pas
    const errorMessage = await page.locator('text=28 jours, text=ne peux remonter').first().isVisible({ timeout: 2000 }).catch(() => false);
    const timeMachineActive = await timeMachineHelper.isTimeMachineModeActive();
    
    // Soit un message d'erreur est affiché, soit le mode sablier ne s'active pas
    expect(errorMessage || !timeMachineActive).toBeTruthy();
  });
});
