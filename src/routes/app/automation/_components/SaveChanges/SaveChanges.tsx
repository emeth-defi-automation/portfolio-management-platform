import { $, component$, useContext } from "@builder.io/qwik";
import Button from "~/components/Atoms/Buttons/Button";
import IconError from "@material-design-icons/svg/filled/error_outline.svg?jsx";
import ParagraphAnnotation from "~/components/Molecules/ParagraphAnnotation/ParagraphAnnotation";
import { AutomationPageContext } from "../../AutomationPageContext";
import { messagesContext } from "~/routes/app/layout";
import { WagmiConfigContext } from "~/components/WalletConnect/context";
import { emethContractAbi } from "~/abi/emethContractAbi";
import { simulateContract, writeContract } from "@wagmi/core";
import { addressToUint256 } from "~/utils/automations";
import { convertToFraction } from "~/utils/fractions";
import { getTokenDecimalsServer } from "~/database/tokens";
// import { server$ } from "@builder.io/qwik-city";
// import { connectToDB } from "~/database/db";

// const updateActionDeployedStatus = server$(
//   async function (automationId, user, actionId, deployedStatus) {
//     const query = `
//     UPDATE automations
//     SET actions = (
//       SELECT array::replace(actions, actions[$index], merge(actions[$index], { deployed: $deployedStatus }))
//       FROM actions
//       LET $index = array::find(actions, id = $actionId)
//     )
//     WHERE actionId = $automationId AND user = $user;
//   `;
//     const db = await connectToDB(this.env);

//     await db.query(query, {
//       automationId,
//       user,
//       actionId,
//       deployedStatus,
//     });
//   },
// );

export const SaveChanges = component$(() => {
  const automationPageContext = useContext(AutomationPageContext);
  const formMessageProvider = useContext(messagesContext);
  const wagmiConfig = useContext(WagmiConfigContext);

  const handleSaveAutomations = $(async () => {
    const emethContractAddress = import.meta.env
      .PUBLIC_EMETH_CONTRACT_ADDRESS_SEPOLIA as `0x${string}`;
    const swapAutomationContractAddress = import.meta.env
      .PUBLIC_SWAP_CONTRACT_ADDRESS as `0x${string}`;
    const transferAutomationContractAddress = import.meta.env
      .PUBLIC_TRANSFER_CONTRACT_ADDRESS as `0x${string}`;

    const actions = automationPageContext.activeAutomation.value.actions;
    const trigger = automationPageContext.activeAutomation.value.trigger;

    const user = localStorage.getItem("emmethUserWalletAddress");
    if (wagmiConfig.config.value && user) {
      for (const action of actions) {
        try {
          formMessageProvider.messages.push({
            id: formMessageProvider.messages.length,
            variant: "info",
            message: `Deploying ${action.actionName}`,
            isVisible: true,
          });
          let callData;
          let transfers;
          let _contractAddress;
          if (action.actionType === "Transfer") {
            _contractAddress =
              transferAutomationContractAddress as `0x${string}`;
            transfers = action.argsArray.map((item: any) => {
              return {
                from: item.from as `0x${string}`,
                token: item.token as `0x${string}`,
                amountIn: BigInt(item.amount),
              };
            });

            const length = BigInt(transfers.length);
            const ownerAddress = addressToUint256(trigger.user);
            const initialized = BigInt(1);
            const duration = BigInt(trigger.duration);
            const timeZero = BigInt(trigger.timeZero);
            const isActive = BigInt(
              automationPageContext.activeAutomation.value.isActive ? 1 : 0,
            );
            const uintTransfersArray = [
              length,
              ...action.argsArray.map((item: any) => {
                const arr = [
                  BigInt(addressToUint256(item.token)),
                  BigInt(addressToUint256(item.from)),
                  BigInt(addressToUint256(item.to)),
                  BigInt(item.amount),
                ];
                return arr;
              }),
            ].flat(Infinity);
            const transferArray = uintTransfersArray.map((item) =>
              BigInt(item),
            );
            callData = [
              BigInt(ownerAddress),
              BigInt(initialized),
              BigInt(duration),
              BigInt(timeZero),
              BigInt(isActive),
              ...transferArray,
            ];
          } else {
            _contractAddress = swapAutomationContractAddress as `0x${string}`;

            const tokenValueFraction = convertToFraction(
              action.chosenToken.value,
            );
            const chosenTokenDecimals = await getTokenDecimalsServer(
              action.chosenToken.address,
            );
            const valueIn =
              (BigInt(tokenValueFraction.numerator) *
                BigInt(10) ** BigInt(chosenTokenDecimals[0])) /
              BigInt(tokenValueFraction.denominator);
            transfers = [
              {
                from: action.addressToSwapFrom as `0x${string}`,
                token: action.chosenToken.address as `0x${string}`,
                amountIn: BigInt(valueIn),
              },
            ];

            const ownerAddress = addressToUint256(trigger.user);
            const initialized = BigInt(1);
            const duration = BigInt(trigger.duration);
            const timeZero = BigInt(trigger.timeZero);
            const tokenIn = addressToUint256(action.chosenToken.address);
            const tokenOut = addressToUint256(action.tokenToSwapOn.address);
            const amountInFraction = convertToFraction(
              action.chosenToken.value,
            );
            const tokenInDecimals = await getTokenDecimalsServer(
              action.chosenToken.address,
            );
            const amountIn =
              (BigInt(amountInFraction.numerator) *
                BigInt(10) ** BigInt(tokenInDecimals[0])) /
              BigInt(amountInFraction.denominator);
            const from = addressToUint256(action.addressToSwapFrom);
            const to = addressToUint256(action.accountToSendTokens);
            const isActive = BigInt(
              automationPageContext.activeAutomation.value.isActive ? 1 : 0,
            );
            callData = [
              ownerAddress,
              initialized,
              duration,
              timeZero,
              tokenIn,
              tokenOut,
              amountIn,
              from,
              to,
              isActive,
            ];
            console.log(callData);
            console.log(transfers);
            console.log(_contractAddress);
          }

          const actionId = BigInt(action.actionId);

          const { request } = await simulateContract(wagmiConfig.config.value, {
            abi: emethContractAbi,
            address: emethContractAddress,
            functionName: "addActionExternal",
            args: [actionId, _contractAddress, transfers, callData],
          });

          const transactionHash = await writeContract(
            wagmiConfig.config.value,
            request,
          );

          // await updateActionDeployedStatus(
          //   `${automationPageContext.activeAutomation.value.automationId}`,
          //   user,
          //   `${actionId}`,
          //   true,
          // );
          console.log("hash: ", transactionHash);
          formMessageProvider.messages.push({
            id: formMessageProvider.messages.length,
            variant: "success",
            message: `Deployed ${action.actionName}`,
            isVisible: true,
          });
        } catch (err) {
          console.log(err);
          formMessageProvider.messages.push({
            id: formMessageProvider.messages.length,
            variant: "error",
            message: `Could not deploy ${action.actionName}.`,
            isVisible: true,
          });
        }
      }
      console.log("DONE!");
    }
  });

  return (
    <ParagraphAnnotation
      hasIconBox={true}
      iconBoxBorder="clear"
      customClass="absolute bottom-0 left-0 h-20 border-t border-white/10 bg-white/3 p-6"
      iconBoxCustomClass="p-0 w-7"
      iconBoxCustomIcon={<IconError class="h-7 w-7 fill-white" />}
      textBoxClass="max-w-[290px]"
      annotationVariant="white"
      annotationText="Remember, saving changes sends a transaction to the blockchain and incurs a gas fee."
    >
      <Button
        size="small"
        text="Save Changes"
        customClass="font-normal"
        onClick$={async () => {
          await handleSaveAutomations();
        }}
      />
    </ParagraphAnnotation>
  );
});
