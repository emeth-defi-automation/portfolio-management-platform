import { readContract, writeContract } from "@wagmi/core";
import { simulateContract } from "viem/actions";
import { uniswapRouterAbi } from "~/abi/UniswapRouterAbi";
import { getTokenDecimalsServer } from "~/database/tokens";

export const swapTokens = async (
  firstTokenAddress: string,
  secondTokenAddress: string,
  amount: string,
  routerContractAddress: string,
  accountAddress: string,
  wagmiConfig: any,
) => {
  const deadline = BigInt(Math.floor(Date.now() / 1000) + 200000);
  try {
    const wrappedEtherAddress = await readContract(wagmiConfig.config, {
      abi: uniswapRouterAbi,
      address: routerContractAddress as `0x${string}`,
      functionName: "WETH",
    });
    const tokenDecimals = await getTokenDecimalsServer(firstTokenAddress);
    const amountIn = BigInt(
      parseFloat(amount) * 10 ** parseInt(tokenDecimals.decimals),
    );
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
    if (firstTokenAddress === wrappedEtherAddress) {
      const { request } = await simulateContract(wagmiConfig.config, {
        abi: uniswapRouterAbi,
        address: "0x87aE49902B749588c15c5FE2A6fE6a1067a5bea0",
        functionName: "swapExactETHForTokens",
        args: [
          amountOutMin[0],
          [
            firstTokenAddress as `0x${string}`,
            secondTokenAddress as `0x${string}`,
          ],
          accountAddress as `0x${string}`,
          deadline,
        ],
        value: amountIn,
      });
      await writeContract(wagmiConfig.config, request);
    } else if (secondTokenAddress === wrappedEtherAddress) {
      const { request } = await simulateContract(wagmiConfig.config, {
        abi: uniswapRouterAbi,
        address: "0x87aE49902B749588c15c5FE2A6fE6a1067a5bea0",
        functionName: "swapExactTokensForETH",
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
    } else {
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
    }
  } catch (e) {
    console.error("Error in swap: ", e);
  }
};
