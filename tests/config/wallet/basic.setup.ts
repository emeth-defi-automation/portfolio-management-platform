import type { BrowserContext, Page } from "@playwright/test";
import {
  MetaMask,
  defineWalletSetup,
  getExtensionId,
} from "@synthetixio/synpress";
import { SEED_PHRASE, WALLET_PASSWORD } from "../../data/wallet";

export default defineWalletSetup(
  WALLET_PASSWORD,
  async (context, walletPage) => {
    const extensionId = await getExtensionId(
      context as BrowserContext,
      "MetaMask",
    );

    const metamask = new MetaMask(
      context as BrowserContext,
      walletPage as Page,
      WALLET_PASSWORD,
      extensionId,
    );

    await metamask.importWallet(SEED_PHRASE);
  },
);
