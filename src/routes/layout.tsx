import {
  component$,
  Slot,
  useContextProvider,
  noSerialize,
  useVisibleTask$,
  useTask$,
  useContext,
  useSignal,
} from "@builder.io/qwik";
import { type RequestHandler } from "@builder.io/qwik-city";
import { type Config, reconnect, watchAccount } from "@wagmi/core";
import { defaultWagmiConfig } from "@web3modal/wagmi";
import { mainnet, sepolia } from "viem/chains";
import { StreamStoreContext } from "~/interface/streamStore/streamStore";
import {
  LoginContext,
  WagmiConfigContext,
} from "~/components/WalletConnect/context";
import {
  getStream,
  initializeStreamIfNeeded,
  setupStream,
} from "~/utils/stream";

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
  const metadata = {
    name: import.meta.env.PUBLIC_METADATA_NAME,
    description: import.meta.env.PUBLIC_METADATA_DESCRIPTION,
    url: "https://web3modal.com",
    icons: ["https://avatars.githubusercontent.com/u/37784886"],
  };

  useContextProvider(WagmiConfigContext, {
    config: noSerialize({} as Config),
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
    if (wagmiConfig.config) {
      console.log("wagmi config from index ", wagmiConfig.config);
      watchAccount(wagmiConfig.config!, {
        onChange(account) {
          console.log("watchAccount account:", account);

          if (
            window.location.pathname === "/signin" ||
            window.location.pathname === "/"
          ) {
            localStorage.setItem(
              "emmethUserWalletAddress",
              `${account.address}`,
            );
          } else {
            reconnect(wagmiConfig.config as Config);
          }
          login.account = noSerialize(account);
          login.address.value = account.address;
          login.chainId.value = account.chainId;
        },
      });
    }
    // const wconfig = defaultWagmiConfig({
    //   chains: [mainnet, sepolia],
    //   projectId: import.meta.env.PUBLIC_PROJECT_ID,
    //   metadata,
    // });

    // wagmiConfig.config = noSerialize(wconfig);
    // console.log("wagmi config just created", wagmiConfig.config);
  });

  useContextProvider(StreamStoreContext, { streamId: "" });
  const streamStore = useContext(StreamStoreContext);

  useTask$(async function () {
    await initializeStreamIfNeeded(setupStream);
    const stream = await getStream();
    streamStore.streamId = stream["jsonResponse"]["id"];
    console.log(streamStore.streamId);
  });

  return (
    <>
      <main class="h-screen overflow-auto bg-black font-['Sora'] text-white">
        <Slot />
      </main>
    </>
  );
});
