import { Locator, Page, Response } from '@playwright/test';
import { BasePage } from './BasePage';

export class PimPage extends BasePage {
  static readonly URL_PATTERN = /\/pim\/viewEmployeeList/;

  readonly title: Locator;
  readonly employeeInformationTitle: Locator;
  readonly employeeNameInput: Locator;
  readonly searchButton: Locator;
  readonly recordsFoundLabel: Locator;
  readonly resultRows: Locator;
  readonly toast: Locator;

  constructor(page: Page) {
    super(page);
    this.title = this.headerTitle('PIM');
    this.employeeInformationTitle = page.getByRole('heading', { name: 'Employee Information' });
    // Campo localizado por su etiqueta visible, no por posicion en el DOM
    this.employeeNameInput = page
      .locator('.oxd-input-group')
      .filter({ has: page.getByText('Employee Name', { exact: true }) })
      .getByRole('textbox');
    this.searchButton = page.getByRole('button', { name: 'Search' });
    this.recordsFoundLabel = page.locator('.orangehrm-horizontal-padding .oxd-text--span');
    this.resultRows = page.locator('.oxd-table-body .oxd-table-card');
    this.toast = page.locator('.oxd-toast');
  }

  /**
   * Busca por nombre y retorna la respuesta del backend de la busqueda.
   * La espera se sincroniza con la llamada real a la API (sin pausas fijas).
   */
  async searchEmployeeByName(name: string): Promise<Response> {
    await this.employeeNameInput.fill(name);
    const searchResponse = this.page.waitForResponse(
      (res) => res.url().includes('/api/v2/pim/employees') && res.url().includes('nameOrId='),
    );
    await this.searchButton.click();
    return searchResponse;
  }
}
