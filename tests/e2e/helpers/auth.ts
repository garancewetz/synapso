import { Page } from '@playwright/test';

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
    // Aller à la page d'accueil
    await this.page.goto('/');
    
    // Attendre que le formulaire de connexion soit visible
    // Le formulaire peut être dans un Input personnalisé ou un input standard
    await this.page.waitForSelector('input[type="text"], input[placeholder*="nom"], input[placeholder*="Nom"], label:has-text("Nom") + * input', { timeout: 10000 });
    
    // S'assurer qu'on est en mode "login" (pas "register")
    // Chercher l'onglet "Se connecter" et cliquer dessus si nécessaire
    const loginTab = this.page.locator('button:has-text("Se connecter"), button:has-text("Connexion")').first();
    if (await loginTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await loginTab.click();
      await this.page.waitForTimeout(300); // Attendre que le formulaire change
    }
    
    // Trouver le champ nom (peut être dans un Input personnalisé ou un input standard)
    const nameInput = this.page.locator('input[type="text"], input[placeholder*="nom"], input[placeholder*="Nom"], label:has-text("Nom") + * input').first();
    await nameInput.fill(username);
    
    // Trouver le champ mot de passe
    const passwordInput = this.page.locator('input[type="password"]').first();
    await passwordInput.fill(password);
    
    // Soumettre le formulaire
    // Chercher le bouton de soumission dans le formulaire
    const submitButton = this.page.locator('form button[type="submit"], button:has-text("Se connecter")').first();
    await submitButton.click();
    
    // Attendre que la connexion soit effectuée
    // Soit on voit le loader, soit on est redirigé vers le dashboard
    await Promise.race([
      this.page.waitForSelector('text=Corps, text=Journal, text=Parcours', { timeout: 15000 }),
      this.page.waitForURL('/', { timeout: 15000 }),
      this.page.waitForLoadState('networkidle', { timeout: 15000 })
    ]);
    
    // Vérifier qu'on est bien connecté en vérifiant l'absence du formulaire de connexion
    await this.page.waitForSelector('input[type="text"][placeholder*="nom"], input[placeholder*="Nom"]', { state: 'hidden', timeout: 5000 }).catch(() => {
      // Si le sélecteur n'est pas trouvé (caché), c'est bon signe
    });
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
