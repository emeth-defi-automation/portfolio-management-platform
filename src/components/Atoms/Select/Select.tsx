import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

export type Option = {
  value: string;
  text: string;
};

export interface SelectProps {
  text?: string;
  class?: string;
  options?: Option[];
  // value: number | string;
  onValueChange: any;
  placeholder?: string;
}

const SelectStyles = cva(
  [
    "custom-border-1 w-full cursor-pointer rounded-lg bg-transparent px-4 text-white classic text-xs font-['Sora']",
  ],
  {
    variants: {
      variant: {
        smallArrow: ["classic-second-position bg-white bg-opacity-5"],
        largeArrow: ["classic-first-position"],
      },
      size: {
        small: ["w-14 px-1.5 h-8"],
        large: ["w-full h-10"],
      },
      defaultVariant: {
        variant: "largeArrow",
        size: "large",
      },
    },
  },
);

export type SelectType = VariantProps<typeof SelectStyles> & SelectProps;

const Select = ({ variant, size, ...props }: SelectType) => {
  return (
    <select
      class={twMerge(SelectStyles({ variant, size }), props.class)}
      // onInput$={(e: any) => {
      //     const target = e.target as any;
      //     $(props.onValueChange(target.value)); // Użyj funkcji przekazanej przez propsy do aktualizacji wartości
      // }}
      // value={props.value}
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
};

export default Select;
