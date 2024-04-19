import { type Signal, component$ } from "@builder.io/qwik";
import { FormBadge } from "~/components/FormBadge/FormBadge";

import { type addWalletFormStore } from "~/routes/app/wallets";

export interface CoinsToApproveProps {
  addWalletFormStore: addWalletFormStore;
  walletTokenBalances: Signal<any>
}

export default component$<CoinsToApproveProps>(({ addWalletFormStore, walletTokenBalances }) => {
  const coins = walletTokenBalances.value.filter((tokenBalance: any) => tokenBalance.balance != 0);

  return (
    <>
      <div class="flex flex-col py-4">
        {coins.map((symbol: any) => (
          <FormBadge
            key={symbol.symbol}
            class="mb-2"
            image={`/assets/icons/tokens/${symbol.symbol.toLowerCase()}.svg`}
            description={symbol.symbol}
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

            //  />}
            input={
              <input
                id={symbol.symbol}
                type="checkbox"
                name={symbol.symbol}
                value={symbol.symbol}
                class="border-gradient custom-border-1 custom-bg-white checked checked:after:border-bg absolute end-2 z-10  h-6 w-6 appearance-none rounded checked:after:absolute checked:after:left-1/2 checked:after:top-1/2 checked:after:h-2.5 checked:after:w-1.5 checked:after:-translate-x-1/2 checked:after:-translate-y-1/2 checked:after:rotate-45 checked:after:border-solid hover:cursor-pointer focus:after:absolute focus:after:z-[1]"
                checked={addWalletFormStore.coinsToCount.includes(symbol.symbol)}
                onClick$={() => {
                  if (!addWalletFormStore.coinsToCount.includes(symbol.symbol)) {
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
            }
            for={symbol}
            customClass="border-gradient"
          />
        ))}
      </div>
    </>
  );
});
