import { component$, useSignal } from "@builder.io/qwik";
import type { Signal } from "@builder.io/qwik";
import Button from "~/components/Atoms/Buttons/Button";
import { getObservedWallets } from "~/components/ObservedWalletsList/ObservedWalletsList";
import { type WalletTokensBalances } from "~/interface/walletsTokensBalances/walletsTokensBalances";
import { useRemoveWallet } from "~/routes/app/wallets/server";
import IconWarning from "@material-design-icons/svg/filled/warning_amber.svg?jsx";
import Dialog from "~/components/Organism/Dialog";
export { getObservedWallets } from "~/components/ObservedWalletsList/ObservedWalletsList";
export { useRemoveWallet } from "~/routes/app/wallets/server";

interface DeleteModalProps {
  // isDeleteModalOpen: Signal<boolean>;
  selectedWallet: Signal<WalletTokensBalances | null>;
  ref: Signal<HTMLDialogElement | undefined>;
}

export const DeleteModal = component$<DeleteModalProps>(
  ({ ref, selectedWallet }) => {
    const removeWalletAction = useRemoveWallet();
    const observedWallets = useSignal<WalletTokensBalances[]>([]);

    return (
      <>
        <Dialog ref={ref} customClass="gap-0 px-10 !w-fit">
          <div class="flex flex-col items-center gap-4">
            <IconWarning />
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
              onClick$={() => ref.value?.close()}
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
                  ref.value?.close();
                  selectedWallet.value = null;
                  if (success) {
                    observedWallets.value = await getObservedWallets();
                  }
                }
              }}
            />
          </div>
        </Dialog>
        {/* <Modal
        title=""
        hasButton={false}
        customClass="py-8 px-14 w-fit"
      >
        <div class="flex flex-col items-center gap-4">
          <IconWarning class="h-14 w-14 fill-customRed" />
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
      </Modal> */}
      </>
    );
  },
);
