import { type JSXOutput, component$ } from "@builder.io/qwik";
import { twMerge } from "tailwind-merge";

export interface ButtonProps {
  text?: string;
  variant?:
    | "blue"
    | "red"
    | "transparent"
    | "gradient"
    | "iconBox"
    | "onlyIcon";
  class?: string;
  leftIcon?: JSXOutput | null;
  size?: "small" | "large";
}

export const Button = component$<ButtonProps>((props) => {
  return (
    <button
      {...props}
      class={twMerge(
        `pointer flex items-center justify-center gap-2 text-nowrap rounded-full px-10 py-4
        ${
          props.variant === "blue"
            ? "bg-customBlue"
            : props.variant === "transparent"
              ? "custom-border-2 bg-transparent"
              : props.variant === "red"
                ? "bg-customRed"
                : props.variant === "gradient"
                  ? "gradient-border"
                  : props.variant === "iconBox"
                    ? "custom-border-1 custom-bg-white rounded-lg px-2 py-2"
                    : props.variant == "onlyIcon"
                      ? "p-0"
                      : ""
        }
        ${
          props.size === "small"
            ? "text-xs font-semibold"
            : "text-sm font-medium"
        }`,
        props.class,
      )}
    >
      {props.leftIcon ? props.leftIcon : null}
      {props.text ? <span>{props.text}</span> : null}
    </button>
  );
});
