import { cva, type VariantProps } from "class-variance-authority";
import { component$, type JSXOutput, type Signal } from "@builder.io/qwik";
import { type QRL } from "@builder.io/qwik";
import { twMerge } from "tailwind-merge";

export interface InputProps {
  placeholder?: string;
  name?: string;
  value?: any;
  onInput?:
    | QRL<(value: any) => void>
    | ((value: any) => void)
    | QRL<(value: any) => Promise<void>>
    | ((value: any) => Promise<void>);
  inputClass?: string;
  disabled?: boolean;
  subValue?: string;
  type?: string;
  iconLeft?: JSXOutput | null;
  iconRight?: JSXOutput | null;
  id: string;
  ref?: Signal<Element | undefined>;
  isValid?: boolean;
}

const InputStyles = cva(
  [
    "custom-border-1 min-w-[13rem] w-full rounded-lg px-4 text-white placeholder:text-white bg-transparent font-['Sora'] text-sm",
  ],
  {
    variants: {
      variant: {
        search: ["pl-10"],
        swap: ["!border-0 p-0 text-[28px] h-fit focus:!border-0"],
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
    <div class="relative w-full">
      {props.iconLeft ? (
        <span class="absolute left-3 top-1/2 -translate-y-1/2 fill-white">
          {props.iconLeft}
        </span>
      ) : null}
      <input
        class={twMerge(
          InputStyles({ variant, size }),
          props.subValue ? "pr-[130px]" : null,
          props.iconRight ? "pr-10" : null,
          props.inputClass,
          props.isValid
            ? "!border-customGreen pr-10 text-customGreen placeholder:text-opacity-50 focus:border-customGreen focus:outline-none"
            : "",
        )}
        ref={props.ref}
        placeholder={props.placeholder}
        name={props.name}
        id={props.id}
        value={props.value}
        onInput$={props.onInput}
        disabled={props.disabled}
        type={props.type}
      />
      {props.iconRight ? (
        <span class="absolute right-3 top-1/2 -translate-y-1/2  fill-customGreen">
          {props.iconRight}
        </span>
      ) : null}
      {props.subValue ? (
        <span class="custom-text-50 absolute right-14 top-1/2 -translate-y-1/2 text-xs">
          {props.subValue}
        </span>
      ) : null}
    </div>
  );
});

export default Input;
