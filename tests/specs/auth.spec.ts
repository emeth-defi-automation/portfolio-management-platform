import { test } from "../helpers/test";
import LoginPage from "../pages/login.page";

test.beforeEach(async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.navigate();
});

test("should be able to connect", async ({ page, wallet }) => {
  await page.getByText('Use Metamask').click();
  await page.locator('w3m-modal w3m-connect-view').getByText('MetaMask').click();

  await wallet.approve();

  await page.getByText('Accept and Sign').click();

  await wallet.confirmTransaction();

  await page.getByText('Portfolio Value').isVisible();
});
