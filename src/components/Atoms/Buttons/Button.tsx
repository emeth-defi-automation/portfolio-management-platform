import { type JSXOutput } from "@builder.io/qwik";
import { twMerge } from "tailwind-merge";
import { cva, type VariantProps } from "class-variance-authority";

export interface ButtonProps {
  text?: string;
  class?: string;
  leftIcon?: JSXOutput | null;
  rightIcon?: JSXOutput | null;
}

const buttonStyles = cva(
  [
    "font-['Sora'] pointer flex items-center gap-2 text-nowrap rounded-full px-4 py-4",
    // TODO change hover states while designed
    "hover:backdrop-brightness-150",
    "hover:brightness-125",
  ],
  {
    variants: {
      variant: {
        blue: ["bg-customBlue"],
        transparent: ["custom-border-2 bg-transparent"],
        red: ["bg-customRed"],
        danger: ["bg-customRed/20 text-customRed"],
        gradient: ["gradient-border"],
        iconBox: ["custom-border-1 custom-bg-white rounded-lg px-2 py-2"],
        onlyIcon: ["p-0 gap-0"],
      },
      size: {
        small: ["text-xs font-semibold"],
        large: ["text-sm"],
      },
    },
    defaultVariants: {
      variant: "blue",
      size: "large",
    },
  },
);

export type buttonType = VariantProps<typeof buttonStyles> & ButtonProps;

const Button = ({ variant, size, ...props }: buttonType) => {
  return (
    <button
      {...props}
      class={twMerge(buttonStyles({ variant, size }), props.class)}
    >
      {props.leftIcon ? <span class="grow-0">{props.leftIcon}</span> : null}
      {props.text ? (
        <span class={props.rightIcon ? "grow text-left" : ""}>
          {props.text}
        </span>
      ) : null}
      {props.rightIcon ? <span class="grow-0">{props.rightIcon}</span> : null}
    </button>
  );
};

export default Button;