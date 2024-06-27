import { type QRL, component$, type JSXOutput } from "@builder.io/qwik";
import { twMerge } from "tailwind-merge";
import { cva, type VariantProps } from "class-variance-authority";

export interface ButtonProps {
  text?: string;
  customClass?: string;
  leftIcon?: JSXOutput | null;
  rightIcon?: JSXOutput | null;
  disabled?: boolean;
  onClick$?:
    | QRL<() => void>
    | (() => void)
    | QRL<() => Promise<void>>
    | (() => Promise<void>);
  dataTestId?: string;
  type?: "submit" | "button";
}

const buttonStyles = cva(
  [
    "font-['Sora'] pointer flex items-center gap-2 text-nowrap justify-center rounded-full border-2 text-white border-transparent hover:brightness-75 disabled:bg-transparent disabled:cursor-not-allowed disabled:hover:brightness-100 disabled:border-2 disabled:border-customGrey/15 disabled:text-customGrey",
  ],
  {
    variants: {
      variant: {
        blue: ["bg-customBlue"],
        transparent: ["custom-border-2 bg-transparent"],
        red: ["bg-customRed"],
        danger: ["bg-customRed/20 text-customRed"],
        gradient: ["gradient-border disabled:before:p-0 "],
        iconBox: ["custom-border-1 custom-bg-white rounded-lg !p-2"],
        onlyIcon: ["!p-0 gap-0 !h-fit border-0"],
        dashed: [
          "border-dashed border-customBlue border-[1px] rounded-lg w-full bg-customBlue/10",
        ],
        transfer: [
          "bg-gradient-to-br from-pink-600 via-pink-600 to-red-300 border-none rounded-md hover:brightness-100",
        ],
      },
      size: {
        small: ["text-xs font-semibold h-8 px-4"],
        large: ["text-sm h-12 px-8"],
      },
    },
    defaultVariants: {
      variant: "blue",
      size: "large",
    },
  },
);

export type buttonType = VariantProps<typeof buttonStyles> & ButtonProps;

const Button = component$(({ variant, size, ...props }: buttonType) => {
  return (
    <>
      <button
        {...props}
        class={twMerge(buttonStyles({ variant, size }), props.customClass)}
        data-testid={props.dataTestId}
        type={props.type}
      >
        {props.leftIcon ? (
          <span
            class={`${props.disabled ? "first:fill-customGrey" : variant == "danger" ? "fill-customRed" : "first:fill-white"} grow-0`}
          >
            {props.leftIcon}
          </span>
        ) : null}
        {props.text ? (
          <span class={props.rightIcon ? "grow text-left" : ""}>
            {props.text}
          </span>
        ) : null}
        {props.rightIcon ? (
          <span
            class={`${props.disabled ? "last:fill-customGrey" : "last:fill-white"} grow-0`}
          >
            {props.rightIcon}
          </span>
        ) : null}
      </button>
    </>
  );
});

export default Button;
