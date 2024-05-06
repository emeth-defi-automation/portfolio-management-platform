import { server$, z } from "@builder.io/qwik-city";
import { connectToDB } from "~/database/db";
import { getUserId } from "../balanceHistory/getUserId";
import { getUsersObservedWallets } from "../balanceHistory/getUsersObservedWallets";
import { type Token } from "~/interface/token/Token";

interface TokenBalances {
  tokenSymbol: string;
  value: string;
  tokenDecimals: number;
}

export const TokenBalancecQueryResult = z.object({
  tokenSymbol: z.string(),
  value: z.string(),
  blockNumber: z.string(),
});
export type TokenBalancecQueryResult = z.infer<typeof TokenBalancecQueryResult>;

export const getTokenBalancesForChart = server$(async function (
  blockNumber: number,
): Promise<TokenBalances[]> {
  const db = await connectToDB(this.env);
  const userId = await getUserId();
  const observedWallets = await getUsersObservedWallets(db, userId);
  const tokens = await db.select<Token>("token");
  const tokenBalances: TokenBalances[] = [];
  for (const token of tokens) {
    let partTokenBalance: bigint = 0n;
    for (const wallet of observedWallets) {
      const result = await db.query(`
            SELECT tokenSymbol, value, blockNumber 
            FROM wallet_balance_history 
            WHERE walletId = ${wallet.walletId} AND blockNumber <= ${blockNumber} AND tokenSymbol = ${token.symbol}
            ORDER BY blockNumber DESC
            LIMIT 1
            `);
      const balances = TokenBalancecQueryResult.parse(result);
      partTokenBalance += BigInt(balances.value);
    }
    tokenBalances.push({
      value: partTokenBalance.toString(),
      tokenSymbol: token.symbol,
      tokenDecimals: token.decimals,
    });
  }
  return tokenBalances;
});
