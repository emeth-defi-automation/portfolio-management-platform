import { component$, $, useContext, QRL } from "@builder.io/qwik";
import { ConnectButton, type ButtonProps } from "../Buttons/Buttons";
import { WagmiConfigContext } from "~/components/WalletConnect/context";
import { openWeb3Modal } from "~/utils/walletConnections";

export interface WalletConnectProps {
  afterConnect: QRL<() => void>;

}

export default component$<ButtonProps>((props) => {
  const modalConfig = useContext(WagmiConfigContext);

  const openModal = $(async () => {
    await openWeb3Modal(modalConfig!.config);
  });

    
  return (
    <ConnectButton
      onClick$={openModal}
      text={props.text}
      image={props.image}
      class={props.class}
    ></ConnectButton>
  );
});


// import { component$, $, useContext, noSerialize } from "@builder.io/qwik";
// import { type Chain } from "viem/chains";
// import { reconnect, watchAccount } from "@wagmi/core";
// import { createWeb3Modal, defaultWagmiConfig } from "@web3modal/wagmi";
// import { useNavigate } from "@builder.io/qwik-city";
// import { ConnectButton, type ButtonProps } from "../Buttons/Buttons";
// import { ModalStoreContext } from "~/interface/web3modal/ModalStore";

// const metadata = {
//   name: "Web3Modal",
//   description: "Web3Modal Example",
//   url: "https://web3modal.com",
//   icons: ["https://avatars.githubusercontent.com/u/37784886"],
// };

// export const returnWeb3ModalAndClient = async (
//   projectId: string,
//   enableWalletConnect: boolean,
//   enableInjected: boolean,
//   enableCoinbase: boolean,
//   chains: [Chain, ...Chain[]],
// ) => {
//   const config = defaultWagmiConfig({
//     chains,
//     projectId,
//     metadata,
//     enableWalletConnect,
//     enableInjected,
//     enableEIP6963: true,
//     enableCoinbase,
//   });

//   reconnect(config);

//   const modal = createWeb3Modal({
//     wagmiConfig: config,
//     projectId,
//     enableAnalytics: true,
//   });
//   return { config, modal };
// };

// export default component$<
//   ButtonProps & {
//     enableWalletConnect: boolean;
//     enableInjected: boolean;
//     enableCoinbase: boolean;
//     chains: [Chain, ...Chain[]];
//   }
// >((props) => {
//   const nav = useNavigate();
//   const modalStore = useContext(ModalStoreContext);

//   const setWeb3Modal = $(async () => {
//     const projectId = import.meta.env.PUBLIC_PROJECT_ID;
//     if (!projectId || typeof projectId !== "string") {
//       throw new Error("Missing project ID");
//     }
//     return returnWeb3ModalAndClient(
//       projectId,
//       props.enableWalletConnect,
//       props.enableInjected,
//       props.enableCoinbase,
//       props.chains,
//     );
//   });

//   const openWeb3Modal = $(async () => {
//     const { config, modal } = await setWeb3Modal();
//     await modal.open({ view: "Connect" });
//     modalStore.config = noSerialize(config);
//     watchAccount(config, {
//       onChange(data, prevData) {
//         console.log('[DATA]: ', data);
//         console.log('[PREVDATA]: ', prevData);
//         modalStore.isConnected = data.isConnected;
//         modalStore.isConnected && (modal.close(), nav("/signin"));
//       },
//     });
//   });

//   return (
//     <ConnectButton
//       onClick$={openWeb3Modal}
//       text={props.text}
//       image={props.image}
//       class={props.class}
//     ></ConnectButton>
//   );
// });
