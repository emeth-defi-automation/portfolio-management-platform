import { server$ } from "@builder.io/qwik-city";
import { EvmChain } from "@moralisweb3/common-evm-utils";
import Moralis from "moralis";
import { connectToDB } from "~/database/db";
import { type Token } from "~/interface/token/Token";
import { mapTokenAddress } from "../mapTokenAddress";

interface TokenPrices {
  tokenSymbol: string;
  usdPrice: number;
}

export const getTokenPricesForCharts = server$(async function (
  blockNumber: number,
): Promise<TokenPrices[]> {
  const db = await connectToDB(this.env);
  const tokens = await db.select<Token>("token");
  const tokenPrices: TokenPrices[] = [];
  for (const token of tokens) {
    const ethAddress = mapTokenAddress(token.address);
    const result = await Moralis.EvmApi.token.getTokenPrice({
      chain: EvmChain.ETHEREUM,
      address: ethAddress,
      toBlock: blockNumber,
    });
    tokenPrices.push({
      tokenSymbol: token.symbol,
      usdPrice: result.raw.usdPrice,
    });
  }
  return tokenPrices;
});
