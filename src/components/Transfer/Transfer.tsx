import { component$, useSignal } from "@builder.io/qwik";
import { Modal } from "~/components/Modal/Modal";
import Box from "../Atoms/Box/Box";
import Header from "../Atoms/Headers/Header";
import Paragraph from "../Atoms/Paragraphs/Paragraphs";
import Button from "../Atoms/Buttons/Button";
import { ButtonWithIcon } from "../Buttons/Buttons";
import Checkbox from "../Atoms/Checkbox/Checkbox";

export const Transfer = component$(() => {
  const isTransferModalOpen = useSignal(true);
  
  return (
    <Modal title="Transfer Funds" isOpen={isTransferModalOpen} customClass="w-full m-10">
      <div class="grid grid-cols-[1fr_2fr] gap-6">
        <Box customClass="grid grid-rows-[32px_40px_1fr] gap-6 bg-white/[0.03] p-6">
          <div class="flex items-center justify-between gap-2">
            <Header variant="h4" text="Automations" class="font-normal" />
            <Button
              text="Add New"
              variant="transparent"
              size="small"
              customClass="font-normal bg-white/10 !border-0"
            />
          </div>
          <div class="grid w-full gap-2">
            <ButtonWithIcon
              image="/assets/icons/search.svg"
              text="Search for Automation"
              class="custom-border-1 h-10 flex-row-reverse justify-between gap-2 rounded-lg px-3"
            />
          </div>
          <div class="">
            <div class="flex items-center justify-between gap-12 p-4">
              <div class="flex flex-col gap-3">
                <Header variant="h5" text="Automation Name #1" />
                <Paragraph
                  size="xs"
                  variant="secondaryText"
                  text="At a scheduled time with a defined alert"
                />
              </div>
              <Checkbox variant="toggleTick" isChecked={true} class="" />
            </div>
            <div class="flex items-center justify-between p-4">
              <div class="flex flex-col gap-3">
                <Header variant="h5" text="Automation Name #2" />
                <Paragraph
                  size="xs"
                  variant="secondaryText"
                  text="At a scheduled time with a defined alert"
                />
              </div>
              <Checkbox variant="toggleTick" isChecked={true} />
            </div>
          </div>
        </Box>
        <Box>

        </Box>
      </div>
    </Modal>
  );
});