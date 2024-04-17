import { component$ } from "@builder.io/qwik";
import { FormBadge } from "~/components/FormBadge/FormBadge";
import { type BatchTransferFormStore } from "~/routes/app/portfolio";
import { replaceNonMatching } from "~/routes/app/wallets";

export interface CoinsAmountsProps {
  batchTransferFormStore: BatchTransferFormStore;
  availableStructures: any;
}

export default component$<CoinsAmountsProps>(({ batchTransferFormStore }) => {
  return (
    <>
      {batchTransferFormStore.coinsToTransfer.map(
        (structure: any, index: number) => (
          <div class="flex flex-col" key={`${structure.name}${index}`}>
            <p>{structure.name}</p>
            <div class="custom-border-1 flex flex-col p-2">
              {structure.coins.map((coinObject: any, index: number) => (
                <div key={`${coinObject.name}${index}`}>
                  {coinObject.coins.map((coin: any) => (
                    <FormBadge
                      key={`${coin}${index}`}
                      class="mb-2"
                      description={`${coinObject.name}`}
                      text={coin.symbol}
                      image={`/assets/icons/tokens/${coin.symbol.toLowerCase()}.svg`}
                      // for={}
                      input={
                        <input
                          type="text"
                          name={`${coin.symbol}Amount`}
                          class={` absolute end-2 block h-9 w-1/2 rounded border border-[#24a148] bg-transparent p-3 text-sm text-[#24a148] placeholder-white placeholder-opacity-50`}
                          placeholder={`${coin.symbol} approval limit`}
                          value={coin.amount}
                          onInput$={(e) => {
                            const target = e.target as HTMLInputElement;
                            const regex = /^\d*\.?\d*$/;
                            target.value = replaceNonMatching(
                              target.value,
                              regex,
                              "",
                            );

                            const x =
                              batchTransferFormStore.coinsToTransfer.find(
                                (item) => item.name === structure.name,
                              );
                            const y = x!.coins.find(
                              (item) => item.wallet === coinObject.wallet,
                            );

                            y!.coins.find(
                              (c) => c.symbol === coin.symbol,
                            )!.amount = target.value;
                          }}
                        />
                      }
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        ),
      )}
    </>
  );
});
