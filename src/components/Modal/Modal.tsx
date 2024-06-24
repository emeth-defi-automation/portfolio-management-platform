import {
  type QRL,
  type Signal,
  Slot,
  component$,
  type HTMLAttributes,
} from "@builder.io/qwik";
import IconClose from "@material-design-icons/svg/round/close.svg?jsx";
import { twMerge } from "tailwind-merge";
import Button from "../Atoms/Buttons/Button";
import BoxHeader from "../Molecules/BoxHeader/BoxHeader";
export interface ModalProps extends HTMLAttributes<any> {
  title?: string;
  isOpen: Signal<boolean>;
  customClass?: string;
  onClose?: QRL<() => void>;
  hasButton?: boolean;
}

export const Modal = component$<ModalProps>(
  ({ isOpen, title = "", onClose, hasButton = true, customClass }) => {
    return (
      <div
        onClick$={() => {
          isOpen.value = false;
          if (onClose) {
            onClose();
          }
        }}
        class="fixed left-0 top-0 z-50 flex h-full w-full items-center justify-center bg-black bg-opacity-60"
      >
        <div
          onClick$={(event) => {
            event.stopPropagation();
          }}
          class={twMerge(
            customClass,
            "custom-bg-opacity-5 custom-border-1 relative h-fit  w-fit min-w-[455px] overflow-auto rounded-2xl p-6 backdrop-blur-2xl",
          )}
        >
          {hasButton ? (
            <BoxHeader variantHeader="h3" title={title} class="mb-8">
              <Button
                variant="onlyIcon"
                onClick$={() => {
                  isOpen.value = !isOpen.value;
                  if (onClose) {
                    onClose();
                  }
                }}
                leftIcon={<IconClose class="h-6 w-6 fill-white" />}
              />
            </BoxHeader>
          ) : null}
          <Slot />
        </div>
      </div>
    );
  },
);
