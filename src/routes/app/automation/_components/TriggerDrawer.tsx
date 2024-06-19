import {
  $,
  component$,
  useContext,
  useSignal,
  useStore,
  useVisibleTask$,
} from "@builder.io/qwik";
import { server$ } from "@builder.io/qwik-city";
import {
  getAccount,
  simulateContract,
  writeContract,
  type Config,
} from "@wagmi/core";
import { emethContractAbi } from "~/abi/emethContractAbi";
import Button from "~/components/Atoms/Buttons/Button";
import Checkbox from "~/components/Atoms/Checkbox/Checkbox";
import Header from "~/components/Atoms/Headers/Header";
import Input from "~/components/Atoms/Input/Input";
import Label from "~/components/Atoms/Label/Label";
import Select from "~/components/Atoms/Select/Select";
import { WagmiConfigContext } from "~/components/WalletConnect/context";
import { connectToDB } from "~/database/db";
import { messagesContext } from "../../layout";
import { getObservedWalletBalances } from "../../portfolio/server/observerWalletBalancesLoader";
import { AutomationPageContext } from "../AutomationPageContext";

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
  // eslint-disable-next-line qwik/no-use-visible-task
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
    const account = getAccount(wagmiConfig.config.value as Config);
    const emethContractAddress = import.meta.env
      .PUBLIC_EMETH_CONTRACT_ADDRESS_SEPOLIA;
    const {
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
      const duration = BigInt(durationCount) * BigInt(interval);
      const timeZeroCalculated = Math.floor(
        new Date(timeZero).getTime() / 1000,
      );
      const calculatedAmountIn = BigInt(amountIn) * 10n ** 18n;

      const { request } = await simulateContract(
        wagmiConfig.config.value as Config,
        {
          account: account.address as `0x${string}`,
          abi: emethContractAbi,
          address: emethContractAddress,
          functionName: "addAction",
          args: [
            BigInt(actionId),
            tokenIn as `0x${string}`,
            tokenOut as `0x${string}`,
            BigInt(calculatedAmountIn),
            from as `0x${string}`,
            to as `0x${string}`,
            BigInt(timeZeroCalculated),
            BigInt(duration),
            isActive,
          ],
        },
      );

      const transactionHash = await writeContract(
        wagmiConfig.config.value as Config,
        request,
      );
      console.log(transactionHash);
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
      class={`h-full w-96 gap-6 border-l border-white/10 bg-white/3 p-6 duration-500 ease-in ${automationPageContext.isDraverOpen ? "" : ""}`}
    >
      {automationPageContext.isDraverOpen.value ? (
        <>
          <Header variant="h4" text="Properties" />
          <div class="my-4 flex flex-col gap-2">
            <div>
              <Label name="Token In" class="my-2 block" />
              <Select
                id="TriggerDrawenTokenIn"
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
                id="TriggerDrawenTokenOut"
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
                onValueChange={$((value: string) => {
                  addModalStore.tokenOut = value;
                })}
              />
            </div>
            <div>
              <Label name="Amount In" class="my-2 block" />
              <Input
                id="TriggerDrawenAmountIn"
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
                id="TriggerDrawenAddressFrom"
                name="AddressFrom"
                options={[
                  { value: "", text: "Select wallet" },
                  ...observedWallets.value.map((wallet: any) => {
                    return {
                      text: wallet.walletName,
                      value: wallet.wallet.address,
                    };
                  }),
                ]}
                onValueChange={$((value: string) => {
                  addModalStore.from = value;
                })}
              />
            </div>
            <div>
              <Label name="Address to" class="my-2 block" />
              <Input
                id="TriggerDrawenAddressTo"
                name="to"
                placeholder="Address to send coins to"
                value={addModalStore.to}
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
                id="TriggerDrawenDateTimeLocal"
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
                id="TriggerDrawenDurationInterval"
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
                onValueChange={$((value: number) => {
                  addModalStore.interval = value;
                })}
              />
            </div>
            <div>
              <Label name="How many" class="my-2 block" />
              <Input
                id="TriggerDrawenDurationCount"
                name="durationCount"
                placeholder="0"
                value={addModalStore.durationCount}
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
                try {
                  await handleAddAutomation();
                  automationPageContext.isDraverOpen.value = false;
                } catch (err) {
                  console.log(err);
                }
              })}
            />
          </div>
        </>
      ) : null}
    </div>
  );
});
