import { server$, type RequestHandler } from "@builder.io/qwik-city";
import type WebSocketStrategy from "surrealdb.js";
import { checksumAddress } from "viem";
import { connectToDB } from "~/utils/db";
import Moralis from "moralis";
import { EvmChain } from "@moralisweb3/common-evm-utils";
import { convertWeiToQuantity } from "~/utils/formatBalances/formatTokenBalance";

export const onPost: RequestHandler = async ({ request, env, json }) => {
  try {
    const db = await connectToDB(env);
    const webhook = await request.json();
    const emethContractAddress =
      import.meta.env.PUBLIC_EMETH_CONTRACT_ADDRESS_SEPOLIA.toUpperCase();

    const transfers = webhook["erc20Transfers"];
    const { number, timestamp } = webhook["block"];
    if (transfers) {
      for (const transfer of transfers) {
        const { from, to, tokenSymbol, triggers } = transfer;
        for (const trigger of triggers.filter(
          (trigger: any) => trigger.value !== "0",
        )) {
          if (from.toUpperCase() !== emethContractAddress) {
            await updateBalanceIfExists(db, from, tokenSymbol, trigger.value);
            await updateBalance(db, from, number, timestamp);
          } else if (to.toUpperCase() !== emethContractAddress) {
            await updateBalance(db, to, number, timestamp);
            await updateBalanceIfExists(db, to, tokenSymbol, trigger.value);
          }
        }
      }
    }
    json(200, {});
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
  blockNumber: string,
  timestamp: number,
) {
  const checksumWalletAddress = checksumAddress(walletAddress as `0x${string}`);

  const [isWalletObserved] = await db.query(`
      RETURN array::any(SELECT VALUE COUNT(address) FROM wallet WHERE address = '${checksumWalletAddress}')
    `);
  if (!isWalletObserved) {
    return;
  }

  const tokenAddresses = {
    GLM: "0x054e1324cf61fe915cca47c48625c07400f1b587",
    USDC: "0xd418937d10c9cec9d20736b2701e506867ffd85f",
    USDT: "0x9d16475f4d36dd8fc5fe41f74c9f44c7eccd0709",
  };

  const blockResponse: any = await Moralis.EvmApi.token.getWalletTokenBalances({
    chain: EvmChain.SEPOLIA.hex,
    toBlock: parseInt(blockNumber),
    tokenAddresses: [
      tokenAddresses.GLM,
      tokenAddresses.USDC,
      tokenAddresses.USDT,
    ],
    address: walletAddress,
  });

  if (blockResponse.raw.length > 0) {
    const currentBalance: { [key: string]: string } = {};
    // @ts-ignore
    blockResponse?.jsonResponse.forEach((entry: any) => {
      currentBalance[entry.token_address] = convertWeiToQuantity(
        entry.balance,
        parseInt(entry.decimals),
      );
    });

    const dbObject = {
      blockNumber: blockNumber,
      timestamp: new Date(timestamp * 1000),
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
});
