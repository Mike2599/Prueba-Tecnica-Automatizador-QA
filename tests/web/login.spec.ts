import { test, expect } from '../fixtures';
import { DashboardPage } from '../../pages/DashboardPage';
import { config } from '../../config/environments';
import { webData } from '../../data/testData';

test.describe('Escenario A - Inicio de sesion', { tag: ['@web', '@smoke'] }, () => {
  test('WEB-01 Login exitoso con credenciales validas muestra el Dashboard', async ({
    page,
    loginPage,
    dashboardPage,
  }) => {
    await test.step('Abrir la aplicacion', async () => {
      await loginPage.open();
      await expect(loginPage.loginButton).toBeVisible();
    });

    await test.step('Autenticarse con las credenciales indicadas', async () => {
      await loginPage.login(config.credentials.username, config.credentials.password);
    });

    await test.step('Validar que el inicio de sesion sea exitoso', async () => {
      await expect(page).toHaveURL(DashboardPage.URL_PATTERN);
      await expect(loginPage.loginButton, 'El formulario de login ya no debe mostrarse').toBeHidden();
      await expect(dashboardPage.userDropdown, 'Debe mostrarse el usuario autenticado').toBeVisible();
    });

    await test.step('Comprobar que se visualiza el Dashboard', async () => {
      await expect(dashboardPage.title).toHaveText(webData.dashboard.title);
      for (const widget of webData.dashboard.expectedWidgets) {
        await expect(dashboardPage.widget(widget), `Widget "${widget}" visible`).toBeVisible();
      }
    });
  });
});
