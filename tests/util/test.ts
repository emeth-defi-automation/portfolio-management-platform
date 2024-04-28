import type { BrowserContext } from "@playwright/test";
import { test as baseTest } from "@playwright/test";
import type { Dappwright } from "@tenkeylabs/dappwright";
import dappwright from "@tenkeylabs/dappwright";
import { metamaskOptions, sepoliaNetwork } from "../config/wallet";

let sharedContext: BrowserContext;

// Create extended test function with shared context and already connected wallet.
export const test = baseTest.extend<{
  context: BrowserContext;
  wallet: Dappwright;
}>({
  // eslint-disable-next-line no-empty-pattern
  context: async ({}, use) => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!sharedContext) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [wallet, _, context] = await dappwright.bootstrap(
        // Use default browser - Chromium with local Google Chrome.
        "",
        metamaskOptions,
      );

      await wallet.addNetwork(sepoliaNetwork);

      sharedContext = context;
    }

    await use(sharedContext);
  },

  wallet: async ({ context }, use) => {
    const metamask = await dappwright.getWallet("metamask", context);

    await use(metamask);
  },
});
