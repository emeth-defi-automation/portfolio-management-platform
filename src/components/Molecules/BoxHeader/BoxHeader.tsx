import { twMerge } from "tailwind-merge";
import Header from "~/components/Atoms/Headers/Header";
import { component$, Slot } from "@builder.io/qwik";

export interface BoxHeaderProps {
  class?: string;
  variantHeader: "h1" | "h2" | "h3" | "h4" | "h5" | null;
  title?: string;
  headerClass?: string;
}

const BoxHeader = component$(({ ...props }: BoxHeaderProps) => {
  return (
    <div
      {...props}
      class={twMerge("flex items-center justify-between gap-6", props.class)}
    >
      <Header
        variant={props.variantHeader}
        text={props.title}
        class={props.headerClass}
      />
      <Slot />
    </div>
  );
});

export default BoxHeader;
