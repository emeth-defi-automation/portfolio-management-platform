import { component$, useSignal } from "@builder.io/qwik";
import { Modal } from "~/components/Modal/Modal";
import Button from "../Atoms/Buttons/Button";
import { ProgressBar } from "./ProgressBar";
import { Step3 } from "./Step3";
import Header from "../Atoms/Headers/Header";
import IconClose from "@material-design-icons/svg/round/close.svg?jsx";
import Checkbox from "../Atoms/Checkbox/Checkbox";
import Paragraph from "~/components/Atoms/Paragraphs/Paragraphs";

export const Transfer = component$(() => {
  const isTransferModalOpen = useSignal(true);

  return (
    <Modal
      hasButton={false}
      isOpen={isTransferModalOpen}
      customClass="w-full m-10"
    >
      <div class="grid gap-6 overflow-auto">
        <div class="flex items-center justify-between gap-4">
          <Header text="Transfer Funds" variant="h3" class="font-normal" />
          <div class="custom-bg-opacity-5 custom-border-1 flex h-8 items-center rounded-md px-1">
            <Button variant="transfer" text="Tokens" />
            <Button
              variant="onlyIcon"
              text="Value"
              customClass="h-6 w-[146px] !text-xs"
            />
            <Button
              variant="onlyIcon"
              text="Summary"
              customClass="h-6 w-[146px] !text-xs"
            />
          </div>
          <Button
            variant="onlyIcon"
            leftIcon={<IconClose class="h-6 w-6 fill-white" />}
          />
        </div>
        {/* CHOOSE STEP */}
        <Step3 />
        {/* <Destination>
          IF STEP 2:
          <Input
            placeholder="Type or paste deposit address here"
            customClass="w-[430px]"
          /> 
          IF STEP 3/4:
          <Tag
            text="Address"
            isBorder={true}
            variant="success"
            icon={<IconSuccess class="h-5 w-5 fill-customGreen" />}
            size="large"
            class="h-10 flex-row-reverse gap-10 px-6"
          />
          <div class="flex items-center gap-3">
            <Checkbox variant="checkTick" isChecked={false} />
            <Annotation text="I want to confirm that I am absolutely certain about sending the tokens to this address." class="max-w-[300px]"/>
          </div>
        </Destination> */}
        <ProgressBar>
          <div class="flex items-center gap-2">
            <Checkbox isChecked={false} />
            <Paragraph
              text="I am aware that sending funds to a wrong address means losing funds."
              class="!text-wrap text-xs !leading-4"
            />
          </div>
          <Button text="Next Step" />
        </ProgressBar>
      </div>
    </Modal>
  );
});
