import {
  MetaMask,
  defineWalletSetup,
  getExtensionId,
} from "@synthetixio/synpress";
import { SEED_PHRASE, WALLET_PASSWORD } from "../../data/wallet";

export default defineWalletSetup(
  WALLET_PASSWORD,
  async (context, walletPage) => {
    const extensionId = await getExtensionId(context, "MetaMask");

    const metamask = new MetaMask(
      context,
      walletPage,
      WALLET_PASSWORD,
      extensionId,
    );

    await metamask.importWallet(SEED_PHRASE);
  },
);
