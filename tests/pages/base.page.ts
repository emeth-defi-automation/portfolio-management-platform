import type { Locator, Page } from "@playwright/test";

interface BasePageProps {
  page: Page;
  route: string;
  locators: { [key: string]: Locator };
}

class BasePage {
  readonly page: Page;
  protected route: string;
  locators: { [key: string]: Locator };

  constructor({ page, route, locators }: BasePageProps) {
    this.page = page;
    this.route = route;
    this.locators = locators;
  }

  async navigate() {
    await this.page.goto(this.route);
  }
}

export default BasePage;
