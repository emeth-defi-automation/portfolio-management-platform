import { $, component$ } from "@builder.io/qwik";
import InputField from "~/components/Molecules/InputField/InputField";
import { type BatchTransferFormStore } from "~/routes/app/portfolio/interface";

export interface DestinationProps {
  batchTransferFormStore: BatchTransferFormStore;
}

export default component$<DestinationProps>(({ batchTransferFormStore }) => {
  return (
    <>
      <InputField
        class="ml-0.5 w-[98%]"
        variant={null}
        size="medium"
        name="delivery address"
        placeholder="Type or paste deposit address here"
        value={batchTransferFormStore.receiverAddress}
        onInput={$((e) => {
          const target = e.target;
          batchTransferFormStore.receiverAddress = target.value;
        })}
      />
      {/* <Input
        text="DELIVERY ADDRESS"
        name="receiverAddress"
        type="text"
        placeholder="Type or paste deposit address here"
        customClass="w-[98%] ml-0.5"
        value={batchTransferFormStore.receiverAddress}
        onInput={$((e) => {
          const target = e.target;
          batchTransferFormStore.receiverAddress = target.value;
        })}
      />*/}
    </>
  );
});
