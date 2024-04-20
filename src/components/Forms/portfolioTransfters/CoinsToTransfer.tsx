import { component$ } from "@builder.io/qwik";
import { FormBadge } from "~/components/FormBadge/FormBadge";
import { type BatchTransferFormStore } from "~/routes/app/portfolio";

export interface CoinsToTransferProps {
  batchTransferFormStore: BatchTransferFormStore;
  availableStructures: any;
}

export default component$<CoinsToTransferProps>(
  ({ batchTransferFormStore, availableStructures }) => {
    return (
      <>
        {availableStructures.value.map((structure: any, index: number) => {
          return (
            <div class="flex flex-col" key={`${structure.name}${index}`}>
              <p>{structure.structure.name}</p>
              <div class="custom-border-1 flex flex-col p-2">
                {structure.structureBalance.map(
                  (balance: any, index: number) =>
                    balance.wallet.isExecutable ? (
                      <FormBadge
                        key={index}
                        text={balance.balance.symbol}
                        class="mb-2"
                        description={balance.wallet.name}
                        image={`/assets/icons/tokens/${balance.balance.symbol.toLowerCase()}.svg`}
                        for={`${structure.structure.name}${balance.balance.symbol}`}
                        input={
                          <input
                            id={`${structure.structure.name}${balance.balance.symbol}`}
                            name={`${structure.structure.name}${balance.balance.symbol}`}
                            type="checkbox"
                            value={`${structure.structure.name}${balance.balance.symbol}`}
                            class="border-gradient custom-border-1 custom-bg-white checked checked:after:border-bg absolute end-2 z-10  h-6 w-6 appearance-none rounded checked:after:absolute checked:after:left-1/2 checked:after:top-1/2 checked:after:h-2.5 checked:after:w-1.5 checked:after:-translate-x-1/2 checked:after:-translate-y-1/2 checked:after:rotate-45 checked:after:border-solid hover:cursor-pointer focus:after:absolute focus:after:z-[1]"
                            onClick$={() => {
                              const x =
                                batchTransferFormStore.coinsToTransfer.find(
                                  (item) =>
                                    item.name === structure.structure.name,
                                );
                              if (x) {
                                const y = x.coins.find(
                                  (item) => item.wallet === balance.wallet.name,
                                );
                                if (y) {
                                  if (
                                    !y.coins.find(
                                      (coin) =>
                                        coin.symbol === balance.balance.symbol,
                                    )
                                  ) {
                                    y.coins.push({
                                      symbol: balance.balance.symbol,
                                      amount: "0",
                                    });
                                  } else {
                                    const element = y.coins.find(
                                      (coin) =>
                                        coin.symbol === balance.balance.symbol,
                                    )!;
                                    const indexToRemove =
                                      y.coins.indexOf(element);
                                    y.coins.splice(indexToRemove, 1);
                                  }
                                }
                              }
                            }}
                          />
                        }
                      />
                    ) : null,
                )}
              </div>
            </div>
          );
        })}
      </>
    );
  },
);
