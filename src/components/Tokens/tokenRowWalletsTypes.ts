import { z } from "@builder.io/qwik-city";
import { type Surreal } from "surrealdb.js";

export const LiveQueryResult = z.string();
export type LiveQueryResult = z.infer<typeof LiveQueryResult>;
export const createLiveQuery = async (db: Surreal, query: string) => {
  try {
    const [queryResult] = await db.query(query);
    return LiveQueryResult.parse(queryResult);
  } catch (err) {
    console.error("Error creating live query:", err);
    throw new Error("Error creating live query");
  }
};

export const LatestTokenBalance = z.object({
  blockNumber: z.string(),
  id: z.string(),
  timestamp: z.string(),
  tokenSymbol: z.string(),
  walletId: z.string(),
  walletValue: z.string(),
});

export type LatestTokenBalance = z.infer<typeof LatestTokenBalance>;

export const fetchLatestTokenBalance = async (
  db: Surreal,
  tokenSymbol: string,
  walletId: string,
) => {
  try {
    const [[latestBalanceOfTokenForWallet]]: any =
      await db.query(`SELECT * FROM wallet_balance WHERE tokenSymbol = '${tokenSymbol}' 
    AND walletId = ${walletId} ORDER BY timestamp DESC LIMIT 1;`);
    if (!latestBalanceOfTokenForWallet) return undefined;
    return LatestTokenBalance.parse(latestBalanceOfTokenForWallet);
  } catch (err) {
    console.error("Error fetching token balance:", err);
    throw new Error("Error fetching token balance");
  }
};

export const LatestTokenPrice = z.object({
  id: z.string(),
  price: z.string(),
  symbol: z.string(),
  timestamp: z.string(),
});

export const fetchLatestTokenPrice = async (
  db: Surreal,
  tokenSymbol: string,
) => {
  try {
    const [[latestTokenPrice]]: any = await db.query(
      `SELECT * FROM token_price_history WHERE symbol = '${tokenSymbol}' ORDER BY timestamp DESC LIMIT 1;`,
    );
    return LatestTokenPrice.parse(latestTokenPrice);
  } catch (err) {
    console.error("Error fetching token balance:", err);
    throw new Error("Error fetching token balance");
  }
};
