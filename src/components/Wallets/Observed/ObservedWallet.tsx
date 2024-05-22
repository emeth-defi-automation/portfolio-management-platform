import { type Signal, component$ } from "@builder.io/qwik";
import { type WalletTokensBalances } from "~/interface/walletsTokensBalances/walletsTokensBalances";
import IconEthereum from "/public/assets/icons/ethereum.svg?jsx";
import IconClock from "@material-design-icons/svg/outlined/schedule.svg?jsx";
import Paragraph from "~/components/Atoms/Paragraphs/Paragraphs";

interface ObservedWalletProps {
  observedWallet: WalletTokensBalances;
  selectedWallet: Signal<WalletTokensBalances | null>;
  chainIdToNetworkName: { [key: string]: string };
}

export const ObservedWallet = component$<ObservedWalletProps>(
  ({ observedWallet, selectedWallet, chainIdToNetworkName }) => {
    return (
      <div
        class="flex h-14 cursor-pointer items-center justify-between rounded-lg"
        onClick$={() => {
          selectedWallet.value = observedWallet;
        }}
      >
        <div class="flex items-center gap-3">
          <div class="custom-border-1 flex h-6 w-6 items-center justify-center rounded bg-white bg-opacity-5">
            <IconEthereum />
          </div>
          <div class="flex flex-col gap-1">
            <Paragraph text={observedWallet.wallet.name} />
            <Paragraph
              text={chainIdToNetworkName[observedWallet.wallet.chainId]}
              variant="secondaryText"
              size="xs"
            />
          </div>
        </div>
        <IconClock class="h-4 w-4 fill-customWarning" />
      </div>
    );
  },
);
