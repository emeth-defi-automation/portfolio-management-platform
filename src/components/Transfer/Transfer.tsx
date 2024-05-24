import { component$, useSignal } from "@builder.io/qwik";
import { Modal } from "~/components/Modal/Modal";
import Box from "../Atoms/Box/Box";
import Header from "../Atoms/Headers/Header";
import Paragraph from "../Atoms/Paragraphs/Paragraphs";
import Button from "../Atoms/Buttons/Button";
import { ButtonWithIcon } from "../Buttons/Buttons";
import Checkbox from "../Atoms/Checkbox/Checkbox";
import IconArrowDown from "@material-design-icons/svg/filled/expand_more.svg?jsx";
import IconBTC from "./public/assets/icons/tokens/btc.svg?jsx";

export const Transfer = component$(() => {
  const isTransferModalOpen = useSignal(true);

  return (
    <Modal
      title="Transfer Funds"
      isOpen={isTransferModalOpen}
      customClass="w-full m-10"
    >
      <div class="grid grid-cols-[1fr_3fr] h-full gap-6">
        <Box customClass="grid grid-rows-[32px_40px_1fr] h-full gap-6 p-6">
          <div class="flex items-center justify-between gap-2">
            <Header variant="h4" text="Subportfolios" class="font-normal" />
            <div class="flex items-center gap-2">
              <Paragraph size="xs" class="text-customGrey" text="Select All" />
              <Checkbox variant="toggleTick" isChecked={false} class="" />
            </div>
          </div>
          <div class="grid w-full gap-2">
            <ButtonWithIcon
              image="/assets/icons/search.svg"
              text="Search for SubPortfolio"
              class="custom-border-1 h-10 flex-row-reverse justify-between gap-2 rounded-lg px-3"
            />
          </div>
          <div>
            <div class="flex items-center justify-between gap-4 p-4">
              <div class="flex flex-col gap-3">
                <Header variant="h5" text="Investment" />
                <Paragraph
                  size="xs"
                  variant="secondaryText"
                  text="$400,000.00"
                />
              </div>
              <Checkbox variant="toggleTick" isChecked={true} class="" />
            </div>
            <div class="flex items-center justify-between gap-4  p-4">
              <div class="flex flex-col gap-3">
                <Header variant="h5" text="Investment" />
                <Paragraph
                  size="xs"
                  variant="secondaryText"
                  text="$20,000.00"
                />
              </div>
              <Checkbox variant="toggleTick" isChecked={true} />
            </div>
          </div>
        </Box>
        <Box customClass="p-6 grid grid-rows-[32px_40px_1fr] h-full gap-6 items-center">
          <Header variant="h4" text="Tokens" class="font-normal" />
          <div class="flex gap-2">
            <ButtonWithIcon
              image="/assets/icons/search.svg"
              text="Search Token"
              class="custom-border-1 h-10 w-[300px] flex-row-reverse justify-between gap-2 rounded-lg px-3"
            />
            <ButtonWithIcon
              image="/assets/icons/arrow-down.svg"
              text="Filter by SubPortfolio"
              class="custom-border-1 h-10 w-[220px] flex-row-reverse justify-between gap-2 rounded-lg px-3"
            />
            <ButtonWithIcon
              image="/assets/icons/arrow-down.svg"
              text="Filter by Wallet"
              class="custom-border-1 h-10 w-[220px] flex-row-reverse justify-between gap-2 rounded-lg px-3"
            />
          </div>
          <div class="flex flex-col gap-5">
            <div class="flex items-center gap-2">
              <Button
                variant="onlyIcon"
                leftIcon={<IconArrowDown class="*:fill-white" />}
              />
              <Paragraph text="Investment" />
              <span class="text-xs text-customGrey">Value: $400,000.00</span>
            </div>
            <div class="flex flex-col gap-4">
              <div class="grid grid-cols-[repeat(3,minmax(0,1fr))_24px] text-xs text-customGrey">
                <span>TOKEN NAME</span>
                <span class="text-center">CURRENT VALUE</span>
                <span class="text-center pr-4">WALLET</span>
              </div>
              <div class="flex flex-col gap-1">
                <div class="grid grid-cols-[repeat(3,minmax(0,1fr))_24px] px-4 py-3 rounded-lg bg-white/3">
                <div class="flex gap-4 items-center">
                  <div class="bg-white/3 flex items-center justify-center rounded-lg p-2">
                    <IconBTC class="h-6 w-6" />
                  </div>
                  <div class="flex flex-col h-full gap-1 justify-center">
                    <Paragraph text="Bitcoin" />
                    <span class="text-customGrey text-xs">BTC</span>
                  </div>
                </div>
                <div class="flex justify-center items-center gap-2">
                  <span class="text-sm">$67,083.63</span>
                  <span class="text-xs text-customGrey">(481 BTC)</span>
                </div>
                <div class="flex justify-center items-center">
                  <span class="text-sm">TreasuryWBTC</span>
                </div> 
                <div class="flex justify-center items-center">
                  <Checkbox variant="checkTick" isChecked={true}/>
                </div>
              </div>
              <div class="grid grid-cols-[repeat(3,minmax(0,1fr))_24px] px-4 py-3 rounded-lg bg-white/3">
                <div class="flex gap-4 items-center">
                  <div class="bg-white/3 flex items-center justify-center rounded-lg p-2">
                    <IconBTC class="h-6 w-6" />
                  </div>
                  <div class="flex flex-col h-full gap-1 justify-center">
                    <Paragraph text="Bitcoin" />
                    <span class="text-customGrey text-xs">BTC</span>
                  </div>
                </div>
                <div class="flex justify-center items-center gap-2">
                  <span class="text-sm">$67,083.63</span>
                  <span class="text-xs text-customGrey">(481 BTC)</span>
                </div>
                <div class="flex justify-center items-center gap-2">
                  <span class="text-sm">TreasuryWBTC</span>
                </div> 
                <div>
                  <Checkbox variant="checkTick" isChecked={true}/>
                </div>
              </div>
              </div>
            </div>
          </div>
        </Box>
      </div>
    </Modal>
  );
});
