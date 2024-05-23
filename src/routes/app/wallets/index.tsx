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
// import { checksumAddress } from "viem";
// import { emethContractAbi } from "~/abi/emethContractAbi";
// import IsExecutableSwitch from "~/components/Forms/isExecutableSwitch";
// import * as jwtDecode from "jwt-decode";
// import { StreamStoreContext } from "~/interface/streamStore/streamStore";
// import { WagmiConfigContext } from "~/components/WalletConnect/context";
// import { messagesContext } from "../layout";
import Box from "~/components/Atoms/Box/Box";
// import Header from "~/components/Atoms/Headers/Header";

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
import IconSearch from "@material-design-icons/svg/filled/search.svg?jsx"

export default component$(() => {
  const isAddWalletModalOpen = useSignal(false);
  const isDeleteModalOpen = useSignal(false);
  const transferredCoin = useStore({ symbol: "", address: "" });
  const isTransferModalOpen = useSignal(false);
  const selectedWallet = useSignal<WalletTokensBalances | null>(null);

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
        <Box customClass="grid grid-rows-[32px_88px_1fr] gap-6 h-full">
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

          <ObservedWalletsList
            observedWallets={observedWallets}
            selectedWallet={selectedWallet}
          />
        </Box>

        <div class="grid gap-6">
          {/* <PendingAuthorization/> */}
          <Box customClass="grid grid-rows-[72px_24px_1fr] gap-4 h-full">
            {selectedWallet.value && (
              <SelectedWalletDetails
                key={selectedWallet.value.wallet.address}
                selectedWallet={selectedWallet}
                chainIdToNetworkName={chainIdToNetworkName}
                isDeleteModalopen={isDeleteModalOpen}
                isTransferModalOpen={isTransferModalOpen}
                transferredCoin={transferredCoin}
              />
            )}
          </Box>
        </div>
      </div>

      {isAddWalletModalOpen.value && (
        <AddWalletModal isAddWalletModalOpen={isAddWalletModalOpen} />
      )}

      {isDeleteModalOpen.value && (
        <DeleteModal
          isDeleteModalOpen={isDeleteModalOpen}
          selectedWallet={selectedWallet}
        />
      )}
    </>
  );
});
