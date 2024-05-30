import { component$, useSignal } from "@builder.io/qwik";
import { Modal } from "~/components/Modal/Modal";
import Box from "../Atoms/Box/Box";
import Header from "../Atoms/Headers/Header";
import Paragraph from "../Atoms/Paragraphs/Paragraphs";
import Button from "../Atoms/Buttons/Button";
import IconSwap from "@material-design-icons/svg/round/swap_horiz.svg?jsx";
import IconArrowDown from "@material-design-icons/svg/filled/expand_more.svg?jsx";
import IconBTC from "/public/assets/icons/tokens/btc.svg?jsx";
import Input from "../Atoms/Input/Input";

export const TransferStep2 = component$(() => {
  const isTransferModalOpen = useSignal(true);

  return (
    <Modal
      title="Transfer Funds"
      isOpen={isTransferModalOpen}
      customClass="w-full m-10"
    >
      <div class="grid gap-8 overflow-auto">
        <Box variant="box" customClass="flex flex-col gap-6 !shadow-none">
          <Header text="Quantities & Destination" variant="h4" />
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
                  <span class="">TOKEN NAME</span>
                  <span class="">CURRENT VALUE</span>
                  <span class="">WALLET</span>
                  <span class="">SEND</span>
                </div>
                <div class="flex flex-col gap-1">
                  <div class="grid grid-cols-[repeat(3,minmax(0,1fr))_3fr] rounded-lg bg-white/3 py-3">
                    <div class="flex items-center gap-4 pl-4">
                      <div class="flex items-center justify-center rounded-lg bg-white/3 p-2">
                        <IconBTC class="h-6 w-6" />
                      </div>
                      <div class="flex h-full flex-col justify-center gap-1">
                        <Paragraph text="Bitcoin" />
                        <span class="text-xs text-customGrey">BTC</span>
                      </div>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="text-sm">$67,083.63</span>
                      <span class="text-xs text-customGrey">(481 BTC)</span>
                    </div>
                    <div class="flex items-center">
                      <span class="text-sm">TreasuryWBTC</span>
                    </div>
                    <div class="flex items-center pr-4">
                      <Input customClass="min-w-56 h-8" />
                      <Button
                        variant="onlyIcon"
                        leftIcon={<IconSwap class="h-5 w-5 fill-white" />}
                      />
                      <Input customClass="min-w-56 h-8" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Box>
        <Box customClass="flex justify-between items-center py-3 gap-4 !shadow-none">
          <Paragraph text="Destination address" />
          <Input
            placeholder="Type or paste deposit address here"
            customClass="w-[430px]"
          />
        </Box>
        <div class="flex w-full items-center justify-between gap-3">
          <div class="flex min-w-[720px] gap-[1px] text-xs text-customGrey">
            <div class="flex flex-1 flex-col gap-3">
              <span>TOKENS</span>
              <div class="custom-bg-button h-2 w-full rounded-l-lg"></div>
            </div>
            <div class="flex flex-1 flex-col gap-3">
              <span>VALUE & DESTINATION</span>
              <div class="custom-bg-button h-2 w-full"></div>
            </div>
            <div class="flex flex-1 flex-col gap-3">
              <span>SUMMARY</span>
              <div class="h-2 w-full rounded-r-lg bg-white/10"></div>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <Button variant="transparent" text="Back" />
            <Button text="Next Step" />
          </div>
        </div>
      </div>
    </Modal>
  );
});
