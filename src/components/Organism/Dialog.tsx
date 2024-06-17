import {
  component$,
  type QRL,
  type Signal,
  Slot,
  useSignal,
} from "@builder.io/qwik";
import { twMerge } from "tailwind-merge";
import BoxHeader from "../Molecules/BoxHeader/BoxHeader";
import Button from "../Atoms/Buttons/Button";
import IconClose from "@material-design-icons/svg/filled/close.svg?jsx";

export interface DialogProps {
  customClass?: string;
  hasButton?: boolean;
  title?: string;
  ref: Signal<HTMLDialogElement | undefined>;
  onClose?:
    | QRL<() => void>
    | (() => void)
    | QRL<() => Promise<void>>
    | (() => Promise<void>);
}

const Dialog = component$(({ ref, onClose, ...props }: DialogProps) => {
  return (
    <dialog
      class="custom-bg-opacity-5 relative  overflow-auto rounded-2xl p-6 text-white backdrop-blur-2xl backdrop:bg-black backdrop:bg-opacity-70"
      onClick$={(event) => {
        event.stopPropagation();
      }}
      ref={ref}
    >
      <div
        class={twMerge(
          `flex h-fit w-1/3 min-w-[380px] flex-col gap-8`,
          props.customClass,
        )}
      >
        {props.hasButton ? (
          <BoxHeader variantHeader="h3" title={props.title}>
            <Button
              variant="onlyIcon"
              leftIcon={<IconClose class="h-6 w-6 fill-white" />}
              onClick$={() => {
                ref.value?.close();
                if (onClose) {
                  onClose();
                }
              }}
            />
          </BoxHeader>
        ) : null}
        <Slot />
      </div>
    </dialog>
  );
});

export default Dialog;
