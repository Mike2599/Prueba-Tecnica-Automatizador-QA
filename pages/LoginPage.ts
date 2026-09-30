import { Locator, Page } from '@playwright/test';

export class LoginPage {
  static readonly URL_PATTERN = /\/auth\/login/;

  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorAlert: Locator;

  constructor(private readonly page: Page) {
    this.usernameInput = page.getByPlaceholder('Username');
    this.passwordInput = page.getByPlaceholder('Password');
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.errorAlert = page.getByRole('alert');
  }

  /**
   * Navega sin esperar el evento "load" (imagenes, fuentes y scripts externos del demo a veces
   * no terminan de cargar). La prueba espera los elementos que necesita con aserciones.
   */
  async open(): Promise<void> {
    await this.page.goto('/web/index.php/auth/login', { waitUntil: 'domcontentloaded' });
  }

  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  /** Mensaje de validacion mostrado debajo del campo con la etiqueta indicada. */
  fieldError(label: 'Username' | 'Password'): Locator {
    return this.page
      .locator('.oxd-input-group')
      .filter({ has: this.page.getByText(label, { exact: true }) })
      .locator('.oxd-input-field-error-message');
  }
}
