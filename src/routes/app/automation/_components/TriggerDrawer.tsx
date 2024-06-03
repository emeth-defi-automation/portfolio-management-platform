import { $, Slot, component$, useContext, useStore } from "@builder.io/qwik";
import Header from "~/components/Atoms/Headers/Header";
import { AutomationPageContext } from "../AutomationPageContext";
import Input from "~/components/Atoms/Input/Input";
import Select from "~/components/Atoms/Select/Select";
import Button from "~/components/Atoms/Buttons/Button";
import Label from "~/components/Atoms/Label/Label";

interface TriggerDrawerProps {}

export const TriggerDrawer = component$<TriggerDrawerProps>(() => {
  const automationPageContext = useContext(AutomationPageContext);
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
    duration: 0,
    interval: 0,
  });
  //   await getObservedWalletBalances()

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
                //   onInput={$((e) => {
                //     const target = e.target;

                //   })}
              />
            </div>

            <div>
              <Label name="Address From" class="my-2 block" />
              <Select
                name="AddressFrom"
                options={[
                  {
                    text: "Chose address to swap from",
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
                //   onValueChange={$((value) => {

                //   })}
              />
            </div>

            <div>
              <Label name="Time Zero" class="my-2 block" />
              <Input type="datetime-local" name="TimeZero" />
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
                //   onInput={$((e) => {
                //     const target = e.target;

                //   })}
              />
            </div>
            <Button
              text="Approve"
              //   onClick$={() => {

              //   }}
            />
          </div>
        </>
      ) : null}
    </div>
  );
});
