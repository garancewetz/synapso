import { config } from 'dotenv';
import { defineConfig, devices } from '@playwright/test';

config();

/**
 * Configuration Playwright pour les tests E2E.
 * Le serveur Next.js doit tourner en local (npm run dev) avec DATABASE_URL_DEV.
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  timeout: 60000,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3003',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: process.env.CI
    ? undefined
    : {
        command: 'npm run dev',
        url: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3003',
        reuseExistingServer: !process.env.CI,
        timeout: 120000,
      },
});
