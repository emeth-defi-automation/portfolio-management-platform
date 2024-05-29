import {
  component$,
  $,
  useContext,
  type QRL,
  useTask$,
  noSerialize,
} from "@builder.io/qwik";
// import { ConnectButton, type ButtonProps } from "../Buttons/Buttons";
import {
  LoginContext,
  WagmiConfigContext,
} from "~/components/WalletConnect/context";
import { openWeb3Modal } from "~/utils/walletConnections";
import Button, { type buttonType } from "../Atoms/Buttons/Button";
import { defaultWagmiConfig } from "@web3modal/wagmi";
import { mainnet, sepolia } from "viem/chains";
import { metadata } from "~/routes/layout";
import { Config, reconnect, watchAccount } from "@wagmi/core";

export interface WalletConnectProps {
  afterConnect: QRL<() => void>;
}

export default component$<buttonType>((props) => {
  const wagmiConfig = useContext(WagmiConfigContext);
  const login = useContext(LoginContext);

  useTask$(() => {
    console.log("wagmi config from index ", wagmiConfig.config);
  });

  const openModal = $(async () => {
    console.log("wagmi config from walletConnect btn", wagmiConfig.config);

    // const wconfig = defaultWagmiConfig({
    //   chains: [mainnet, sepolia],
    //   projectId: import.meta.env.PUBLIC_PROJECT_ID,
    //   metadata,
    // });

    // wagmiConfig.config = noSerialize(wconfig);
    // console.log("wagmi config just created", wagmiConfig.config);

    await openWeb3Modal(wagmiConfig, login);
    console.log("wagmiconfig contetx", wagmiConfig.config);
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
