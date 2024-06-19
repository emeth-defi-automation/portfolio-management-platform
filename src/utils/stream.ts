import { server$ } from "@builder.io/qwik-city";
import { EvmChain } from "@moralisweb3/common-evm-utils";
import Moralis from "moralis";


export const setupMoralis = server$(async function () {
  // const balanceOfSenderABI = {
  //   inputs: [{ internalType: "address", name: "", type: "address" }],
  //   name: "balanceOf",
  //   outputs: [
  //     { internalType: "uint256", name: "fromBalance", type: "uint256" },
  //   ],
  //   stateMutability: "view",
  //   type: "function",
  // };

  // const balanceOfReceiverABI = {
  //   inputs: [{ internalType: "address", name: "", type: "address" }],
  //   name: "balanceOf",
  //   outputs: [{ internalType: "uint256", name: "toBalance", type: "uint256" }],
  //   stateMutability: "view",
  //   type: "function",
  // };

  // const triggerFrom = {
  //   contractAddress: "$contract",
  //   functionAbi: balanceOfSenderABI,
  //   inputs: ["$from"],
  //   type: "erc20transfer" as const,
  // };

  // const triggerTo = {
  //   contractAddress: "$contract",
  //   functionAbi: balanceOfReceiverABI,
  //   inputs: ["$to"],
  //   type: "erc20transfer" as const,
  // };


  const moralisApiKey = this.env.get("MORALIS_API_KEY");

  if (!moralisApiKey) {
    console.error("MORALIS_API_KEY is not set in the environment variables.");
    return;
  }

  if (!Moralis.Core.isStarted) {
    await Moralis.start({ apiKey: moralisApiKey });
  }
});
