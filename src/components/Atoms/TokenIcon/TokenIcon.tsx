import { twMerge } from "tailwind-merge";
import { component$ } from "@builder.io/qwik";
import { cva, type VariantProps } from "class-variance-authority";

export interface TokenIconProps {
  imagePath?: string;
  tokenName?: string;
  customClass?: string;
}

const TokenIconStyles = cva(["rounded-lg"], {
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

export type TokenIconType = VariantProps<typeof TokenIconStyles> &
  TokenIconProps;

const TokenIcon = component$(
  ({
    border,
    background,
    imagePath,
    tokenName,
    boxSize,
    ...props
  }: TokenIconType) => {
    return (
      <>
        <div
          class={twMerge(
            TokenIconStyles({ border, boxSize, background }),
            props.customClass,
          )}
        >
          <img
            width={boxSize == "large" ? 24 : 16}
            height={boxSize == "large" ? 24 : 16}
            alt={`${tokenName} logo`}
            src={imagePath}
            class="w-full"
          />
        </div>
      </>
    );
  },
);

export default TokenIcon;
