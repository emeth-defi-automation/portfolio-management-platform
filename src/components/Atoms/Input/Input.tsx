import { cva, type VariantProps } from "class-variance-authority";
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
    "custom-border-1 min-w-[20rem] w-full cursor-pointer rounded-lg px-4 text-white placeholder:text-white bg-transparent font-['Sora'] text-sm",
  ],
  {
    variants: {
      variant: {
        search: [
          "bg-[url('/assets/icons/search.svg')] bg-no-repeat bg-[position:12px_50%] pl-10",
        ],
        checked: [
          "bg-[url('/assets/icons/dashboard/success.svg')] bg-[size:16px_16px] bg-no-repeat bg-[position:right_12px_top_50%] text-customGreen !border-customGreen placeholder:text-opacity-50 pr-10",
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

const Input = ({ variant, size, ...props }: InputType) => {
  return (
    <>
      <input
        {...props}
        class={twMerge(
          InputStyles({ variant, size }),
          props.subValue ? "pr-[80px]" : null,
          props.customClass,
        )}
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
