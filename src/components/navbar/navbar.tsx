import { component$, Slot } from "@builder.io/qwik";
import Logo from "/public/images/logo.png?jsx";

export const Navbar = component$(() => {
  return (
    <>
      <div class="grid grid-cols-[1fr_2fr_1fr] items-center justify-between py-2 px-6 text-xs text-gray-400 shadow">
        <div class="h-[20px] w-[94px]">
          <Logo />
        </div>
        <Slot/>
      </div>
    </>
  );
});