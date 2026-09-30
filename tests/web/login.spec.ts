import { test, expect } from '../fixtures';
import { DashboardPage } from '../../pages/DashboardPage';
import { LoginPage } from '../../pages/LoginPage';
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

test.describe('Escenario A - Casos alternos', { tag: ['@web', '@regression'] }, () => {
  test('WEB-03 Login con contrasena incorrecta muestra "Invalid credentials"', async ({ page, loginPage }) => {
    await loginPage.open();
    await loginPage.login(config.credentials.username, webData.login.wrongPassword);

    await expect(loginPage.errorAlert).toHaveText(webData.login.invalidCredentialsMessage);
    await expect(page, 'Debe permanecer en la pantalla de login').toHaveURL(LoginPage.URL_PATTERN);
  });

  test('WEB-04 Login con campos vacios muestra "Required" en usuario y contrasena', async ({ page, loginPage }) => {
    await loginPage.open();
    await loginPage.loginButton.click();

    await expect(loginPage.fieldError('Username')).toHaveText(webData.login.requiredMessage);
    await expect(loginPage.fieldError('Password')).toHaveText(webData.login.requiredMessage);
    await expect(page, 'Debe permanecer en la pantalla de login').toHaveURL(LoginPage.URL_PATTERN);
  });

  test('WEB-05 Acceso directo al Dashboard sin sesion redirige al login', async ({ page, loginPage, dashboardPage }) => {
    await dashboardPage.open();

    await expect(page).toHaveURL(LoginPage.URL_PATTERN);
    await expect(loginPage.loginButton).toBeVisible();
  });
});
