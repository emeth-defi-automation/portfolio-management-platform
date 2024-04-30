import { type Page } from "@playwright/test";
import { routes } from "../data/routes";
import BasePage from "./base.page";

class SignInPage extends BasePage {
  constructor(page: Page) {
    super({
      page,
      route: routes.signin,
      locators: {
        cancelButton: page.locator("button[data-testid='cancel-button']"),
        acceptAndSignButton: page.locator(
          "button[data-testid='accept-and-sign-button']",
        ),
        connectWalletMetamaskButton: page
          .locator("w3m-modal w3m-connect-view")
          .getByText("MetaMask"),
      },
    });
  }

  async cancel() {
    await this.locators.cancelButton.click();
  }

  async acceptAndSign() {
    await this.locators.acceptAndSignButton.click();
  }

  async useMetamaskWithConnectWalletModal() {
    await this.locators.connectWalletMetamaskButton.click();
  }
}

export default SignInPage;
