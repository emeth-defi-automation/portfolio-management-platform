import { component$, Slot } from "@builder.io/qwik";
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";
import DialogTitle from "../Molecules/DialogTitle/DialogTitle";
import Button from "../Atoms/Buttons/Button";
import IconClose from "@material-design-icons/svg/filled/close.svg?jsx";

export interface DialogProps {
  class?: string;
  hasButton?: boolean;
  title?: string;
  // onClose?: QRL<() => void>;
  // isOpen: Signal<boolean>;
}

const DialogStyles = cva([
  "custom-border-1 custom-bg-opacity-5 relative h-fit w-1/3 min-w-[455px] overflow-auto rounded-2xl p-6 backdrop-blur-2xl text-white flex flex-col gap-8",
]);

export type DialogType = VariantProps<typeof DialogStyles> & DialogProps;

const Dialog = component$(({ ...props }: DialogType) => {
  return (
    <dialog
      {...props}
      class={twMerge(DialogStyles(), props.class)}
      onClick$={(event) => {
        event.stopPropagation();
      }}
    >
      {props.hasButton ? (
        <DialogTitle variantHeader="h3" title={props.title}>
          <Button
            variant="onlyIcon"
            leftIcon={<IconClose class="h-6 w-6 fill-white" />}
            // TODO
            // onClick$={() => {
            //   isOpen.value = !isOpen.value;
            //   if (onClose) {
            //     onClose();
            //   }
            // }}
          />
        </DialogTitle>
      ) : null}
      <Slot />
    </dialog>
  );
});

export default Dialog;
