import { server$ } from "@builder.io/qwik-city";
import Moralis from "moralis";
import { EvmChain } from "@moralisweb3/common-evm-utils";

export const getEthBlockNumbersFromTimestamps = server$(async function (
  timestamps: string[],
): Promise<number[]> {
  let ethBlocks: number[] = [];
  try {
    const ethPromiseArray = timestamps.map(async (item) => {
      const ethBlockDetails = await Moralis.EvmApi.block.getDateToBlock({
        chain: EvmChain.ETHEREUM.hex,
        date: item,
      });
      return ethBlockDetails.raw.block;
    });
    ethBlocks = await Promise.all(ethPromiseArray);
  } catch (error) {
    console.error("Error occurred when fetching Eth block details", error);
  }
  return ethBlocks;
});

export const getSepBlockNumbersFromTimestamps = server$(async function (
  timestamps: string[],
): Promise<number[]> {
  let sepBlocks: number[] = [];
  try {
    const sepPromiseArray = timestamps.map(async (item) => {
      const sepBlockDetails = await Moralis.EvmApi.block.getDateToBlock({
        chain: EvmChain.SEPOLIA.hex,
        date: item,
      });
      return sepBlockDetails.raw.block;
    });
    sepBlocks = await Promise.all(sepPromiseArray);
  } catch (error) {
    console.error("Error occurred when fetching Sep block details", error);
  }
  return sepBlocks;
});
