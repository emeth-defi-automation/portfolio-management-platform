import { type QRL, component$ } from "@builder.io/qwik";
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";
import IconArrowDown from "/public/assets/icons/arrow-down.svg?jsx";

export type Option = {
  value: string;
  text: string;
};

const SelectStyles = cva(
  [
    "custom-border-1 min-w-max w-full cursor-pointer rounded-lg bg-transparent px-4 text-white  text-xs font-['Sora'] appearance-none ",
  ],
  {
    variants: {
      size: {
        small: ["w-14 px-1.5 h-8"],
        medium: ["w-full h-10 pr-10"],
        large: ["w-full h-12 pr-10 text-sm"],
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
}

const Select = component$(({ size, ...props }: SelectProps) => {
  return (
    <div
      class={twMerge(
        `relative min-w-max ${size == "small" ? "w-fit" : null}`,
        props.class,
      )}
    >
      <select
        name={props.name}
        id={props.name}
        class={twMerge(SelectStyles({ size }), props.selectClass)}
        disabled={props.disabled ? props.disabled : false}
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
        class={`absolute top-1/2 -translate-y-1/2 ${size == "small" ? "right-1.5" : size == "medium" ? "right-2" : "right-4"}`}
      >
        <IconArrowDown />
      </span>
    </div>
  );
});

export default Select;
