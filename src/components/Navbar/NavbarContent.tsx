import { component$, useContext } from "@builder.io/qwik";
import ImgAvatar from "/public/assets/images/avatar.png?jsx";
import IconLogout from "/public/assets/icons/logout.svg?jsx";
import { ModalStoreContext } from "~/interface/web3modal/ModalStore";
import { type Config, disconnect, getAccount } from "@wagmi/core";
import { NavLink } from "./NavLink";
import { useNavigate } from "@builder.io/qwik-city";

export const NavbarContent = component$(() => {
  const nav = useNavigate();
  const modalStore = useContext(ModalStoreContext);
  let address;
  modalStore.config &&
    (({ address } = getAccount(modalStore.config)),
    address && (address = address.slice(0, 4) + "..." + address.slice(-4)));
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
        <div class="">
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

            await disconnect(modalStore.config as Config);
            await nav("/");
          }}
        >
          <IconLogout />
        </button>
      </div>
    </>
  );
});
