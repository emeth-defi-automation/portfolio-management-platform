import {
  type Signal,
  component$,
  useStore,
  $,
  useContext,
  useVisibleTask$,
  useSignal,
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
import { type WalletWithBalance } from "../../interface";
import { convertToFraction, replaceNonMatching } from "~/utils/fractions";
import WalletAddressValueSwitch from "./WalletAddressValueSwitch";
import { isAddress } from "viem";
import { type Token } from "~/interface/token/Token";
import Label from "~/components/Atoms/Label/Label";
import InputField from "~/components/Molecules/InputField/InputField";

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
  allTokensFromDb: any;
}

export const SwapModal = component$<SwapModalProps>(
  ({
    chosenToken,
    chosenTokenWalletAddress,
    chosenTokenSymbol,
    isOpen,
    wallets,
    allTokensFromDb,
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
          amountIn: string;
          tokenInAddress: `0x${string}`;
          tokenOutAddress: `0x${string}`;
        }) => {
          const tokenDecimals = await getTokenDecimalsServer(tokenInAddress);

          const amountInFraction = convertToFraction(amountIn);

          const amountInWEI =
            (BigInt(amountInFraction.numerator) *
              BigInt(10) ** BigInt(tokenDecimals[0])) /
            BigInt(amountInFraction.denominator);

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

          const nominator =
            estimatedValue[1] / BigInt(10) ** BigInt(tokenDecimals[0]);
          console.log("nominator: ", nominator);
          const denominator = estimatedValue[1]
            .toString()
            .substring(
              nominator.toString().length,
              estimatedValue[1].toString().length - 1,
            );

          swapValues.tokenToSwapOn.value = `${nominator}.${denominator}`;
        },
      ),
      500,
    );
    const isManualAddress = useSignal<boolean>(false);
    // eslint-disable-next-line qwik/no-use-visible-task
    useVisibleTask$(() => {
      console.log(allTokensFromDb.value);
      swapValues.accountToSendTokens = chosenTokenWalletAddress.value;
    });
    // eslint-disable-next-line qwik/no-use-visible-task
    useVisibleTask$(async ({ track }) => {
      track(() => {
        swapValues.tokenToSwapOn.value;
        swapValues.accountToSendTokens;
      });

      const { response } = await askMoralisForPrices();
      const findFromToken = response.find(
        (token) => token.tokenSymbol === swapValues.chosenToken.symbol.value,
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

        swapValues.tokenToSwapOn.dolarValue =
          `${Number(swapValues.tokenToSwapOn.value) * Number(findToToken!.usdPrice)}`.substring(
            0,
            5,
          );
      }
    });
    // eslint-disable-next-line qwik/no-use-visible-task
    useVisibleTask$(async ({ track }) => {
      track(() => swapValues.tokenToSwapOn.symbol);
      await tokenFromAmountDebounce({
        amountIn: swapValues.chosenToken.value,
        tokenInAddress: swapValues.chosenToken.address.value as `0x${string}`,
        tokenOutAddress: swapValues.tokenToSwapOn.address as `0x${string}`,
      });
    });
    const handleSwap = $(async () => {
      formMessageProvider.messages.push({
        id: formMessageProvider.messages.length,
        variant: "info",
        message: "Swapping tokens...",
        isVisible: true,
      });
      try {
        const swap = await swapTokensForTokens(
          swapValues.chosenToken.address.value as `0x${string}`,
          swapValues.tokenToSwapOn.address as `0x${string}`,
          swapValues.chosenToken.value,
          swapValues.chosenTokenWalletAddress.value as `0x${string}`,
          swapValues.accountToSendTokens as `0x${string}`,
          wagmiConfig,
        );
        console.log(swap);
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
        customClass="!min-w-[500px] !w-fit"
        onClose={$(() => {
          swapValues.chosenToken.address.value = "";
          swapValues.chosenToken.value = "";
          swapValues.tokenToSwapOn.address = "";
          swapValues.tokenToSwapOn.value = "";
          swapValues.accountToSendTokens = "";
        })}
      >
        <div class="flex min-w-[500px] max-w-[500px] flex-col gap-6 font-['Sora']">
          <div class="flex flex-col gap-2">
            <Box customClass="!shadow-none flex justify-between p-4 rounded-xl">
              <div class="flex flex-col gap-6">
                <InputField
                  id="amount"
                  name="You pay"
                  variant="swap"
                  size="large"
                  placeholder="00.00"
                  value={swapValues.chosenToken.value}
                  onInput={$(async (e) => {
                    const target = e.target as HTMLInputElement;

                    const regex = /^\d*\.?\d*$/;
                    target.value = replaceNonMatching(target.value, regex, "");

                    swapValues.chosenToken.value = target.value;
                    if (
                      swapValues.chosenToken.address.value != "" &&
                      swapValues.tokenToSwapOn.address != "" &&
                      swapValues.chosenToken.value != "0"
                    ) {
                      const amountIn = target.value;
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
                <span class="text-xs font-normal text-white/60">
                  ${swapValues.chosenToken.dolarValue}
                </span>
              </div>
              <Select
                id="chosenToken"
                name="chosenToken"
                options={[
                  {
                    value: swapValues.chosenToken.address.value,
                    text: swapValues.chosenToken.symbol.value,
                  },
                ]}
                size="swap"
              />
            </Box>
            <Box customClass="!shadow-none flex justify-between p-4 rounded-xl">
              <div class="flex flex-col gap-6">
                <InputField
                  id="receive"
                  name="You receive"
                  variant="swap"
                  size="large"
                  value={swapValues.tokenToSwapOn.value}
                  placeholder="00.00"
                />
                <span class="text-xs font-normal text-white/60">
                  ${swapValues.tokenToSwapOn.value}
                </span>
              </div>

              <Select
                id="selectedToken"
                name="selectedToken"
                options={[
                  { value: "", text: "Pick a coin" },
                  ...allTokensFromDb.value.map((token: Token) => {
                    if (
                      !(token.symbol === swapValues.chosenToken.symbol.value)
                    ) {
                      return {
                        value: token.address,
                        text: token.symbol,
                      };
                    } else return null;
                  }),
                ].filter((item) => item != null)}
                onValueChange={$(async (value: string) => {
                  swapValues.tokenToSwapOn.address = value;
                  swapValues.tokenToSwapOn.symbol =
                    await getTokenSymbolByAddress(value as `0x${string}`);
                })}
                size="swap"
              />
            </Box>
          </div>
          <WalletAddressValueSwitch isManualAddress={isManualAddress} />
          <div class="flex flex-col gap-2">
            <Label
              for="swapValues.accountToSendTokens"
              name="Address to send coins to:"
            />
            {isManualAddress.value ? (
              <Input
                id="swapValues.accountToSendTokens"
                type="text"
                name="swapValues.accountToSendTokens"
                value={swapValues.accountToSendTokens}
                onInput={$((e) => {
                  const target = e.target;
                  swapValues.accountToSendTokens = target.value;
                })}
              />
            ) : (
              <Select
                id="swapValues.accountToSendTokens"
                name="Wallet"
                options={[
                  { value: "", text: "Select wallet" },
                  ...wallets.map((option) => {
                    return {
                      value: option.wallet.address,
                      text: option.walletName,
                      selected: undefined,
                    };
                  }),
                ]}
                onValueChange={$((value: string) => {
                  swapValues.accountToSendTokens = value;
                })}
              />
            )}
          </div>
          {/* BUTTONS */}
          <div class="flex items-center gap-4">
            <Button
              variant="transparent"
              text="Cancel"
              customClass="w-full"
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
              customClass="w-full"
              onClick$={async () => {
                isOpen.value = false;
                await handleSwap();
              }}
              disabled={
                !swapValues.chosenToken.address.value ||
                !swapValues.tokenToSwapOn.address ||
                swapValues.chosenToken.value == "0" ||
                !isAddress(swapValues.accountToSendTokens as `0x${string}`)
              }
            />
          </div>
        </div>
      </Modal>
    );
  },
);