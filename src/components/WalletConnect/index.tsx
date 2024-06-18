import { $, component$, useContext, type QRL } from "@builder.io/qwik";
// import { ConnectButton, type ButtonProps } from "../Buttons/Buttons";
import {
  LoginContext,
  WagmiConfigContext,
} from "~/components/WalletConnect/context";
import { openWeb3Modal } from "~/utils/walletConnections";
import Button, { type buttonType } from "../Atoms/Buttons/Button";

export interface WalletConnectProps {
  afterConnect: QRL<() => void>;
}

export default component$<buttonType>((props) => {
  const wagmiConfig = useContext(WagmiConfigContext);
  const login = useContext(LoginContext);
  const openModal = $(async () => {
    await openWeb3Modal(wagmiConfig, login);
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
