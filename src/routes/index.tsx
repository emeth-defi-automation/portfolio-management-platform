import { component$, useVisibleTask$ } from "@builder.io/qwik";
import { useLocation, type DocumentHead } from "@builder.io/qwik-city";
import { defaultWagmiConfig } from "@web3modal/wagmi";
import { mainnet, arbitrum, type Chain } from "viem/chains";

export default component$(() => {
  const loc = useLocation();

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    const projectId = import.meta.env.PUBLIC_PROJECT_ID;

    const metadata = {
      name: "Web3Modal",
      description: "Web3Modal Example",
      url: loc.url.origin,
      icons: ["https://avatars.githubusercontent.com/u/37784886"],
    };

    const chains: [Chain, ...Chain[]] = [mainnet, arbitrum];
    const config = defaultWagmiConfig({
      chains, // required
      projectId, // required
      metadata, // required
      enableWalletConnect: true, // Optional - true by default
      enableInjected: true, // Optional - true by default
      enableEIP6963: true, // Optional - true by default
      enableCoinbase: true, // Optional - true by default
    });
  });

  return (
    <>
      <h1>Hi 👋</h1>
      <p>
        Can't wait to see what you build with qwik!
        <br />
        Happy coding.
      </p>
    </>
  );
});

export const head: DocumentHead = {
  title: "Welcome to Qwik",
  meta: [
    {
      name: "description",
      content: "Qwik site description",
    },
  ],
};
