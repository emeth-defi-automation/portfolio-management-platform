import { server$ } from "@builder.io/qwik-city";
import { EvmChain } from "@moralisweb3/common-evm-utils";
import Moralis from "moralis";

interface TokenPrices {
  tokenSymbol: string;
  usdPrice: number;
}

export const getTokenPricesForCharts = server$(async function (
  blockNumber: number,
): Promise<TokenPrices[]> {
  const tokenPrices: TokenPrices[] = [];
  const result = await Moralis.EvmApi.token.getMultipleTokenPrices(
    {
      chain: EvmChain.ETHEREUM.hex,
    },
    {
      tokens: [
        {
          tokenAddress: "0x7DD9c5Cba05E151C895FDe1CF355C9A1D5DA6429",
          toBlock: blockNumber.toString(),
        },
        {
          tokenAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
          toBlock: blockNumber.toString(),
        },
        {
          tokenAddress: "0xdac17f958d2ee523a2206206994597c13d831ec7",
          toBlock: blockNumber.toString(),
        },
      ],
    },
  );
  for (let i = 0; i < result.raw.length; i++) {
    tokenPrices.push({
      tokenSymbol: result.raw[i].tokenSymbol ?? "",
      usdPrice: result.raw[i].usdPrice,
    });
  }
  return tokenPrices;
});
