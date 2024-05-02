import { HeroText } from "~/components/HeroText/HeroText";
import {
  component$,
  noSerialize,
  useContext,
  useVisibleTask$,
} from "@builder.io/qwik";
import { ConnectButton } from "~/components/Buttons/Buttons";
import WalletConnect from "~/components/WalletConnect";
import { Copyright } from "~/components/Paragraph/Paragraph";
import IconLogo from "/public/assets/icons/logo.svg?jsx";
import { Config, getClient, getConnections, getConnectors, reconnect, watchAccount } from "@wagmi/core";
import { LoginContext, WagmiConfigContext } from "~/components/WalletConnect/context";
import { defaultWagmiConfig } from "@web3modal/wagmi";
import { type Chain, mainnet, sepolia } from "viem/chains";
import { useNavigate } from "@builder.io/qwik-city";

export default component$(() => {
  const wagmiConfig = useContext(WagmiConfigContext);
  const login = useContext(LoginContext);
  const nav = useNavigate();
  
  const metadata = {   
    name: import.meta.env.PUBLIC_METADATA_NAME,
    description: import.meta.env.PUBLIC_METADATA_DESCRIPTION,
    url: "https://web3modal.com",
    icons: ["https://avatars.githubusercontent.com/u/37784886"],
  };


  useVisibleTask$(async ({track}) => {
    track(() => login.address.value)
    console.log('login index: ',login)

    if(login.address.value){
      await nav('/signin')
    }
  });
  return (
    <>
      <div class="background-container"></div>
      <div class="content-container grid h-full grid-rows-[85%_15%] items-center justify-items-center">
        <div class="grid min-w-[448px] max-w-md gap-10 pt-20">
          <HeroText
            title="Login to Emeth"
            description="Log in to the app using your Crypto Wallet"
          >
            <IconLogo class="h-6 w-28" />
          </HeroText>
          <div class="grid justify-items-center gap-3">
            <WalletConnect
              image="/assets/icons/login/metamask.svg"
              text="Use Metamask"
            />
            <WalletConnect
              image="/assets/icons/login/walletconnect.svg"
              text="Use WalletConnect"
            />
          </div>
        </div>
        <div class="grid h-full items-end justify-items-center gap-6 pb-10">
          <ConnectButton
            image="/assets/icons/info-white.svg"
            text="How to use Wallet?"
            class="w-52 !border-0 bg-customBlue py-2 pl-2 pr-3 text-xs"
          />
          <Copyright />
        </div>
      </div>
    </>
  );
});
