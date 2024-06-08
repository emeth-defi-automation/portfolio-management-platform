import { twMerge } from "tailwind-merge";
import { component$, type JSXOutput } from "@builder.io/qwik";
import { cva, type VariantProps } from "class-variance-authority";

export interface IconBoxProps {
  tokenPath?: string;
  tokenName?: string;
  customClass?: string;
  customIcon?: JSXOutput | null;
}

const IconBoxStyles = cva(["rounded-lg"], {
  variants: {
    border: {
      gradient: ["gradient-border before:rounded-lg before:p-[1px]"],
      default: ["custom-border-1"],
      clear: [""],
    },
    background: {
      transparent: ["bg-transparent"],
      white: ["bg-white/10"],
    },
    boxSize: {
      small: ["h-8 w-8 p-1.5"],
      large: ["h-11 w-11 p-2"],
    },
  },
  defaultVariants: {
    border: "default",
    background: "transparent",
    boxSize: "large",
  },
});

export type IconBoxType = VariantProps<typeof IconBoxStyles> & IconBoxProps;

const IconBox = component$(
  ({
    border,
    background,
    tokenPath,
    tokenName,
    boxSize,
    customClass,
    customIcon,
  }: IconBoxType) => {
    return (
      <>
        <div
          class={twMerge(
            IconBoxStyles({ border, boxSize, background }),
            customClass,
          )}
        >
          {!customIcon ? (
            <img
              width={boxSize == "large" ? 24 : 16}
              height={boxSize == "large" ? 24 : 16}
              alt={`${tokenName} logo`}
              src={tokenPath}
              class="w-full"
            />
          ) : (
            customIcon
          )}
        </div>
      </>
    );
  },
);

export default IconBox;
