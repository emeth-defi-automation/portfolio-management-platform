import { type Token } from "~/interface/token/Token";
import { testPublicClient } from "~/routes/app/wallets/testconfig";
import { contractABI } from "~/abi/abi";
import { server$ } from "@builder.io/qwik-city";
import { connectToDB } from "~/database/db";

export const getCurrentBalance = server$(async function (
  walletAddress: string,
): Promise<TokenBalance[]> {
  const db = await connectToDB(this.env);
  const tokensBalance: TokenBalance[] = [];
  try {
    const tokens = await db.select<Token>("token");
    for (const token of tokens) {
      const readBalance = await testPublicClient.readContract({
        address: token.address as `0x${string}`,
        abi: contractABI,
        functionName: "balanceOf",
        args: [walletAddress as `0x${string}`],
      });

      tokensBalance.push({
        symbol: token.symbol,
        balance: readBalance.toString(),
      });
    }
  } catch (err) {
    console.log("Error in getCurrentBalance:", err);
  }
  return tokensBalance;
});

export type TokenBalance = {
  symbol: string;
  balance: string;
};
