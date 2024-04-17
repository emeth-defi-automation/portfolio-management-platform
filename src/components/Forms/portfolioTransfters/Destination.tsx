import { component$ } from "@builder.io/qwik";
import { FormBadge } from "~/components/FormBadge/FormBadge";
import { BatchTransferFormStore } from "~/routes/app/portfolio";

export interface DestinationProps {
  batchTransferFormStore: BatchTransferFormStore;
  availableStructures: any
}

export default component$<DestinationProps>(({ batchTransferFormStore, availableStructures }) => {


  return (
    <>
     step3
    </>
  );
});
