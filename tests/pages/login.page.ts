import { expect, type Page } from "@playwright/test";
import { routes } from "../data/routes";
import { loginFixture } from "../fixtures/login.fixture";
import BasePage from "./base.page";

class LoginPage extends BasePage {
  constructor(page: Page) {
    super({
      page,
      route: routes.login,
      locators: {
        title: page.locator("h1"),
        useMetamaskButton: page.locator(
          "button[data-testid='use-metamask-button']",
        ),
        useWalletConnectButton: page.locator(
          "button[data-testid='use-walletconnect-button']",
        ),
        howToUseWalletButton: page.locator(
          "button[data-testid='how-to-use-wallet-button']",
        ),
      },
    });
  }

  async verifyTitle() {
    await expect(this.locators.title).toBeVisible();
    await expect(this.locators.title).toHaveText(loginFixture.title);
  }

  async useMetamask() {
    await this.locators.useMetamaskButton.click();
  }

  async useWalletConnect() {
    await this.locators.useWalletConnectButton.click();
  }
}

export default LoginPage;
