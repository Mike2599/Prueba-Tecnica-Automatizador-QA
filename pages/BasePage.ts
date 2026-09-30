import { Locator, Page } from '@playwright/test';

/**
 * Componentes comunes a todas las pantallas autenticadas de OrangeHRM
 * (titulo de la barra superior y menu lateral).
 */
export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  /** Titulo del modulo mostrado en la barra superior (ej: "Dashboard", "PIM"). */
  headerTitle(name: string): Locator {
    return this.page.getByRole('heading', { name, exact: true });
  }

  async goToModule(moduleName: string): Promise<void> {
    await this.page.getByRole('link', { name: moduleName, exact: true }).click();
  }
}
