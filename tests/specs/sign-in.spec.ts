import DashboardPage from "../pages/app/dashboard.page";
import LoginPage from "../pages/login.page";
import SignInPage from "../pages/signin.page";
import { test } from "../util/test";

test.describe('sign in', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.navigate();
  });

  test("should allow user to connect wallet with 'Use Metamask' flow", async ({ page, wallet }) => {
    const loginPage = new LoginPage(page);
    const signInPage = new SignInPage(page);
    const dashboardPage = new DashboardPage(page);

    await loginPage.verifyTitle();
    await loginPage.useMetamask();

    await signInPage.useMetamaskWithConnectWalletModal();
    await wallet.approve();
    await signInPage.acceptAndSign();
    await wallet.confirmTransaction();

    await dashboardPage.verifyPortfolioValue("0.00");
  });
});
