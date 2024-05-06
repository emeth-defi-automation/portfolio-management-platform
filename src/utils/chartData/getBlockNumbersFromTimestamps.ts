import { server$ } from "@builder.io/qwik-city";
import Moralis from "moralis";
import { EvmChain } from "@moralisweb3/common-evm-utils";

export const getBlockNumbersFromTimestamps = server$(async function (
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
