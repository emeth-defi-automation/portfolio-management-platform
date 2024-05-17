import { metaMaskFixtures } from "@synthetixio/synpress";
import basicSetup from "../config/wallet/basic.setup";
import { sepoliaNetwork } from "../data/network";

export const test = metaMaskFixtures(basicSetup).extend<{
  connectToSepoliaNetwork: () => Promise<void>;
}>({
  connectToSepoliaNetwork: async ({ metamask }) => {
    metamask.addNetwork(sepoliaNetwork);
  },
});

export const { expect, describe } = test;
