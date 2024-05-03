import { cva, VariantProps } from "class-variance-authority";
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
}

const InputStyles = cva(
  [
    "custom-border-1 w-full cursor-pointer rounded-lg px-4 text-white placeholder:text-white bg-transparent font-['Sora']",
  ],
  {
    variants: {
      variant: {
        search: ["background-search px-10"],
        checked: [
          "background-checked text-customGreen !border-customGreen placeholder:text-opacity-50",
        ],
      },
      size: {
        xs: ["h-8 text-xs"],
        small: ["h-10 text-sm placeholder:text-opacity-50"],
        medium: ["h-11"],
        large: ["h-12"],
      },
      defaultVariant: {
        variant: "",
        size: "large",
      },
    },
  },
);

export type InputType = VariantProps<typeof InputStyles> & InputProps;

const Input = ({ variant, size, ...props }: InputType) => {
  return (
    <>
      <input
        {...props}
        class={twMerge(InputStyles({ variant, size }), props.customClass)}
        placeholder={props.placeholder}
        type="text"
        name={props.name}
        value={props.value}
        onInput$={props.onInput}
        disabled={props.disabled}
      />
      {props.subValue ? (
        <span class="custom-text-50 absolute right-8 top-8 -translate-y-1/2 text-xs">
          ({props.subValue})
        </span>
      ) : null}
    </>
  );
};

export default Input;
