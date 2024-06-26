import {
  type Signal,
  component$,
  useStore,
  $,
  useContext,
  useVisibleTask$,
  useSignal,
  QRL,
  useTask$,
} from "@builder.io/qwik";
import Box from "~/components/Atoms/Box/Box";
import Button from "~/components/Atoms/Buttons/Button";
import Input from "~/components/Atoms/Input/Input";
import Select from "~/components/Atoms/Select/Select";
import { Modal } from "~/components/Modal/Modal";
import { server$ } from "@builder.io/qwik-city";
import Moralis from "moralis";
import { EvmChain } from "@moralisweb3/common-evm-utils";
import { useDebouncer } from "~/utils/debouncer";
import {
  fetchTokens,
  getTokenDecimalsServer,
  getTokenSymbolByAddress,
} from "~/database/tokens";
import { WagmiConfigContext } from "~/components/WalletConnect/context";
import { type Config, readContract, reconnect } from "@wagmi/core";
import { uniswapRouterAbi } from "~/abi/UniswapRouterAbi";
import { messagesContext } from "~/routes/app/layout";
import { convertToFraction, replaceNonMatching } from "~/utils/fractions";
import { isAddress } from "viem";
import { type Token } from "~/interface/token/Token";
import Label from "~/components/Atoms/Label/Label";
import InputField from "~/components/Molecules/InputField/InputField";
import WalletAddressValueSwitch from "../../portfolio/_components/Swap/WalletAddressValueSwitch";
import { getObservedWalletBalances } from "../../portfolio/server/observerWalletBalancesLoader";
import { connectToDB } from "~/database/db";

const addAutomationAction = server$(
  async function (
    automationId,
    actionId,
    user,
    actionName,
    actionDesc,
    actionType,
  ) {
    const db = await connectToDB(this.env);

    try {
      const newAction = {
        actionName: actionName,
        actionDesc: actionDesc,
        actionType: actionType,
        actionId: actionId,
      };
      console.log(
        automationId,
        actionId,
        user,
        actionName,
        actionDesc,
        actionType,
      );
      const result = await db.query(
        `
            UPDATE automations
            SET actions = ARRAY::APPEND(actions, $newAction)
            WHERE actionId = $automationId AND user = $user;
          `,
        {
          newAction,
          automationId,
          user,
        },
      );

      console.log("Action added successfully:", result);
    } catch (error) {
      console.error("Error adding action:", error);
    }
  },
);

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

interface AddSwapActionModalProps {
  isOpen: Signal<boolean>;
  automationAction: any;
}

export const AddSwapActionModal = component$<AddSwapActionModalProps>(
  ({ isOpen, automationAction }) => {
    const formMessageProvider = useContext(messagesContext);
    const allTokensFromDb = useSignal([]);
    const wallets = useSignal<any>([]);
    const wagmiConfig = useContext(WagmiConfigContext);
    const swapValues = useStore({
      chosenToken: {
        address: "",
        value: "0",
        symbol: "",
        dolarValue: "0",
      },
      tokenToSwapOn: {
        address: "",
        symbol: "",
        value: "0",
        dolarValue: "0",
      },
      accountToSendTokens: "",
      chosenTokenWalletAddress: "",
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

          if (!wagmiConfig.config.value) {
            return;
          }

          const estimatedValue = await readContract(
            wagmiConfig.config.value as Config,
            {
              abi: uniswapRouterAbi,
              address: routerContractAddress,
              functionName: "getAmountsOut",
              args: [amountInWEI, [tokenInAddress, tokenOutAddress]],
            },
          );

          const nominator =
            estimatedValue[1] / BigInt(10) ** BigInt(tokenDecimals[0]);
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
    useTask$(async () => {
      const tokens: any = await fetchTokens();
      allTokensFromDb.value = tokens;
    });
    const isManualAddress = useSignal<boolean>(false);

    // eslint-disable-next-line qwik/no-use-visible-task
    useVisibleTask$(async () => {
      if (wagmiConfig.config.value) {
        await reconnect(wagmiConfig.config.value);
      }
      wallets.value = await getObservedWalletBalances();
      swapValues.accountToSendTokens = swapValues.chosenTokenWalletAddress;
    });

    // eslint-disable-next-line qwik/no-use-visible-task
    useVisibleTask$(async ({ track }) => {
      track(() => {
        swapValues.tokenToSwapOn.value;
        swapValues.accountToSendTokens;
      });

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
        tokenInAddress: swapValues.chosenToken.address as `0x${string}`,
        tokenOutAddress: swapValues.tokenToSwapOn.address as `0x${string}`,
      });
    });

    const handleSaveSwap = $(async () => {});

    return (
      <Modal
        isOpen={isOpen}
        title="Swap"
        customClass="!min-w-[500px] !w-fit"
        onClose={$(() => {
          swapValues.chosenToken.address = "";
          swapValues.chosenToken.value = "";
          swapValues.tokenToSwapOn.address = "";
          swapValues.tokenToSwapOn.value = "";
          swapValues.accountToSendTokens = "";
        })}
      >
        <div class="flex min-w-[500px] max-w-[500px] flex-col gap-6 font-['Sora']">
          <div class="flex flex-col gap-2">
            <Select
              id="swapValues.chosenWallet"
              name="Wallet"
              options={[
                { value: "", text: "Select wallet" },
                ...wallets.value.map((option: any) => {
                  return {
                    value: option.wallet.address,
                    text: option.walletName,
                    selected: undefined,
                  };
                }),
              ]}
              onValueChange={$((value: string) => {
                swapValues.chosenTokenWalletAddress = value;
              })}
            />
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
                      swapValues.chosenToken.address != "" &&
                      swapValues.tokenToSwapOn.address != "" &&
                      swapValues.chosenToken.value != "0"
                    ) {
                      const amountIn = target.value;
                      await tokenFromAmountDebounce({
                        amountIn: amountIn,
                        tokenInAddress: swapValues.chosenToken
                          .address as `0x${string}`,
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
                  { value: "", text: "Pick a coin" },
                  ...allTokensFromDb.value.map((token: Token) => {
                    return {
                      value: token.address,
                      text: token.symbol,
                    };
                  }),
                ].filter((item) => item != null)}
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
                    return {
                      value: token.address,
                      text: token.symbol,
                    };
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
                  ...wallets.value.map((option: any) => {
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
                swapValues.chosenToken.address = "";
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

                console.log("done");
              }}
              disabled={
                !swapValues.chosenToken.address ||
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
