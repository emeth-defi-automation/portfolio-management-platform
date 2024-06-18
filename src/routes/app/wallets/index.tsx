import {
  component$,
  createContextId,
  useContextProvider,
  useSignal,
  useStore,
  type Signal,
} from "@builder.io/qwik";
import Button from "~/components/Atoms/Buttons/Button";
import { SelectedWalletDetails } from "~/components/Wallets/Details/SelectedWalletDetails";

import Box from "~/components/Atoms/Box/Box";

import { ObservedWalletsList } from "~/components/ObservedWalletsList/ObservedWalletsList";
import { chainIdToNetworkName } from "~/utils/chains";
export { ObservedWalletsList } from "~/components/ObservedWalletsList/ObservedWalletsList";
export { useAddWallet, useRemoveWallet } from "./server";

import { AddWalletModal } from "./_components/wallets/AddWalletModal";
import { DeleteModal } from "./_components/wallets/DeleteModal";

import IconSearch from "@material-design-icons/svg/filled/search.svg?jsx";
import Input from "~/components/Atoms/Input/Input";
import Select from "~/components/Atoms/Select/Select";
import BoxHeader from "~/components/Molecules/BoxHeader/BoxHeader";
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
        <Box customClass="grid grid-rows-[32px_88px_1fr] gap-6 h-full min-w-max">
          <BoxHeader variantHeader="h3" title="Wallets" class="gap-2">
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
              id="searchWallet"
              variant="search"
              iconLeft={<IconSearch class="h-4 w-4" />}
              placeholder="Search for wallet"
              size="small"
            />
            <Select
              id="chooseNetwork"
              name="chooseNetwork"
              options={[{ value: "", text: "Choose Network" }]}
              size="medium"
            />
          </div>

          <ObservedWalletsList />
        </Box>

        {/* usunięty div grid gap-6? */}
        {/* <PendingAuthorization/> */}
        <Box customClass="grid grid-rows-[72px_24px_1fr] gap-4 h-full">
          {selectedWalletDetails.value && (
            <SelectedWalletDetails
              key={selectedWalletDetails.value.id}
              chainIdToNetworkName={chainIdToNetworkName}
              isDeleteModalopen={isDeleteModalOpen}
              isTransferModalOpen={isTransferModalOpen}
              transferredCoin={transferredCoin}
            />
          )}
        </Box>
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
