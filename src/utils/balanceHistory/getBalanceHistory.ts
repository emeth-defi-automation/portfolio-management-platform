import { server$ } from "@builder.io/qwik-city";
import { connectToDB } from "~/database/db";
import { type TokenBalance } from "./getCurrentBalance";
import { getERC20Transfers } from "./getERC20Transfers";
import {
  EvmChain,
  type GetWalletTokenTransfersResponseAdapter,
} from "@moralisweb3/common-evm-utils";
import Moralis from "moralis";
//check if wallet exists
export const getBalanceHistory = server$(async function (
  currentTokenBalance: TokenBalance[],
  walletAddress: string,
  walletId: string,
) {
  const db = await connectToDB(this.env);
  try {
    const dateNow = new Date();
    const timestamp = await Moralis.EvmApi.block.getDateToBlock({
      chain: EvmChain.SEPOLIA,
      date: dateNow,
    });
    const startingBlock = timestamp.raw.block;
    let cursor = null;
    do {
      const recordList = [];
      const transferHistory: GetWalletTokenTransfersResponseAdapter =
        await getERC20Transfers(walletAddress, startingBlock, cursor);
      for (const token of currentTokenBalance) {
        const filteredHistory = transferHistory.raw.result.filter(
          (item) => item.token_symbol === token.symbol,
        );
        for (const transaction of filteredHistory) {
          const newRecord = {
            timestamp: transaction.block_timestamp,
            blockNumber: transaction.block_number,
            value: token.balance,
            walletId: walletId,
            tokenSymbol: token.symbol,
          };
          recordList.push({ newRecord });
          let newTokenBalance: BigInt = 0n;
          if (transaction.from_address === walletAddress) {
            newTokenBalance = BigInt(token.balance) + BigInt(transaction.value);
          } else {
            newTokenBalance = BigInt(token.balance) - BigInt(transaction.value);
          }
          token.balance = newTokenBalance.toString();
        }
      }
      cursor = transferHistory.pagination.cursor;
      recordList.map(
        async (item) =>
          await db.create("wallet_balance_history", item.newRecord),
      );
    } while (cursor != null && cursor != "");
  } catch (err) {
    console.log("Nasz error");
  }
});
