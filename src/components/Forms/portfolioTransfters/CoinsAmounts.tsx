import { component$ } from "@builder.io/qwik";
import { FormBadge } from "~/components/FormBadge/FormBadge";
import { type BatchTransferFormStore } from "~/routes/app/portfolio";
import { chekckIfProperAmount, replaceNonMatching } from "~/routes/app/wallets";

export interface CoinsAmountsProps {
  batchTransferFormStore: BatchTransferFormStore;
  availableStructures: any;
}

export default component$<CoinsAmountsProps>(({ batchTransferFormStore }) => {
  return (
    <>
      {batchTransferFormStore.coinsToTransfer.map(
        (structure: any, index: number) => {
          const s = structure.coins.filter((c: any) => c.coins.length > 0);
          if (!s.length) return null;
          return (
            <div class="flex flex-col" key={`${structure.name}${index}`}>
              <p>{structure.name}</p>
              <div class="custom-border-1 flex flex-col p-2">
                {structure.coins.map((coinObject: any, index: number) => (
                  <div key={`${coinObject.wallet}${index}`}>
                    {coinObject.coins.map((coin: any) => {
                      return (
                        <>
                          <FormBadge
                            key={`${coin}${index}`}
                            class="mb-2"
                            description={`${coinObject.wallet}`}
                            text={coin.symbol}
                            image={`/assets/icons/tokens/${coin.symbol.toLowerCase()}.svg`}
                            // for={}
                            hasImg={
                              chekckIfProperAmount(
                                coin.amount,
                                /^\d*\.?\d*$/,
                              ) &&
                              coin.amount != "0" &&
                              coin.amount.length > 0 &&
                              coin.amount[0] != "0"
                                ? "/assets/icons/dashboard/success.svg?jsx"
                                : undefined
                            }
                            input={
                              <input
                                type="text"
                                name={`${coin.symbol}Amount`}
                                class={`absolute end-2 block h-9 w-1/2 rounded border  bg-transparent p-3 text-sm  placeholder-white placeholder-opacity-50 
                          ${chekckIfProperAmount(coin.amount, /^\d*\.?\d*$/) && coin.amount != "0" && coin.amount.length > 0 && coin.amount[0] != "0" ? "border-[#24a148] text-[#24a148] focus:border-[#24a148]" : ""}`}
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
                          <span class="block pb-1 text-xs text-white">
                            {coin.amount.length < 1 &&
                            coin.amount[0] != "0" &&
                            !chekckIfProperAmount(
                              coin.amount,
                              /^\d*\.?\d*$/,
                            ) ? (
                              <span class="text-xs text-red-500">
                                Invalid amount. There should be only one dot.
                              </span>
                            ) : null}
                          </span>
                        </>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          );
        },
      )}
    </>
  );
});
