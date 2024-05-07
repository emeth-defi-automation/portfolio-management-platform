import { server$ } from "@builder.io/qwik-city";
import { EvmChain } from "@moralisweb3/common-evm-utils";
import Moralis from "moralis";

export const getERC20Transfers = server$(async function (
  walletAddress: string,
  block: number,
  cursor: string | null,
) {
  const getTransfersResponse =
    await Moralis.EvmApi.token.getWalletTokenTransfers({
      chain: EvmChain.SEPOLIA,
      order: "DESC",
      address: `${walletAddress}`,
      limit: 200,
      toBlock: block,
      contractAddresses: [
        "0x054E1324CF61fe915cca47C48625C07400F1B587",
        "0xD418937d10c9CeC9d20736b2701E506867fFD85f",
        "0x9D16475f4d36dD8FC5fE41F74c9F44c7EcCd0709",
      ],
      cursor: `${cursor}`,
    });
  return getTransfersResponse;
});
