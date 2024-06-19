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
import IconSearch from "@material-design-icons/svg/filled/search.svg?jsx";

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
            <Checkbox variant="toggleTick" isChecked={false} />
          </div>
        </BoxHeader>
        <Input
          id="portfolio"
          size="small"
          placeholder="Search for Subportfolio"
          InputClass="placeholder:text-opacity-100"
          iconRight={<IconSearch class="fill-white h-4 w-4"/>}
        />
        <div>
          <div class="flex items-center justify-between gap-4 p-4">
            <div class="flex flex-col gap-3">
              <Header variant="h5" text="Investment" class="font-normal" />
              <Annotation text="$400,000.00" class="text-[10px]"/>
            </div>
            <Checkbox variant="toggleTick" isChecked={true} />
          </div>
          <div class="flex items-center justify-between gap-4 p-4">
            <div class="flex flex-col gap-3">
              <Header variant="h5" text="Marcin" class="font-normal" />
              <Annotation text="$20,000.00" class="text-[10px]"/>
            </div>
            <Checkbox variant="toggleTick" isChecked={true} />
          </div>
        </div>
      </Box>
      <Box customClass="flex flex-col gap-6 p-6 !overflow-x-hidden h-[550px]">
        <Header variant="h4" text="Tokens" class="font-normal" />
        <div class="grid grid-cols-3 gap-2">
          <Input
            id="token"
            size="small"
            placeholder="Search for Subportfolio"
            InputClass="placeholder:text-opacity-100 "
            iconRight={<IconSearch class="fill-white h-4 w-4"/>}
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
        <div class="flex flex-col gap-5">
          <div class="flex items-center justify-between gap-2 rounded-lg bg-white/3 px-4 py-1">
            <Paragraph text="Investment" />
            <div class="flex items-center gap-2">
              <Annotation text="Portfolio Value" />
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
          <div class="flex flex-col gap-4">
            <div class="grid grid-cols-[repeat(3,minmax(0,1fr))] text-xs text-customGrey">
              <Annotation text="Token" />
              <Annotation text="Current Value" />
              <Annotation text="Wallet" />
            </div>
            <div class="flex flex-col gap-1">
              <div class="grid grid-cols-[repeat(3,minmax(0,1fr))] rounded-lg bg-white/3 py-2.5">
                <div class="flex items-center gap-4 pl-4">
                  <div class="flex items-center justify-center rounded-lg bg-white/3 p-2">
                    <IconBTC class="h-6 w-6" />
                  </div>
                  <div class="flex h-full flex-col justify-center gap-1">
                    <Paragraph text="Bitcoin" />
                    <Annotation text="BTC" />
                  </div>
                </div>
                <div class="flex h-full flex-col justify-center gap-1">
                  <Paragraph text="481 BTC" size="xs" />
                  <Annotation text="$32,267,226.03" />
                </div>
                <div class="flex items-center justify-between pr-4">
                  <Paragraph text="Wallet#1" size="xs" />
                  <Checkbox variant="checkTick" isChecked={true} />
                </div>
              </div>
              <div class="grid grid-cols-[repeat(3,minmax(0,1fr))] rounded-lg bg-white/3 py-3">
                <div class="flex items-center gap-4 pl-4">
                  <div class="flex items-center justify-center rounded-lg bg-white/3 p-2">
                    <IconBTC class="h-6 w-6" />
                  </div>
                  <div class="flex h-full flex-col justify-center gap-1">
                    <Paragraph text="Bitcoin" />
                    <Annotation text="BTC" />
                  </div>
                </div>
                <div class="flex h-full flex-col justify-center gap-1">
                  <Paragraph text="481 BTC" size="xs" />
                  <Annotation text="$32,267,226.03" />
                </div>
                <div class="flex items-center justify-between pr-4">
                  <Paragraph text="Wallet#2" size="xs" />
                  <Checkbox variant="checkTick" isChecked={true} />
                </div>
              </div>
              <div class="grid grid-cols-[repeat(3,minmax(0,1fr))] rounded-lg  py-3">
                <div class="flex items-center gap-4 pl-4">
                  <div class="flex items-center justify-center rounded-lg bg-white/3 p-2">
                    <IconBTC class="h-6 w-6" />
                  </div>
                  <div class="flex h-full flex-col justify-center gap-1">
                    <Paragraph text="Bitcoin" />
                    <Annotation text="BTC" />
                  </div>
                </div>
                <div class="flex h-full flex-col justify-center gap-1">
                  <Paragraph text="481 BTC" size="xs" />
                  <Annotation text="$32,267,226.03" />
                </div>
                <div class="flex items-center justify-between pr-4">
                  <Paragraph text="Wallet#3" size="xs" />
                  <Checkbox variant="checkTick" isChecked={false} />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="flex flex-col gap-5">
          <div class="flex items-center justify-between gap-2 rounded-lg bg-black/10 px-4 py-1">
            <Paragraph text="Marian" />
            <div class="flex items-center gap-2">
              <Annotation text="Portfolio Value" />
              <Annotation
                text="$200,000.00"
                class="rounded-lg bg-black/10 p-2 !text-white"
              />
              <Button
                variant="onlyIcon"
                leftIcon={<IconArrowDown class="fill-white" />}
              />
            </div>
          </div>
        </div>
      </Box>
    </div>
  );
});
