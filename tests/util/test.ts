import {
  MetaMask,
  testWithSynpress,
  unlockForFixture,
} from "@synthetixio/synpress";
import basicSetup from "../config/wallet/basic.setup";
import { sepoliaNetwork } from "../data/network";

export const test = testWithSynpress(basicSetup, unlockForFixture).extend<{
  metamask: MetaMask;
}>({
  metamask: async ({ context, metamaskPage, extensionId }, use) => {
    const metamask = new MetaMask(
      context,
      metamaskPage,
      basicSetup.walletPassword,
      extensionId,
    );

    metamask.addNetwork(sepoliaNetwork);

    await use(metamask);
  },
});

export const { expect } = test;
