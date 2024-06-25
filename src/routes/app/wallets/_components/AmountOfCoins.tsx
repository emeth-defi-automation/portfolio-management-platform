import { type Signal, component$, $, useTask$ } from "@builder.io/qwik";
import { FormBadge } from "~/components/FormBadge/FormBadge";
import { checkPattern, replaceNonMatching } from "~/utils/fractions";
import { type AddWalletFormStore } from "~/routes/app/wallets/interface";
import Button from "~/components/Atoms/Buttons/Button";
import Label from "~/components/Atoms/Label/Label";
import Input from "~/components/Atoms/Input/Input";
import IconSuccess from "@material-design-icons/svg/round/check_circle_outline.svg?jsx";

export interface AmountOfCoinsProps {
  addWalletFormStore: AddWalletFormStore;
  walletTokenBalances: Signal<any>;
}

export default component$<AmountOfCoinsProps>(
  ({ addWalletFormStore, walletTokenBalances }) => {
    useTask$(() => {
      addWalletFormStore.modalTitle = "Set Approval Limit";
    });
    return (
      <>
        <div class="flex flex-col gap-2 pb-3">
          <Label name="Selected tokens" />
          {addWalletFormStore.coinsToCount.map((symbol) => {
            const coin = addWalletFormStore.coinsToApprove.find(
              (item) => item.symbol === symbol,
            );

            const isValid = () => {
              return (
                checkPattern(coin!.amount, /^\d*\.?\d*$/) &&
                coin!.amount != "0" &&
                coin!.amount.length > 0 &&
                coin!.amount[0] != "0"
              );
            };
            return (
              <div
                class="flex max-h-[500px] flex-col overflow-auto"
                key={symbol}
              >
                <div class="flex items-center justify-between gap-2">
                  <FormBadge
                    key={symbol}
                    tokenName=""
                    tokenSymbol={symbol}
                    tokenPath={`/assets/icons/tokens/${symbol.toLowerCase()}.svg`}
                  >
                    <Input
                      name={`${symbol}Amount`}
                      id={`${symbol}Amount`}
                      placeholder="Approval limit..."
                      value={
                        coin!.amount === "0"
                          ? "Approval limit..."
                          : coin!.amount
                      }
                      onInput={$((e) => {
                        const target = e.target as HTMLInputElement;
                        const regex = /^\d*\.?\d*$/;
                        target.value = replaceNonMatching(
                          target.value,
                          regex,
                          "",
                        );
                        coin!.amount = target.value;
                      })}
                      InputClass="pr-10"
                      isValid={isValid()}
                      iconRight={
                        isValid() ? <IconSuccess class="h-4 w-4" /> : null
                      }
                    />
                  </FormBadge>
                  <Button
                    text="max"
                    variant="blue"
                    size="small"
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
            );
          })}
        </div>
      </>
    );
  },
);
