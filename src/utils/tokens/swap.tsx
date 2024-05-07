import { server$ } from "@builder.io/qwik-city";
import { readContract, writeContract } from "@wagmi/core";
import { simulateContract } from "viem/actions";
import { uniswapRouterAbi } from "~/abi/UniswapRouterAbi";
import { type WagmiConfig } from "~/components/WalletConnect/context";
import { connectToDB } from "~/database/db";

export const swapTokens = server$(async function (
  firstTokenAddress: string,
  secondTokenAddress: string,
  amount: string,
  routerContractAddress: string,
  accountAddress: string,
  wagmiConfig: any,
) {
  // get deadline
  const deadline = BigInt(Math.floor(Date.now() / 1000) + 200000);
  // get decimals of token1
  // TODO: Move to separate file and validate it
  //   const db = await connectToDB(this.env);
  //   const tokenDecimals = await db.query(
  //     `SELECT VALUE decimals FROM token WHERE address = ${firstTokenAddress}`,
  //   );
  const amountIn = BigInt(parseFloat(amount) * 10 ** 18);
  // get amountIn = amount * 10^decimals
  try {
    const amountOutMin = await readContract(wagmiConfig.config, {
      abi: uniswapRouterAbi,
      address: routerContractAddress as `0x${string}`,
      functionName: "getAmountsOut",
      args: [
        amountIn,
        [
          firstTokenAddress as `0x${string}`,
          secondTokenAddress as `0x${string}`,
        ],
      ],
    });

    const { request } = await simulateContract(wagmiConfig.config, {
      abi: uniswapRouterAbi,
      address: "0x87aE49902B749588c15c5FE2A6fE6a1067a5bea0",
      functionName: "swapExactTokensForTokens",
      args: [
        amountIn,
        amountOutMin[0],
        [
          firstTokenAddress as `0x${string}`,
          secondTokenAddress as `0x${string}`,
        ],
        accountAddress as `0x${string}`,
        deadline,
      ],
    });
    await writeContract(wagmiConfig.config, request);
  } catch (e) {
    console.error("Error in swap: ", e);
  }
});
