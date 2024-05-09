import {
  component$,
  useContext,
  useSignal,
  useVisibleTask$,
} from "@builder.io/qwik";
import ImgAvatar from "/public/assets/images/avatar.png?jsx";
import IconLogout from "/public/assets/icons/logout.svg?jsx";
import { LoginContext, WagmiConfigContext } from "../WalletConnect/context";
import { NavLink } from "./NavLink";
import { useNavigate } from "@builder.io/qwik-city";
import { disconnectWallets } from "~/utils/walletConnections";

export const NavbarContent = component$(() => {
  const nav = useNavigate();
  const login = useContext(LoginContext);
  const wagmiConfig = useContext(WagmiConfigContext);
  const address = useSignal("");

  useVisibleTask$(({ track }) => {
    track(() => login.address.value);
    wagmiConfig.config &&
      (login.address.value,
      login.address.value &&
        (address.value =
          login.address.value.slice(0, 4) +
          "..." +
          login.address.value.slice(-4)));
  });

  return (
    <>
      <div class="flex items-center gap-10 ">
        <NavLink href="/app/dashboard/">Dashboard</NavLink>
        <NavLink href="/app/portfolio/">Portfolio</NavLink>
        <NavLink href="/app/wallets/">Wallets</NavLink>
        <NavLink href="/app/action/">Action</NavLink>
        <NavLink href="/app/automation/">Automation</NavLink>
        <NavLink href="/app/alerts/">Alerts</NavLink>
        <NavLink href="/app/reports/">Reports</NavLink>
      </div>
      <div class="flex items-center gap-2">
        <ImgAvatar />
        <div class="flex flex-col">
          <p>{address}</p>

          <p class="text-[10px] text-customGreen">Account verified</p>
        </div>
        <button
          class="ml-1"
          type="button"
          onClick$={async () => {
            localStorage.removeItem("refreshToken");
            document.cookie =
              "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/app;";

            login.account = undefined;
            login.address.value = undefined;
            login.chainId.value = undefined;
            await disconnectWallets(wagmiConfig.config, true);
            await nav("/");
          }}
        >
          <IconLogout />
        </button>
      </div>
    </>
  );
});
