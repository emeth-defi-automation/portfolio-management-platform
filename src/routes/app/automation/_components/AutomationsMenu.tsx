import {
  $,
  component$,
  useContext,
  useSignal,
  useVisibleTask$,
} from "@builder.io/qwik";
import Button from "~/components/Atoms/Buttons/Button";
import Checkbox from "~/components/Atoms/Checkbox/Checkbox";
import { connectToDB } from "~/database/db";
import { server$ } from "@builder.io/qwik-city";
import { AddAutomationModal } from "./AddAutomationModal";
import { AutomationPageContext } from "../AutomationPageContext";
import {
  type Config,
  getAccount,
  simulateContract,
  writeContract,
} from "@wagmi/core";
import { emethContractAbi } from "~/abi/emethContractAbi";
import { WagmiConfigContext } from "~/components/WalletConnect/context";
import Input from "~/components/Atoms/Input/Input";
import ParagraphAnnotation from "~/components/Molecules/ParagraphAnnotation/ParagraphAnnotation";
import BoxHeader from "~/components/Molecules/BoxHeader/BoxHeader";

const updateIsActiveStatus = server$(async function (actionId, isActive) {
  const db = await connectToDB(this.env);
  try {
    await db.query(
      `UPDATE automations SET isActive = $isActive WHERE actionId = $actionId;`,
      { actionId: actionId, isActive: isActive },
    );
  } catch (err) {
    console.log(err);
  }
});

const getActionsFromDb = server$(async function (user) {
  const db = await connectToDB(this.env);

  const [actions] = await db.query(
    `SELECT * FROM automations WHERE user = $user;`,
    { user: user },
  );
  return actions;
});

interface AutomationsMenuProps {}

export const AutomationsMenu = component$<AutomationsMenuProps>(() => {
  const automationPageContext = useContext(AutomationPageContext);
  const isAddModalOpen = useSignal<boolean>(false);
  const wagmiConfig = useContext(WagmiConfigContext);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async ({ track }) => {
    track(() => {
      isAddModalOpen.value === false;
      automationPageContext.isDraverOpen.value = false;
    });
    const user = localStorage.getItem("emmethUserWalletAddress");
    const actionsFromDb = await getActionsFromDb(user);
    automationPageContext.automations.value = actionsFromDb;
  });

  const handleActiveStatus = $(async function (
    actionId: string,
    isActive: boolean,
    deployed: boolean,
  ) {
    try {
      if (deployed) {
        const account = getAccount(wagmiConfig.config.value as Config);
        const emethContractAddress = import.meta.env
          .PUBLIC_EMETH_CONTRACT_ADDRESS_SEPOLIA;
        const { request } = await simulateContract(
          wagmiConfig.config.value as Config,
          {
            account: account.address as `0x${string}`,
            abi: emethContractAbi,
            address: emethContractAddress,
            functionName: "setAutomationActiveState",
            args: [BigInt(actionId), isActive],
          },
        );

        const transactionHash = await writeContract(
          wagmiConfig.config.value as Config,
          request,
        );
        console.log(transactionHash);
      }
      await updateIsActiveStatus(actionId, isActive);
    } catch (err) {
      console.log(err);
    }
  });

  return (
    <>
      <div class="grid grid-rows-[32px_40px_1fr] gap-6 border-r border-white/10 bg-white/3 p-6">
        <BoxHeader
          title="Automations"
          variantHeader="h4"
          headerClass="font-normal"
        >
          <Button
            text="Add New"
            variant="transparent"
            size="small"
            customClass="font-normal bg-white/10 !border-0"
            onClick$={() => (isAddModalOpen.value = !isAddModalOpen.value)}
          />
        </BoxHeader>
        <Input
          id="automation"
          variant="search"
          placeholder="Search for Automation"
          InputClass="text-xs"
        />
        <div class="flex flex-col ">
          {automationPageContext.automations.value.map((action: any) => (
            <ParagraphAnnotation
              key={action.actionId}
              paragraphText={action.name}
              annotationText={action.desc}
              onClick$={$(() => {
                automationPageContext.activeAutomation.value = action;
              })}
              textBoxClass="py-4"
            >
              <Checkbox
                variant="toggleTick"
                isChecked={action.isActive}
                class=""
                onClick={$(async () => {
                  await handleActiveStatus(
                    action.actionId,
                    !action.isActive,
                    action.deployed,
                  );
                })}
              />
            </ParagraphAnnotation>
          ))}
        </div>
      </div>
      {isAddModalOpen.value ? (
        <AddAutomationModal isAddModalOpen={isAddModalOpen} />
      ) : null}
    </>
  );
});
