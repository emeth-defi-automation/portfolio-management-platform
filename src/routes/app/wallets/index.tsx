import {
  component$,
  createContextId,
  useContextProvider,
  useSignal,
  useStore,
  useVisibleTask$,
  type Signal,
} from "@builder.io/qwik";
import Button from "~/components/Atoms/Buttons/Button";
import { SelectedWalletDetails } from "~/components/Wallets/Details/SelectedWalletDetails";

import { ObservedWalletsList } from "~/components/ObservedWalletsList/ObservedWalletsList";
import { chainIdToNetworkName } from "~/utils/chains";
export { ObservedWalletsList } from "~/components/ObservedWalletsList/ObservedWalletsList";
export { useAddWallet, useRemoveWallet } from "./server";

import { AddWalletModal } from "./_components/wallets/AddWalletModal";
import { DeleteModal } from "./_components/wallets/DeleteModal";

import Input from "~/components/Atoms/Input/Input";
import Select from "~/components/Atoms/Select/Select";
import BoxHeader from "~/components/Molecules/BoxHeader/BoxHeader";
import { balancesLiveStream } from "./server/balancesLiveStream";
import { type Wallet } from "~/interface/auth/Wallet";

export const SelectedWalletDetailsContext = createContextId<Signal<any>>(
  "selected-wallet-details-context",
);
export const SelectedWalletNameContext = createContextId<Signal<string>>(
  "selected-wallet-name-context",
);

export default component$(() => {
  const selectedWalletDetails = useSignal<Wallet | undefined>(undefined);
  useContextProvider(SelectedWalletDetailsContext, selectedWalletDetails);
  const selectedWalletName = useSignal<string>("");
  useContextProvider(SelectedWalletNameContext, selectedWalletName);

  const isAddWalletModalOpen = useSignal(false);
  const isDeleteModalOpen = useSignal(false);
  const transferredCoin = useStore({ symbol: "", address: "" });
  const isTransferModalOpen = useSignal(false);


  return (
    <>
      <div class="grid grid-cols-[1fr_3fr] gap-6 p-6">
        <div class="custom-border-1 custom-bg-opacity-5 grid grid-rows-[32px_88px_1fr] gap-6 rounded-2xl p-6">
          <BoxHeader title="Wallets" variantHeader="h3">
            <Button
              onClick$={() => {
                isAddWalletModalOpen.value = !isAddWalletModalOpen.value;
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
          <ObservedWalletsList />
        </div>

        <div class="grid gap-6">
          {/* <PendingAuthorization/> */}
          <div class="custom-border-1 custom-bg-opacity-5 flex min-w-fit flex-col gap-4 rounded-2xl p-6">
            {selectedWalletDetails.value && (
              <SelectedWalletDetails
                key={selectedWalletDetails.value.id}
                chainIdToNetworkName={chainIdToNetworkName}
                isDeleteModalopen={isDeleteModalOpen}
                isTransferModalOpen={isTransferModalOpen}
                transferredCoin={transferredCoin}
              />
            )}
          </div>
        </div>
      </div>

      {isAddWalletModalOpen.value && (
        <AddWalletModal isAddWalletModalOpen={isAddWalletModalOpen} />
      )}

      {isDeleteModalOpen.value && (
        <DeleteModal isDeleteModalOpen={isDeleteModalOpen} />
      )}
    </>
  );
});
