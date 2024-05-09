import { type QRL, type Signal, Slot, component$ } from "@builder.io/qwik";
import IconClose from "@material-design-icons/svg/round/close.svg?jsx";
// import { twMerge } from "tailwind-merge";
import Button from "../Atoms/Buttons/Button";
import Box from "../Atoms/Box/Box";

export interface ModalProps {
  title: string;
  isOpen: Signal<boolean>;
  customClass?: string;
  onClose?: QRL<() => void>;
  hasButton?: boolean;
}

export const Modal = component$<ModalProps>(
  ({ isOpen, title = "", onClose, hasButton = true }) => {
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
        <Box
          onClick$={(event) => {
            event.stopPropagation();
          }}
          customClass="w-1/3 min-w-[455px] overflow-auto backdrop-blur-2xl"
        >
          {hasButton ? (
            <div class="mb-8 flex items-center justify-between">
              <div class="text-xl font-semibold text-white">{title}</div>
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
            </div>
          ) : null}
          <Slot />
        </Box>
      </div>
    );
  },
);
