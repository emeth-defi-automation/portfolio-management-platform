import { cva, type VariantProps } from "class-variance-authority";
import { component$, useSignal, type QRL } from "@builder.io/qwik";
import { twMerge } from "tailwind-merge";

export interface CheckboxProps {
  value?: string | number;
  onClick?: QRL<() => void> | (() => void);
  isChecked: boolean;
  name?: string;
  class?: string;
  setIsChecked?: boolean;
  checkBoxClass?: string;
}

const CheckboxStyles = cva(["cursor-pointer"], {
  variants: {
    variant: {
      checkTick: [
        "appearance-none custom-border-1 rounded custom-bg-white checkbox-gradient-border relative before:absolute before:rounded before:p-px after:absolute  border-grd after:rotate-45",
      ],
      toggleTick: ["opacity-0 w-8 h-4 absolute"],
    },
    size: {
      small: [
        "h-5 w-5 before:w-5 before:h-5 after:w-1.5 after:h-2.5 after:left-1/2 after:-translate-x-1/2 after:top-1/2 after:-translate-y-2/3",
      ],
      large: [
        "h-6 w-6 before:w-6 before:h-6 after:w-1.5 after:h-2.5 after:left-1/2 after:-translate-x-1/2 after:top-1/2 after:-translate-y-2/3",
      ],
    },
  },
  defaultVariants: {
    variant: "checkTick",
    size: "large",
  },
});

export type CheckboxType = VariantProps<typeof CheckboxStyles> & CheckboxProps;

const Checkbox = component$<CheckboxType>(
  ({ isChecked, variant, size, onClick, ...props }) => {
    const isInputChecked = useSignal<boolean>(isChecked);
    return (
      <div
        class={twMerge(
          `${variant === "toggleTick" ? "h-5 w-8" : null} relative`,
          props.class,
        )}
      >
        <input
          id={props.name}
          name={props.name}
          type="checkbox"
          class={twMerge(
            CheckboxStyles({ variant, size }),
            props.checkBoxClass,
          )}
          value={props.value}
          onClick$={onClick}
          checked={isChecked}
        />
        {variant === "toggleTick" ? (
          <span
            onClick$={(e) => {
              const target = e.target;
              const input = (target as HTMLElement)!.parentNode!
                .childNodes[0] as HTMLInputElement;
              isInputChecked.value = !isInputChecked.value;
              input.checked = isInputChecked.value;
              if (onClick) {
                onClick();
              }
            }}
            class={`absolute h-4 w-8 cursor-pointer rounded-full before:absolute before:left-1 before:top-1/2 before:h-2.5 before:w-2.5 before:-translate-y-1/2 before:rounded-full before:bg-white ${isInputChecked.value ? "bg-customGreen before:translate-x-3.5" : "bg-gray-400 after:border-gray-400"}`}
          />
        ) : null}
      </div>
    );
  },
);

export default Checkbox;
