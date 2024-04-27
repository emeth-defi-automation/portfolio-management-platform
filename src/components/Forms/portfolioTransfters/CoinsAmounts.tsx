import { component$ } from "@builder.io/qwik";
import { FormBadge } from "~/components/FormBadge/FormBadge";
import { type BatchTransferFormStore } from "~/routes/app/portfolio";
import IconArrowDown from "/public/assets/icons/arrow-down.svg?jsx";
import { chekckIfProperAmount, replaceNonMatching } from "~/utils/fractions";

export interface CoinsAmountsProps {
  batchTransferFormStore: BatchTransferFormStore;
  availableStructures: any;
}

export default component$<CoinsAmountsProps>(({ batchTransferFormStore }) => {
  return (
    <>
      {batchTransferFormStore.coinsToTransfer.map(
        (structure: any, index: number) => {
          const s = structure.coins.filter((c: any) => c.isChecked === true);
          if (!s.length) return null;
          return (
            <div
              class="scrollbar mb-4 flex max-h-[250px] flex-col overflow-auto"
              key={`${structure.name}${index}`}
            >
              <div class="flex gap-2">
                <IconArrowDown />
                <p class="text-sm">{structure.name}</p>
              </div>
              <div class="mr-2 flex flex-col py-2">
                {structure.coins.map((coin: any, index: number) => {
                  if (coin.isChecked === false) return null;
                  return (
                    <>
                      <FormBadge
                        key={`${coin}${index}`}
                        class="mb-2"
                        customClass="h-[56px]"
                        labelClass="start-4"
                        imgClass="end-5"
                        description={`${coin.wallet}`}
                        text={coin.symbol}
                        image={`/assets/icons/tokens/${coin.symbol.toLowerCase()}.svg`}
                        for={`${coin.symbol}${coin.wallet}Amount`}
                        hasImg={
                          chekckIfProperAmount(coin.amount, /^\d*\.?\d*$/) &&
                          coin.amount != "0" &&
                          coin.amount.length > 0 &&
                          coin.amount[0] != "0"
                            ? "/assets/icons/dashboard/success.svg?jsx"
                            : undefined
                        }
                        input={
                          <input
                            type="text"
                            name={`${coin.symbol}${coin.wallet}Amount`}
                            id={`${coin.symbol}${coin.wallet}Amount`}
                            class={`custom-border-1 absolute end-4 block h-8 w-1/2 rounded-lg bg-transparent p-3 text-sm  placeholder-white placeholder-opacity-50
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

                              const currentStructure =
                                batchTransferFormStore.coinsToTransfer.find(
                                  (item) => item.name === structure.name,
                                );
                              const currentCoin = currentStructure!.coins.find(
                                (item) =>
                                  item.wallet === coin.wallet &&
                                  item.symbol === coin.symbol,
                              );

                              currentCoin!.amount = target.value;
                            }}
                          />
                        }
                      />
                      <span class="block pb-1 text-xs text-white">
                        {coin.amount.length < 1 &&
                        coin.amount[0] != "0" &&
                        !chekckIfProperAmount(coin.amount, /^\d*\.?\d*$/) ? (
                          <span class="text-xs text-red-500">
                            Invalid amount. There should be only one dot.
                          </span>
                        ) : null}
                      </span>
                    </>
                  );
                })}
              </div>
            </div>
          );
        },
      )}
    </>
  );
});
