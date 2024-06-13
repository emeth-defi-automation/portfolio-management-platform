import {
  component$,
  useSignal,
  useStore,
  useVisibleTask$,
  createContextId,
  useContextProvider,
  type Signal
} from "@builder.io/qwik";
import Button from "~/components/Atoms/Buttons/Button";
import { SelectedWalletDetails } from "~/components/Wallets/Details/SelectedWalletDetails";
import { type WalletTokensBalances } from "~/interface/walletsTokensBalances/walletsTokensBalances";
import { chainIdToNetworkName } from "~/utils/chains";

import { ButtonWithIcon } from "~/components/Buttons/Buttons";
import { ObservedWalletsList } from "~/components/ObservedWalletsList/ObservedWalletsList";
export {
  getObservedWallets,
  ObservedWalletsList,
} from "~/components/ObservedWalletsList/ObservedWalletsList";
export { useAddWallet, useGetBalanceHistory, useRemoveWallet } from "./server";

import { AddWalletModal } from "./_components/wallets/AddWalletModal";
import { DeleteModal } from "./_components/wallets/DeleteModal";
import { balancesLiveStream } from "./server/balancesLiveStream";

export const SelectedWalletDetailsContext = createContextId<Signal<any>>(
  "selected-wallet-details-context",
);
export const SelectedWalletNameContext = createContextId<Signal<string>>(
  "selected-wallet-name-context",
);


export default component$(() => {

  const selectedWalletDetails = useSignal<any | undefined>(undefined)
  useContextProvider(SelectedWalletDetailsContext, selectedWalletDetails);
  const selectedWalletName = useSignal<string>("");
  useContextProvider(SelectedWalletNameContext, selectedWalletName);

  const isAddWalletModalOpen = useSignal(false);
  const isDeleteModalOpen = useSignal(false);
  const transferredCoin = useStore({ symbol: "", address: "" });
  const isTransferModalOpen = useSignal(false);
  const selectedWallet = useSignal<any>(null);


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
          <div class="flex items-center justify-between gap-2">
            <h1 class="text-xl font-semibold">Wallets</h1>
            <Button
              onClick$={() => {
                isAddWalletModalOpen.value = !isAddWalletModalOpen.value;
              }}
              text="Add New Wallet"
              variant="transparent"
              size="small"
            />
          </div>

          <div class="grid w-full gap-2">
            <ButtonWithIcon
              image="/assets/icons/search.svg"
              text="Search for wallet"
              class="custom-text-50 custom-border-1 h-10 justify-start gap-2 rounded-lg px-3"
            />
            <ButtonWithIcon
              image="/assets/icons/arrow-down.svg"
              text="Choose Network"
              class="custom-border-1 h-10 flex-row-reverse justify-between gap-2 rounded-lg px-3"
            />
          </div>
          <ObservedWalletsList />
        </div>

        <div class="grid gap-6">
          {/* <PendingAuthorization/> */}
          <div class="custom-border-1 custom-bg-opacity-5 grid grid-rows-[64px_24px_1fr] gap-4 rounded-2xl p-6">
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
        <DeleteModal
          isDeleteModalOpen={isDeleteModalOpen}
        />
      )}
    </>
  );
});