import { type Signal, component$, useContext, useSignal } from "@builder.io/qwik";
import { type WalletTokensBalances } from "~/interface/walletsTokensBalances/walletsTokensBalances";
import IconEthereum from "/public/assets/icons/ethereum.svg?jsx";
import IconClock from "/public/assets/icons/wallets/clock.svg?jsx";
import {
  SelectedWalletDetailsContext,
  SelectedWalletNameContext,
} from "~/routes/app/wallets";

interface ObservedWalletProps {
  observedWallet: any;
  chainIdToNetworkName: { [key: string]: string };
}

export const ObservedWallet = component$<ObservedWalletProps>(
  ({ observedWallet, chainIdToNetworkName }) => {

    const selectedWalletDetails = useContext(SelectedWalletDetailsContext);
    const observedWalletNameContext = useContext(SelectedWalletNameContext);
    // const observedWalletNameSignal = useSignal("Loading name...");

    return (
      <div
        class="flex h-14 cursor-pointer items-center justify-between rounded-lg"
        onClick$={() => {
          selectedWalletDetails.value = observedWallet;
          observedWalletNameContext.value = "example name"
        }}
      >
        <div class="flex items-center gap-3">
          <div class="custom-border-1 flex h-6 w-6 items-center justify-center rounded bg-white bg-opacity-5">
            <IconEthereum />
          </div>
          <div class="">
            <div class="text-sm">{observedWallet.id}</div>
            <div class="custom-text-50 text-xs">
              {chainIdToNetworkName[observedWallet.chainId]}
            </div>
          </div>
        </div>
        <IconClock />
      </div>
    );
  },
);
