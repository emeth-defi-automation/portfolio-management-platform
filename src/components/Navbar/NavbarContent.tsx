import {
  component$,
  useContext,
  useSignal,
  useVisibleTask$,
} from "@builder.io/qwik";
import ImgAvatar from "/public/assets/images/avatar.png?jsx";
import IconLogout from "@material-design-icons/svg/outlined/logout.svg?jsx";
import { LoginContext, WagmiConfigContext } from "../WalletConnect/context";
import { NavLink } from "./NavLink";
import { useNavigate } from "@builder.io/qwik-city";
import { disconnectWallets } from "~/utils/walletConnections";
import Button from "~/components/Atoms/Buttons/Button";
import Dialog from "../Organism/Dialog";

export const NavbarContent = component$(() => {
  const nav = useNavigate();
  const login = useContext(LoginContext);
  const wagmiConfig = useContext(WagmiConfigContext);
  const address = useSignal("");
  const ref = useSignal<HTMLDialogElement | undefined>();
  // eslint-disable-next-line qwik/no-use-visible-task
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
        <Button
          variant="onlyIcon"
          leftIcon={<IconLogout class="h-6 w-6 fill-white" />}
          onClick$={async () => {
            ref.value?.showModal();
          }}
        />
      </div>
      <Dialog ref={ref} hasButton={true} title="Confirm logout">
        <div class="flex gap-4">
          <Button
            text="Logout"
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
            customClass="w-full"
          />
          <Button
            text="Cancel"
            type="button"
            variant="transparent"
            onClick$={() => {
              ref.value?.close();
            }}
            customClass="w-full"
          />
        </div>
      </Dialog>
    </>
  );
});
