import {
  $,
  component$,
  useContext,
  useSignal,
  useStore,
  useVisibleTask$,
} from "@builder.io/qwik";
import { type JwtPayload } from "jsonwebtoken";
import { contractABI } from "~/abi/abi";
import { chainIdToNetworkName } from "~/utils/chains";
import { Modal } from "~/components/Modal/Modal";
import { SelectedWalletDetails } from "~/components/Wallets/Details/SelectedWalletDetails";
import { type WalletTokensBalances } from "~/interface/walletsTokensBalances/walletsTokensBalances";
import { checksumAddress } from "viem";
import { emethContractAbi } from "~/abi/emethContractAbi";
import IsExecutableSwitch from "~/components/Forms/isExecutableSwitch";
import * as jwtDecode from "jwt-decode";
import { StreamStoreContext } from "~/interface/streamStore/streamStore";
import { WagmiConfigContext } from "~/components/WalletConnect/context";
import Button from "~/components/Atoms/Buttons/Button";

import {
  type Config,
  getAccount,
  readContract,
  simulateContract,
  writeContract,
  getConnections,
  watchAccount,
} from "@wagmi/core";


import { ButtonWithIcon } from "~/components/Buttons/Buttons";
import {
  getObservedWallets,
  ObservedWalletsList,
} from "~/components/ObservedWalletsList/ObservedWalletsList";
export {
  getObservedWallets,
  ObservedWalletsList,
} from "~/components/ObservedWalletsList/ObservedWalletsList";

import { convertToFraction } from "~/utils/fractions";
import {
  isExecutableDisabled,
  isNotExecutableDisabled,
  isProceedDisabled,
} from "~/utils/validators/addWallet";
import { useAddWallet, useGetBalanceHistory, useRemoveWallet } from "./server";
export { useAddWallet, useGetBalanceHistory, useRemoveWallet } from "./server";
import { type AddWalletFormStore } from "./interface";
import { fetchTokens } from "~/database/tokens";
import { addAddressToStreamConfig, getMoralisBalance } from "~/server/moralis";
import { balancesLiveStream } from "./server/balancesLiveStream";
import { disconnectWallets, openWeb3Modal } from "~/utils/walletConnections";
import { getAccessToken } from "~/utils/refresh";
import { DeleteModal } from "./_components/wallets/DeleteModal";
import { AddWalletModal } from "./_components/wallets/AddWalletModal";

export default component$(() => {
  const wagmiConfig = useContext(WagmiConfigContext);
  const { streamId } = useContext(StreamStoreContext);
  const isAddWalletModalOpen = useSignal(false);
  const isDeleteModalOpen = useSignal(false);
  const transferredCoin = useStore({ symbol: "", address: "" });
  const isTransferModalOpen = useSignal(false);
  const selectedWallet = useSignal<WalletTokensBalances | null>(null);
  const isSecondWalletConnected = useSignal(false);
  const stepsCounter = useSignal(1);

  const observedWallets = useSignal<WalletTokensBalances[]>([]);

  const msg = useSignal("1");

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    const data = await balancesLiveStream();
    for await (const value of data) {
      msg.value = value;
    }
  });
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async ({ track }) => {
    track(() => wagmiConfig.config);
    watchAccount(wagmiConfig.config!, {
      onChange() {
        const connections = getConnections(wagmiConfig.config as Config);
        if (connections.length > 1) {
          isSecondWalletConnected.value = true;
        } else {
          isSecondWalletConnected.value = false;
        }
      },
    });
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async ({ track }) => {
    track(() => wagmiConfig.config);
    watchAccount(wagmiConfig.config!, {
      onChange() {
        const connections = getConnections(wagmiConfig.config as Config);
        if (connections.length > 1) {
          isSecondWalletConnected.value = true;
        } else {
          isSecondWalletConnected.value = false;
        }
      },
    });
  });


  const connectWallet = $(async () => {
    await openWeb3Modal(wagmiConfig!.config);
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
          <ObservedWalletsList
            observedWallets={observedWallets}
            selectedWallet={selectedWallet}
          />
        </div>

        <div class="grid gap-6">
          {/* <PendingAuthorization/> */}
          <div class="custom-border-1 custom-bg-opacity-5 grid grid-rows-[64px_24px_1fr] gap-4 rounded-2xl p-6">
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
          </div>
        </div>
      </div>

      {isAddWalletModalOpen.value && (
        <AddWalletModal
          isAddWalletModalOpen={isAddWalletModalOpen}
          stepsCounter={stepsCounter}
          isSecondWalletConnected={isSecondWalletConnected}
        />
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
