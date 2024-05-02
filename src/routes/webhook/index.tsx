import { server$, type RequestHandler } from "@builder.io/qwik-city";
import type WebSocketStrategy from "surrealdb.js";
import { checksumAddress } from "viem";
import { connectToDB } from "~/database/db";
import { indexWalletBalance } from "~/database/balanceHistory";

export const onPost: RequestHandler = async ({ request, env, json }) => {
  try {
    const db = await connectToDB(env);
    const webhook = await request.json();
    const emethContractAddress =
      import.meta.env.PUBLIC_EMETH_CONTRACT_ADDRESS_SEPOLIA.toUpperCase();

    if (webhook.confirmed) {
      const transfers = webhook["erc20Transfers"];
      const { number, timestamp } = webhook["block"];
      if (transfers) {
        for (const transfer of transfers) {
          const {
            from,
            to,
            tokenSymbol,
            triggers,
            transactionHash,
            contract,
            valueWithDecimals,
          } = transfer;
          for (const trigger of triggers.filter(
            (trigger: any) => trigger.value !== "0",
          )) {
            if (from.toUpperCase() !== emethContractAddress) {
              await updateBalanceIfExists(db, from, tokenSymbol, trigger.value);
              await updateBalance(
                db,
                from,
                transactionHash,
                number,
                timestamp,
                contract,
                -parseFloat(valueWithDecimals),
              );
            } else if (to.toUpperCase() !== emethContractAddress) {
              await updateBalanceIfExists(db, to, tokenSymbol, trigger.value);
              await updateBalance(
                db,
                to,
                transactionHash,
                number,
                timestamp,
                contract,
                parseFloat(valueWithDecimals),
              );
            }
          }
        }
      }
      json(200, {});
    }
  } catch (err) {
    console.error(err);
  }
};

const updateBalanceIfExists = server$(async function (
  db: WebSocketStrategy,
  address: string,
  tokenSymbol: string,
  value: string,
) {
  await db.query(
    `UPDATE balance SET value = '${value}' WHERE ->(for_wallet WHERE out.address = '${checksumAddress(address as `0x${string}`)}') AND ->(for_token WHERE out.symbol = '${tokenSymbol}');`,
  );
});

const updateBalance = server$(async function (
  db: WebSocketStrategy,
  walletAddress: string,
  transactionHash: string,
  blockNumber: string,
  timestamp: number,
  tokenAddress: string,
  value: number,
) {
  const tokenChecksum = checksumAddress(tokenAddress as `0x${string}`);
  const walletChecksum = checksumAddress(walletAddress as `0x${string}`);
  const isoTimestamp = new Date(timestamp * 1000).toISOString();
  await indexWalletBalance(
    db,
    tokenChecksum,
    walletChecksum,
    isoTimestamp,
    blockNumber,
    transactionHash,
    value,
  );
});
