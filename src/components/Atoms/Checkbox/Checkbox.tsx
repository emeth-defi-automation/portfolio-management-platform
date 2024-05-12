import { cva, type VariantProps } from "class-variance-authority";
import { type QRL } from "@builder.io/qwik";
import { twMerge } from "tailwind-merge";

export interface CheckboxProps {
  value: string | number;
  onClick: QRL<() => void> | (() => void);
  checked: boolean;
  name: string;
  class?: string;
  setIsChecked: boolean;
}

const CheckboxStyles = cva(["cursor-pointer"], {
  variants: {
    variant: {
      checkTick: [
        "appearance-none custom-border-1 rounded custom-bg-white checkbox-gradient-border relative before:absolute before:rounded before:p-px after:absolute  border-grd after:rotate-45",
      ],
      toggleTick: ["opacity-0 w-8 h-5 absolute"],
    },
    size: {
      small: [
        "h-5 w-5 before:w-5 before:h-5 after:w-1.5 after:h-2.5 after:left-1/2 after:-translate-x-1/2 after:top-1/2 after:-translate-y-2/3",
      ],
      large: [
        "h-6 w-6 before:w-6 before:h-6 after:w-1.5 after:h-2.5 after:left-1/2 after:-translate-x-1/2 after:top-1/2 after:-translate-y-2/3",
      ],
    },
    defaultVariant: {
      variant: "checkTick",
      size: "large",
    },
  },
});

export type CheckboxType = VariantProps<typeof CheckboxStyles> & CheckboxProps;

const Checkbox = ({ variant, size, ...props }: CheckboxType) => {
  return (
    <>
      <input
        id={props.name}
        name={props.name}
        type="checkbox"
        class={twMerge(CheckboxStyles({ variant, size }), props.class)}
        value={props.value}
        onClick$={props.onClick}
        checked={props.checked}
      />
      {variant === "toggleTick" ? (
        <span
          onClick$={() => {
          props.checked = !props.checked;
          }}
          class={`absolute h-5 w-8 cursor-pointer rounded-full before:absolute before:left-1 before:top-1/2 before:h-3 before:w-3 before:-translate-y-1/2 before:rounded-full before:bg-white after:absolute after:left-2 after:top-1/2 after:h-1.5 after:w-1 after:-translate-y-1/2 after:rotate-45 after:border-2 after:border-l-0 after:border-t-0 after:border-solid ${props.checked ? "bg-customGreen before:translate-x-3 after:translate-x-3 after:border-customGreen" : "bg-gray-400 after:border-gray-400"}`}
        />
      ) : null}
    </>
  );
};

export default Checkbox;
