import { $, component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import Paragraph from "../Atoms/Paragraphs/Paragraphs";
import Box from "../Atoms/Box/Box";
import Header from "../Atoms/Headers/Header";
import Button from "../Atoms/Buttons/Button";
import IconArrowDown from "@material-design-icons/svg/filled/expand_more.svg?jsx";
import Checkbox from "../Atoms/Checkbox/Checkbox";
import BoxHeader from "../Molecules/BoxHeader/BoxHeader";
import Input from "../Atoms/Input/Input";
import Select from "../Atoms/Select/Select";
import Annotation from "../Atoms/Annotation/Annotation";
import IconSearch from "@material-design-icons/svg/filled/search.svg?jsx";
import { BatchTransferFormStore } from "~/routes/app/portfolio/interface";
import { convertWeiToQuantity } from "~/utils/formatBalances/formatTokenBalance";

interface Step1Props {
  batchTransferFormStore: BatchTransferFormStore;
  availableStructures: any;
}

export const Step1 = component$<Step1Props>(
  ({ batchTransferFormStore, availableStructures }) => {
    const isCheckAllChecked = useSignal(false);
    return (
      <div class="flex gap-6">
        {/* left side */}
        <Box customClass="flex flex-col w-1/3 h-auto min-w-fit gap-6 p-6">
          <BoxHeader
            variantHeader="h4"
            title="Subportfolios"
            headerClass="font-normal"
          >
            <div class="flex items-center gap-2">
              <Annotation text="Select All" />
              <Checkbox
                variant="toggleTick"
                isChecked={isCheckAllChecked.value}
                onClick={$(() => {
                  isCheckAllChecked.value = !isCheckAllChecked.value;
                  for (let structure of batchTransferFormStore.coinsToTransfer) {
                    structure.isChecked = isCheckAllChecked.value;
                  }
                })}
              />
            </div>
          </BoxHeader>
          <Input
            id="portfolio"
            size="small"
            placeholder="Search for Subportfolio"
            inputClass="placeholder:text-opacity-100"
            iconRight={<IconSearch class="h-4 w-4 fill-white" />}
          />
          {batchTransferFormStore.coinsToTransfer.length ? (
            <div key={`${isCheckAllChecked.value}structures`}>
              {availableStructures?.value.structures.map(
                (structure: any, index: number) => {
                  const currentStructure =
                    batchTransferFormStore.coinsToTransfer!.find(
                      (struct) => struct.name === structure.structure.name,
                    )!;
                  return (
                    <div class="flex items-center justify-between gap-4 p-4">
                      <div class="flex flex-col gap-3">
                        <Header
                          variant="h5"
                          text={structure.structure.name}
                          class="font-normal"
                        />
                        <Annotation text="$400,000.00" class="text-[10px]" />
                      </div>
                      <Checkbox
                        variant="toggleTick"
                        isChecked={!!currentStructure.isChecked}
                        onClick={$(() => {
                          currentStructure.isChecked =
                            !currentStructure.isChecked;
                        })}
                      />
                    </div>
                  );
                },
              )}
            </div>
          ) : null}
        </Box>
        {/* right side */}
        <Box customClass="flex flex-col gap-6 p-6 !overflow-x-hidden h-[550px]">
          <Header variant="h4" text="Tokens" class="font-normal" />
          <div class="flex gap-2">
            <Input
              id="token"
              size="small"
              placeholder="Search for Subportfolio"
              inputClass="placeholder:text-opacity-100 "
              iconRight={<IconSearch class="h-4 w-4 fill-white" />}
            />
            <Select
              name="filterSubPortfolio"
              id="filterSubPortfolio"
              size="medium"
              options={[{ value: "", text: "Filter by SubPortfolio" }]}
            />
            <Select
              name="filterSubPortfolio"
              id="filterSubPortfolio"
              size="medium"
              options={[{ value: "", text: "Filter by Wallet" }]}
            />
          </div>
          {/* STRUKTURA */}
          {batchTransferFormStore.coinsToTransfer.length
            ? availableStructures?.value.structures.map(
                (structure: any, index: number) => {
                  const currentStructure =
                    batchTransferFormStore.coinsToTransfer!.find(
                      (struct) => struct.name === structure.structure.name,
                    )!;
                  if (!currentStructure.isChecked) return null;
                  return (
                    <div class={`flex flex-col gap-5`}>
                      <div class="flex items-center justify-between gap-2 rounded-lg bg-white/3 px-4 py-1">
                        <Paragraph text={structure.structure.name} />
                        <div class="flex items-center gap-2">
                          <Annotation text="Portfolio Value" />
                          <Annotation
                            text="$201,179.85" //sum of all
                            class="rounded-lg bg-black/10 p-2 !text-white"
                          />
                          <Button
                            variant="onlyIcon"
                            customClass={`${currentStructure.isVisible ? "" : "rotate-180"}`}
                            leftIcon={<IconArrowDown class="fill-white" />}
                            onClick$={() => {
                              currentStructure.isVisible =
                                !currentStructure.isVisible;
                            }}
                          />
                        </div>
                      </div>
                      {/* kolumny tabeli*/}
                      <div
                        class={`flex flex-col gap-4 ${currentStructure.isVisible ? "flex" : "hidden"}`}
                      >
                        <div class="grid grid-cols-[repeat(3,minmax(0,1fr))] text-xs text-customGrey">
                          <Annotation text="Token" />
                          <Annotation text="Current Value" />
                          <Annotation text="Wallet" />
                        </div>
                        {/* TOKEN W STRUKTURZE */}
                        {structure.structureBalance.map(
                          (balance: any, index: number) => {
                            const currentStructure =
                              batchTransferFormStore.coinsToTransfer.find(
                                (struct) =>
                                  struct.name === structure.structure.name,
                              );

                            const currentCoin = currentStructure?.coins.find(
                              (item) =>
                                item.wallet === balance.wallet.name &&
                                item.symbol === balance.balance.symbol,
                            );

                            return balance.wallet.isExecutable ? (
                              <div class="flex flex-col gap-1">
                                <div class="grid grid-cols-[repeat(3,minmax(0,1fr))] rounded-lg bg-white/3 py-2.5">
                                  <div class="flex items-center gap-4 pl-4">
                                    <div class="flex items-center justify-center rounded-lg bg-white/3 p-2">
                                      <img
                                        src={`/assets/icons/tokens/${balance.balance.symbol.toLowerCase()}.svg`}
                                        width="24"
                                        height="24"
                                      />
                                      {/* icon should be changed */}
                                    </div>
                                    <div class="flex h-full flex-col justify-center gap-1">
                                      <Paragraph text={balance.balance.name} />
                                      <Annotation
                                        text={balance.balance.symbol}
                                      />
                                    </div>
                                  </div>
                                  <div class="flex h-full flex-col justify-center gap-1">
                                    <Paragraph
                                      text={`${convertWeiToQuantity(balance.balance.balance, Number(balance.balance.decimals))} ${balance.balance.symbol}`}
                                      size="xs"
                                    />
                                    <Annotation text="$32,267,226.03" />
                                  </div>
                                  <div class="flex items-center justify-between pr-4">
                                    <Paragraph
                                      text={balance.wallet.name}
                                      size="xs"
                                    />
                                    <Checkbox
                                      variant="checkTick"
                                      isChecked={currentCoin!.isChecked}
                                      // id={`${structure.structure.name}${balance.wallet.name}${balance.balance.symbol}`}
                                      name={`${structure.structure.name}${balance.wallet.name}${balance.balance.symbol}`}
                                      onClick={$(() => {
                                        if (currentCoin) {
                                          currentCoin.isChecked =
                                            !currentCoin.isChecked;
                                        }
                                      })}
                                    />
                                  </div>
                                </div>
                                {/* koniec tokenu */}
                              </div>
                            ) : null;
                          },
                        )}
                      </div>
                    </div>
                  );
                },
              )
            : null}
          {/* Koniec struktury */}
        </Box>
      </div>
    );
  },
);
