import { type QRL, component$ } from "@builder.io/qwik";
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

export type Option = {
  value: string;
  text: string;
};

const SelectStyles = cva(
  [
    "custom-border-1 min-w-max w-full cursor-pointer rounded-lg bg-transparent px-4 text-white  text-xs font-['Sora'] appearance-none bg-[url('/assets/icons/arrow-down.svg')] bg-no-repeat bg-auto",
  ],
  {
    variants: {
      variant: {
        smallArrow: ["bg-[position:right_6px_center] bg-white bg-opacity-5"],
        largeArrow: ["bg-[position:right_16px_center]"],
      },
      size: {
        small: ["w-14 px-1.5 h-8"],
        medium: ["w-full h-10 pr-10"],
        large: ["w-full h-12 pr-10 text-sm"],
      },
    },
    defaultVariants: {
      variant: "largeArrow",
      size: "large",
    },
  },
);

// export type SelectType = VariantProps<typeof SelectStyles>;

export interface SelectProps extends VariantProps<typeof SelectStyles> {
  class?: string;
  options?: Option[];
  onValueChange?: QRL<(target: any) => void>;
  name: string;
}

const Select = component$(
  ({ onValueChange, variant, size, ...props }: SelectProps) => {
    return (
      <select
        name={props.name}
        id={props.name}
        class={twMerge(SelectStyles({ variant, size }), props.class)}
        onInput$={(e: any) => {
          const target = e.target as any;
          if (onValueChange) {
            onValueChange(target.value);
          }
        }}
      >
        {props.options?.map((option, index) => (
          <option
            class="text-black"
            key={`${option.text}${index}`}
            value={option.value}
          >
            {option.text}
          </option>
        ))}
      </select>
    );
  },
);

export default Select;
