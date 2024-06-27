import {
  $,
  component$,
  Slot,
  useSignal,
  useVisibleTask$,
} from "@builder.io/qwik";
import Paragraph from "~/components/Atoms/Paragraphs/Paragraphs";
import Select from "../Atoms/Select/Select";
import Input from "../Atoms/Input/Input";
import { type BatchTransferFormStore } from "~/routes/app/portfolio/interface";
import { getObservedWalletBalances } from "~/routes/app/portfolio/server/observerWalletBalancesLoader";

interface ProgressBarProps {
  batchTransferFormStore: BatchTransferFormStore;
}

export const ProgressBar = component$<ProgressBarProps>(
  ({ batchTransferFormStore }) => {
    const type = useSignal("custom");
    const wallets = useSignal<any>([]);

    // eslint-disable-next-line qwik/no-use-visible-task
    useVisibleTask$(async () => {
      wallets.value = await getObservedWalletBalances();
    });

    return (
      <div class="flex w-full max-w-full items-center justify-between gap-20">
        <div class="flex w-full items-center justify-between gap-3">
          <Paragraph text="Destination" />
          <Select
            id=""
            name=""
            size="medium"
            options={[
              { value: "custom", text: "Custom wallet" },
              { value: "observed", text: "Observed wallet" },
            ]}
            onValueChange={$((value: string) => {
              type.value = value;
            })}
          />
          <Paragraph text="To" />
          {type.value === "custom" ? (
            <Input
              id="addressTo"
              name="delivery address"
              value={batchTransferFormStore.receiverAddress}
              onInput={$((e) => {
                const target = e.target;
                batchTransferFormStore.receiverAddress = target.value;
              })}
              placeholder="Paste Wallet Address"
              size="small"
              inputClass="placeholder:text-opacity-100"
            />
          ) : (
            <Select
              id="observedWallets"
              name="observedWallets"
              options={[
                { value: "", text: "Select wallet" },
                ...wallets.value.map((option: any) => {
                  return {
                    value: option.wallet.address,
                    text: option.walletName,
                    selected: undefined,
                  };
                }),
              ]}
              onValueChange={$((value: string) => {
                batchTransferFormStore.receiverAddress = value;
              })}
              size="medium"
            />
          )}
        </div>
        <Slot />
      </div>
    );
  },
);
