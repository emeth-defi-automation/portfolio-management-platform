import {
  component$,
  $,
  useContext,
  type QRL,
  useTask$,
} from "@builder.io/qwik";
// import { ConnectButton, type ButtonProps } from "../Buttons/Buttons";
import { WagmiConfigContext } from "~/components/WalletConnect/context";
import { openWeb3Modal } from "~/utils/walletConnections";
import Button, { type buttonType } from "../Atoms/Buttons/Button";

export interface WalletConnectProps {
  afterConnect: QRL<() => void>;
}

export default component$<buttonType>((props) => {
  const wagmiConfig = useContext(WagmiConfigContext);

  useTask$(() => {
    console.log("wagmi config from index ", wagmiConfig.config);
  });

  const openModal = $(async () => {
    console.log("wagmi config from walletConnect btn", wagmiConfig.config);

    await openWeb3Modal(wagmiConfig.config);
  });

  return (
    <Button
      onClick$={openModal}
      text={props.text}
      variant={props.variant}
      leftIcon={props.leftIcon}
      rightIcon={props.rightIcon}
      customClass={props.customClass}
      dataTestId={props.dataTestId}
      size={props.size}
    />
  );
});
