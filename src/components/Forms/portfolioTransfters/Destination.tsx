import { $, component$ } from "@builder.io/qwik";
import { Input } from "~/components/Input/Input";
import { BatchTransferFormStore } from "~/routes/app/portfolio";

export interface DestinationProps {
  batchTransferFormStore: BatchTransferFormStore;
  availableStructures: any;
}

export default component$<DestinationProps>(
  ({ batchTransferFormStore, availableStructures }) => {
    return (
      <>
        <Input
          text="DELIVERY ADDRESS"
          name="receiverAddress"
          type="text"
          value={batchTransferFormStore.receiverAddress}
          onInput={$((e) => {
            const target = e.target;
            batchTransferFormStore.receiverAddress = target.value;
          })}
        />
      </>
    );
  },
);
