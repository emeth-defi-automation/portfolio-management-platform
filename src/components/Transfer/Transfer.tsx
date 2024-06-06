import { component$, useSignal } from "@builder.io/qwik";
import { Modal } from "~/components/Modal/Modal";
import Button from "../Atoms/Buttons/Button";
import { ProgressBar } from "./ProgressBar";
import { Step3 } from "./Step3";

export const Transfer = component$(() => {
  const isTransferModalOpen = useSignal(true);

  return (
    <Modal
      title="Transfer Funds"
      isOpen={isTransferModalOpen}
      customClass="w-full m-10"
    >
      <div class="grid gap-8 overflow-auto">
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
            text="Addres"
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
          <Button variant="transparent" text="Back" />
          <Button text="Next Step" />
        </ProgressBar>
      </div>
    </Modal>
  );
});
