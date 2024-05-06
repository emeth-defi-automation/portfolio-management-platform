import { z } from "@builder.io/qwik-city";
import { type Surreal } from "surrealdb.js";

export const ObservedWalletsQueryResult = z.object({
  walletAddress: z.string(),
  walletId: z.string(),
});
export type ObservedWalletsQueryResult = z.infer<
  typeof ObservedWalletsQueryResult
>;

export const getUsersObservedWallets = async (db: Surreal, userId: string) => {
  const result = (
    await db.query(
      `SELECT out.address AS walletAddress, out.id AS walletId FROM ${userId}->observes_wallet;`,
    )
  ).at(0);

  if (!result) throw new Error("No observed wallets");

  const observedWalletsQueryResult =
    ObservedWalletsQueryResult.array().parse(result);

  return observedWalletsQueryResult;
};
