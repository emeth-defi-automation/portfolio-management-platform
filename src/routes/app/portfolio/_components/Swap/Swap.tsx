import {
  type Signal,
  component$,
  useStore,
  $,
  useContext,
  useVisibleTask$,
} from "@builder.io/qwik";
import Box from "../../../../../components/Atoms/Box/Box";
import Button from "../../../../../components/Atoms/Buttons/Button";
import Input from "../../../../../components/Atoms/Input/Input";
import Select from "../../../../../components/Atoms/Select/Select";
import { Modal } from "~/components/Modal/Modal";
import { server$ } from "@builder.io/qwik-city";
import Moralis from "moralis";
import { EvmChain } from "@moralisweb3/common-evm-utils";
import { useDebouncer } from "~/utils/debouncer";
import {
  getTokenDecimalsServer,
  getTokenSymbolByAddress,
} from "~/database/tokens";
import { WagmiConfigContext } from "~/components/WalletConnect/context";
import { readContract } from "@wagmi/core";
import { uniswapRouterAbi } from "~/abi/UniswapRouterAbi";
import { messagesContext } from "~/routes/app/layout";
import { swapTokensForTokens } from "~/utils/tokens/swap";
import { WalletWithBalance } from "../../interface";

const askMoralisForPrices = server$(async () => {
  const response = await Moralis.EvmApi.token.getMultipleTokenPrices(
    {
      chain: EvmChain.ETHEREUM.hex,
      include: "percent_change",
    },
    {
      tokens: [
        {
          tokenAddress: "0xdac17f958d2ee523a2206206994597c13d831ec7",
        },
        {
          tokenAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        },
      ],
    },
  );

  return { response: response.raw };
});

interface SwapModalProps {
  chosenToken: Signal<string>;
  chosenTokenWalletAddress: Signal<string>;
  chosenTokenSymbol: Signal<string>;
  isOpen: Signal<boolean>;
  wallets: WalletWithBalance[];
}

export const SwapModal = component$<SwapModalProps>(
  ({
    chosenToken,
    chosenTokenWalletAddress,
    chosenTokenSymbol,
    isOpen,
    wallets,
  }) => {
    const formMessageProvider = useContext(messagesContext);
    const wagmiConfig = useContext(WagmiConfigContext);
    const swapValues = useStore({
      chosenToken: {
        address: chosenToken,
        value: "0",
        symbol: chosenTokenSymbol,
        dolarValue: "0",
      },
      tokenToSwapOn: {
        address: "",
        symbol: "",
        value: "0",
        dolarValue: "0",
      },
      accountToSendTokens: "",
      chosenTokenWalletAddress: chosenTokenWalletAddress,
    });
    const tokenFromAmountDebounce = useDebouncer(
      $(
        async ({
          amountIn,
          tokenInAddress,
          tokenOutAddress,
        }: {
          amountIn: bigint;
          tokenInAddress: `0x${string}`;
          tokenOutAddress: `0x${string}`;
        }) => {
          console.log("amountInWEI", amountIn);
          console.log("tokenInAddress", tokenInAddress);
          console.log("tokenOutAddress", tokenOutAddress);
          const tokenDecimals = await getTokenDecimalsServer(tokenInAddress);

          const amountInWEI = BigInt(
            parseFloat(amountIn.toString()) * 10 ** parseInt(tokenDecimals[0]),
          );
          const routerContractAddress = import.meta.env
            .PUBLIC_ROUTER_CONTRACT_ADDRESS;

          if (!wagmiConfig.config) {
            return;
          }

          const estimatedValue = await readContract(wagmiConfig.config, {
            abi: uniswapRouterAbi,
            address: routerContractAddress,
            functionName: "getAmountsOut",
            args: [amountInWEI, [tokenInAddress, tokenOutAddress]],
          });

          console.log("[[estimatedValue]]", estimatedValue);

          swapValues.tokenToSwapOn.value = estimatedValue[1].toString();
        },
      ),
      500,
    );
    const calculate = $(async () => {
      if (swapValues.tokenToSwapOn.address) {
        const decimals = await getTokenDecimalsServer(
          swapValues.tokenToSwapOn.address,
        );
        const numerator =
          BigInt(swapValues.tokenToSwapOn.value) /
          BigInt(BigInt(10) ** BigInt(decimals[0]));
        const denominator = swapValues.tokenToSwapOn.value
          .toString()
          .substring(
            numerator.toString().length,
            swapValues.tokenToSwapOn.value.toString().length - 1,
          );

        console.log(`${numerator}.${denominator}`);

        return `${numerator}.${denominator}`;
      }
    });
    useVisibleTask$(() => {
      console.log("wallets: ", wallets);
    });
    // eslint-disable-next-line qwik/no-use-visible-task
    useVisibleTask$(({ track }) => {
      track(() => isOpen);
      const cookieWallet = localStorage.getItem("emmethUserWalletAddress");
      if (cookieWallet) {
        swapValues.accountToSendTokens = cookieWallet;
      }
    });
    useVisibleTask$(async ({ track }) => {
      track(() => {
        swapValues.tokenToSwapOn.value;
        swapValues.accountToSendTokens;
      });

      const calculation = await calculate();
      if (calculation != undefined) {
        swapValues.tokenToSwapOn.value = `${calculation}`;
      }

      const { response } = await askMoralisForPrices();
      const findFromToken = response.find(
        (token) => token.tokenSymbol === swapValues.chosenToken.symbol,
      );
      const findToToken = response.find(
        (token) => token.tokenSymbol === swapValues.tokenToSwapOn.symbol,
      );

      if (findFromToken?.usdPrice && findToToken?.usdPrice) {
        swapValues.chosenToken.dolarValue =
          `${Number(swapValues.chosenToken.value) * Number(findFromToken!.usdPrice)}`.substring(
            0,
            5,
          );

        swapValues.tokenToSwapOn.value =
          `${Number(swapValues.tokenToSwapOn.value) * Number(findToToken!.usdPrice)}`.substring(
            0,
            5,
          );
      }
    });
    const handleSwap = $(async () => {
      formMessageProvider.messages.push({
        id: formMessageProvider.messages.length,
        variant: "info",
        message: "Swapping tokens...",
        isVisible: true,
      });
      try {
        await swapTokensForTokens(
          swapValues.chosenToken.address.value as `0x${string}`,
          swapValues.tokenToSwapOn.address.value as `0x${string}`,
          swapValues.chosenToken.value,
          swapValues.chosenTokenWalletAddress.value as `0x${string}`,
          swapValues.accountToSendTokens as `0x${string}`,
          wagmiConfig,
        );
        formMessageProvider.messages.push({
          id: formMessageProvider.messages.length,
          variant: "success",
          message: "Tokens swapped!",
          isVisible: true,
        });
      } catch (err) {
        console.log("swapping error: ", err);
        formMessageProvider.messages.push({
          id: formMessageProvider.messages.length,
          variant: "error",
          message: "Error while swapping",
          isVisible: true,
        });
      }
    });
    return (
      <Modal
        isOpen={isOpen}
        title="Swap"
        customClass="min-w-[500px]! w-[500px]!"
        onClose={$(() => {
          swapValues.chosenToken.address.value = "";
          swapValues.chosenToken.value = "";
          swapValues.tokenToSwapOn.address = "";
          swapValues.tokenToSwapOn.value = "";
          swapValues.accountToSendTokens = "";
        })}
      >
        {swapValues.chosenToken.address ? (
          <div class="flex min-w-[500px] max-w-[500px] flex-col gap-6 font-['Sora']">
            <div class="flex flex-col gap-2">
              <Box customClass="!shadow-none flex justify-between p-4 rounded-xl">
                <div class="flex flex-col gap-6">
                  <div class="flex flex-col gap-2">
                    <span class="text-xs font-normal text-white/60">
                      You Pay
                    </span>
                    <Input
                      placeholder="00.00"
                      customClass="!border-0 p-0 text-[28px] h-fit"
                      value={swapValues.chosenToken.value}
                      type="number"
                      name="amount"
                      onInput={$(async (e) => {
                        const target = e.target as HTMLInputElement;
                        swapValues.chosenToken.value = target.value;
                        if (
                          swapValues.chosenToken.address &&
                          swapValues.tokenToSwapOn.address &&
                          swapValues.chosenToken.value
                        ) {
                          const amountIn = BigInt(parseInt(target.value));
                          await tokenFromAmountDebounce({
                            amountIn: amountIn,
                            tokenInAddress: swapValues.chosenToken.address
                              .value as `0x${string}`,
                            tokenOutAddress: swapValues.tokenToSwapOn
                              .address as `0x${string}`,
                          });
                        }
                      })}
                    />
                  </div>
                  <span class="text-xs font-normal text-white/60">
                    ${swapValues.chosenToken.dolarValue}
                  </span>
                </div>
                {/* TODO parsin options */}
                <Select
                  name=""
                  options={[
                    {
                      value: swapValues.chosenToken.address.value,
                      text: swapValues.chosenToken.symbol.value,
                    },
                  ]}
                  size="medium"
                  class="h-8 pr-0"
                />
              </Box>
              <Box customClass="!shadow-none flex justify-between p-4 rounded-xl">
                <div class="flex flex-col gap-6">
                  <div class="flex flex-col gap-2">
                    <span class="text-xs font-normal text-white/60">
                      You receive
                    </span>
                    <Input
                      type="text"
                      placeholder="00.00"
                      customClass="!border-0 p-0 text-[28px] h-fit"
                      value={swapValues.tokenToSwapOn.value}
                    />
                  </div>
                  <span class="text-xs font-normal text-white/60">
                    ${swapValues.tokenToSwapOn.value}
                  </span>
                </div>
                {/* parsing options */}
                <Select
                  name=""
                  options={[
                    { value: "", text: "Pick a coin" },
                    {
                      value: "0xD418937d10c9CeC9d20736b2701E506867fFD85f",
                      text: "USDC",
                    },
                    {
                      value: "0x9D16475f4d36dD8FC5fE41F74c9F44c7EcCd0709",
                      text: "USDT",
                    },
                  ]}
                  onValueChange={$(async (value) => {
                    swapValues.tokenToSwapOn.address = value;
                    swapValues.tokenToSwapOn.symbol =
                      await getTokenSymbolByAddress(value);
                  })}
                  size="medium"
                  class="h-8 pr-0"
                />
              </Box>
            </div>
            <div class="flex flex-col gap-2">
              <label for="swapValues.accountToSendTokens">
                Address to send coins to:
              </label>
              <Input
                type="text"
                name="swapValues.accountToSendTokens"
                value={swapValues.accountToSendTokens}
              />
            </div>
            {/* BUTTONS */}
            <div class="flex items-center gap-4">
              <Button
                variant="transparent"
                text="Cancel"
                class="w-full"
                onClick$={() => {
                  isOpen.value = false;
                  swapValues.chosenToken.address.value = "";
                  swapValues.chosenToken.value = "";
                  swapValues.tokenToSwapOn.address = "";
                  swapValues.accountToSendTokens = "";
                  swapValues.tokenToSwapOn.value = "";
                }}
              />
              <Button
                variant="blue"
                text="Swap Tokens"
                class="w-full"
                onClick$={async () => {
                  isOpen.value = false;
                  await handleSwap();
                }}
              />
            </div>
          </div>
        ) : (
          <h1>Can't swap selected token</h1>
        )}
      </Modal>
    );
  },
);
