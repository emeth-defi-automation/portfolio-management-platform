import { createContextId, type Signal } from "@builder.io/qwik";

export interface AutomationPageInterface {
  automations: Signal<any | null>;
  activeAutomation: Signal<any | null>;
  isDraverOpen: Signal<boolean>;
  sideDraverVariant: Signal<string>;
  addSwapModalOpen: Signal<boolean>;
  addTransferModalOpen: Signal<boolean>;
}

export const AutomationPageContext = createContextId<AutomationPageInterface>(
  "automation-page-context",
);

// <div>
// <Label name="Token In" class="my-2 block" />
// <Select
//   id="TriggerDrawenTokenIn"
//   name="tokenIn"
//   options={[
//     {
//       text: "Chose token to swap",
//       value: "",
//     },
//     {
//       text: "USDC",
//       value: "0xD418937d10c9CeC9d20736b2701E506867fFD85f",
//     },
//     {
//       text: "USDT",
//       value: "0x9D16475f4d36dD8FC5fE41F74c9F44c7EcCd0709",
//     },
//   ]}
//   onValueChange={$((value: string) => {
//     addTriggerStore.tokenIn = value;
//   })}
// />
// </div>
// <div>
// <Label name="Token Out" class="my-2 block" />
// <Select
//   id="TriggerDrawenTokenOut"
//   name="tokenOut"
//   options={[
//     {
//       text: "Chose token swap on",
//       value: "",
//     },
//     {
//       text: "USDC",
//       value: "0xD418937d10c9CeC9d20736b2701E506867fFD85f",
//     },
//     {
//       text: "USDT",
//       value: "0x9D16475f4d36dD8FC5fE41F74c9F44c7EcCd0709",
//     },
//   ]}
//   onValueChange={$((value: string) => {
//     addTriggerStore.tokenOut = value;
//   })}
// />
// </div>

// <div>
// <Label name="Amount In" class="my-2 block" />
// <Input
//   id="TriggerDrawenAmountIn"
//   name="amountIn"
//   placeholder="enter amountIn"
//   value={addTriggerStore.amountIn}
//   type="number"
//   onInput={$((e) => {
//     const target = e.target;
//     addTriggerStore.amountIn = target.value;
//   })}
// />
// </div>

// <div>
// <Label name="Address From" class="my-2 block" />
// <Select
//   id="TriggerDrawenAddressFrom"
//   name="AddressFrom"
//   options={[
//     { value: "", text: "Select wallet" },
//     ...observedWallets.value.map((wallet: any) => {
//       return {
//         text: wallet.walletName,
//         value: wallet.wallet.address,
//       };
//     }),
//   ]}
//   onValueChange={$((value: string) => {
//     addTriggerStore.from = value;
//   })}
// />
// </div>
// <div>
// <Label name="Address to" class="my-2 block" />
// <Input
//   id="TriggerDrawenAddressTo"
//   name="to"
//   placeholder="Address to send coins to"
//   value={addTriggerStore.to}
//   type="text"
//   onInput={$((e) => {
//     const target = e.target;
//     addTriggerStore.to = target.value;
//   })}
// />
// </div>
