import { defineConfig, devices } from '@playwright/test';
import { config } from './config/environments';

export default defineConfig({
  testDir: './tests',
  outputDir: './reports/results',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // Reintento solo en CI: mitiga inestabilidad del demo publico sin ocultar fallas en local.
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  reporter: [
    ['list'],
    ['html', { outputFolder: 'reports/html', open: 'never' }],
    ['junit', { outputFile: 'reports/junit.xml' }],
  ],
  use: {
    headless: config.headless,
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    // Captura al final de cada prueba como evidencia (exitosa o fallida); video y trace solo si falla.
    screenshot: 'on',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'web-chromium',
      testDir: './tests/web',
      use: { ...devices['Desktop Chrome'], baseURL: config.webBaseUrl },
    },
    {
      // Navegador adicional opcional: npm run test:firefox
      name: 'web-firefox',
      testDir: './tests/web',
      use: { ...devices['Desktop Firefox'], baseURL: config.webBaseUrl },
    },
    {
      name: 'api',
      testDir: './tests/api',
      use: { baseURL: config.apiBaseUrl },
    },
  ],
});
