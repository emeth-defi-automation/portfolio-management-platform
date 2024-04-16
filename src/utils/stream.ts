import { server$ } from "@builder.io/qwik-city";
import { EvmChain } from "@moralisweb3/common-evm-utils";
import Moralis from "moralis";

let _stream: any;

export async function getStream() {
  if (!_stream) {
    throw new Error("Stream not set");
  }
  return _stream;
}

export async function initializeStreamIfNeeded(factory: () => Promise<any>) {
  if (!_stream) {
    _stream = await factory();
  }
}

export const setupStream = server$(async function () {
  const balanceOfSenderABI = {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "balanceOf",
    outputs: [
      { internalType: "uint256", name: "fromBalance", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  };

  const balanceOfReceiverABI = {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "toBalance", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  };

  const triggerFrom = {
    contractAddress: "$contract",
    functionAbi: balanceOfSenderABI,
    inputs: ["$from"],
    type: "erc20transfer" as const,
  };

  const triggerTo = {
    contractAddress: "$contract",
    functionAbi: balanceOfReceiverABI,
    inputs: ["$to"],
    type: "erc20transfer" as const,
  };

  const allowanceABI = {
    inputs: [
      { internalType: "address", name: "owner", type: "address" },
      { internalType: "address", name: "spender", type: "address" },
    ],
    name: "allowance",
    outputs: [
      { internalType: "uint256", name: "remainingAllowance", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  };

  const triggerAllowanceFrom = {
    contractAddress: "$contract",
    functionAbi: allowanceABI,
    inputs: ["$from", "0x9B2985a026c243A5133AaE819544ADb213366D7F"],
    type: "erc20transfer" as const,
  };

  const triggers = [triggerFrom, triggerTo, triggerAllowanceFrom];

  const ERC20TransferABI = [
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "src",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "dst",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "wad",
          type: "uint256",
        },
      ],
      name: "Transfer",
      type: "event",
    },
  ];

  const moralisApiKey = this.env.get("MORALIS_API_KEY");

  if (!moralisApiKey) {
    console.error("MORALIS_API_KEY is not set in the environment variables.");
    return;
  }

  if (!Moralis.Core.isStarted) {
    await Moralis.start({ apiKey: moralisApiKey });
  }

  const ngrokWebhookUrl = this.env.get("NGROK_WEBHOOK_URL");
  if (!ngrokWebhookUrl) {
    console.error("NGROK_WEBHOOK_URL is not set in the environment variables.");
    return;
  }

  const streams = await Moralis.Streams.getAll({
    limit: 10,
  });
  const jsonStream = streams
    .toJSON()
    .result.find((s) => s.webhookUrl === this.env.get("NGROK_WEBHOOK_URL"));

  let newStream;

  if (jsonStream != undefined) {
    newStream = await Moralis.Streams.getById({
      id: jsonStream.id,
    });
  } else {
    newStream = await Moralis.Streams.add({
      chains: [EvmChain.SEPOLIA.hex],
      description: "Listen for Transfers",
      tag: "transfers",
      includeNativeTxs: true,
      abi: ERC20TransferABI,
      includeContractLogs: true,
      topic0: ["Transfer(address,address,uint256)"],
      webhookUrl: ngrokWebhookUrl,
      triggers: triggers,
      getNativeBalances: [
        {
          selectors: ["$fromAddress", "$toAddress"],
          type: "tx",
        },
      ],
    });
  }

  _stream = newStream;
  return newStream;
});
