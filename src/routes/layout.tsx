import {
  component$,
  Slot,
  useContextProvider,
  noSerialize,
  useTask$,
  useContext,
} from "@builder.io/qwik";
import type { RequestHandler } from "@builder.io/qwik-city";
import { defaultWagmiConfig } from "@web3modal/wagmi";
import { mainnet, sepolia } from "viem/chains";
import {
  LoginContext,
  ModalConfigContext,
} from "~/components/WalletConnect/context";
import { StreamStoreContext } from "~/interface/streamStore/streamStore";
import {
  getStream,
  initializeStreamIfNeeded,
  setupStream,
} from "~/utils/stream";

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

  useContextProvider(ModalConfigContext, {
    config: noSerialize(
      defaultWagmiConfig({
        chains: [mainnet, sepolia],
        projectId: import.meta.env.PUBLIC_PROJECT_ID,
        metadata,
      }),
    ),
  });

  useContextProvider(LoginContext, { account: undefined });

  useContextProvider(StreamStoreContext, { streamId: "" });
  const streamStore = useContext(StreamStoreContext);

  useTask$(async function () {
    await initializeStreamIfNeeded(setupStream);
    const stream = await getStream();
    streamStore.streamId = stream["jsonResponse"]["id"];
  });

  return (
    <>
      <main class="h-screen overflow-auto bg-black font-['Sora'] text-white">
        <Slot />
      </main>
    </>
  );
});
