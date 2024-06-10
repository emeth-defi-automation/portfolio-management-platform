import { type Signal, component$ } from "@builder.io/qwik";
import { type WalletTokensBalances } from "~/interface/walletsTokensBalances/walletsTokensBalances";
import IconEthereum from "/public/assets/icons/ethereum.svg?jsx";
import IconClock from "/public/assets/icons/wallets/clock.svg?jsx";
import ParagraphAnnotation from "~/components/Molecules/ParagraphAnnotation/ParagraphAnnotation";

interface ObservedWalletProps {
  observedWallet: WalletTokensBalances;
  selectedWallet: Signal<WalletTokensBalances | null>;
  chainIdToNetworkName: { [key: string]: string };
}

export const ObservedWallet = component$<ObservedWalletProps>(
  ({ observedWallet, selectedWallet, chainIdToNetworkName }) => {
    return (
      <ParagraphAnnotation
        paragraphText={observedWallet.wallet.name}
        annotationText={chainIdToNetworkName[observedWallet.wallet.chainId]}
        onClick$={() => {
          selectedWallet.value = observedWallet;
        }}
        hasIconBox={true}
        iconBoxSize="small"
        iconBoxCustomIcon={<IconEthereum class="h-full w-full" />}
        customClass="py-4"
      >
        <IconClock />
      </ParagraphAnnotation>
    );
  },
);
