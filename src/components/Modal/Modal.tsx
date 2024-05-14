import { type QRL, type Signal, Slot, component$ } from "@builder.io/qwik";
import IconClose from "/public/assets/icons/close.svg?jsx";
import { twMerge } from "tailwind-merge";

export interface ModalProps {
  title: string;
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
        class="fixed left-0 top-0 flex h-full w-full items-center justify-center bg-black bg-opacity-60"
      >
        <div
          onClick$={(event) => {
            event.stopPropagation();
          }}
          class={twMerge(
            customClass,
            "custom-border-1 bg-modal-glass relative h-fit  min-w-[455px] overflow-auto rounded-xl p-6",
          )}
        >
          {hasButton ? (
            <div class="mb-8 flex items-center justify-between">
              <div class="text-xl font-semibold text-white">{title}</div>
              <button
                class="cursor-pointer"
                onClick$={() => {
                  isOpen.value = !isOpen.value;
                  if (onClose) {
                    onClose();
                  }
                }}
              >
                <IconClose />
              </button>
            </div>
          ) : null}
          <Slot />
        </div>
      </div>
    );
  },
);
