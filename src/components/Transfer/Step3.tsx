import { component$ } from "@builder.io/qwik";
import Box from "../Atoms/Box/Box";
import Header from "../Atoms/Headers/Header";
import Button from "../Atoms/Buttons/Button";
import Paragraph from "../Atoms/Paragraphs/Paragraphs";
import IconArrowDown from "@material-design-icons/svg/filled/expand_more.svg?jsx";
import IconBTC from "/public/assets/icons/tokens/btc.svg?jsx";
import Annotation from "../Atoms/Annotation/Annotation";

export const Step3 = component$(() => {
  return (
    <Box
      variant="box"
      customClass="flex flex-col gap-6 !shadow-none !overflow-x-hidden h-[550px] relative"
    >
      <Header text="Summary" variant="h4" />
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
            <div class="grid grid-cols-[repeat(3,minmax(0,1fr))_3fr]">
              <Annotation text="Token" />
              <Annotation text="Balance After Transfer" />
              <Annotation text="Wallet" />
              <Annotation text="Amount" class="text-right" />
            </div>
            <div class="flex flex-col gap-1">
              <div class="grid grid-cols-[repeat(3,minmax(0,1fr))_3fr] items-center py-3">
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
                <div class="flex h-full flex-col items-end gap-1">
                  <Paragraph text="1 BTC" size="xs" />
                  <Annotation text="$67,083.63" />
                </div>
              </div>
              <div class="grid grid-cols-[repeat(3,minmax(0,1fr))_3fr] items-center py-3">
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
                <div class="flex h-full flex-col items-end gap-1">
                  <Paragraph text="1 BTC" size="xs" />
                  <Annotation text="$67,083.63" />
                </div>
              </div>
              <div class="grid grid-cols-[repeat(3,minmax(0,1fr))_3fr] items-center py-3">
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
                <div class="flex h-full flex-col items-end gap-1">
                  <Paragraph text="1 BTC" size="xs" />
                  <Annotation text="$67,083.63" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Box customClass="rounded-lg flex justify-between p-3 items-center absolute bottom-6 w-[96%]">
        <Paragraph text="Overall Transfer Amount" />
        <Annotation
          text="$201,179.85"
          class="rounded-lg border border-customBlue bg-customBlue/10 px-4 py-2 !text-white"
        />
      </Box>
    </Box>
  );
});
