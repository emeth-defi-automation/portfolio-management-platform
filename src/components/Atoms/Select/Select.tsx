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
    "custom-border-1 min-w-max w-full cursor-pointer rounded-lg bg-transparent px-4 text-white  text-xs font-['Sora'] appearance-none bg-[url('/assets/icons/arrow-down.svg')] bg-no-repeat bg-auto",
  ],
  {
    variants: {
      variant: {
        smallArrow: ["bg-[position:right_8px_center] bg-white bg-opacity-5"],
        largeArrow: ["bg-[position:right_16px_center]"],
      },
      size: {
        small: ["w-14 px-1.5 h-8"],
        large: ["w-full h-10 pr-10"],
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
