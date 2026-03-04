import { config } from 'dotenv';

// Charger .env ici aussi (en plus de playwright.config.ts)
// pour que les variables soient disponibles même quand l'IDE évalue ce module avant le config.
config();

/**
 * Constantes partagées pour les tests E2E.
 * Identifiants lus depuis .env (E2E_USERNAME, E2E_PASSWORD).
 * Pour que le test "change le mot de passe" passe : E2E_PASSWORD doit correspondre
 * au mot de passe en base (ex. Calypso123 pour l'utilisateur créé par le seed).
 */
export const TEST_USER = {
  username: process.env.E2E_USERNAME ?? '',
  password: process.env.E2E_PASSWORD ?? '',
} as const;
