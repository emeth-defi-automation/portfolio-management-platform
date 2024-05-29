import { component$, useSignal } from "@builder.io/qwik";
import { Modal } from "~/components/Modal/Modal";
import Box from "../Atoms/Box/Box";
import Header from "../Atoms/Headers/Header";
import Paragraph from "../Atoms/Paragraphs/Paragraphs";
import Button from "../Atoms/Buttons/Button";
import { ButtonWithIcon } from "../Buttons/Buttons";
import Checkbox from "../Atoms/Checkbox/Checkbox";
import IconArrowDown from "@material-design-icons/svg/filled/expand_more.svg?jsx";
import IconBTC from "/public/assets/icons/tokens/btc.svg?jsx";

export const Transfer = component$(() => {
  const isTransferModalOpen = useSignal(true);

  return (
    <Modal
      title="Transfer Funds"
      isOpen={isTransferModalOpen}
      customClass="w-full  m-10"
    >
      <div class="flex flex-col gap-6">
        <div class="flex gap-6">
          <Box customClass="grid grid-rows-[32px_40px_1fr] w-1/3 h-auto min-w-fit gap-6 p-6">
            <div class="flex items-center justify-between gap-2">
              <Header variant="h4" text="Subportfolios" class="font-normal" />
              <div class="flex items-center gap-2">
                <Paragraph
                  size="xs"
                  class="text-customGrey"
                  text="Select All"
                />
                <Checkbox variant="toggleTick" isChecked={false} class="" />
              </div>
            </div>
            <ButtonWithIcon
              image="/assets/icons/search.svg"
              text="Search for SubPortfolio"
              class="custom-border-1 h-10 flex-row-reverse justify-between gap-2 rounded-lg bg-white/3 px-3"
            />
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
          <Box customClass="grid grid-rows-[32px_40px_1fr] gap-6 p-6 items-center">
            <Header variant="h4" text="Tokens" class="font-normal" />
            <div class="flex gap-2">
              <ButtonWithIcon
                image="/assets/icons/search.svg"
                text="Search Token"
                class="custom-border-1 h-10 w-[300px] flex-row-reverse justify-between gap-2 rounded-lg bg-white/3 px-3"
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
                  leftIcon={<IconArrowDown class="fill-white" />}
                />
                <Paragraph text="Investment" />
                <span class="text-xs text-customGrey">Value: $400,000.00</span>
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
                        <span class="text-xs text-customGrey">BTC</span>
                      </div>
                    </div>
                    <div class="flex items-center justify-center gap-2">
                      <span class="text-sm">$67,083.63</span>
                      <span class="text-xs text-customGrey">(481 BTC)</span>
                    </div>
                    <div class="flex items-center justify-center">
                      <span class="text-sm">TreasuryWBTC</span>
                    </div>
                    <div class="flex items-center justify-center">
                      <Checkbox variant="checkTick" isChecked={true} />
                    </div>
                  </div>
                  <div class="grid grid-cols-[repeat(3,minmax(0,1fr))_24px] rounded-lg px-4 py-3">
                    <div class="flex items-center gap-4">
                      <div class="flex items-center justify-center rounded-lg bg-white/3 p-2">
                        <IconBTC class="h-6 w-6" />
                      </div>
                      <div class="flex h-full flex-col justify-center gap-1">
                        <Paragraph text="Bitcoin" />
                        <span class="text-xs text-customGrey">BTC</span>
                      </div>
                    </div>
                    <div class="flex items-center justify-center gap-2">
                      <span class="text-sm">$67,083.63</span>
                      <span class="text-xs text-customGrey">(481 BTC)</span>
                    </div>
                    <div class="flex items-center justify-center gap-2">
                      <span class="text-sm">TreasuryWBTC</span>
                    </div>
                    <div>
                      <Checkbox variant="checkTick" isChecked={true} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Box>
        </div>
        <div class="flex w-full items-center justify-between gap-3">
          <div class="flex min-w-[720px] gap-[1px] text-xs text-customGrey">
            <div class="flex w-1/3 flex-col gap-3">
              <span>TOKENS</span>
              <div class="custom-bg-button h-2 w-full rounded-l-lg"></div>
            </div>
            <div class="flex w-1/3 flex-col gap-3">
              <span>VALUE & DESTINATION</span>
              <div class="h-2 w-full bg-white/10"></div>
            </div>
            <div class="flex w-1/3 flex-col gap-3">
              <span>SUMMARY</span>
              <div class="h-2 w-full rounded-r-lg bg-white/10"></div>
            </div>
          </div>
          <Button text="Next Step" />
        </div>
      </div>
    </Modal>
  );
});
