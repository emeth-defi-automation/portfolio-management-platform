import { component$, Slot } from "@builder.io/qwik";
import { twMerge } from "tailwind-merge";

export interface LabelProps {
  class?: string;
  name: string;
}

const Label = component$(({ ...props }: LabelProps) => {
  return (
    <label
      {...props}
      for={props.name}
      class={twMerge(
        "custom-text-50 block text-nowrap font-['Sora'] text-xs uppercase",
        props.class,
      )}
    >
      {props.name}
      <Slot />
    </label>
  );
});

export default Label;
