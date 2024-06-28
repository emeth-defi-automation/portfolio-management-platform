import {
  component$,
  Slot,
  useContextProvider,
  noSerialize,
  useVisibleTask$,
  useTask$,
  useContext,
  useSignal,
  useComputed$,
} from "@builder.io/qwik";
import { type RequestHandler } from "@builder.io/qwik-city";
import { type Config, reconnect, watchAccount, getAccount } from "@wagmi/core";
import { defaultWagmiConfig } from "@web3modal/wagmi";

import { sepolia } from "viem/chains";
import {
  LoginContext,
  OnClientContext,
  WagmiConfigContext,
} from "~/components/WalletConnect/context";
import { setupMoralis } from "~/utils/stream";
import { AutomationPageContext } from "./app/automation/AutomationPageContext";

export const metadata = {
  name: "Web3Modal",
  description: "Web3Modal Example",
  url: "https://web3modal.com",
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};

export const onGet: RequestHandler = async ({ cacheControl }) => {
  // Control caching for this request for best performance and to reduce hosting costs:
  // https://qwik.builder.io/docs/caching/
  cacheControl({
    // Always serve a cached response by default, up to a week stale
    staleWhileRevalidate: 60 * 60 * 24 * 7,
    // Max once every 5 seconds, revalidate on the server to get a fresh version of this page
    maxAge: 5,
  });
};

export default component$(() => {
  const wagmiMetadata = {
    name: import.meta.env.PUBLIC_METADATA_NAME,
    description: import.meta.env.PUBLIC_METADATA_DESCRIPTION,
    url: "https://web3modal.com",
    icons: ["https://avatars.githubusercontent.com/u/37784886"],
  };

  useContextProvider(OnClientContext, {
    onClient: useSignal(false),
  });

  useContextProvider(AutomationPageContext, {
    automations: useSignal([]),
    activeAutomation: useSignal(null),
    isDraverOpen: useSignal(false),
    sideDraverVariant: useSignal(""),
    addSwapModalOpen: useSignal(false),
    addTransferModalOpen: useSignal(false),
  });

  const onClient = useContext(OnClientContext);

  const config = useComputed$(
    () =>
      onClient.onClient.value &&
      noSerialize(
        defaultWagmiConfig({
          chains: [sepolia],
          projectId: import.meta.env.PUBLIC_PROJECT_ID,
          metadata: wagmiMetadata,
          enableCoinbase: false,
        }),
      ),
  );

  useContextProvider(WagmiConfigContext, {
    config: config,
  });

  useContextProvider(LoginContext, {
    account: undefined,
    address: useSignal(undefined),
    chainId: useSignal(undefined),
  });

  const wagmiConfig = useContext(WagmiConfigContext);
  const login = useContext(LoginContext);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    onClient.onClient.value = true;
  });
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ track }) => {
    track(() => {
      onClient.onClient.value;
    });
    if (wagmiConfig.config.value) {
      if (
        window.location.pathname === "/signin" ||
        window.location.pathname === "/"
      ) {
        watchAccount(wagmiConfig.config.value!, {
          onChange(account) {
            {
              localStorage.setItem(
                "emmethUserWalletAddress",
                `${account.address}`,
              );
            }
            login.account = noSerialize(account);
            login.address.value = account.address;
            login.chainId.value = account.chainId;
          },
        });
      } else {
        reconnect(wagmiConfig.config.value as Config);
        const account = getAccount(wagmiConfig.config.value);

        login.account = noSerialize(account);
        login.address.value = account.address;
        login.chainId.value = account.chainId;
      }
    }
  });

  useTask$(async function () {
    await setupMoralis();
  });

  return (
    <>
      <main class="h-screen overflow-auto bg-black font-['Sora'] text-white">
        <Slot />
      </main>
    </>
  );
});
