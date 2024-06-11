import { server$ } from "@builder.io/qwik-city";
import { EvmChain } from "@moralisweb3/common-evm-utils";
import Moralis from "moralis";

/**
 * This asynchronous function retrieves ERC20 token transfers for a given wallet address.
 * It uses the Moralis EvmApi to fetch the transfers, and concatenates the results to an array.
 * If a cursor is provided in the response, the function calls itself recursively with the new cursor to fetch more transfers.
 * 
 * @param {string | null} cursor - The cursor for pagination, or null for the first page.
 * @param {string} address - The wallet address to fetch transfers for.
 * @returns {Promise<any[]>} A promise that resolves to an array of all token transfers.
 * @throws {Error} If an error occurs during the API call, it is logged to the console.
 */
export async function getErc20TokenTransfers(
  cursor: string | null,
  address: string,
) {
  let allEntries: any = [];
  try {
    const response = await Moralis.EvmApi.token.getWalletTokenTransfers({
      chain: EvmChain.SEPOLIA.hex,
      order: "ASC",
      cursor: cursor as string,
      contractAddresses: [
        "0x054E1324CF61fe915cca47C48625C07400F1B587",
        "0xD418937d10c9CeC9d20736b2701E506867fFD85f",
        "0x9D16475f4d36dD8FC5fE41F74c9F44c7EcCd0709",
      ],
      address: address,
    });
    allEntries = allEntries.concat(response.raw.result);

    if (response.raw.cursor) {
      allEntries = allEntries.concat(
        await getErc20TokenTransfers(response.raw.cursor, address),
      );
    }
  } catch (error) {
    console.error(error);
  }
  return allEntries;
}

/**
 * This asynchronous function retrieves the token balances of a wallet at a specific block.
 * It uses the Moralis EvmApi to fetch the balances for specific tokens (identified by their contract addresses).
 * 
 * @param {string} block - The block number at which to fetch the balances.
 * @param {string} address - The wallet address to fetch balances for.
 * @returns {Promise<any> | undefined} A promise that resolves to the wallet's token balances at the specified block, or undefined if an error occurs.
 */
export async function getWalletBalance(block: string, address: string) {
  try {
    return Moralis.EvmApi.token.getWalletTokenBalances({
      chain: EvmChain.SEPOLIA.hex,
      toBlock: parseInt(block),
      tokenAddresses: [
        "0x054E1324CF61fe915cca47C48625C07400F1B587",
        "0xD418937d10c9CeC9d20736b2701E506867fFD85f",
        "0x9D16475f4d36dD8FC5fE41F74c9F44c7EcCd0709",
      ],
      address: address,
    });
  } catch (error) {
    console.error(error);
  }
}

/**
 * Adds an address to the stream configuration.
 *
 * @param streamId The ID of the stream to which the address should be added.
 * @param address The address to add to the stream configuration.
 */

export const addAddressToStreamConfig = server$(async function (
  streamId: string,
  address: string,
) {
  await Moralis.Streams.addAddress({ id: streamId, address });
});

/**
 * Retrieves the balance of Moralis tokens associated with a specific wallet address.
 *
 * @param data The data object containing the wallet address.
 * @param data.wallet The wallet address for which to retrieve the Moralis token balances.
 * @returns An object containing information about the Moralis token balances.
 */

export const getMoralisBalance = server$(async (data) => {
  const walletAddress = data.wallet;

  const response = await Moralis.EvmApi.token.getWalletTokenBalances({
    chain: EvmChain.SEPOLIA.hex,
    tokenAddresses: [
      "0x054E1324CF61fe915cca47C48625C07400F1B587",
      "0xD418937d10c9CeC9d20736b2701E506867fFD85f",
      "0x9D16475f4d36dD8FC5fE41F74c9F44c7EcCd0709",
    ],
    address: `${walletAddress}`,
  });

  const rawResponse = response.raw;
  return { tokens: rawResponse };
});