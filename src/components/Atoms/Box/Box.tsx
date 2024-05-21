import { twMerge } from "tailwind-merge";
import { Slot, component$ } from "@builder.io/qwik";
import { cva, type VariantProps } from "class-variance-authority";

export interface BoxProps {
  customClass?: string;
}

const BoxStyles = cva(
  [" p-6  h-fit w-full relative overflow-auto custom-bg-opacity-5"],
  {
    variants: {
      variant: {
        box: ["custom-border-1 rounded-3xl custom-shadow-2"],
        navbar: ["custom-shadow rounded-none custom-border-b-1"],
      },
    },
    defaultVariants: {
      variant: "box",
    },
  },
);

export type BoxType = VariantProps<typeof BoxStyles> & BoxProps;

const Box = component$(({ variant, ...props }: BoxType) => {
  return (
    <div {...props} class={twMerge(BoxStyles({ variant }), props.customClass)}>
      <Slot />
    </div>
  );
});

export default Box;
