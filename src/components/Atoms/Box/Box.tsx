import { twMerge } from "tailwind-merge";
import { Slot } from "@builder.io/qwik";
import { cva, type VariantProps } from "class-variance-authority";

export interface BoxProps {
  customClass?: string;
}

const BoxStyles = cva(
  ["custom-shadow-2 p-6 rounded-3xl h-fit w-full relative overflow-auto "],
  {
    variants: {
      variant: {
        popUp: ["custom-bg-white w-1/3 min-w-[455px] custom-border-1"],
        mainWindow: ["custom-bg-opacity-5 custom-border-1"],
        navbar: [
          "custom-shadow custom-bg-opacity-5 rounded-none custom-border-b-1",
        ],
      },
    },
    defaultVariants: {
      variant: "mainWindow",
    },
  },
);

export type BoxType = VariantProps<typeof BoxStyles> & BoxProps;

const Box = ({ variant, ...props }: BoxType) => {
  return (
    <div {...props} class={twMerge(BoxStyles({ variant }), props.customClass)}>
      <Slot />
    </div>
  );
};

export default Box;
