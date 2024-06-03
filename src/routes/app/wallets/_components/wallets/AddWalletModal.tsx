import {
  $,
  Signal,
  component$,
  useContext,
  useSignal,
  useStore,
} from "@builder.io/qwik";
import { Form } from "@builder.io/qwik-city";

import {
  getAccount,
  readContract,
  simulateContract,
  writeContract,
  type Config,
} from "@wagmi/core";
import { checksumAddress } from "viem";
import { contractABI } from "~/abi/abi";
import { emethContractAbi } from "~/abi/emethContractAbi";

import { type JwtPayload } from "jsonwebtoken";
import * as jwtDecode from "jwt-decode";
import { fetchTokens } from "~/database/tokens";

import { StreamStoreContext } from "~/interface/streamStore/streamStore";
import { type WalletTokensBalances } from "~/interface/walletsTokensBalances/walletsTokensBalances";
import { AddWalletFormStore } from "~/routes/app/wallets/interface";

import { convertToFraction } from "~/utils/fractions";
import { getAccessToken } from "~/utils/refresh";
import {
  isExecutableDisabled,
  isNotExecutableDisabled,
  isProceedDisabled,
} from "~/utils/validators/addWallet";
import { disconnectWallets, openWeb3Modal } from "~/utils/walletConnections";
import { messagesContext } from "~/routes/app/layout";

import Button from "~/components/Atoms/Buttons/Button";
import AddWalletFormFields from "~/routes/app/wallets/_components/AddWalletFormFields";
import AmountOfCoins from "~/routes/app/wallets/_components/AmountOfCoins";
import CoinsToApprove from "~/routes/app/wallets/_components/CoinsToApprove";
import IsExecutableSwitch from "~/routes/app/wallets/_components/isExecutableSwitch";
import { Modal } from "~/components/Modal/Modal";
import { getObservedWallets } from "~/components/ObservedWalletsList/ObservedWalletsList";
import { WagmiConfigContext } from "~/components/WalletConnect/context";

import { addAddressToStreamConfig, getMoralisBalance } from "~/server/moralis";
import {
  useAddWallet,
  useGetBalanceHistory,
} from "~/routes/app/wallets/server";
export {
  ObservedWalletsList,
  getObservedWallets,
} from "~/components/ObservedWalletsList/ObservedWalletsList";
export {
  useAddWallet,
  useGetBalanceHistory,
  useRemoveWallet,
} from "~/routes/app/wallets/server";

interface AddWalletModal {
  isAddWalletModalOpen: Signal<boolean>;
  isSecondWalletConnected: Signal<boolean>;
  stepsCounter: Signal<number>;
}

export const AddWalletModal = component$<AddWalletModal>(
  ({ isAddWalletModalOpen, stepsCounter, isSecondWalletConnected }) => {
    const observedWallets = useSignal<WalletTokensBalances[]>([]);
    const walletTokenBalances = useSignal<any>([]);

    const addWalletFormStore = useStore<AddWalletFormStore>({
      name: "",
      address: "",
      isExecutable: 0,
      isNameUnique: true,
      isNameUniqueLoading: false,
      isAddressUnique: true,
      coinsToCount: [],
      coinsToApprove: [],
    });

    const wagmiConfig = useContext(WagmiConfigContext);
    const { streamId } = useContext(StreamStoreContext);
    const formMessageProvider = useContext(messagesContext);

    const getWalletBalanceHistory = useGetBalanceHistory();
    const addWalletAction = useAddWallet();

    const connectWallet = $(async () => {
      await openWeb3Modal(wagmiConfig!.config);
    });

    const handleReadBalances = $(async (wallet: string) => {
      const tokenBalances = await getMoralisBalance({ wallet });

      walletTokenBalances.value = tokenBalances.tokens;
    });

    const handleAddWallet = $(async () => {
      isAddWalletModalOpen.value = false;

      formMessageProvider.messages.push({
        id: formMessageProvider.messages.length,
        variant: "info",
        message: "Processing wallet...",
        isVisible: true,
      });

      const emethContractAddress = import.meta.env
        .PUBLIC_EMETH_CONTRACT_ADDRESS_SEPOLIA;

      try {
        if (addWalletFormStore.isExecutable) {
          if (wagmiConfig.config) {
            const account = getAccount(wagmiConfig.config);

            addWalletFormStore.address = account.address as `0x${string}`;

            if (!emethContractAddress) {
              throw new Error("Missing PUBLIC_EMETH_CONTRACT_ADDRESS_SEPOLIA");
            }

            const tokens: any = await fetchTokens();

            for (const token of tokens) {
              if (addWalletFormStore.coinsToCount.includes(token.symbol)) {
                const tokenBalance = await readContract(wagmiConfig.config, {
                  account: account.address as `0x${string}`,
                  abi: contractABI,
                  address: checksumAddress(token.address as `0x${string}`),
                  functionName: "balanceOf",
                  args: [account.address as `0x${string}`],
                });

                const amount = addWalletFormStore.coinsToApprove.find(
                  (item) => item.symbol === token.symbol,
                )!.amount;

                const { numerator, denominator } = convertToFraction(amount);

                const calculation =
                  BigInt(numerator * BigInt(Math.pow(10, token.decimals))) /
                  BigInt(denominator);

                if (tokenBalance) {
                  const approval = await simulateContract(wagmiConfig.config, {
                    account: account.address as `0x${string}`,
                    abi: contractABI,
                    address: checksumAddress(token.address as `0x${string}`),
                    functionName: "approve",
                    args: [emethContractAddress, BigInt(calculation)],
                  });

                  // keep receipts for now, to use waitForTransactionReceipt
                  try {
                    await writeContract(wagmiConfig.config, approval.request);
                  } catch (err) {
                    console.error("Error: ", err);
                  }
                }
              }
            }
          }
          // approving logged in user by observed wallet by emeth contract
          const cookie = await getAccessToken();
          if (!cookie) throw new Error("No accessToken cookie found");

          const { address } = jwtDecode.jwtDecode(cookie) as JwtPayload;

          const { request } = await simulateContract(
            wagmiConfig.config as Config,
            {
              account: addWalletFormStore.address as `0x${string}`,
              address: emethContractAddress,
              abi: emethContractAbi,
              functionName: "approve",
              args: [address as `0x${string}`],
            },
          );

          await writeContract(wagmiConfig.config as Config, request);
        }
        if (wagmiConfig.config) {
          await disconnectWallets(wagmiConfig.config);
        }

        const {
          value: { success },
        } = await addWalletAction.submit({
          address: addWalletFormStore.address as `0x${string}`,
          name: addWalletFormStore.name,
          isExecutable: addWalletFormStore.isExecutable.toString(),
        });

        if (success) {
          observedWallets.value = await getObservedWallets();
          await getWalletBalanceHistory.submit({
            address: addWalletFormStore.address,
          });
        }

        formMessageProvider.messages.push({
          id: formMessageProvider.messages.length,
          variant: "success",
          message: "Wallet successfully added.",
          isVisible: true,
        });

        await addAddressToStreamConfig(
          streamId,
          addWalletFormStore.address as `0x${string}`,
        );

        addWalletFormStore.address = "";
        addWalletFormStore.name = "";
        addWalletFormStore.isExecutable = 0;
        addWalletFormStore.coinsToCount = [];
        addWalletFormStore.coinsToApprove = [];
        stepsCounter.value = 1;
      } catch (err) {
        console.error("error: ", err);
        formMessageProvider.messages.push({
          id: formMessageProvider.messages.length,
          variant: "error",
          message: "Something went wrong.",
          isVisible: true,
        });
      }
    });

    return (
      <Modal
        isOpen={isAddWalletModalOpen}
        title="Add Wallet"
        onClose={$(async () => {
          addWalletFormStore.address = "";
          addWalletFormStore.name = "";
          addWalletFormStore.isExecutable = 0;
          addWalletFormStore.coinsToCount = [];
          addWalletFormStore.coinsToApprove = [];
          stepsCounter.value = 1;

          if (wagmiConfig.config) {
            await disconnectWallets(wagmiConfig.config);
          }
        })}
      >
        <Form>
          {stepsCounter.value === 1 ? (
            <>
              <IsExecutableSwitch addWalletFormStore={addWalletFormStore} />
              <AddWalletFormFields
                addWalletFormStore={addWalletFormStore}
                onConnectWalletClick={connectWallet}
              />
            </>
          ) : null}
          {stepsCounter.value === 2 ? (
            <CoinsToApprove
              addWalletFormStore={addWalletFormStore}
              walletTokenBalances={walletTokenBalances}
            />
          ) : null}
          {stepsCounter.value === 3 ? (
            <AmountOfCoins
              addWalletFormStore={addWalletFormStore}
              walletTokenBalances={walletTokenBalances}
            />
          ) : null}
          <div class="flex w-full items-center justify-between gap-2">
            {stepsCounter.value > 1 && addWalletFormStore.isExecutable ? (
              <Button
                variant="transparent"
                onClick$={async () => {
                  stepsCounter.value = stepsCounter.value - 1;
                }}
                text="Back"
                customClass="w-full"
              />
            ) : null}
            {addWalletFormStore.isExecutable === 0 ? (
              <Button
                variant="blue"
                onClick$={handleAddWallet}
                text="Add Wallet"
                customClass="w-full"
                disabled={isNotExecutableDisabled(addWalletFormStore)}
              />
            ) : stepsCounter.value === 3 ? (
              <Button
                variant="blue"
                onClick$={handleAddWallet}
                text="Add Wallet"
                customClass="w-full"
                disabled={
                  addWalletFormStore.isExecutable
                    ? isExecutableDisabled(addWalletFormStore)
                    : isNotExecutableDisabled(addWalletFormStore)
                }
              />
            ) : (
              <Button
                variant="blue"
                text="Proceed"
                onClick$={async () => {
                  if (stepsCounter.value === 1) {
                    const { address } = getAccount(
                      wagmiConfig.config as Config,
                    );

                    await handleReadBalances(address as `0x${string}`);
                  }
                  if (stepsCounter.value === 2) {
                    for (
                      let i = 0;
                      i < addWalletFormStore.coinsToCount.length;
                      i++
                    ) {
                      addWalletFormStore.coinsToApprove.push({
                        symbol: addWalletFormStore.coinsToCount[i],
                        amount: "0",
                      });
                    }
                  }
                  stepsCounter.value = stepsCounter.value + 1;
                }}
                disabled={isProceedDisabled(
                  addWalletFormStore,
                  isSecondWalletConnected,
                )}
                customClass="w-full"
              />
            )}
          </div>
        </Form>
      </Modal>
    );
  },
);
