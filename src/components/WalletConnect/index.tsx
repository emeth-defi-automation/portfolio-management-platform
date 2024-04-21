import { component$, $, useContext, QRL } from "@builder.io/qwik";
import { reconnect } from "@wagmi/core";
import { createWeb3Modal } from "@web3modal/wagmi";
import { ConnectButton, type ButtonProps } from "../Buttons/Buttons";
import { ModalConfigContext } from "~/components/WalletConnect/context";

export interface WalletConnectProps {
  afterConnect: QRL<() => void>;
}

export default component$<ButtonProps>((props) => {
  const modalConfig = useContext(ModalConfigContext);

  const openWeb3Modal = $(async () => {
    const projectId = import.meta.env.PUBLIC_PROJECT_ID;
    if (!projectId || typeof projectId !== "string") {
      throw new Error("Missing project ID");
    }
    await reconnect(modalConfig.config!);
    const modal = createWeb3Modal({
      wagmiConfig: modalConfig.config!,
      projectId,
    });
    await modal.open({ view: "Connect" });
  });

  return (
    <ConnectButton
      onClick$={openWeb3Modal}
      text={props.text}
      image={props.image}
      class={props.class}
    ></ConnectButton>
  );
});
