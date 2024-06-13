import { component$, useContext, useSignal } from "@builder.io/qwik";
import type { Signal } from "@builder.io/qwik";
import Button from "~/components/Atoms/Buttons/Button";
import { Modal } from "~/components/Modal/Modal";
import { getObservedWallets } from "~/components/ObservedWalletsList/ObservedWalletsList";
import { type WalletTokensBalances } from "~/interface/walletsTokensBalances/walletsTokensBalances";
import { useRemoveWallet } from "~/routes/app/wallets/server";
import ImgWarningRed from "/public/assets/icons/wallets/warning-red.svg?jsx";
import { SelectedWalletDetailsContext } from "../..";
export { getObservedWallets } from "~/components/ObservedWalletsList/ObservedWalletsList";
export { useRemoveWallet } from "~/routes/app/wallets/server";

interface DeleteModalProps {
  isDeleteModalOpen: Signal<boolean>;
}

export const DeleteModal = component$<DeleteModalProps>(
  ({ isDeleteModalOpen }) => {
    const selectedWalletDetails = useContext(SelectedWalletDetailsContext)
    const removeWalletAction = useRemoveWallet();
    const observedWallets = useSignal<WalletTokensBalances[]>([]);

    return (
      <Modal
        isOpen={isDeleteModalOpen}
        title=""
        hasButton={false}
        customClass="py-8 px-14 w-fit"
      >
        <div class="flex flex-col items-center gap-4">
          <ImgWarningRed />
          <h1 class="text-center text-xl">
            You are going to permanently delete your wallet!
          </h1>
        </div>
        <div class="my-8 flex justify-center">
          <ul class="custom-text-50 text-sm">
            <li>
              <span class="before:mr-3 before:inline-block before:h-3 before:w-2 before:rotate-45 before:border-b-2 before:border-r-2 before:border-solid before:border-green-600" />
              We will stop all related automation
            </li>
            <li>
              <span class="before:mr-3 before:inline-block before:h-3 before:w-2 before:rotate-45 before:border-b-2 before:border-r-2 before:border-solid before:border-green-600" />
              Change all future report processes
            </li>
            <li>
              <span class="before:mr-3 before:inline-block before:h-3 before:w-2 before:rotate-45 before:border-b-2 before:border-r-2 before:border-solid before:border-green-600" />
              Stop all alerts
            </li>
          </ul>
        </div>
        <div class="grid grid-cols-[49%_49%] gap-2">
          <Button
            variant="transparent"
            text="Cancel"
            onClick$={() => (isDeleteModalOpen.value = false)}
            customClass="w-full"
          />
          <Button
            variant="red"
            text="Yes, Let’s Do It!"
            customClass="w-full"
            onClick$={async () => {
              if (selectedWalletDetails.value && selectedWalletDetails.value.id) {
                const {
                  value: { success },
                } = await removeWalletAction.submit({
                  id: selectedWalletDetails.value.id,
                });
                selectedWalletDetails.value = null;
                isDeleteModalOpen.value = false;
                if (success) {
                  observedWallets.value = await getObservedWallets();
                }
              }
            }}
          />
        </div>
      </Modal>
    );
  },
);