import { component$ } from "@builder.io/qwik";
import { twMerge } from "tailwind-merge";

export interface DividerProps {
  class?: string;
}

export const Divider = component$((props: DividerProps) => {
  return (
    <div
      class={twMerge("mx-auto w-full border-b border-white/10", props.class)}
    ></div>
  );
});
