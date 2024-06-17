import { HeroText } from "~/components/HeroText/HeroText";
import { component$, useContext, useVisibleTask$ } from "@builder.io/qwik";
import { Copyright } from "~/components/Paragraph/Paragraph";
import IconLogo from "/public/assets/icons/logo.svg?jsx";
import {
  LoginContext,
  WagmiConfigContext,
} from "~/components/WalletConnect/context";
import { useNavigate } from "@builder.io/qwik-city";
import { disconnectWallets } from "~/utils/walletConnections";
import IconArrowForward from "@material-design-icons/svg/outlined/arrow_forward.svg?jsx";
import IconInfo from "@material-design-icons/svg/outlined/info.svg?jsx";
import IconWalletConnect from "/public/assets/icons/login/walletconnect.svg?jsx";
import IconMetaMask from "/public/assets/icons/login/metamask.svg?jsx";
import WalletConnect from "~/components/WalletConnect";
import Button from "~/components/Atoms/Buttons/Button";

export default component$(() => {
  const login = useContext(LoginContext);
  const nav = useNavigate();
  const wagmiConfig = useContext(WagmiConfigContext);
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    if (localStorage.getItem("emmethUserWalletAddress")) {
      localStorage.removeItem("emmethUserWalletAddress");
    }

    if (wagmiConfig.config.value) {
      await disconnectWallets(wagmiConfig.config);
    }
  });
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async ({ track }) => {
    track(() => login.address.value);

    if (login.address.value) {
      await nav("/signin");
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
              text="Use Metamask"
              variant="transparent"
              dataTestId="use-metamask-button"
              leftIcon={<IconMetaMask class="h-6 w-6" />}
              rightIcon={<IconArrowForward class="h-4 w-4" />}
              customClass="px-4 w-72"
            />
            <WalletConnect
              text="Use Wallet Connect"
              variant="transparent"
              dataTestId="use-walletconnect-button"
              leftIcon={<IconWalletConnect class="h-6 w-6" />}
              rightIcon={<IconArrowForward class="h-4 w-4" />}
              customClass="px-4 w-72"
            />
          </div>
        </div>
        <div class="grid h-full items-end justify-items-center gap-6 pb-10">
          <Button
            text="How to use Wallet?"
            variant="blue"
            leftIcon={<IconInfo class="h-6 w-6 " />}
            rightIcon={<IconArrowForward class="h-4 w-4" />}
            customClass="font-normal h-10 w-52 px-3"
            size="small"
            dataTestId="how-to-use-wallet-button"
          />
          <Copyright />
        </div>
      </div>
    </>
  );
});
