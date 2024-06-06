import { component$ } from "@builder.io/qwik";
import Paragraph from "../Atoms/Paragraphs/Paragraphs";
import Box from "../Atoms/Box/Box";
import Header from "../Atoms/Headers/Header";
import Button from "../Atoms/Buttons/Button";
import IconArrowDown from "@material-design-icons/svg/filled/expand_more.svg?jsx";
import IconBTC from "/public/assets/icons/tokens/btc.svg?jsx";
import Checkbox from "../Atoms/Checkbox/Checkbox";
import BoxHeader from "../Molecules/BoxHeader/BoxHeader";
import Input from "../Atoms/Input/Input";
import Select from "../Atoms/Select/Select";
import Annotation from "../Atoms/Annotation/Annotation";

export const Step1 = component$(() => {
  return (
    <div class="flex gap-6">
      <Box customClass="flex flex-col w-1/3 h-auto min-w-fit gap-6 p-6">
        <BoxHeader
          variantHeader="h4"
          title="Subportfolios"
          headerClass="font-normal"
        >
          <div class="flex items-center gap-2">
            <Annotation text="Select All" />
            <Checkbox variant="toggleTick" isChecked={false} class="" />
          </div>
        </BoxHeader>
        <Input
          variant="search"
          placeholder="Search for Portfolio"
          customClass="flex-row-reverse h-10 w-[300px] text-xs"
        />
        <div>
          <div class="flex items-center justify-between gap-4 p-4">
            <div class="flex flex-col gap-3">
              <Header variant="h5" text="Investment" class="font-normal" />
              <Annotation text="$400,000.00" />
            </div>
            <Checkbox variant="toggleTick" isChecked={true} />
          </div>
          <div class="flex items-center justify-between gap-4 p-4">
            <div class="flex flex-col gap-3">
              <Header variant="h5" text="Marcin" class="font-normal" />
              <Annotation text="$20,000.00" />
            </div>
            <Checkbox variant="toggleTick" isChecked={true} />
          </div>
        </div>
      </Box>
      <Box customClass="flex flex-col gap-6 p-6 !overflow-hidden">
        <Header variant="h4" text="Tokens" class="font-normal" />
        <div class="flex gap-2">
          <Input
            variant="search"
            placeholder="Search Token"
            customClass="flex-row-reverse h-10 w-[300px] text-xs"
          />
          <Select
            options={[{ value: "", text: "Filter by SubPortfolio" }]}
            class="h-10 w-56 text-xs"
          />
          <Select
            options={[{ value: "", text: "Filter by Wallet" }]}
            class="h-10 w-56 text-xs"
          />
        </div>
        <div class="flex flex-col gap-5">
          <div class="flex items-center gap-2">
            <Button
              variant="onlyIcon"
              leftIcon={<IconArrowDown class="fill-white" />}
            />
            <Paragraph text="Investment" />
            <Annotation text="Value: $400,000.00" />
          </div>
          <div class="flex flex-col gap-4">
            <div class="grid grid-cols-[repeat(3,minmax(0,1fr))_24px] text-xs text-customGrey">
              <span>TOKEN NAME</span>
              <span class="text-center">CURRENT VALUE</span>
              <span class="pr-4 text-center">WALLET</span>
            </div>
            <div class="flex flex-col gap-1">
              <div class="grid grid-cols-[repeat(3,minmax(0,1fr))_24px] rounded-lg bg-white/3 px-4 py-3">
                <div class="flex items-center gap-4">
                  <div class="flex items-center justify-center rounded-lg bg-white/3 p-2">
                    <IconBTC class="h-6 w-6" />
                  </div>
                  <div class="flex h-full flex-col justify-center gap-1">
                    <Paragraph text="Bitcoin" />
                    <Annotation text="BTC" />
                  </div>
                </div>
                <div class="flex items-center justify-center gap-2">
                  <span class="text-sm">$67,083.63</span>
                  <Annotation text="(481 BTC)" />
                </div>
                <div class="flex items-center justify-center">
                  <span class="text-center text-sm">TreasuryWBTC</span>
                </div>
                <Checkbox variant="checkTick" isChecked={true} />
              </div>
              <div class="grid grid-cols-[repeat(3,minmax(0,1fr))_24px] rounded-lg px-4 py-3">
                <div class="flex items-center gap-4">
                  <div class="flex items-center justify-center rounded-lg bg-white/3 p-2">
                    <IconBTC class="h-6 w-6" />
                  </div>
                  <div class="flex h-full flex-col justify-center gap-1">
                    <Paragraph text="Bitcoin" />
                    <Annotation text="BTC" />
                  </div>
                </div>
                <div class="flex items-center justify-center gap-2">
                  <span class="text-sm">$67,083.63</span>
                  <Annotation text="(481 BTC)" />
                </div>
                <div class="flex items-center justify-center">
                  <span class="text-center text-sm">TreasuryWBTC</span>
                </div>
                <Checkbox variant="checkTick" isChecked={true} />
              </div>
            </div>
          </div>
        </div>
        <div class="flex flex-col gap-5">
          <div class="flex items-center gap-2">
            <Button
              variant="onlyIcon"
              leftIcon={<IconArrowDown class="fill-white" />}
            />
            <Paragraph text="Marcin" />
            <Annotation text="Value: $20,000.00" />
          </div>
          <div class="flex flex-col gap-4">
            <div class="grid grid-cols-[repeat(3,minmax(0,1fr))_24px] text-xs text-customGrey">
              <span>TOKEN NAME</span>
              <span class="text-center">CURRENT VALUE</span>
              <span class="pr-4 text-center">WALLET</span>
            </div>
            <div class="flex flex-col gap-1">
              <div class="grid grid-cols-[repeat(3,minmax(0,1fr))_24px] rounded-lg bg-white/3 px-4 py-3">
                <div class="flex items-center gap-4">
                  <div class="flex items-center justify-center rounded-lg bg-white/3 p-2">
                    <IconBTC class="h-6 w-6" />
                  </div>
                  <div class="flex h-full flex-col justify-center gap-1">
                    <Paragraph text="Bitcoin" />
                    <Annotation text="BTC" />
                  </div>
                </div>
                <div class="flex items-center justify-center gap-2">
                  <span class="text-sm">$67,083.63</span>
                  <Annotation text="(481 BTC)" />
                </div>
                <div class="flex items-center justify-center">
                  <span class="text-center text-sm">TreasuryWBTC</span>
                </div>
                <Checkbox variant="checkTick" isChecked={true} />
              </div>
            </div>
          </div>
        </div>
      </Box>
    </div>
  );
});
