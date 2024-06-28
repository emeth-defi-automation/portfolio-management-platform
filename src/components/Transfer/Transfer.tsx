import {
  $,
  type Signal,
  component$,
  useContext,
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
import Checkbox from "../Atoms/Checkbox/Checkbox";
import Paragraph from "~/components/Atoms/Paragraphs/Paragraphs";
import { Step2 } from "./Step2";
import { Step1 } from "./Step1";
import {
  type BatchTransferFormStore,
  type WalletWithBalance,
} from "~/routes/app/portfolio/interface";
import { getAvailableStructures } from "~/routes/app/portfolio/server/availableStructuresLoader";
import { getObservedWalletBalances } from "~/routes/app/portfolio/server/observerWalletBalancesLoader";
import { queryTokens } from "~/database/tokens";
import { convertToFraction } from "~/utils/fractions";
import {
  simulateContract,
  waitForTransactionReceipt,
  writeContract,
} from "@wagmi/core";
import { WagmiConfigContext } from "../WalletConnect/context";
import { emethContractAbi } from "~/abi/emethContractAbi";
import { messagesContext } from "~/routes/app/layout";
import { generateRandomId } from "~/utils/automations";
import { server$ } from "@builder.io/qwik-city";
import { connectToDB } from "~/database/db";
import { AutomationPageContext } from "~/routes/app/automation/AutomationPageContext";

const addAutomationAction = server$(async function (
  automationAction: any,
  argsArray: any,
  user: string,
  actionId: string,
) {
  const db = await connectToDB(this.env);
  try {
    const newAction = {
      actionName: automationAction.actionName,
      actionDesc: automationAction.actionDesc,
      actionType: automationAction.actionType,
      argsArray: argsArray,
      actionId: actionId,
      deployed: false,
    };
    const automationId = `${automationAction.automationId}`;
    console.log("{ACTION]: ", newAction);
    await db.query(
      `
        UPDATE automations
        SET actions = ARRAY::APPEND(actions, $newAction)
        WHERE actionId = $automationId AND user = $user;
      `,
      {
        newAction,
        automationId,
        user,
      },
    );
  } catch (error) {
    console.error("Error adding action:", error);
  }
});
interface TransferProps {
  isOpen: Signal<boolean>;
  automationAction?: any;
}

export const Transfer = component$<TransferProps>(
  ({ isOpen, automationAction }) => {
    const automationPageContext = useContext(AutomationPageContext);
    const wagmiConfig = useContext(WagmiConfigContext);
    const formMessageProvider = useContext(messagesContext);
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
          isVisible: true,
        });
      }
    });
    // eslint-disable-next-line qwik/no-use-visible-task
    useVisibleTask$(({ track }) => {
      track(() => {
        batchTransferFormStore.coinsToTransfer;
      });
    });
    const closeModal = $(() => {
      batchTransferFormStore.receiverAddress = "";
      batchTransferFormStore.coinsToTransfer = [];

      isOpen.value = false;
    });
    const handleBatchTransfer = $(async () => {
      const emethContractAddress = import.meta.env
        .PUBLIC_EMETH_CONTRACT_ADDRESS_SEPOLIA;

      if (!emethContractAddress) {
        throw new Error("Missing PUBLIC_EMETH_CONTRACT_ADDRESS_SEPOLIA");
      }

      try {
        const tokens = await queryTokens();
        if (wagmiConfig.config.value) {
          const argsArray = [];
          for (const cStructure of batchTransferFormStore.coinsToTransfer) {
            for (const cCoin of cStructure.coins) {
              if (cCoin.isChecked) {
                const chosenToken = tokens.find(
                  (token: any) => token.symbol === cCoin.symbol.toUpperCase(),
                );
                const { numerator, denominator } = convertToFraction(
                  cCoin.amount,
                );
                const calculation =
                  BigInt(numerator * BigInt(10 ** chosenToken.decimals)) /
                  BigInt(denominator);
                argsArray.push({
                  from: cCoin.address as `0x${string}`,
                  to: batchTransferFormStore.receiverAddress as `0x${string}`,
                  amount: calculation,
                  token: chosenToken.address as `0x${string}`,
                });
              }
            }
          }

          const { request } = await simulateContract(wagmiConfig.config.value, {
            abi: emethContractAbi,
            address: emethContractAddress,
            functionName: "transferBatch",
            args: [argsArray],
          });

          formMessageProvider.messages.push({
            id: formMessageProvider.messages.length,
            variant: "info",
            message: "Transferring tokens...",
            isVisible: true,
          });

          const transactionHash = await writeContract(
            wagmiConfig.config.value,
            request,
          );
          await waitForTransactionReceipt(wagmiConfig.config.value, {
            hash: transactionHash,
          });

          batchTransferFormStore.receiverAddress = "";
          batchTransferFormStore.coinsToTransfer = [];

          formMessageProvider.messages.push({
            id: formMessageProvider.messages.length,
            variant: "success",
            message: "Success!",
            isVisible: true,
          });
        }
      } catch (err) {
        console.error(err);
        formMessageProvider.messages.push({
          id: formMessageProvider.messages.length,
          variant: "error",
          message: "Something went wrong.",
          isVisible: true,
        });
      }
    });
    const handleSaveTransferAutomation = $(async () => {
      try {
        formMessageProvider.messages.push({
          id: formMessageProvider.messages.length,
          variant: "info",
          message: "Swapping tokens...",
          isVisible: true,
        });
        const tokens = await queryTokens();

        const argsArray = [];
        for (const cStructure of batchTransferFormStore.coinsToTransfer) {
          for (const cCoin of cStructure.coins) {
            if (cCoin.isChecked) {
              const chosenToken = tokens.find(
                (token: any) => token.symbol === cCoin.symbol.toUpperCase(),
              );
              const { numerator, denominator } = convertToFraction(
                cCoin.amount,
              );
              const calculation =
                BigInt(numerator * BigInt(10 ** chosenToken.decimals)) /
                BigInt(denominator);
              argsArray.push({
                from: cCoin.address as `0x${string}`,
                to: batchTransferFormStore.receiverAddress as `0x${string}`,
                amount: `${calculation}`,
                token: chosenToken.address as `0x${string}`,
              });
            }
          }
        }
        const user = localStorage.getItem("emmethUserWalletAddress");

        if (!user) {
          return new Error("there is no user address");
        }

        const actionId = `${generateRandomId()}`;
        await addAutomationAction(
          automationAction,
          argsArray,
          user!,
          `${actionId}`,
        );
        automationPageContext.isDraverOpen.value = false;
        formMessageProvider.messages.push({
          id: formMessageProvider.messages.length,
          variant: "success",
          message: "Tokens swapped!",
          isVisible: true,
        });
      } catch (err) {
        console.log(err);
        formMessageProvider.messages.push({
          id: formMessageProvider.messages.length,
          variant: "error",
          message: "Error while swapping",
          isVisible: true,
        });
      }
    });
    return (
      <Modal
        hasButton={false}
        isOpen={isOpen}
        customClass="min-w-full w-full m-10 !h-[730px]"
        onClose={$(() => {
          closeModal();
        })}
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
              onClick$={$(() => {
                closeModal();
              })}
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
            <Step3 batchTransferFormStore={batchTransferFormStore} />
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
              onClick$={async () => {
                if (step.value === 3) {
                  if (
                    batchTransferFormStore.consent &&
                    batchTransferFormStore.receiverAddress
                  ) {
                    isOpen.value = false;
                    if (automationAction) {
                      await handleSaveTransferAutomation();
                    } else {
                      await handleBatchTransfer();
                    }
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
  },
);
