import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";
import Header from "~/components/Atoms/Headers/Header";
import { component$, Slot } from "@builder.io/qwik";

export interface DialogTitleProps {
  class?: string;
  variantHeader: "h1" | "h2" | "h3" | "h4" | "h5" | null;
  title?: string;
  headerClass?: string;
}

const DialogTitleStyles = cva(["flex items-center justify-between gap-6"]);

export type DialogTitleType = VariantProps<typeof DialogTitleStyles> &
  DialogTitleProps;

const DialogTitle = component$(({ ...props }: DialogTitleType) => {
  return (
    <div {...props} class={twMerge(DialogTitleStyles(), props.class)}>
      <Header
        variant={props.variantHeader}
        title={props.title}
        class={props.headerClass}
      />
      <Slot />
    </div>
  );
});

export default DialogTitle;
