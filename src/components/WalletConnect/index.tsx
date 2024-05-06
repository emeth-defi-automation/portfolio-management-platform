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
