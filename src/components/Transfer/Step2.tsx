import { $, component$ } from "@builder.io/qwik";
import Box from "../Atoms/Box/Box";
import Header from "../Atoms/Headers/Header";
import Button from "../Atoms/Buttons/Button";
import Paragraph from "../Atoms/Paragraphs/Paragraphs";
import Input from "../Atoms/Input/Input";
import IconArrowDown from "@material-design-icons/svg/filled/expand_more.svg?jsx";
import IconBTC from "/public/assets/icons/tokens/btc.svg?jsx";
import Annotation from "../Atoms/Annotation/Annotation";
import Select from "../Atoms/Select/Select";
import { BatchTransferFormStore } from "~/routes/app/portfolio/interface";
import { replaceNonMatching } from "~/utils/fractions";
import { convertWeiToQuantity } from "~/utils/formatBalances/formatTokenBalance";

interface Step2Props {
  batchTransferFormStore: BatchTransferFormStore;
  availableStructures: any;
}

export const Step2 = component$<Step2Props>(
  ({ batchTransferFormStore, availableStructures }) => {
    return (
      <Box
        variant="box"
        customClass="flex flex-col gap-6 !shadow-none !overflow-x-hidden h-[550px]"
      >
        <Header text="Value" variant="h4" />
        <div class="flex flex-col gap-6">
          {/* plakietka struktury */}
          {batchTransferFormStore.coinsToTransfer.map(
            (structure: any, index: number) => {
              const s = structure.coins.filter(
                (c: any) => c.isChecked === true,
              );
              if (!s.length) return null;
              return (
                <div class="flex flex-col gap-5">
                  <div class="flex items-center justify-between gap-2 rounded-lg bg-white/3 px-4 py-1">
                    <Paragraph text={structure.name} />
                    <div class="flex items-center gap-2">
                      <Annotation text="Portfolio Transfer Amount" />
                      <Annotation
                        text="$201,179.85"
                        class="rounded-lg bg-black/10 p-2 !text-white"
                      />
                      <Button
                        variant="onlyIcon"
                        customClass="rotate-180"
                        leftIcon={<IconArrowDown class="fill-white" />}
                      />
                    </div>
                  </div>
                  {/*  */}
                  <div class="flex flex-col gap-4">
                    {/* kolumny tabeli */}
                    <div class="grid grid-cols-[repeat(3,minmax(0,1fr))_1fr_2fr]">
                      <Annotation text="Token" />
                      <Annotation text="Current Value" />
                      <Annotation text="Wallet" />
                      <Annotation text="Unit" />
                      <Annotation text="Amount" />
                    </div>
                    {/* Coin w strukturze */}
                    {structure.coins.map((coin: any, index: number) => {
                      console.log("coin: ", coin);
                      if (coin.isChecked === false) return null;
                      return (
                        <div class="flex flex-col gap-4">
                          <div class="grid grid-cols-[repeat(3,minmax(0,1fr))_1fr_2fr] items-center rounded-lg">
                            <div class="flex items-center gap-4">
                              <div class="flex items-center justify-center rounded-lg bg-white/3 p-2">
                                <img
                                  src={`/assets/icons/tokens/${coin.symbol.toLowerCase()}.svg`}
                                  width="24"
                                  height="24"
                                />
                              </div>
                              <div class="flex h-full flex-col justify-center gap-1">
                                <Paragraph text="Bitcoin" />
                                <Annotation text={coin.symbol} />
                              </div>
                            </div>
                            <div class="flex h-full flex-col justify-center gap-1">
                              <Paragraph text="481 BTC" size="xs" />
                              <Annotation text="$32,267,226.03" />
                            </div>
                            <Paragraph text={`${coin.wallet}`} size="xs" />
                            <div class="mr-4">
                              <Select
                                name="crypto"
                                id="crypto"
                                size="medium"
                                options={[{ value: "", text: "Crypto" }]}
                              />
                            </div>
                            <div class="relative">
                              <Input
                                name={`${coin.symbol}${coin.wallet}Amount`}
                                id={`${coin.symbol}${coin.wallet}Amount`}
                                placeholder={`${coin.symbol} approval limit`}
                                size="small"
                                subValue="$67,059.95"
                                value={coin.amount}
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
                                  const currentCoin =
                                    currentStructure!.coins.find(
                                      (item) =>
                                        item.wallet === coin.wallet &&
                                        item.symbol === coin.symbol,
                                    );

                                  currentCoin!.amount = target.value;
                                })}
                              />
                              <Button
                                variant="blue"
                                customClass="absolute top-1/2 -translate-y-1/2 right-2.5 h-5 !p-1 !rounded-md"
                                text="Max"
                                onClick$={async () => {
                                  const currentStructure =
                                    batchTransferFormStore.coinsToTransfer.find(
                                      (item) => item.name === structure.name,
                                    );

                                  const currentCoin =
                                    currentStructure!.coins.find(
                                      (item) =>
                                        item.wallet === coin.wallet &&
                                        item.symbol === coin.symbol,
                                    );
                                  console.log(
                                    "availables: ",
                                    availableStructures.value,
                                  );
                                  const chosenStructure =
                                    availableStructures.value.structures.find(
                                      (struct: any) =>
                                        struct.structure.name ===
                                        currentStructure!.name,
                                    );
                                  const chosenCoin =
                                    chosenStructure.structureBalance.find(
                                      (item: any) =>
                                        item.balance.symbol === coin.symbol &&
                                        item.wallet.name === coin.wallet,
                                    );
                                  const chosenCoinValue = convertWeiToQuantity(
                                    chosenCoin.balance.balance,
                                    Number(chosenCoin.balance.decimals),
                                  );
                                  console.log(chosenCoinValue);

                                  coin.amount = `${chosenCoinValue}`;
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            },
          )}
        </div>
      </Box>
    );
  },
);
