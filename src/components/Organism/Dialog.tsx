import { component$, Slot } from "@builder.io/qwik";
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";
import DialogTitle from "../Molecules/DialogTitle/DialogTitle";
import Button from "../Atoms/Buttons/Button";
import IconClose from "/public/assets/icons/close.svg?jsx";

export interface DialogProps {
  class?: string;
  hasButton?: boolean;
}

const DialogStyles = cva([
  "custom-border-1 custom-bg-opacity-5 relative h-fit w-1/3 min-w-[455px] overflow-auto rounded-xl p-6 backdrop-blur-2xl text-white",
]);

export type DialogType = VariantProps<typeof DialogStyles> & DialogProps;

const Dialog = component$(({ ...props }: DialogType) => {
  return (
    <dialog open {...props} class={twMerge(DialogStyles(), props.class)}>
      {props.hasButton ? (
        <DialogTitle variantHeader="h3" title="Add wallet">
          <Button variant="onlyIcon" leftIcon=<IconClose class="h-4 w-4" /> />
        </DialogTitle>
      ) : null}
      {/* {props.hasButton ? (
            <div class="mb-8 flex items-center justify-between">
              <div class="text-xl font-semibold text-white">hellooo</div>
              <button
                class="cursor-pointer"
              >
                close
              </button>
            </div>
          ) : null} */}
      <Slot />
    </dialog>
  );
});

export default Dialog;
