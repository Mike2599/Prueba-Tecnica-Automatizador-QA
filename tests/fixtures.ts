import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { PimPage } from '../pages/PimPage';
import { config } from '../config/environments';

type Pages = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  pimPage: PimPage;
  /** Sesion iniciada de forma independiente en cada prueba (no depende del orden). */
  loggedIn: DashboardPage;
};

export const test = base.extend<Pages>({
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  dashboardPage: async ({ page }, use) => use(new DashboardPage(page)),
  pimPage: async ({ page }, use) => use(new PimPage(page)),
  loggedIn: async ({ page, loginPage, dashboardPage }, use) => {
    await loginPage.open();
    await loginPage.login(config.credentials.username, config.credentials.password);
    await expect(page).toHaveURL(DashboardPage.URL_PATTERN);
    await expect(dashboardPage.title).toBeVisible();
    await use(dashboardPage);
  },
});

export { expect };
