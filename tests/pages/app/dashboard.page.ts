import { expect, type Page } from "@playwright/test";
import { routes } from "../../data/routes";
import BasePage from "../base.page";

class DashboardPage extends BasePage {
  constructor(page: Page) {
    super({
      page,
      route: routes.app.dashboard,
      locators: {
        portfolioValueText: page.locator("h1[data-testid='portfolio-value']"),
      },
    });
  }

  async verifyPortfolioValue(amount: string) {
    await expect(this.locators.portfolioValueText).toBeVisible();
    await expect(this.locators.portfolioValueText).toHaveText(`$${amount}`);
  }
}

export default DashboardPage;
