import { server$, type RequestHandler } from "@builder.io/qwik-city";
import type WebSocketStrategy from "surrealdb.js";
import { checksumAddress } from "viem";
import { connectToDB } from "~/utils/db";
import Moralis from "moralis";
import {EvmChain} from "@moralisweb3/common-evm-utils";
import {convertWeiToQuantity} from "~/utils/formatBalances/formatTokenBalance";

export const onPost: RequestHandler = async ({ request, env, json }) => {
  try {
    const db = await connectToDB(env);
    const webhook = await request.json();


    const transfers = webhook["erc20Transfers"];
    console.log(transfers)
    console.log('------------------------------------------')
    if (transfers) {
      for (const transfer of transfers) {
        const { transactionHash, from, to, tokenSymbol, triggers } = transfer;
        for (const trigger of triggers) {
          if (trigger.name === "fromBalance") {
            if(from !== process.env["export PUBLIC_EMETH_CONTRACT_ADDRESS_SEPOLIA"]) {
              await updateBalanceIfExists(db, from, tokenSymbol, trigger.value);
              await updateBalance(db, transactionHash, from)
            }
          } else {
            if(to !== process.env["export PUBLIC_EMETH_CONTRACT_ADDRESS_SEPOLIA"]) {
              await updateBalance(db, transactionHash, to)
              await updateBalanceIfExists(db, to, tokenSymbol, trigger.value);
            }
          }
        }
      }
    }
    json(200, {});
  } catch (err) {
    console.error(err);
  }
};
// //TODO ta funkcja jest do rozbudowy.
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

const updateBalance = server$(async function (db: WebSocketStrategy, tx: string, walletAddress: string) {
  console.log(tx)
  const response: any = await Moralis.EvmApi.transaction.getTransaction({
    chain: EvmChain.SEPOLIA,
    transactionHash: tx
  })

    const blockResponse: any = await Moralis.EvmApi.token.getWalletTokenBalances({
    chain: EvmChain.SEPOLIA.hex,
    toBlock: parseInt(response.raw.block_number),
    tokenAddresses: [
      "0x054E1324CF61fe915cca47C48625C07400F1B587",
      "0xD418937d10c9CeC9d20736b2701E506867fFD85f",
      "0x9D16475f4d36dD8FC5fE41F74c9F44c7EcCd0709",
    ],
    address: walletAddress,
  });

  if(blockResponse.raw.length > 0) {
  const currentBalance: { [key: string]: string } = {};
  // @ts-ignore
  blockResponse?.jsonResponse.forEach((entry: any) => {
    currentBalance[entry.token_address] = convertWeiToQuantity(
      entry.balance,
      parseInt(entry.decimals),
    );
  });

  const tokenAddresses = {
    GLM: "0x054e1324cf61fe915cca47c48625c07400f1b587",
    USDC: "0xd418937d10c9cec9d20736b2701e506867ffd85f",
    USDT: "0x9d16475f4d36dd8fc5fe41f74c9f44c7eccd0709",
  };

  const dbObject = {
    blockNumber: response.raw.block_number,
    timestamp: response.raw.block_timestamp,
    walletAddress: walletAddress,
    [tokenAddresses.GLM]: currentBalance[tokenAddresses.GLM]
      ? currentBalance[tokenAddresses.GLM]
      : "0",
    [tokenAddresses.USDC]: currentBalance[tokenAddresses.USDC]
      ? currentBalance[tokenAddresses.USDC]
      : "0",
    [tokenAddresses.USDT]: currentBalance[tokenAddresses.USDT]
      ? currentBalance[tokenAddresses.USDT]
      : "0",
  };

  await db.create("wallet_balance", dbObject);
  }

})
