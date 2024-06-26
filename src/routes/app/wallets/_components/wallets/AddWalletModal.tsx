import {
  $,
  component$,
  useContext,
  useSignal,
  useStore,
  useVisibleTask$,
  type Signal,
} from "@builder.io/qwik";
import { Form } from "@builder.io/qwik-city";

import {
  getAccount,
  readContract,
  simulateContract,
  writeContract,
  getConnections,
  type Config,
  waitForTransactionReceipt,
} from "@wagmi/core";

import { checksumAddress } from "viem";
import { contractABI } from "~/abi/abi";
import { emethContractAbi } from "~/abi/emethContractAbi";

import { type JwtPayload } from "jsonwebtoken";
import * as jwtDecode from "jwt-decode";
import { fetchTokens } from "~/database/tokens";

import { type AddWalletFormStore } from "~/routes/app/wallets/interface";

import { messagesContext } from "~/routes/app/layout";
import { convertToFraction } from "~/utils/fractions";
import { getAccessToken } from "~/utils/refresh";
import {
  isExecutableDisabled,
  isNotExecutableDisabled,
  isProceedDisabled,
} from "~/utils/validators/addWallet";
import { disconnectWallets, openWeb3Modal } from "~/utils/walletConnections";
import Button from "~/components/Atoms/Buttons/Button";
import { Modal } from "~/components/Modal/Modal";
import { WagmiConfigContext } from "~/components/WalletConnect/context";
import AddWalletFormFields from "~/routes/app/wallets/_components/AddWalletFormFields";
import AmountOfCoins from "~/routes/app/wallets/_components/AmountOfCoins";
import CoinsToApprove from "~/routes/app/wallets/_components/CoinsToApprove";
import IsExecutableSwitch from "~/routes/app/wallets/_components/isExecutableSwitch";
import { LoginContext } from "~/components/WalletConnect/context";
import { useAddWallet } from "~/routes/app/wallets/server";
import { getMoralisBalance } from "~/server/moralis";
export { ObservedWalletsList } from "~/components/ObservedWalletsList/ObservedWalletsList";
export { useAddWallet, useRemoveWallet } from "~/routes/app/wallets/server";

interface AddWalletModal {
  isAddWalletModalOpen: Signal<boolean>;
}

export const AddWalletModal = component$<AddWalletModal>(
  ({ isAddWalletModalOpen }) => {
    const isSecondWalletConnected = useSignal(false);
    const walletTokenBalances = useSignal<any>([]);
    const stepsCounter = useSignal(1);
    const login = useContext(LoginContext);
    const addWalletFormStore = useStore<AddWalletFormStore>({
      name: "",
      address: "",
      isExecutable: 0,
      isNameUnique: true,
      isNameUniqueLoading: false,
      isAddressUnique: true,
      coinsToCount: [],
      coinsToApprove: [],
      modalTitle: "",
    });

    const wagmiConfig = useContext(WagmiConfigContext);
    const formMessageProvider = useContext(messagesContext);

    const addWalletAction = useAddWallet();

    const connectWallet = $(async () => {
      await openWeb3Modal(wagmiConfig, login);
    });

    const handleReadBalances = $(async (wallet: string) => {
      const tokenBalances: any = await getMoralisBalance({ wallet });

      walletTokenBalances.value = tokenBalances.tokens;
    });

    const handleAddWallet = $(async () => {
      isAddWalletModalOpen.value = false;
      const cookie = await getAccessToken();
      if (!cookie) throw new Error("No accessToken cookie found");

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
          if (wagmiConfig.config.value) {
            const account = getAccount(wagmiConfig.config.value);

            addWalletFormStore.address = account.address as `0x${string}`;

            if (!emethContractAddress) {
              throw new Error("Missing PUBLIC_EMETH_CONTRACT_ADDRESS_SEPOLIA");
            }

            const tokens: any = await fetchTokens();

            for (const token of tokens) {
              if (addWalletFormStore.coinsToCount.includes(token.symbol)) {
                const tokenBalance = await readContract(
                  wagmiConfig.config.value,
                  {
                    account: account.address as `0x${string}`,
                    abi: contractABI,
                    address: checksumAddress(token.address as `0x${string}`),
                    functionName: "balanceOf",
                    args: [account.address as `0x${string}`],
                  },
                );

                const amount = addWalletFormStore.coinsToApprove.find(
                  (item) => item.symbol === token.symbol,
                )!.amount;

                const { numerator, denominator } = convertToFraction(amount);

                const calculation =
                  BigInt(numerator * BigInt(Math.pow(10, token.decimals))) /
                  BigInt(denominator);

                if (tokenBalance) {
                  const { request } = await simulateContract(
                    wagmiConfig.config.value,
                    {
                      account: account.address as `0x${string}`,
                      abi: contractABI,
                      address: checksumAddress(token.address as `0x${string}`),
                      functionName: "approve",
                      args: [emethContractAddress, BigInt(calculation)],
                    },
                  );
                  if (request.gasPrice) {
                    request.gasPrice *= 2n;
                  }

                  // keep receipts for now, to use waitForTransactionReceipt
                  try {
                    const hash = await writeContract(
                      wagmiConfig.config.value,
                      request,
                    );
                    await waitForTransactionReceipt(wagmiConfig.config.value, {
                      hash,
                    });
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
            wagmiConfig.config.value as Config,
            {
              account: addWalletFormStore.address as `0x${string}`,
              address: emethContractAddress,
              abi: emethContractAbi,
              functionName: "approve",
              args: [address as `0x${string}`],
            },
          );
          if (request.gasPrice) {
            request.gasPrice *= 2n;
          }

          const hash = await writeContract(
            wagmiConfig.config!.value as Config,
            request,
          );

          await waitForTransactionReceipt(wagmiConfig.config.value as Config, {
            hash,
          });
        }
        if (wagmiConfig.config.value) {
          await disconnectWallets(wagmiConfig.config);
        }

        await addWalletAction.submit({
          address: addWalletFormStore.address as `0x${string}`,
          name: addWalletFormStore.name,
          isExecutable: addWalletFormStore.isExecutable.toString(),
        });

        formMessageProvider.messages.push({
          id: formMessageProvider.messages.length,
          variant: "success",
          message: "Wallet successfully added.",
          isVisible: true,
        });

        addWalletFormStore.address = "";
        addWalletFormStore.name = "";
        addWalletFormStore.isExecutable = 0;
        addWalletFormStore.coinsToCount = [];
        addWalletFormStore.coinsToApprove = [];
        stepsCounter.value = 1;
      } catch (err) {
        console.error("error: ", err);
        await disconnectWallets(wagmiConfig.config);
        formMessageProvider.messages.push({
          id: formMessageProvider.messages.length,
          variant: "error",
          message: "Something went wrong.",
          isVisible: true,
        });
      }
    });

    // eslint-disable-next-line qwik/no-use-visible-task
    useVisibleTask$(async ({ track }) => {
      track(() => wagmiConfig.config.value);

      const connections = getConnections(wagmiConfig.config.value as Config);
      if (connections.length) {
        isSecondWalletConnected.value = true;
      } else {
        isSecondWalletConnected.value = false;
      }
    });
    return (
      <Modal
        isOpen={isAddWalletModalOpen}
        title={addWalletFormStore.modalTitle}
        onClose={$(async () => {
          addWalletFormStore.address = "";
          addWalletFormStore.name = "";
          addWalletFormStore.isExecutable = 0;
          addWalletFormStore.coinsToCount = [];
          addWalletFormStore.coinsToApprove = [];
          stepsCounter.value = 1;

          if (wagmiConfig.config.value) {
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
                      wagmiConfig.config.value as Config,
                    );
                    console.log(address);
                    await handleReadBalances(address as `0x${string}`);
                    console.log("read balances");
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
