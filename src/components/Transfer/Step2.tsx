import { component$ } from "@builder.io/qwik";
import Box from "../Atoms/Box/Box";
import Header from "../Atoms/Headers/Header";
import Button from "../Atoms/Buttons/Button";
import Paragraph from "../Atoms/Paragraphs/Paragraphs";
import Input from "../Atoms/Input/Input";
import IconArrowDown from "@material-design-icons/svg/filled/expand_more.svg?jsx";
import IconBTC from "/public/assets/icons/tokens/btc.svg?jsx";
import Annotation from "../Atoms/Annotation/Annotation";
import Select from "../Atoms/Select/Select";

export const Step2 = component$(() => {
  return (
    <Box
      variant="box"
      customClass="flex flex-col gap-6 !shadow-none !overflow-x-hidden h-[550px]"
    >
      <Header text="Value" variant="h4" />
      <div class="flex flex-col gap-6">
        <div class="flex flex-col gap-5">
          <div class="flex items-center justify-between gap-2 rounded-lg bg-white/3 px-4 py-1">
            <Paragraph text="Investment" />
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
          <div class="flex flex-col gap-4">
            <div class="grid grid-cols-[repeat(3,minmax(0,1fr))_1fr_2fr]">
              <Annotation text="Token" />
              <Annotation text="Current Value" />
              <Annotation text="Wallet" />
              <Annotation text="Unit" />
              <Annotation text="Amount" />
            </div>
            <div class="flex flex-col gap-4">
              <div class="grid grid-cols-[repeat(3,minmax(0,1fr))_1fr_2fr] items-center rounded-lg">
                <div class="flex items-center gap-4">
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
                <Paragraph text="Wallet#1" size="xs" />
                <div class="mr-4">
                  <Select
                    name="crypto"
                    id="crypto"
                    size="medium"
                    options={[{ value: "", text: "Crypto" }]}
                  />
                </div>
                <div class="relative">
                  <Input id="swap" size="small" subValue="$67,059.95" />
                  <Button
                    variant="blue"
                    customClass="absolute top-1/2 -translate-y-1/2 right-2.5 h-5 !p-1 !rounded-md"
                    text="Max"
                  />
                </div>
              </div>
              <div class="grid grid-cols-[repeat(3,minmax(0,1fr))_1fr_2fr] items-center rounded-lg">
                <div class="flex items-center gap-4">
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
                <Paragraph text="Wallet#2" size="xs" />
                <div class="mr-4">
                  <Select
                    id=""
                    name=""
                    size="medium"
                    options={[{ value: "", text: "Crypto" }]}
                  />
                </div>
                <div class="relative">
                  <Input id="" size="small" subValue="$67,059.95" />
                  <Button
                    variant="blue"
                    customClass="absolute top-1/2 -translate-y-1/2 right-2.5 h-5 !p-1 !rounded-md"
                    text="Max"
                  />
                </div>
              </div>
              <div class="grid grid-cols-[repeat(3,minmax(0,1fr))_1fr_2fr] items-center rounded-lg">
                <div class="flex items-center gap-4">
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
                <Paragraph text="Wallet#3" size="xs" />
                <div class="mr-4">
                  <Select
                    id=""
                    name=""
                    size="medium"
                    options={[{ value: "", text: "Dollar" }]}
                  />
                </div>
                <div class="relative">
                  <Input id="" size="small" subValue="1.00" />
                  <Button
                    variant="blue"
                    customClass="absolute top-1/2 -translate-y-1/2 right-2.5 h-5 !p-1 !rounded-md"
                    text="Max"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Box>
  );
});
