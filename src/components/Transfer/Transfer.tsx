import {
  $,
  component$,
  useSignal,
  useStore,
  useVisibleTask$,
} from "@builder.io/qwik";
import { Modal } from "~/components/Modal/Modal";
import Button from "../Atoms/Buttons/Button";
import { ProgressBar } from "./ProgressBar";
import { Step3 } from "./Step3";
import Header from "../Atoms/Headers/Header";
import IconClose from "@material-design-icons/svg/round/close.svg?jsx";
// import IconSuccess from "@material-design-icons/svg/round/success.svg?jsx";
import Checkbox from "../Atoms/Checkbox/Checkbox";
import Paragraph from "~/components/Atoms/Paragraphs/Paragraphs";
import { Step2 } from "./Step2";
import { Step1 } from "./Step1";
import { Destination } from "./Destination";
import {
  BatchTransferFormStore,
  WalletWithBalance,
} from "~/routes/app/portfolio/interface";
import { getAvailableStructures } from "~/routes/app/portfolio/server/availableStructuresLoader";
import { getObservedWalletBalances } from "~/routes/app/portfolio/server/observerWalletBalancesLoader";
import { setupServiceWorker } from "@builder.io/qwik-city/service-worker";

export const Transfer = component$(() => {
  const isTransferModalOpen = useSignal(true);
  const step = useSignal(1);
  const batchTransferFormStore = useStore<BatchTransferFormStore>({
    receiverAddress: "",
    coinsToTransfer: [],
    consent: false,
  });
  const availableStructures = useSignal<any>({
    structures: [],
    isLoading: true,
  });
  const observedWalletsWithBalance = useSignal<any>([]);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    availableStructures.value = await getAvailableStructures();
    observedWalletsWithBalance.value = await getObservedWalletBalances();
    for (const structure of availableStructures.value.structures) {
      const coins = [];
      for (const wallet of structure.structureBalance) {
        const walletAddress = `${observedWalletsWithBalance.value.find((item: WalletWithBalance) => item.wallet.id === wallet.wallet.id)?.wallet.address}`;
        coins.push({
          wallet: wallet.wallet.name,
          isExecutable: wallet.wallet.isExecutable,
          address: walletAddress,
          symbol: wallet.balance.symbol,
          amount: "0",
          isChecked: false,
        });
      }
      batchTransferFormStore.coinsToTransfer.push({
        name: structure.structure.name,
        coins: coins,
        isChecked: false,
        isVisible: false,
      });
    }
  });
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ track }) => {
    track(() => {
      batchTransferFormStore.coinsToTransfer;
    });
    console.log("reload");
  });
  return (
    <Modal
      hasButton={false}
      isOpen={isTransferModalOpen}
      customClass="min-w-full w-full m-10 !h-[730px]"
    >
      <div class="grid gap-6 overflow-auto">
        <div class="flex items-center justify-between gap-4">
          <Header text="Transfer Funds" variant="h3" class="font-normal" />
          <div class="custom-bg-opacity-5 custom-border-1 flex h-8 items-center rounded-md px-1">
            <Button
              variant={step.value === 1 ? "transfer" : "onlyIcon"}
              text="Tokens"
              customClass="h-6 w-[146px] !text-xs"
              onClick$={() => {
                step.value = 1;
              }}
            />
            <Button
              variant={step.value === 2 ? "transfer" : "onlyIcon"}
              text="Value"
              customClass="h-6 w-[146px] !text-xs"
              onClick$={() => {
                step.value = 2;
              }}
            />
            <Button
              variant={step.value === 3 ? "transfer" : "onlyIcon"}
              text="Summary"
              customClass="h-6 w-[146px] !text-xs"
              onClick$={() => {
                step.value = 3;
              }}
            />
          </div>
          <Button
            variant="onlyIcon"
            leftIcon={<IconClose class="h-6 w-6 fill-white" />}
          />
        </div>
        {step.value === 1 ? (
          <Step1
            availableStructures={availableStructures}
            batchTransferFormStore={batchTransferFormStore}
          />
        ) : step.value === 2 ? (
          <Step2
            batchTransferFormStore={batchTransferFormStore}
            availableStructures={availableStructures}
          />
        ) : (
          <Step3
            batchTransferFormStore={batchTransferFormStore}
            availableStructures={availableStructures}
          />
        )}

        <ProgressBar batchTransferFormStore={batchTransferFormStore}>
          <div class="flex items-center gap-2">
            <Checkbox
              isChecked={batchTransferFormStore.consent}
              onClick={$(() => {
                batchTransferFormStore.consent =
                  !batchTransferFormStore.consent;
              })}
            />
            <Paragraph
              text="I am aware that sending funds to a wrong address means losing funds."
              class="!text-wrap text-xs !leading-4"
            />
          </div>
          <Button
            text="Next Step"
            onClick$={() => {
              if (step.value === 3) {
                if (
                  batchTransferFormStore.consent &&
                  batchTransferFormStore.receiverAddress
                ) {
                  console.log("store: ", batchTransferFormStore);
                }
              } else {
                step.value = step.value + 1;
              }
            }}
          />
        </ProgressBar>
      </div>
    </Modal>
  );
});
