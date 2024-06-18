import { component$, useSignal } from "@builder.io/qwik";
import type { Signal } from "@builder.io/qwik";
import Button from "~/components/Atoms/Buttons/Button";
import { Modal } from "~/components/Modal/Modal";
import { getObservedWallets } from "~/components/ObservedWalletsList/ObservedWalletsList";
import { type WalletTokensBalances } from "~/interface/walletsTokensBalances/walletsTokensBalances";
import { useRemoveWallet } from "~/routes/app/wallets/server";
import IconWarning from "@material-design-icons/svg/filled/warning_amber.svg?jsx";
import Header from "~/components/Atoms/Headers/Header";
export { getObservedWallets } from "~/components/ObservedWalletsList/ObservedWalletsList";
export { useRemoveWallet } from "~/routes/app/wallets/server";

interface DeleteModalProps {
  isDeleteModalOpen: Signal<boolean>;
  selectedWallet: Signal<WalletTokensBalances | null>;
}

export const DeleteModal = component$<DeleteModalProps>(
  ({ isDeleteModalOpen, selectedWallet }) => {
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
          <IconWarning class="h-14 w-14 fill-customRed" />
          <Header
            variant="h3"
            text="You are going to permanently delete your wallet!"
            class="text-center"
          />
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
              if (selectedWallet.value && selectedWallet.value.wallet.id) {
                const {
                  value: { success },
                } = await removeWalletAction.submit({
                  id: selectedWallet.value.wallet.id,
                });
                selectedWallet.value = null;
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
