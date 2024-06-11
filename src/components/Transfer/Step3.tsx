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
      customClass="flex flex-col gap-6 !shadow-none !overflow-x-hidden h-[550px]"
    >
      <Header text="Summary" variant="h4" />
      <div class="flex flex-col gap-6">
        <div class="flex flex-col gap-5">
          <div class="flex items-center gap-2">
            <Button
              variant="onlyIcon"
              leftIcon={<IconArrowDown class="fill-white" />}
            />
            <Paragraph text="Investment" />
          </div>
          <div class="flex flex-col gap-4">
            <div class="grid grid-cols-[repeat(3,minmax(0,1fr))_3fr] text-xs text-customGrey">
              <span>TOKEN NAME</span>
              <span>YOU SEND</span>
              <span>FROM</span>
              <span class="text-right">BALANCE AFTER TRANSFER</span>
            </div>
            <div class="flex flex-col gap-1">
              <div class="grid grid-cols-[repeat(3,minmax(0,1fr))_3fr] rounded-lg py-3">
                <div class="flex items-center gap-4 pl-4">
                  <div class="flex items-center justify-center rounded-lg bg-white/3 p-2">
                    <IconBTC class="h-6 w-6" />
                  </div>
                  <div class="flex h-full flex-col justify-center gap-1">
                    <Paragraph text="Bitcoin" />
                    <Annotation text="BTC" />
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-sm">$67,083.63</span>
                  <Annotation text="(481 BTC)" />
                </div>
                <div class="flex items-center">
                  <span class="text-sm">TreasuryWBTC</span>
                </div>
                <div class="flex items-center justify-end gap-2">
                  <span class="text-sm">$67,083.63</span>
                  <Annotation text="(481 BTC)" />
                </div>
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
          </div>
          <div class="flex flex-col gap-4">
            <div class="grid grid-cols-[repeat(3,minmax(0,1fr))_3fr] text-xs text-customGrey">
              <span>TOKEN NAME</span>
              <span>YOU SEND</span>
              <span>FROM</span>
              <span class="text-right">BALANCE AFTER TRANSFER</span>
            </div>
            <div class="flex flex-col gap-1">
              <div class="grid grid-cols-[repeat(3,minmax(0,1fr))_3fr] rounded-lg py-3">
                <div class="flex items-center gap-4 pl-4">
                  <div class="flex items-center justify-center rounded-lg bg-white/3 p-2">
                    <IconBTC class="h-6 w-6" />
                  </div>
                  <div class="flex h-full flex-col justify-center gap-1">
                    <Paragraph text="Bitcoin" />
                    <Annotation text="BTC" />
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-sm">$67,083.63</span>
                  <Annotation text="(481 BTC)" />
                </div>
                <div class="flex items-center">
                  <span class="text-sm">TreasuryWBTC</span>
                </div>
                <div class="flex items-center justify-end gap-2">
                  <span class="text-sm">$67,083.63</span>
                  <Annotation text="(481 BTC)" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Box>
  );
});
