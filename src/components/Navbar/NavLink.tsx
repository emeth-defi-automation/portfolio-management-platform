import { Slot, component$ } from "@builder.io/qwik";
import { Link, useLocation } from "@builder.io/qwik-city";

export interface NavLinkProps {
  href: string;
}
export const NavLink = component$<NavLinkProps>(({ href }) => {
  const location = useLocation();
  const toPathname = href;
  const locationPathname = location.url.pathname;

  const isActive = locationPathname.startsWith(toPathname);
  return (
    <Link
      href={href}
      class={`text-white no-underline${isActive ? "" : " opacity-50"}`}
      prefetch={false}
    >
      <Slot />
    </Link>
  );
});
