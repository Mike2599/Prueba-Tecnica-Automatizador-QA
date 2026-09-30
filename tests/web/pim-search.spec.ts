import { test, expect } from '../fixtures';
import { PimPage } from '../../pages/PimPage';
import { webData } from '../../data/testData';

test.describe('Escenario B - Busqueda sin resultados', { tag: ['@web', '@regression'] }, () => {
  test('WEB-02 Buscar un empleado inexistente en PIM muestra "No Records Found"', async ({
    page,
    loggedIn,
    pimPage,
  }) => {
    const employee = webData.pim.nonExistentEmployee();
    test.info().annotations.push({ type: 'dato', description: `Empleado buscado: ${employee}` });

    await test.step('Ingresar al modulo PIM', async () => {
      await loggedIn.goToModule('PIM');
      await expect(page).toHaveURL(PimPage.URL_PATTERN);
      await expect(pimPage.title).toBeVisible();
      await expect(pimPage.employeeInformationTitle).toBeVisible();
    });

    const response = await test.step('Buscar un empleado que no exista', async () => {
      return pimPage.searchEmployeeByName(employee);
    });

    await test.step('Validar el resultado presentado por la aplicacion', async () => {
      // Capa backend: la busqueda responde OK y sin registros
      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.meta.total, 'El backend no debe retornar empleados').toBe(0);
      expect(body.data).toHaveLength(0);

      // Capa UI: mensaje informativo, contador y tabla vacia
      await expect(pimPage.toast).toBeVisible();
      await expect(pimPage.toast).toContainText(webData.pim.noResultsMessage);
      await expect(pimPage.recordsFoundLabel).toHaveText(webData.pim.noResultsMessage);
      await expect(pimPage.resultRows).toHaveCount(0);
    });
  });
});

test.describe('Escenario B - Casos alternos', { tag: ['@web', '@regression'] }, () => {
  test('WEB-06 Buscar por un Employee Id inexistente muestra "No Records Found"', async ({
    page,
    loggedIn,
    pimPage,
  }) => {
    const employeeId = webData.pim.nonExistentEmployeeId();
    test.info().annotations.push({ type: 'dato', description: `Employee Id buscado: ${employeeId}` });

    await loggedIn.goToModule('PIM');
    await expect(page).toHaveURL(PimPage.URL_PATTERN);

    const response = await pimPage.searchEmployeeById(employeeId);

    expect(response.status()).toBe(200);
    expect((await response.json()).meta.total, 'El backend no debe retornar empleados').toBe(0);
    await expect(pimPage.toast).toContainText(webData.pim.noResultsMessage);
    await expect(pimPage.resultRows).toHaveCount(0);
  });
});
