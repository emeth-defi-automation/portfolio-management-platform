import {
  $,
  Slot,
  component$,
  useContext,
  useSignal,
  useStore,
  useVisibleTask$,
} from "@builder.io/qwik";
import Header from "~/components/Atoms/Headers/Header";
import { AutomationPageContext } from "../AutomationPageContext";
import Input from "~/components/Atoms/Input/Input";
import Select from "~/components/Atoms/Select/Select";
import Button from "~/components/Atoms/Buttons/Button";
import Label from "~/components/Atoms/Label/Label";
import { getObservedWalletBalances } from "../../portfolio/server/observerWalletBalancesLoader";
import {
  Config,
  getAccount,
  simulateContract,
  writeContract,
} from "@wagmi/core";
import { WagmiConfigContext } from "~/components/WalletConnect/context";
import { messagesContext } from "../../layout";
import { emethContractAbi } from "~/abi/emethContractAbi";
import Checkbox from "~/components/Atoms/Checkbox/Checkbox";
import { server$ } from "@builder.io/qwik-city";
import { connectToDB } from "~/database/db";

const updateAutomationAction = server$(
  async function (
    isActive,
    actionId,
    tokenIn,
    tokenOut,
    amountIn,
    from,
    to,
    timeZero,
    duration,
    user,
    deployed,
  ) {
    const db = await connectToDB(this.env);
    try {
      console.log("dzialam");
      await db.query(
        `UPDATE automations 
        SET isActive = $isActive, 
        tokenIn = $tokenIn, 
        tokenOut = $tokenOut, 
        amountIn = $amountIn, 
        from = $from, 
        to = $to, 
        timeZero = $timeZero, 
        duration = $duration, 
        user = $user, 
        deployed = $deployed 
        WHERE actionId = $actionId AND user = $user;`,
        {
          user: user,
          actionId: actionId,
          isActive: isActive,
          tokenIn: tokenIn,
          tokenOut: tokenOut,
          timeZero: timeZero,
          to: to,
          from: from,
          duration: duration,
          deployed: deployed,
          amountIn: amountIn,
        },
      );
      console.log("chyba zmienilem");
    } catch (err) {
      console.log(err);
    }
  },
);

interface TriggerDrawerProps {}

export const TriggerDrawer = component$<TriggerDrawerProps>(() => {
  const wagmiConfig = useContext(WagmiConfigContext);
  const automationPageContext = useContext(AutomationPageContext);
  const formMessageProvider = useContext(messagesContext);
  const observedWallets = useSignal<any>([]);
  const addModalStore = useStore({
    name: "",
    isActive: false,
    actionId: "",
    tokenIn: "",
    tokenOut: "",
    amountIn: "",
    from: "",
    to: "",
    timeZero: "",
    durationCount: 0,
    interval: 0,
  });

  useVisibleTask$(async ({ track }) => {
    track(() => {
      automationPageContext.isDraverOpen.value;
    });
    observedWallets.value = await getObservedWalletBalances();
    addModalStore.actionId =
      automationPageContext.activeAutomation.value?.actionId;
    addModalStore.name = automationPageContext.activeAutomation.value?.name;
  });

  const handleAddAutomation = $(async function () {
    const account = getAccount(wagmiConfig.config as Config);
    const emethContractAddress = import.meta.env
      .PUBLIC_EMETH_CONTRACT_ADDRESS_SEPOLIA;
    const {
      name,
      isActive,
      actionId,
      tokenIn,
      tokenOut,
      amountIn,
      from,
      to,
      timeZero,
      durationCount,
      interval,
    } = addModalStore;
    formMessageProvider.messages.push({
      id: formMessageProvider.messages.length,
      variant: "info",
      message: "Creating action...",
      isVisible: true,
    });
    try {
      console.log(addModalStore);

      const duration = BigInt(durationCount) * BigInt(interval);
      const timeZeroCalculated = Math.floor(
        new Date(timeZero).getTime() / 1000,
      );
      console.log(
        BigInt(actionId),
        tokenIn as `0x${string}`,
        tokenOut as `0x${string}`,
        BigInt(amountIn),
        from as `0x${string}`,
        to as `0x${string}`,
        BigInt(timeZeroCalculated),
        BigInt(duration),
        isActive,
      );

      const { request } = await simulateContract(wagmiConfig.config as Config, {
        account: account.address as `0x${string}`,
        abi: emethContractAbi,
        address: emethContractAddress,
        functionName: "addAction",
        args: [
          BigInt(actionId),
          tokenIn as `0x${string}`,
          tokenOut as `0x${string}`,
          BigInt(amountIn),
          from as `0x${string}`,
          to as `0x${string}`,
          BigInt(timeZeroCalculated),
          BigInt(duration),
          isActive,
        ],
      });

      const transactionHash = await writeContract(
        wagmiConfig.config as Config,
        request,
      );
      const user = localStorage.getItem("emmethUserWalletAddress");
      await updateAutomationAction(
        isActive,
        actionId.toString(),
        tokenIn,
        tokenOut,
        amountIn.toString(),
        from,
        to,
        timeZero.toString(),
        duration.toString(),
        user,
        true,
      );

      formMessageProvider.messages.push({
        id: formMessageProvider.messages.length,
        variant: "success",
        message: "Success!",
        isVisible: true,
      });
      console.log(transactionHash);
    } catch (err) {
      console.log(err);
      formMessageProvider.messages.push({
        id: formMessageProvider.messages.length,
        variant: "error",
        message: "Something went wrong.",
        isVisible: true,
      });
    }
  });
  return (
    <div
      class="
    absolute right-0 top-20  h-full
    w-96  gap-6 border-l border-white/10 bg-white/3 p-6
    "
    >
      {automationPageContext.isDraverOpen.value ? (
        <>
          <Header variant="h4" text="Properties" />
          <div class="my-4 flex flex-col gap-2">
            <div>
              <Label name="Token In" class="my-2 block" />
              <Select
                name="tokenIn"
                options={[
                  {
                    text: "Chose token to swap",
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
                onValueChange={$((value: string) => {
                  addModalStore.tokenIn = value;
                })}
              />
            </div>
            <div>
              <Label name="Token Out" class="my-2 block" />
              <Select
                name="tokenOut"
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
            </div>
            <div>
              <Label name="Amount In" class="my-2 block" />
              <Input
                name="amountIn"
                placeholder="enter amountIn"
                value={addModalStore.amountIn}
                type="number"
                onInput={$((e) => {
                  const target = e.target;
                  addModalStore.amountIn = target.value;
                })}
              />
            </div>

            <div>
              <Label name="Address From" class="my-2 block" />
              <Select
                name="AddressFrom"
                options={[
                  { value: "", text: "Select wallet" },
                  ...observedWallets.value?.map((wallet: any) => {
                    return {
                      text: wallet.walletName,
                      value: wallet.wallet.address,
                    };
                  }),
                ]}
                onValueChange={$((value) => {
                  addModalStore.from = value;
                })}
              />
            </div>
            <div>
              <Label name="Address to" class="my-2 block" />
              <Input
                name="to"
                placeholder="Address to send coins to"
                value={addModalStore.amountIn}
                type="text"
                onInput={$((e) => {
                  const target = e.target;
                  addModalStore.to = target.value;
                })}
              />
            </div>
            <div>
              <Label name="Time Zero" class="my-2 block" />
              <Input
                type="datetime-local"
                name="TimeZero"
                onInput={$((e) => {
                  const target = e.target;
                  addModalStore.timeZero = target.value;
                })}
              />
              {/* <Input
              name="AddressTo"
              placeholder="Enter deadline"
              value={addModalStore.}
              type="text"
              onInput={$((e) => {
                const target = e.target;
             
              })}
            /> */}
            </div>
            <div>
              <Label name="Interval" class="my-2 block" />
              <Select
                name="durationInterval"
                options={[
                  {
                    text: "Days",
                    value: "86400",
                  },
                  {
                    text: "Hours",
                    value: "3600",
                  },
                  {
                    text: "Minutes",
                    value: "60",
                  },
                ]}
                onValueChange={$((value) => {
                  addModalStore.interval = value;
                })}
              />
            </div>
            <div>
              <Label name="How many" class="my-2 block" />
              <Input
                name="durationCount"
                placeholder="0"
                value={addModalStore.amountIn}
                type="number"
                onInput={$((e) => {
                  const target = e.target;
                  addModalStore.durationCount = target.value;
                })}
              />
            </div>
            <div>
              <Label name="Is Active?" class="my-2 block" />
              <Checkbox
                variant="toggleTick"
                isChecked={addModalStore.isActive}
                onClick={$(() => {
                  addModalStore.isActive = !addModalStore.isActive;
                })}
              />
            </div>
            <Button
              text="Approve"
              onClick$={$(async () => {
                console.log(addModalStore);
                await handleAddAutomation();
              })}
            />
          </div>
        </>
      ) : null}
    </div>
  );
});
