import { cva, type VariantProps } from "class-variance-authority";
import { component$, type JSXOutput } from "@builder.io/qwik";
import { type QRL } from "@builder.io/qwik";
import { twMerge } from "tailwind-merge";

export interface InputProps {
  placeholder?: string;
  name?: string;
  value?: string;
  onInput?: QRL<(value: any) => void>;
  customClass?: string;
  disabled?: boolean;
  subValue?: string;
  iconLeft?: JSXOutput | null;
  iconRight?: JSXOutput | null;
  type?: string;
}

const InputStyles = cva(
  [
    "custom-border-1 min-w-[11rem] w-full cursor-pointer rounded-lg px-4 text-white placeholder:text-white bg-transparent font-['Sora'] text-sm relative",
  ],
  {
    variants: {
      variant: {
        search: ["pl-10"],
        checked: [
          "text-customGreen !border-customGreen placeholder:text-opacity-50 pr-10",
        ],
      },
      size: {
        xs: ["h-8 text-xs"],
        small: ["h-10 text-xs placeholder:text-opacity-50"],
        medium: ["h-11"],
        large: ["h-12"],
      },
    },
    defaultVariants: {
      size: "large",
    },
  },
);

export type InputType = VariantProps<typeof InputStyles> & InputProps;

const Input = component$(({ variant, size, ...props }: InputType) => {
  return (
    <div class="relative">
      {props.iconLeft ? (
        <span class="absolute left-3 top-1/2 -translate-y-1/2 fill-white">
          {props.iconLeft}
        </span>
      ) : null}
      <input
        {...props}
        class={twMerge(
          InputStyles({ variant, size }),
          props.subValue ? "pr-[80px]" : null,
          props.customClass,
        )}
        placeholder={props.placeholder}
        type={props.type ? props.type : "text"}
        name={props.name}
        value={props.value}
        onInput$={props.onInput}
        disabled={props.disabled}
      />
      {props.iconRight ? (
        <span class="absolute right-3 top-1/2 -translate-y-1/2  fill-customGreen">
          {props.iconRight}
        </span>
      ) : null}
      {props.subValue ? (
        <span class="custom-text-50 absolute right-3 top-1/2 -translate-y-1/2 text-xs">
          ({props.subValue})
        </span>
      ) : null}
    </div>
  );
});

export default Input;
