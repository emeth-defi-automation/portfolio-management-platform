import { MetaMask, defineWalletSetup } from "@synthetixio/synpress";

const SEED_PHRASE =
  "test test test test test test test test test test test junk";
const PASSWORD = "Password123";

export default defineWalletSetup(PASSWORD, async (context, walletPage) => {
  // TODO: Remove `as any`
  const metamask = new MetaMask(context as any, walletPage as any, PASSWORD);

  await metamask.importWallet(SEED_PHRASE);
});
