import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class DashboardPage extends BasePage {
  static readonly URL_PATTERN = /\/dashboard\/index/;

  readonly title: Locator;
  readonly userDropdown: Locator;

  constructor(page: Page) {
    super(page);
    this.title = this.headerTitle('Dashboard');
    this.userDropdown = page.locator('.oxd-userdropdown-name');
  }

  widget(name: string): Locator {
    return this.page.locator('.orangehrm-dashboard-widget-name').getByText(name, { exact: true });
  }
}
