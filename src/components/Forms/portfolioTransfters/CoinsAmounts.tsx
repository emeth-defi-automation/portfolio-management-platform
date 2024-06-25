import { component$ } from "@builder.io/qwik";
import { FormBadge } from "~/components/FormBadge/FormBadge";
import IconArrowDown from "@material-design-icons/svg/filled/expand_more.svg?jsx";
import { checkPattern, replaceNonMatching } from "~/utils/fractions";
import { type BatchTransferFormStore } from "~/routes/app/portfolio/interface";

export interface CoinsAmountsProps {
  batchTransferFormStore: BatchTransferFormStore;
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
                <IconArrowDown class="h-4 w-4 fill-white" />

                <p class="text-sm">{structure.name}</p>
              </div>
              <div class="mr-2 flex flex-col gap-2 py-2">
                {structure.coins.map((coin: any, index: number) => {
                  if (coin.isChecked === false) return null;
                  return (
                    <>
                      <FormBadge
                        key={`${coin}${index}`}
                        class=""
                        customClass="h-[56px]"
                        labelClass="start-4"
                        imgClass="end-5"
                        description={`${coin.wallet}`}
                        text={coin.symbol}
                        image={`/assets/icons/tokens/${coin.symbol.toLowerCase()}.svg`}
                        for={`${coin.symbol}${coin.wallet}Amount`}
                        hasImg={
                          checkPattern(coin.amount, /^\d*\.?\d*$/) &&
                          coin.amount != "0" &&
                          coin.amount.length > 0 &&
                          coin.amount[0] != "0"
                            ? "/assets/icons/dashboard/success.svg?jsx"
                            : undefined
                        }
                      >
                        <input
                          type="text"
                          name={`${coin.symbol}${coin.wallet}Amount`}
                          id={`${coin.symbol}${coin.wallet}Amount`}
                          class={`custom-border-1 absolute end-4 block h-8 w-1/2 rounded-lg bg-transparent p-3 text-sm  placeholder-white placeholder-opacity-50
                        ${checkPattern(coin.amount, /^\d*\.?\d*$/) && coin.amount != "0" && coin.amount.length > 0 && coin.amount[0] != "0" ? "border-[#24a148] text-[#24a148] focus:border-[#24a148]" : ""}`}
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
                      </FormBadge>
                      <span class="block pb-1 text-xs text-white">
                        {coin.amount.length < 1 &&
                        coin.amount[0] != "0" &&
                        !checkPattern(coin.amount, /^\d*\.?\d*$/) ? (
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
