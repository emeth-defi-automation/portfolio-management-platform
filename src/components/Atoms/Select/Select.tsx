import { component$ } from "@builder.io/qwik";
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";
import IconArrowDown from "/public/assets/icons/arrow-down.svg?jsx";

export type Option = {
  value: string | number;
  text: string;
};

const SelectStyles = cva(
  [
    "custom-border-1 min-w-max cursor-pointer rounded-lg bg-transparent px-4 text-white text-xs font-['Sora'] appearance-none ",
  ],
  {
    variants: {
      size: {
        small: ["w-14 px-1.5 h-8"],
        medium: ["w-full h-10 pr-8"],
        large: ["w-full h-12 pr-10 text-sm"],
        swap: ["w-full h-8 pr-10"],
      },
    },
    defaultVariants: {
      size: "large",
    },
  },
);

export interface SelectProps extends VariantProps<typeof SelectStyles> {
  name: string;
  class?: string;
  options?: Option[];
  onValueChange?: any;
  placeholder?: string;
  selectClass?: string;
  disabled?: boolean;
  id: string;
}

const Select = component$(({ size, onValueChange, ...props }: SelectProps) => {
  return (
    <div
      class={twMerge(
        `relative flex w-full items-center ${size == "small" ? "w-fit" : size == "swap" ? "h-8" : null}`,
        props.class,
      )}
    >
      <select
        name={props.name}
        id={props.id}
        class={twMerge(SelectStyles({ size }), props.selectClass)}
        disabled={props.disabled ? props.disabled : false}
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
      <span
        class={`absolute top-1/2 -z-10 -translate-y-1/2 ${size == "small" ? "right-1.5" : size == "medium" ? "right-2" : "right-4"}`}
      >
        <IconArrowDown />
      </span>
    </div>
  );
});

export default Select;
