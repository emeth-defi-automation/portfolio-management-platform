import { readContract, writeContract } from "@wagmi/core";
import { emethContractAbi } from "~/abi/emethContractAbi";
import { uniswapRouterAbi } from "~/abi/UniswapRouterAbi";
import { getTokenDecimalsServer } from "~/database/tokens";

export const swapTokensForTokens = async (
  tokenInAddress: `0x${string}`,
  tokenOutAddress: `0x${string}`,
  amountIn: string,
  from: `0x${string}`,
  to: `0x${string}`,
  wagmiConfig: any,
) => {
  const deadline = BigInt(Math.floor(Date.now() / 1000) + 200000);
  try {
    const routerContractAddress = import.meta.env
      .PUBLIC_ROUTER_CONTRACT_ADDRESS;
    const emethContractAddress = import.meta.env
      .PUBLIC_EMETH_CONTRACT_ADDRESS_SEPOLIA;

    const tokenDecimals = await getTokenDecimalsServer(tokenInAddress);

    const amountInWEI = BigInt(
      parseFloat(amountIn) * 10 ** parseInt(tokenDecimals[0]),
    );

    // TODO: POSSIBLY LOWER IT BY 0.5% ON MAINNET - SLIPPAGE -- move to tokendelegator
    const amountOutMin = await readContract(wagmiConfig.config, {
      abi: uniswapRouterAbi,
      address: routerContractAddress,
      functionName: "getAmountsOut",
      args: [amountInWEI, [tokenInAddress, tokenOutAddress]],
    });

    await writeContract(wagmiConfig.config, {
      abi: emethContractAbi,
      address: emethContractAddress,
      functionName: "swapTokensForTokens",
      args: [
        tokenInAddress,
        tokenOutAddress,
        amountInWEI,
        amountOutMin[1],
        from,
        to,
        deadline,
      ],
    });
  } catch (e) {
    throw new Error(`Error in swapTokensForTokens: ${e}`);
  }
};
