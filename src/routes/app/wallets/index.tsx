import {
  component$,
  useSignal,
  useStore,
  useVisibleTask$,
} from "@builder.io/qwik";
import Button from "~/components/Atoms/Buttons/Button";
import { SelectedWalletDetails } from "~/components/Wallets/Details/SelectedWalletDetails";
import { type WalletTokensBalances } from "~/interface/walletsTokensBalances/walletsTokensBalances";
import { chainIdToNetworkName } from "~/utils/chains";
import { ObservedWalletsList } from "~/components/ObservedWalletsList/ObservedWalletsList";
export {
  getObservedWallets,
  ObservedWalletsList,
} from "~/components/ObservedWalletsList/ObservedWalletsList";
export { useAddWallet, useGetBalanceHistory, useRemoveWallet } from "./server";

import { AddWalletModal } from "./_components/wallets/AddWalletModal";
import { DeleteModal } from "./_components/wallets/DeleteModal";
import { balancesLiveStream } from "./server/balancesLiveStream";
import BoxHeader from "~/components/Molecules/BoxHeader/BoxHeader";
import Input from "~/components/Atoms/Input/Input";
import Select from "~/components/Atoms/Select/Select";

export default component$(() => {
  // const isAddWalletModalOpen = useSignal(false);
  // const isDeleteModalOpen = useSignal(false);
  const transferredCoin = useStore({ symbol: "", address: "" });
  const isTransferModalOpen = useSignal(false);
  const selectedWallet = useSignal<WalletTokensBalances | null>(null);
  const AddWalletRef = useSignal<HTMLDialogElement | undefined>();
  const DeleteWalletRef = useSignal<HTMLDialogElement | undefined>();

  const observedWallets = useSignal<WalletTokensBalances[]>([]);

  const msg = useSignal("1");

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    const data = await balancesLiveStream();
    for await (const value of data) {
      msg.value = value;
    }
  });

  return (
    <>
      <div class="grid grid-cols-[1fr_3fr] gap-6 p-6">
        <div class="custom-border-1 custom-bg-opacity-5 grid grid-rows-[32px_88px_1fr] gap-6 rounded-2xl p-6">
          <BoxHeader title="Wallets" variantHeader="h3">
            <Button
              onClick$={() => {
                // isAddWalletModalOpen.value = !isAddWalletModalOpen.value;
                AddWalletRef.value?.showModal();
              }}
              text="Add New Wallet"
              variant="transparent"
              size="small"
            />
          </BoxHeader>
          <div class="grid w-full gap-2">
            <Input
              variant="search"
              placeholder="Search for Wallet"
              customClass="text-xs custom-text-50"
            />
            <Select
              size="medium"
              options={[
                {
                  text: "Choose network",
                  value: "",
                },
              ]}
            />
          </div>

          <ObservedWalletsList
            observedWallets={observedWallets}
            selectedWallet={selectedWallet}
          />
        </div>

        <div class="grid gap-6">
          {/* <PendingAuthorization/> */}
          <div class="custom-border-1 custom-bg-opacity-5 flex min-w-fit flex-col gap-4 rounded-2xl p-6">
            {selectedWallet.value && (
              <SelectedWalletDetails
                key={selectedWallet.value.wallet.address}
                selectedWallet={selectedWallet}
                chainIdToNetworkName={chainIdToNetworkName}
                DeleteWalletRef={DeleteWalletRef}
                isTransferModalOpen={isTransferModalOpen}
                transferredCoin={transferredCoin}
              />
            )}
          </div>
        </div>
      </div>

      <AddWalletModal ref={AddWalletRef} />

      <DeleteModal ref={DeleteWalletRef} selectedWallet={selectedWallet} />
    </>
  );
});
