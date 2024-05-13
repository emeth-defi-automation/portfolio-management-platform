import { MetaMask } from '@synthetixio/synpress';
import basicSetup from '../config/wallet/basic.setup';
import DashboardPage from '../pages/app/dashboard.page';
import LoginPage from '../pages/login.page';
import SignInPage from '../pages/signin.page';
import { test } from '../util/test';

test.describe("sign in", () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.navigate();
  });

  test("should allow user to connect wallet with 'Use Metamask' flow", async ({ context, page, extensionId }) => {
    const metamask = new MetaMask(context, page, basicSetup.walletPassword, extensionId);

    const loginPage = new LoginPage(page);
    const signInPage = new SignInPage(page);
    const dashboardPage = new DashboardPage(page);

    await loginPage.verifyTitle();
    // await loginPage.useMetamask();
    await loginPage.useWalletConnect();

    await signInPage.useMetamaskWithConnectWalletModal();
    await metamask.connectToDapp();
    await signInPage.acceptAndSign();

    await metamask.confirmSignature();

    await dashboardPage.verifyPortfolioValue("0.00");
  });
});
