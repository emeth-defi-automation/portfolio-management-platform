import { EvmChain } from "@moralisweb3/common-evm-utils";
import Moralis from "moralis";

export async function getErc20TokenTransfers(
  cursor: string | null,
  address: string,
) {
  let allEntries: any = [];
  try {
    const response = await Moralis.EvmApi.token.getWalletTokenTransfers({
      chain: EvmChain.SEPOLIA,
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
