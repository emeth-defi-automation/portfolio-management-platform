import { type Signal, component$ } from "@builder.io/qwik";
import { FormBadge } from "~/components/FormBadge/FormBadge";
import { checkPattern, replaceNonMatching } from "~/utils/fractions";
import { type AddWalletFormStore } from "~/routes/app/wallets/interface";
import Button from "../Atoms/Buttons/Button";

export interface AmountOfCoinsProps {
  addWalletFormStore: AddWalletFormStore;
  walletTokenBalances: Signal<any>;
}

export default component$<AmountOfCoinsProps>(
  ({ addWalletFormStore, walletTokenBalances }) => {
    return (
      <>
        <div class="mb-8">
          <p class="custom-text-50 text-light mb-3 text-xs uppercase">
            Selected tokens
          </p>
          {addWalletFormStore.coinsToCount.map((symbol) => (
            <div class="flex max-h-[500px] flex-col overflow-auto" key={symbol}>
              <div class="flex items-center justify-between gap-2">
                <FormBadge
                  key={symbol}
                  image={`/assets/icons/tokens/${symbol.toLowerCase()}.svg`}
                  description={symbol}
                  class="w-[98%]"
                  hasImg={"/assets/icons/dashboard/success.svg?jsx"}
                >
                  {" "}
                  <input
                    type="text"
                    name={`${symbol}Amount`}
                    class={` absolute end-[56px] block h-9 w-1/2 rounded border border-[#24a148] bg-transparent p-3 text-sm text-[#24a148] placeholder-white placeholder-opacity-50`}
                    placeholder={`${symbol} approval limit`}
                    value={
                      addWalletFormStore.coinsToApprove.find(
                        (item) => item.symbol === symbol,
                      )!.amount
                    }
                    onInput$={(e) => {
                      const target = e.target as HTMLInputElement;
                      // const regex = /^[0-9]*(\.[0-9]*)?$/;
                      const regex = /^\d*\.?\d*$/;
                      target.value = replaceNonMatching(
                        target.value,
                        regex,
                        "",
                      );
                      addWalletFormStore.coinsToApprove.find(
                        (item) => item.symbol === symbol,
                      )!.amount = target.value;
                    }}
                  />
                </FormBadge>
                <Button
                  text="max"
                  variant="transparent"
                  onClick$={async () => {
                    const inputTokenValue =
                      addWalletFormStore.coinsToApprove.find(
                        (item) => item.symbol === symbol,
                      );
                    const chosenTokenBalance = walletTokenBalances.value.find(
                      (item: any) => item.symbol === symbol,
                    );
                    const decimals = chosenTokenBalance.decimals;
                    const calculation =
                      BigInt(chosenTokenBalance.balance) /
                      BigInt(10 ** decimals);
                    const denominator = chosenTokenBalance.balance
                      .toString()
                      .substring(
                        calculation.toString().length,
                        chosenTokenBalance.balance.toString().length - 1,
                      );

                    inputTokenValue!.amount = `${calculation}.${denominator}`;
                  }}
                />
              </div>
              <span class="block pb-1 text-xs text-white">
                {!checkPattern(
                  addWalletFormStore.coinsToApprove.find(
                    (item) => item.symbol === symbol,
                  )!.amount,
                  /^\d*\.?\d*$/,
                ) ? (
                  <span class="text-xs text-red-500">
                    Invalid amount. There should be only one dot.
                  </span>
                ) : null}
              </span>
            </div>
          ))}
        </div>
      </>
    );
  },
);
