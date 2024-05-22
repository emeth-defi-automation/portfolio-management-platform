import { type Signal, component$ } from "@builder.io/qwik";
import { FormBadge } from "~/components/FormBadge/FormBadge";
import { type AddWalletFormStore } from "~/routes/app/wallets/interface";
import Label from "../Atoms/Label/Label";

export interface CoinsToApproveProps {
  addWalletFormStore: AddWalletFormStore;
  walletTokenBalances: Signal<any>;
}

export default component$<CoinsToApproveProps>(
  ({ addWalletFormStore, walletTokenBalances }) => {
    const coins = walletTokenBalances.value.filter(
      (tokenBalance: any) => tokenBalance.balance != 0,
    );
    return (
      <>
        <div class="flex max-h-[450px] flex-col overflow-auto pb-4">
          <div class="mb-3 flex items-center justify-between">
            {/* might not work correctly */}
            <Label name="Select tokens" />
            {/* <div class="relative">
              <label class="custom-text-50 text-light flex h-6 items-center gap-3 text-xs uppercase">
                <input
                  type="checkbox"
                  class="border-gradient custom-border-1 custom-bg-white checked:after:border-bg z-10 h-6 w-6 appearance-none rounded checked:after:absolute  checked:after:ms-2 checked:after:mt-1 checked:after:h-2.5 checked:after:w-1.5 checked:after:rotate-45 checked:after:border-solid hover:cursor-pointer focus:after:absolute focus:after:z-[1]"
                />
                <span class="custom-text-50 text-xs uppercase">select all</span>
              </label>
            </div> */}
          </div>
          {coins.map((symbol: any) => (
            <FormBadge
              key={symbol.symbol}
              class="mb-2"
              image={`/assets/icons/tokens/${symbol.symbol.toLowerCase()}.svg`}
              description={symbol.symbol}
              for={symbol.symbol}
              //  TODO: Why the checkbox component returns "insertBefore" error while it is the same thing.
              //  input={<CheckBox
              //   name={symbol}
              //   value={symbol}
              //   checked={addWalletFormStore.coinsToCount.includes(symbol)}
              //   onClick={$(() => {
              //     console.log("coins: ", addWalletFormStore.coinsToCount);
              //     if (!addWalletFormStore.coinsToCount.includes(symbol)) {
              //       addWalletFormStore.coinsToCount = [...addWalletFormStore.coinsToCount, symbol];
              //       console.log('tu jest ifu')
              //     } else {
              //       console.log('tu jest elsu')
              //       const indexToRemove =
              //         addWalletFormStore.coinsToCount.indexOf(symbol);

              //       if (indexToRemove !== -1) {
              //         addWalletFormStore.coinsToCount.splice(indexToRemove, 1);
              //       }
              //     }
              //   })}

              //  />
              customClass="border-gradient"
            >
              <input
                id={symbol.symbol}
                type="checkbox"
                name={symbol.symbol}
                value={symbol.symbol}
                class="border-gradient custom-border-1 custom-bg-white checked checked:after:border-bg absolute end-2 z-10 h-6 w-6 appearance-none rounded checked:after:absolute checked:after:left-1/2 checked:after:top-2.5 checked:after:h-2.5 checked:after:w-1.5 checked:after:-translate-x-1/2 checked:after:-translate-y-1/2 checked:after:rotate-45 checked:after:border-solid hover:cursor-pointer focus:after:absolute focus:after:z-[1]"
                checked={addWalletFormStore.coinsToCount.includes(
                  symbol.symbol,
                )}
                onClick$={() => {
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
                }}
              />
            </FormBadge>
          ))}
        </div>
      </>
    );
  },
);
