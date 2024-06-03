import {
  $,
  component$,
  useContext,
  useSignal,
  useStore,
  useVisibleTask$,
} from "@builder.io/qwik";
import {
  Config,
  getAccount,
  simulateContract,
  writeContract,
} from "@wagmi/core";
import Button from "~/components/Atoms/Buttons/Button";
import Checkbox from "~/components/Atoms/Checkbox/Checkbox";
import Header from "~/components/Atoms/Headers/Header";
import Paragraph from "~/components/Atoms/Paragraphs/Paragraphs";
import { ButtonWithIcon } from "~/components/Buttons/Buttons";
import { WagmiConfigContext } from "~/components/WalletConnect/context";
import { messagesContext } from "../../layout";
import { emethContractAbi } from "~/abi/emethContractAbi";
import { connectToDB } from "~/database/db";
import { server$ } from "@builder.io/qwik-city";
import { Modal } from "~/components/Modal/Modal";
import Input from "~/components/Atoms/Input/Input";
import Select from "~/components/Atoms/Select/Select";
import { AddAutomationModal } from "./AddAutomationModal";
import { AutomationPageContext } from "../AutomationPageContext";

const updateIsActiveStatus = server$(async function (actionId, isActive) {
  const db = await connectToDB(this.env);
  console.log("id: ", actionId, "isActive: ", isActive);
  try {
    console.log("zmieniam");
    await db.query(
      `UPDATE automations SET isActive = $isActive WHERE actionId = $actionId;`,
      { actionId: actionId, isActive: isActive },
    );
    console.log("chyba zmienilem");
  } catch (err) {
    console.log(err);
  }
});

const addActionToDB = server$(
  async function (
    name,
    isActive,
    actionId,
    tokenIn,
    tokenOut,
    amountIn,
    from,
    to,
    deadline,
    delayDays,
    user,
  ) {
    const cookie = this.cookie.get("accessToken");
    if (!cookie) {
      throw new Error("No cookie found");
    }
    const db = await connectToDB(this.env);
    await db.query(
      `INSERT INTO automations (name, isActive, actionId, tokenIn, tokenOut, amountIn, from, to, deadline, delayDays, user) VALUES ("${name}", ${isActive}, ${actionId}, "${tokenIn}", "${tokenOut}", ${amountIn}, "${from}", "${to}", ${deadline}, ${delayDays}, "${user}");`,
    );
  },
);
const getActionsFromDb = server$(async function () {
  const db = await connectToDB(this.env);
  // TODO handle logged user
  const [actions] = await db.query(
    `SELECT * FROM automations WHERE user = "0x8545845EF4BD63c9481Ae424F8147a6635dcEF87"`,
  );
  console.log(actions);
  return actions;
});

interface AutomationsMenuProps {}

export const AutomationsMenu = component$<AutomationsMenuProps>(() => {
  const wagmiConfig = useContext(WagmiConfigContext);
  const automationPageContext = useContext(AutomationPageContext);
  const formMessageProvider = useContext(messagesContext);
  const isAddModalOpen = useSignal<boolean>(false);
  const addModalStore = useStore({
    name: "",
    isActive: false,
    actionId: "",
    tokenIn: "",
    tokenOut: "",
    amountIn: "",
    from: "",
    to: "",
    deadline: "",
    delayDays: 0,
  });

  // const handleAddAutomation = $(async function () {
  //   const account = getAccount(wagmiConfig.config as Config);
  //   const emethContractAddress = import.meta.env
  //     .PUBLIC_EMETH_CONTRACT_ADDRESS_SEPOLIA;
  //   const {
  //     name,
  //     actionId,
  //     tokenIn,
  //     tokenOut,
  //     amountIn,
  //     from,
  //     to,
  //     deadline,
  //     delayDays,
  //   } = addModalStore;
  //   formMessageProvider.messages.push({
  //     id: formMessageProvider.messages.length,
  //     variant: "info",
  //     message: "Creating action...",
  //     isVisible: true,
  //   });

  //   try {
  //     console.log(addModalStore);
  //     await addActionToDB(
  //       name,
  //       false,
  //       BigInt(actionId),
  //       tokenIn as `0x${string}`,
  //       tokenOut as `0x${string}`,
  //       BigInt(amountIn),
  //       from as `0x${string}`,
  //       to as `0x${string}`,
  //       // 1715998201n,
  //       BigInt(deadline),
  //       BigInt(delayDays),
  //       localStorage.getItem("emmethUserWalletAddress"),
  //     );
  //     const { request } = await simulateContract(wagmiConfig.config as Config, {
  //       account: account.address as `0x${string}`,
  //       abi: emethContractAbi,
  //       address: emethContractAddress,
  //       functionName: "addAction",
  //       args: [
  //         // 12991n,
  //         // "0xD418937d10c9CeC9d20736b2701E506867fFD85f" as `0x${string}`,
  //         // "0x9D16475f4d36dD8FC5fE41F74c9F44c7EcCd0709" as `0x${string}`,
  //         // 20000000000000000000n,
  //         // "0x0577b55800816b6A2Da3BDbD3d862dce8e99505D" as `0x${string}`,
  //         // "0x8545845EF4BD63c9481Ae424F8147a6635dcEF87" as `0x${string}`,
  //         // 1715998201n,
  //         // 1n,
  //         BigInt(actionId),
  //         tokenIn as `0x${string}`,
  //         tokenOut as `0x${string}`,
  //         BigInt(amountIn),
  //         from as `0x${string}`,
  //         to as `0x${string}`,
  //         BigInt(deadline),
  //         BigInt(delayDays),
  //       ],
  //     });

  //     const transactionHash = await writeContract(
  //       wagmiConfig.config as Config,
  //       request,
  //     );
  //     formMessageProvider.messages.push({
  //       id: formMessageProvider.messages.length,
  //       variant: "success",
  //       message: "Success!",
  //       isVisible: true,
  //     });

  //     console.log(transactionHash);
  //   } catch (err) {
  //     console.log(err);
  //     // formMessageProvider.messages.push({
  //     //   id: formMessageProvider.messages.length,
  //     //   variant: "error",
  //     //   message: "Something went wrong.",
  //     //   isVisible: true,
  //     // });
  //   }
  // });
  useVisibleTask$(async () => {
    const actionsFromDb = await getActionsFromDb();
    automationPageContext.automations.value = actionsFromDb;
    console.log(automationPageContext.automations.value);
  });
  return (
    <>
      <div class="grid grid-rows-[32px_40px_1fr] gap-6 border-r border-white/10 bg-white/3 p-6">
        <div class="flex items-center justify-between gap-2">
          <Header variant="h4" text="Automations" class="font-normal" />
          <Button
            text="Add New"
            variant="transparent"
            size="small"
            customClass="font-normal bg-white/10 !border-0"
            onClick$={() => (isAddModalOpen.value = !isAddModalOpen.value)}
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
          {automationPageContext.automations.value.map((action: any) => (
            // TODO odswiezyc gdy zamykany jest addModal
            <div class="flex cursor-pointer items-center justify-between gap-12 p-4">
              <div
                class="flex flex-col gap-3"
                onClick$={$(() => {
                  automationPageContext.activeAutomation.value = action;
                })}
              >
                <Header variant="h5" text={action.name} />
                <Paragraph
                  size="xs"
                  variant="secondaryText"
                  text={action.desc}
                />
              </div>
              <Checkbox
                variant="toggleTick"
                isChecked={action.isActive}
                class=""
                onClick={$(async () => {
                  console.log("kliknalem sie");
                  await updateIsActiveStatus(action.actionId, !action.isActive);
                })}
              />
            </div>
          ))}
        </div>
      </div>
      {isAddModalOpen.value ? (
        <AddAutomationModal isAddModalOpen={isAddModalOpen} />
      ) : null}
      {/* {isAddModalOpen.value ? (
        <Modal
          title="Add action"
          isOpen={isAddModalOpen}
          onClose={$(() => {
            isAddModalOpen.value = false;
            addModalStore.name = "";
            addModalStore.isActive = false;
            addModalStore.actionId = "";
            addModalStore.tokenIn = "";
            addModalStore.tokenOut = "";
            addModalStore.amountIn = "";
            addModalStore.from = "";
            addModalStore.to = "";
            addModalStore.deadline = "";
            addModalStore.delayDays = 0;
          })}
        >
          <div class="flex flex-col gap-2">
            <Input
              name="name"
              placeholder="enter name"
              value={addModalStore.name}
              type="text"
              onInput={$((e) => {
                const target = e.target;
                addModalStore.name = target.value;
              })}
            />
            <Input
              name="actionId"
              placeholder="Enter actionId"
              value={addModalStore.actionId}
              type="text"
              onInput={$((e) => {
                const target = e.target;
                addModalStore.actionId = target.value;
              })}
            />

            <Select
              name="tokenIn"
              options={[
                {
                  text: "Chose token",
                  value: "",
                },
                {
                  text: "USDC",
                  value: "0xD418937d10c9CeC9d20736b2701E506867fFD85f",
                },
                {
                  text: "USDT",
                  value: "0x9D16475f4d36dD8FC5fE41F74c9F44c7EcCd0709",
                },
              ]}
              onValueChange={$((value) => {
                addModalStore.tokenIn = value;
              })}
            />
            <Select
              name="tokenIn"
              options={[
                {
                  text: "Chose token swap on",
                  value: "",
                },
                {
                  text: "USDC",
                  value: "0xD418937d10c9CeC9d20736b2701E506867fFD85f",
                },
                {
                  text: "USDT",
                  value: "0x9D16475f4d36dD8FC5fE41F74c9F44c7EcCd0709",
                },
              ]}
              onValueChange={$((value) => {
                addModalStore.tokenOut = value;
              })}
            />
            <Input
              name="amountIn"
              placeholder="enter amountIn"
              value={addModalStore.amountIn}
              type="text"
              onInput={$((e) => {
                const target = e.target;
                addModalStore.amountIn = target.value;
              })}
            />
            <Input
              name="from"
              placeholder="Wallet address to use"
              value={addModalStore.from}
              type="text"
              onInput={$((e) => {
                const target = e.target;
                addModalStore.from = target.value;
                addModalStore.to = target.value;
              })}
            />
            <Input
              name="deadline"
              placeholder="Enter deadline"
              value={addModalStore.deadline}
              type="text"
              onInput={$((e) => {
                const target = e.target;
                addModalStore.deadline = target.value;
              })}
            />
            <Input
              name="delay"
              placeholder="eEnter how many days"
              value={addModalStore.delayDays}
              type="text"
              onInput={$((e) => {
                const target = e.target;
                addModalStore.delayDays = target.value;
              })}
            />

            <Button
              text="Approve"
              onClick$={() => {
                handleAddAutomation();
                isAddModalOpen.value = false;
                addModalStore.name = "";
                addModalStore.isActive = false;
                addModalStore.actionId = "";
                addModalStore.tokenIn = "";
                addModalStore.tokenOut = "";
                addModalStore.amountIn = "";
                addModalStore.from = "";
                addModalStore.to = "";
                addModalStore.deadline = "";
                addModalStore.delayDays = 0;
              }}
            />
          </div>
        </Modal>
      ) : null} */}
    </>
  );
});
