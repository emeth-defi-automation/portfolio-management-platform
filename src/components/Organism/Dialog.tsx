import { component$, Slot, useSignal } from "@builder.io/qwik";
import { twMerge } from "tailwind-merge";
import BoxHeader from "../Molecules/BoxHeader/BoxHeader";
import Button from "../Atoms/Buttons/Button";
import IconClose from "@material-design-icons/svg/filled/close.svg?jsx";

export interface DialogProps {
  class?: string;
  hasButton?: boolean;
  title?: string;
}

const Dialog = component$(({ ...props }: DialogProps) => {
  const isOpen = useSignal(false);
  return (
    <>
      <Button
        variant="transparent"
        text="Add wallet"
        onClick$={() => {
          isOpen.value = !isOpen.value;
        }}
      />
      <dialog
        {...props}
        class={twMerge(
          `custom-border-1 custom-bg-opacity-5 relative flex h-fit w-1/3 min-w-[455px] flex-col gap-8 overflow-auto rounded-2xl p-6 text-white backdrop-blur-2xl backdrop:bg-black backdrop:bg-opacity-70 ${isOpen.value ? "block" : "hidden"}`,
          props.class,
        )}
        onClick$={(event) => {
          event.stopPropagation();
        }}
        ref={(e) => {
          if (isOpen.value) {
            e.showModal();
          } else {
            e.close();
          }
        }}
      >
        {props.hasButton ? (
          <BoxHeader variantHeader="h3" title={props.title}>
            <Button
              variant="onlyIcon"
              leftIcon={<IconClose class="h-6 w-6 fill-white" />}
              onClick$={() => {
                isOpen.value = !isOpen.value;
              }}
            />
          </BoxHeader>
        ) : null}
        <Slot />
      </dialog>
    </>
  );
});

export default Dialog;
