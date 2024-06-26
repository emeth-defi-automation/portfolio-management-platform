import { $, component$, useContext } from "@builder.io/qwik";
import { useLocation, useNavigate } from "@builder.io/qwik-city";
import { signMessage } from "@wagmi/core";
import { SiweMessage } from "siwe";
import Button from "~/components/Atoms/Buttons/Button";
import { HeroText } from "~/components/HeroText/HeroText";
import { Copyright } from "~/components/Paragraph/Paragraph";
import {
  LoginContext,
  WagmiConfigContext,
} from "~/components/WalletConnect/context";
import {
  getNonceServer,
  verifyMessageServer,
} from "~/components/WalletConnect/server";

import IconHandshake from "/public/assets/icons/signin/handshake.svg?jsx";
import { disconnectWallets } from "~/utils/walletConnections";

export default component$(() => {
  const nav = useNavigate();
  const loc = useLocation();
  const wagmiConfig = useContext(WagmiConfigContext);
  const login = useContext(LoginContext);

  const signInHandler = $(async () => {
    if (login.address.value && login.chainId.value) {
      const address = login.address.value;
      const chainId = login.chainId.value;

      const { nonce } = await getNonceServer();

      const message = new SiweMessage({
        version: "1",
        domain: loc.url.host,
        uri: loc.url.origin,
        address,
        chainId,
        nonce,
        // Human-readable ASCII assertion that the user will sign, and it must not contain `\n`.
        statement: "Sign to continue...",
      }).prepareMessage();

      if (wagmiConfig.config.value) {
        const signature = await signMessage(wagmiConfig.config.value, {
          message,
        });

        const { refreshToken } = await verifyMessageServer(message, signature);

        localStorage.setItem("refreshToken", refreshToken);

        await nav("/app/dashboard");
      }
    }
  });

  const cancelHandler = $(async () => {
    await disconnectWallets(wagmiConfig.config, true);
    login.account = undefined;
    login.address.value = undefined;
    login.chainId.value = undefined;
    await nav("/");
  });

  return (
    <>
      <div class="background-container"></div>
      <div class="content-container grid h-full grid-rows-[85%_15%] items-center justify-items-center">
        <div class="grid min-w-[448px] max-w-md gap-10 pt-20">
          <HeroText
            title="Welcome to Emeth"
            description="By connecting your wallet and using Emeth, you agree to our Terms of Service and Privacy Policy."
          >
            <IconHandshake />
          </HeroText>
          <div class="grid w-full grid-cols-2 gap-4">
            <Button
              onClick$={cancelHandler}
              variant="transparent"
              text="Cancel"
              dataTestId="cancel-button"
            />
            <Button
              onClick$={signInHandler}
              variant="gradient"
              text="Accept and Sign"
              dataTestId="accept-and-sign-button"
            />
          </div>
        </div>
        <div class="grid h-full items-end justify-items-center pb-10">
          <Copyright />
        </div>
      </div>
    </>
  );
});
