import { type Signal, component$, $, useTask$ } from "@builder.io/qwik";
import { FormBadge } from "~/components/FormBadge/FormBadge";
import { type AddWalletFormStore } from "~/routes/app/wallets/interface";
import Label from "~/components/Atoms/Label/Label";
import CheckBox from "~/components/Atoms/Checkbox/Checkbox";

export interface CoinsToApproveProps {
  addWalletFormStore: AddWalletFormStore;
  walletTokenBalances: Signal<any>;
}

export default component$<CoinsToApproveProps>(
  ({ addWalletFormStore, walletTokenBalances }) => {
    useTask$(() => {
      addWalletFormStore.modalTitle = "Wallet Authorization";
    });
    const coins = walletTokenBalances.value.filter(
      (tokenBalance: any) => tokenBalance.balance != 0,
    );
    return (
      <>
        <div class="flex max-h-[450px] flex-col gap-2 overflow-auto pb-4">
          <Label name="Select tokens" />
          {coins.map((symbol: any) => (
            <FormBadge
              key={symbol.symbol}
              tokenSymbol={symbol.symbol}
              tokenPath={`/assets/icons/tokens/${symbol.symbol.toLowerCase()}.svg`}
            >
              <CheckBox
                name={symbol.symbol}
                value={symbol.symbol}
                isChecked={addWalletFormStore.coinsToCount.includes(
                  symbol.symbol,
                )}
                onClick={$(() => {
                  if (
                    !addWalletFormStore.coinsToCount.includes(symbol.symbol)
                  ) {
                    addWalletFormStore.coinsToCount = [
                      ...addWalletFormStore.coinsToCount,
                      symbol.symbol,
                    ];
                  } else {
                    const indexToRemove =
                      addWalletFormStore.coinsToCount.indexOf(symbol.symbol);

                    if (indexToRemove !== -1) {
                      addWalletFormStore.coinsToCount.splice(indexToRemove, 1);
                    }
                  }
                })}
              />
            </FormBadge>
          ))}
        </div>
      </>
    );
  },
);
