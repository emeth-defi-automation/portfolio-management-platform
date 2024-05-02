import { routeAction$ } from "@builder.io/qwik-city";
import { getErc20TokenTransfers, getWalletBalance } from "~/server/moralis";
import { connectToDB } from "~/database/db";
import { convertWeiToQuantity } from "~/utils/formatBalances/formatTokenBalance";
import {checksumAddress} from "viem";
import {indexWalletBalance} from "~/database/balanceHistory";

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
    const walletTransactions = await getErc20TokenTransfers(
        null,
        data.address as string,
    );
    const walletAddress = checksumAddress(data.address as `0x${string}`)
    const db = await connectToDB(requestEvent.env);

    for (const tx of walletTransactions) {
      const tokenAddress = checksumAddress(tx.address as `0x${string}`)
      const value = tx.to_address.toLowerCase() === walletAddress.toLowerCase() ? parseInt(tx.value_decimal) : -parseInt(tx.value_decimal)
      await indexWalletBalance(db, tokenAddress, walletAddress, tx.block_timestamp, tx.block_number, tx.transaction_hash, value)
    }

});
