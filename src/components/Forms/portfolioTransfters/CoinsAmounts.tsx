import { $, component$ } from "@builder.io/qwik";
// import { FormBadge } from "~/components/FormBadge/FormBadge";
import { FormBadge } from "~/components/FormBadge/FormBadge2";
import IconArrowDown from "@material-design-icons/svg/filled/expand_more.svg?jsx";
import IconSuccess from "@material-design-icons/svg/round/check_circle_outline.svg?jsx";
import { checkPattern, replaceNonMatching } from "~/utils/fractions";
import { type BatchTransferFormStore } from "~/routes/app/portfolio/interface";
import Input from "~/components/Atoms/Input/Input";

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
                  const isValid = () => {
                    return (
                      checkPattern(coin.amount, /^\d*\.?\d*$/) &&
                      coin.amount != "0" &&
                      coin.amount.length > 0 &&
                      coin.amount[0] != "0"
                    );
                  };
                  return (
                    <>
                      <FormBadge
                        key={`${coin}${index}`}
                        tokenName={coin.symbol}
                        tokenSymbol={`${coin.wallet}`}
                        tokenPath={`/assets/icons/tokens/${coin.symbol.toLowerCase()}.svg`}
                      >
                        <Input
                          name={`${coin.symbol}${coin.wallet}Amount`}
                          id={`${coin.symbol}${coin.wallet}Amount`}
                          placeholder="Approval limit..."
                          value={coin.amount}
                          inputClass="pr-10"
                          onInput={$((e) => {
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
                          })}
                          isValid={isValid() ? true : false}
                          iconRight={
                            isValid() ? <IconSuccess class="h-4 w-4" /> : null
                          }
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
