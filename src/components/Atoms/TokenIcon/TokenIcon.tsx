import { twMerge } from "tailwind-merge";
import { component$ } from "@builder.io/qwik";
import { cva, type VariantProps } from "class-variance-authority";
import { Image } from "qwik-image";

export interface TokenIconProps {
  imagePath?: string;
  tokenName?: string;
  customClass?: string;
}

const TokenIconStyles = cva(
  [
    "rounded-lg p-2.5",
  ],
  {
    variants: {
      variant: {
        gradient: ["border-gradient"],
        default: ["custom-border-1"], 
      },
      background: {
        transparent: ["bg-transparent"],
        white: ["bg-white/10"]
      },
      iconSize: {
        small: ["!h-6 !w-6"],
        large: ["!h-10 !w-10"],
      },
      boxSize: {
        small: ["h-8 w-8"],
        large: ["h-11 w-11"]
      }
    },
    defaultVariants: {
      variant: "default",
      iconSize: "large",
    },
  },
);

export type TokenIconType = VariantProps<typeof TokenIconStyles> &
  TokenIconProps;

const TokenIcon = component$(
  ({ variant, iconSize, imagePath, tokenName, boxSize, ...props }: TokenIconType) => {
    return (
      <>
        <div class={twMerge(TokenIconStyles({ variant, boxSize, }), props.customClass)}>
          <img
            width={24}
            height={24}
            class={iconSize}
            alt={`${tokenName} logo`}
            src={imagePath}
          />
        </div>
      </>
    );
  },
);

export default TokenIcon