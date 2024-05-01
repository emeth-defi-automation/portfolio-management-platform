import { routeAction$ } from "@builder.io/qwik-city";
import { getErc20TokenTransfers, getWalletBalance } from "~/server/moralis";
import { connectToDB } from "~/database/db";
import { convertWeiToQuantity } from "~/utils/formatBalances/formatTokenBalance";
import {checksumAddress} from "viem";

/**
 * This function is used to get the balance history of a wallet. It fetches the ERC20 token transfers
 * for the wallet, then for each transaction, it gets the wallet balance at the block number of the transaction
 * and stores it in the balance history. It then iterates over the responses, converting the balance from Wei to a
 * more readable format and storing the balance for each token at each block in the database.
 *
 * @param {Object} data - The data object (wallet).
 * @param {string} data.address - The address of the wallet.
 * @returns {Promise<void>} A promise that resolves when the function has completed.
 */
// eslint-disable-next-line qwik/loader-location
export const useGetBalanceHistory = routeAction$(async (data, requestEvent) => {
    const balanceHistory: any[] = [];

    const walletTransactions = await getErc20TokenTransfers(
        null,
        data.address as string,
    );
    const walletAddress = checksumAddress(data.address as `0x${string}`)
    const db = await connectToDB(requestEvent.env);

    const responses: any[] = [];
    for (const tx of walletTransactions) {
      try {
      const tokenAddress = checksumAddress(tx.address as `0x${string}`)
      const value = tx.to_address.toLowerCase() === walletAddress.toLowerCase() ? parseInt(tx.value_decimal) : -parseInt(tx.value_decimal)
      const query = await db.query(`
        LET $value =
        SELECT timestamp, value
        FROM wallet_balance
        WHERE id IN (
          SELECT VALUE in FROM token_balance
          WHERE out IN (
            SELECT VALUE id FROM token
            WHERE address = '${tokenAddress}'))
        AND id IN (
          SELECT VALUE in FROM wallet_token_balance
          WHERE out IN (
            SELECT VALUE id FROM wallet
            WHERE address = '${walletAddress}'))
        AND timestsamp <= '${tx.block_timestamp}'
        ORDER BY timestamp DESC
        LIMIT 1;

        LET $balance = (CREATE wallet_balance SET
        blockNumber = '${tx.block_number}',
        timestamp = '${tx.block_timestamp}',
        transactionHash = '${tx.transaction_hash}',
        value = IF $value[0].value = NONE THEN (RETURN ${value}) ELSE ($value[0].value + ${value}) END);

        RELATE ONLY ($balance.id) ->token_balance-> (RETURN SELECT id FROM token WHERE address = '${tokenAddress}');
        RELATE ONLY ($balance.id) ->wallet_token_balance-> (RETURN SELECT id FROM wallet WHERE address = '${walletAddress}');
      `)

      } catch (e) {
        console.log(e)
      }
    }

    const cookie = requestEvent.cookie.get("accessToken");

    // if (!cookie) {
    //     throw new Error("No cookie found");
    // }

    // const tokenAddresses = {
    //     GLM: "0x054e1324cf61fe915cca47c48625c07400f1b587",
    //     USDC: "0xd418937d10c9cec9d20736b2701e506867ffd85f",
    //     USDT: "0x9d16475f4d36dd8fc5fe41f74c9f44c7eccd0709",
    // };

    // for (let i = 0; i < responses.length; i++) {
    //     const currentBalance: { [key: string]: string } = {};
    //     // @ts-ignore
    //     responses[i]?.jsonResponse.forEach((entry: any) => {
    //         currentBalance[entry.token_address] = convertWeiToQuantity(
    //             entry.balance,
    //             parseInt(entry.decimals),
    //         );
    //     });
    //
    //     const dbObject = {
    //         blockNumber: balanceHistory[i].blockNumber,
    //         timestamp: balanceHistory[i].timestamp,
    //         walletAddress: data.address,
    //         [tokenAddresses.GLM]: currentBalance[tokenAddresses.GLM]
    //             ? currentBalance[tokenAddresses.GLM]
    //             : "0",
    //         [tokenAddresses.USDC]: currentBalance[tokenAddresses.USDC]
    //             ? currentBalance[tokenAddresses.USDC]
    //             : "0",
    //         [tokenAddresses.USDT]: currentBalance[tokenAddresses.USDT]
    //             ? currentBalance[tokenAddresses.USDT]
    //             : "0",
    //     };
    //
    //     await db.create("wallet_balance", dbObject);
    // }
});
