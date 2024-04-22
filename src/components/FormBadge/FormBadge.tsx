import { type JSXOutput, component$ } from "@builder.io/qwik";
import { twMerge } from "tailwind-merge";

export interface FormBadgeProps {
  hasText?: boolean;
  hasImg?: string;
  text?: string;
  description?: string;
  image?: string;
  placeholder?: string;
  input?: JSXOutput | null;
  class?: string;
  customClass?: string;
  for?: string;
  labelClass?: string;
  imgClass?: string;
}

export const FormBadge = component$<FormBadgeProps>((props) => {
  return (
    <div class={twMerge("relative flex min-h-11 items-center", props.class)}>
      {props.input ? props.input : null}
      <label
        for={props.for}
        class={twMerge(
          "custom-bg-white custom-border-1 inline-flex min-h-12 w-full  cursor-pointer items-center justify-between rounded-lg p-2 pr-4",
          props.customClass,
        )}
      >
        <span
          class={twMerge(
            `absolute start-2 flex items-center gap-2`,
            props.labelClass,
          )}
        >
          <div class="custom-border-1 custom-shadow-2 mr-2 rounded-lg p-1 ">
            {props.image && <img src={props.image} width="24" height="24" />}
          </div>
          <div class="">
            <p>{props.text}</p>
            <p class="custom-text-50 text-xs">{props.description}</p>
          </div>
        </span>
      </label>
      {props.hasImg ? (
        <img
          src={props.hasImg}
          width="14"
          height="14"
          class={twMerge(`absolute end-[62px]`, props.imgClass)}
        />
      ) : null}
    </div>
  );
});
