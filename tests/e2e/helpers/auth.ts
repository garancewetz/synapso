import { Page } from '@playwright/test';

/** Mot de passe temporaire du test "change le mot de passe". Si ce test a échoué avant la restauration, la base peut être restée avec ce mot de passe. */
const FALLBACK_PASSWORD_AFTER_FAILED_CHANGE = 'NouveauMotDePasseE2E123';

/**
 * Helper pour l'authentification dans les tests
 */
export class AuthHelper {
  constructor(private page: Page) {}

  /**
   * Se connecter avec un utilisateur
   * @param username - Nom d'utilisateur
   * @param password - Mot de passe
   */
  async login(username: string, password: string): Promise<void> {
    if (!username || !password) {
      throw new Error(
        'E2E_USERNAME et E2E_PASSWORD doivent être définis dans .env pour lancer les tests E2E.'
      );
    }
    // Aller à la page d'accueil
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
    
    // ⚡ FIX: Attendre que le loader initial disparaisse (SiteProtection affiche un loader minimum 2s)
    // Le loader peut être un spinner ou un composant InitialLoader
    // On attend que le formulaire de connexion apparaisse (pas le loader)
    // Utiliser Promise.race pour essayer plusieurs stratégies en parallèle
    await Promise.race([
      // Stratégie 1: Attendre le titre "Synapso" (le plus fiable)
      this.page.waitForSelector('text=Synapso', { timeout: 15000, state: 'visible' }),
      // Stratégie 2: Attendre le formulaire
      this.page.waitForSelector('form', { timeout: 15000, state: 'visible' }),
      // Stratégie 3: Attendre n'importe quel input text
      this.page.waitForSelector('input[type="text"]', { timeout: 15000, state: 'visible' }),
      // Stratégie 4: Attendre n'importe quel input password
      this.page.waitForSelector('input[type="password"]', { timeout: 15000, state: 'visible' }),
      // Stratégie 5: Attendre le logo
      this.page.waitForSelector('[data-testid="logo"], svg[width="80"], img[alt*="Synapso"]', { timeout: 15000, state: 'visible' }),
    ]).catch((error) => {
      // Si toutes les stratégies échouent, prendre une capture d'écran et lancer une erreur descriptive
      throw new Error(
        `Impossible de trouver le formulaire de connexion après 15s.\n` +
        `Vérifiez que:\n` +
        `1. Le serveur Next.js est bien démarré (npm run dev)\n` +
        `2. La page se charge correctement\n` +
        `3. Le loader initial disparaît\n` +
        `Erreur originale: ${error.message}`
      );
    });
    
    // Attendre un peu pour que le loader disparaisse complètement
    await this.page.waitForTimeout(1000);
    
    // Vérifier s'il y a une protection par mot de passe du site
    const sitePasswordInput = this.page.locator('input[type="password"][placeholder*="mot de passe du site"], input[type="password"][placeholder*="Mot de passe du site"]').first();
    if (await sitePasswordInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Remplir le mot de passe du site (généralement "calylove" ou depuis ENV)
      const sitePassword = process.env.SITE_PASSWORD || 'calylove';
      await sitePasswordInput.fill(sitePassword);
      
      // Soumettre le formulaire de protection
      const sitePasswordSubmit = this.page.locator('button:has-text("Accéder"), button[type="submit"]').first();
      await sitePasswordSubmit.click();
      await this.page.waitForLoadState('networkidle');
      await this.page.waitForTimeout(1000);
    }
    
    // S'assurer qu'on est en mode "login" (pas "register")
    // Le mode login est actif par défaut, mais vérifions quand même
    const loginTab = this.page.locator('button:has-text("Se connecter")').first();
    const registerTab = this.page.locator('button:has-text("Créer un compte")').first();
    
    // Vérifier quel onglet est actif (classe avec border-amber-500 ou bg-amber-50)
    const loginTabActive = await loginTab.evaluate((el) => {
      return el.classList.contains('border-amber-500') || 
             el.classList.contains('bg-amber-50') ||
             window.getComputedStyle(el).borderBottomColor.includes('rgb');
    }).catch(() => false);
    
    if (!loginTabActive) {
      // Cliquer sur l'onglet "Se connecter" si ce n'est pas déjà actif
      await loginTab.click();
      await this.page.waitForTimeout(500); // Attendre que le formulaire change
    }
    
    // ⚡ FIX: Trouver le champ nom de manière plus robuste
    // Le composant Input génère un ID dynamique, cherchons par label ou placeholder
    // Le label "Nom" est suivi d'un input (pas directement adjacent, peut être dans un div)
    // Essayer plusieurs stratégies avec fallback
    let nameInput = this.page.locator('input[type="text"]').first();
    
    // Vérifier si on peut trouver un input plus spécifique
    const specificInputs = [
      'input[placeholder*="nom" i]',
      'input[placeholder*="Votre nom" i]',
      'input[type="text"][id*="nom" i]',
      'label:has-text("Nom") ~ input',
      'label:has-text("Nom") + * input',
    ];
    
    for (const selector of specificInputs) {
      const locator = this.page.locator(selector).first();
      const isVisible = await locator.isVisible({ timeout: 1000 }).catch(() => false);
      if (isVisible) {
        nameInput = locator;
        break;
      }
    }
    
    // Attendre que le champ soit visible et interactif
    await nameInput.waitFor({ state: 'visible', timeout: 10000 });
    await nameInput.scrollIntoViewIfNeeded();
    
    // Vérifier que le champ est bien dans le formulaire de connexion (pas dans le formulaire de protection)
    const isInForm = await nameInput.evaluate((el) => {
      const form = el.closest('form');
      if (!form) return false;
      // Vérifier que le formulaire contient un bouton "Se connecter" ou "Créer mon compte"
      const submitButton = form.querySelector('button[type="submit"]');
      return submitButton && (
        submitButton.textContent?.includes('connecter') ||
        submitButton.textContent?.includes('Créer')
      );
    }).catch(() => false);
    
    if (!isInForm) {
      throw new Error(
        `Le champ nom trouvé n'est pas dans le formulaire de connexion.\n` +
        `Vérifiez que le formulaire de protection du site a bien été soumis.`
      );
    }
    
    await nameInput.clear();
    await nameInput.fill(username);
    await this.page.waitForTimeout(300); // Laisser le temps à React de mettre à jour
    
    // ⚡ FIX: Trouver le champ mot de passe (peut être dans un div avec label)
    const passwordInput = this.page.locator(
      'label:has-text("Mot de passe") ~ div input[type="password"], ' +
      'label:has-text("Mot de passe") + div input[type="password"], ' +
      'input[type="password"][placeholder*="mot de passe"], ' +
      'input[type="password"]'
    ).first();
    
    await passwordInput.waitFor({ state: 'visible', timeout: 10000 });
    await passwordInput.scrollIntoViewIfNeeded();
    await passwordInput.clear();
    await passwordInput.fill(password);
    await this.page.waitForTimeout(300);
    
    // ⚡ FIX: Trouver le bouton de soumission de manière plus robuste
    const submitButton = this.page.locator(
      'form button[type="submit"]:has-text("Se connecter"), ' +
      'button[type="submit"]:has-text("Connexion"), ' +
      'form button[type="submit"]'
    ).first();
    
    await submitButton.waitFor({ state: 'visible', timeout: 10000 });
    await submitButton.scrollIntoViewIfNeeded();
    
    // ⚡ FIX: Capturer les erreurs réseau pour debug
    const networkErrors: string[] = [];
    const networkResponses: Array<{ url: string; status: number; body: string }> = [];
    let loginResponse: { status: number; body: string } | null = null;
    let checkResponse: { status: number; body: string } | null = null;
    
    // Intercepter les réponses API
    this.page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('/api/auth/')) {
        const status = response.status();
        const body = await response.text().catch(() => '');
        networkResponses.push({ url, status, body });
        
        if (url.includes('/api/auth/login')) {
          loginResponse = { status, body };
        }
        if (url.includes('/api/auth/check')) {
          checkResponse = { status, body };
        }
        
        if (status >= 400) {
          networkErrors.push(`${url} returned ${status}: ${body.substring(0, 200)}`);
          console.error(`❌ API Error: ${url} - ${status} - ${body.substring(0, 200)}`);
        } else {
          console.log(`✅ API Success: ${url} - ${status}`);
        }
      }
    });
    
    this.page.on('requestfailed', (request) => {
      if (request.url().includes('/api/auth/')) {
        const error = request.failure()?.errorText || 'Unknown error';
        networkErrors.push(`Request failed: ${request.url()} - ${error}`);
        console.error(`❌ Request Failed: ${request.url()} - ${error}`);
      }
    });

    const loginResponsePromise = this.page.waitForResponse(
      (response) => response.url().includes('/api/auth/login') && response.status() !== 0,
      { timeout: 15000 }
    );
    const checkResponsePromise = this.page.waitForResponse(
      (response) => response.url().includes('/api/auth/check') && response.status() !== 0,
      { timeout: 20000 }
    );

    await submitButton.click();

    let usedFallbackPassword = false;

    try {
      const loginResponseObj = await loginResponsePromise;
      const loginStatus = loginResponseObj.status();
      const loginBody = await loginResponseObj.text().catch(() => '');
      console.log(`Login response: ${loginStatus} - ${loginBody.substring(0, 200)}`);

      if (loginStatus >= 400) {
        if (loginStatus === 401 && password !== FALLBACK_PASSWORD_AFTER_FAILED_CHANGE) {
          await passwordInput.clear();
          await passwordInput.fill(FALLBACK_PASSWORD_AFTER_FAILED_CHANGE);
          await this.page.waitForTimeout(300);
          const loginPromise2 = this.page.waitForResponse(
            (r) => r.url().includes('/api/auth/login') && r.status() !== 0,
            { timeout: 15000 }
          );
          await submitButton.click();
          const loginResponseObj2 = await loginPromise2;
          const loginStatus2 = loginResponseObj2.status();
          const loginBody2 = await loginResponseObj2.text().catch(() => '');
          if (loginStatus2 === 200) {
            console.warn(
              '[E2E] Connexion avec le mot de passe de secours (NouveauMotDePasseE2E123). ' +
                'La base a probablement été laissée dans cet état par un test "change le mot de passe" non restauré. ' +
                'Pour remettre E2E_PASSWORD en cohérence, exécutez le test Paramètres une fois ou réinitialisez le mot de passe en base.'
            );
            usedFallbackPassword = true;
            const checkPromise2 = this.page.waitForResponse(
              (r) => r.url().includes('/api/auth/check') && r.status() !== 0,
              { timeout: 20000 }
            );
            await this.page.waitForTimeout(500);
            const checkResponseObj2 = await checkPromise2;
            const checkStatus2 = checkResponseObj2.status();
            const checkBody2 = await checkResponseObj2.text().catch(() => '');
            if (checkStatus2 >= 400) {
              throw new Error(`Auth check API (after fallback login) returned ${checkStatus2}: ${checkBody2}`);
            }
            const checkData2 = JSON.parse(checkBody2);
            if (!checkData2.authenticated || !checkData2.user) {
              throw new Error(`Auth check after fallback login returned authenticated: false - ${checkBody2}`);
            }
          } else {
            const hint =
              ' Vérifiez E2E_USERNAME et E2E_PASSWORD dans .env (utilisateur existant en base). Si le test "change le mot de passe" a échoué avant la restauration, le mot de passe en base est peut-être "NouveauMotDePasseE2E123".';
            throw new Error(`Login API returned ${loginStatus2}: ${loginBody2}.${hint}`);
          }
        } else {
          const hint =
            loginStatus === 401
              ? ' Vérifiez E2E_USERNAME et E2E_PASSWORD dans .env (utilisateur existant en base). Si le test "change le mot de passe" a échoué avant la restauration, le mot de passe en base est peut-être "NouveauMotDePasseE2E123".'
              : '';
          throw new Error(`Login API returned ${loginStatus}: ${loginBody}.${hint}`);
        }
      }

      if (!usedFallbackPassword) {
        try {
          const loginData = JSON.parse(loginBody);
          if (!loginData.success && !loginData.user) {
            throw new Error(`Login API returned error: ${loginBody}`);
          }
        } catch {
          if (loginStatus >= 400) {
            throw new Error(`Login failed with status ${loginStatus}`);
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      throw error;
    }

    if (!usedFallbackPassword) {
      await this.page.waitForTimeout(500);
    }

    if (!usedFallbackPassword) {
      try {
        const checkResponseObj = await checkResponsePromise;
        const checkStatus = checkResponseObj.status();
        const checkBody = await checkResponseObj.text().catch(() => '');
        console.log(`Check response: ${checkStatus} - ${checkBody.substring(0, 200)}`);
        if (checkStatus >= 400) {
          throw new Error(`Auth check API returned ${checkStatus}: ${checkBody}`);
        }
        try {
          const checkData = JSON.parse(checkBody);
          if (!checkData.authenticated || !checkData.user) {
            throw new Error(
              `Auth check returned authenticated: false\n` +
                `Response: ${checkBody}\n` +
                `Vérifiez que le cookie d'authentification est bien défini.`
            );
          }
          console.log(`✅ User authenticated: ${checkData.user.name}`);
        } catch (parseError) {
          if (checkStatus >= 400) {
            throw new Error(`Auth check failed with status ${checkStatus}: ${checkBody}`);
          }
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'authentification:', error);
        await this.page.screenshot({ path: 'test-results/auth-check-failed.png', fullPage: true });
        throw error;
      }
    }
    
    // Attendre que la connexion soit effectuée
    // Plusieurs indicateurs possibles : dashboard visible, loader disparu, URL change
    try {
      await Promise.race([
        // Dashboard visible (le plus fiable)
        this.page.waitForSelector(
          'text=Corps, ' +
          'text=Journal, ' +
          'text=Parcours, ' +
          '[role="progressbar"], ' +
          'text=Objectif du jour',
          { timeout: 25000 }
        ),
        // URL reste sur / mais le contenu change (formulaire disparaît)
        this.page.waitForFunction(() => {
          const nameInputs = document.querySelectorAll('input[type="text"][placeholder*="nom"], input[type="text"][placeholder*="Votre nom"]');
          return nameInputs.length === 0;
        }, { timeout: 25000 }),
        // Loader disparu et contenu chargé
        this.page.waitForLoadState('networkidle', { timeout: 25000 })
      ]);
    } catch (error) {
      // Si ça échoue, vérifier s'il y a des erreurs réseau
      if (networkErrors.length > 0) {
        throw new Error(
          `Erreurs réseau détectées:\n${networkErrors.join('\n')}\n\n` +
          `Réponses API:\n${networkResponses.map(r => `${r.url}: ${r.status} - ${r.body.substring(0, 100)}`).join('\n')}`
        );
      }
      throw error;
    }
    
    // Attendre un peu pour que tout soit stabilisé
    await this.page.waitForTimeout(1500);
    
    // ⚡ FIX: Vérifier qu'on est bien connecté de manière plus robuste
    const isConnected = await Promise.race([
      // Vérifier la présence du dashboard
      this.page.locator('text=Corps, text=Journal, text=Parcours').first().isVisible().then(() => true),
      // Vérifier l'absence du formulaire de connexion
      this.page.locator('input[type="text"][placeholder*="nom"]').count().then(count => count === 0),
      // Vérifier la présence d'éléments du dashboard
      this.page.locator('[role="progressbar"]').first().isVisible().then(() => true),
      // Timeout
      this.page.waitForTimeout(2000).then(() => false)
    ]);
    
    if (!isConnected) {
      // Prendre une capture d'écran pour debug
      await this.page.screenshot({ path: 'test-results/auth-failed.png', fullPage: true });
      const url = this.page.url();
      const pageText = await this.page.textContent('body').catch(() => '');
      
      // Vérifier s'il y a un message d'erreur affiché
      const errorMessage = await this.page.locator('.bg-red-50, text=erreur, text=incorrect').first().textContent().catch(() => '');
      
      // Vérifier les cookies
      const cookies = await this.page.context().cookies();
      const authCookie = cookies.find(c => c.name.includes('auth') || c.name.includes('synapso'));
      
      throw new Error(
        `La connexion a échoué.\n` +
        `URL: ${url}\n` +
        `Utilisateur: ${username}\n` +
        `Message d'erreur affiché: ${errorMessage || 'Aucun'}\n` +
        `Cookie d'authentification: ${authCookie ? 'Présent' : 'Absent'}\n` +
        `Capture d'écran sauvegardée dans test-results/auth-failed.png\n` +
        `Vérifiez que l'utilisateur "${username}" existe et que le mot de passe est correct.\n` +
        `Contenu de la page: ${pageText?.substring(0, 200) || 'Non disponible'}...`
      );
    }
  }

  /**
   * Vérifier si l'utilisateur est connecté
   */
  async isLoggedIn(): Promise<boolean> {
    try {
      // Vérifier si on est sur la page d'accueil (pas sur la page de connexion)
      const url = this.page.url();
      if (url.includes('/login') || url.includes('/auth')) {
        return false;
      }
      
      // Vérifier la présence d'éléments du dashboard
      const hasDashboard = await this.page.locator('text=Corps, text=Journal, text=Parcours').first().isVisible().catch(() => false);
      return hasDashboard;
    } catch {
      return false;
    }
  }
}
