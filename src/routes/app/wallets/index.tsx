import {
  $,
  component$,
  useContext,
  useSignal,
  useStore,
  useVisibleTask$,
} from "@builder.io/qwik";
import { Form } from "@builder.io/qwik-city";
import { type JwtPayload } from "jsonwebtoken";
import { contractABI } from "~/abi/abi";
import { chainIdToNetworkName } from "~/utils/chains";
import { Modal } from "~/components/Modal/Modal";
import { SelectedWalletDetails } from "~/components/Wallets/Details/SelectedWalletDetails";
import { type WalletTokensBalances } from "~/interface/walletsTokensBalances/walletsTokensBalances";
import { checksumAddress } from "viem";
import { emethContractAbi } from "~/abi/emethContractAbi";
import IsExecutableSwitch from "~/components/Forms/isExecutableSwitch";
import { getCookie } from "~/utils/refresh";
import * as jwtDecode from "jwt-decode";
import { StreamStoreContext } from "~/interface/streamStore/streamStore";
import { WagmiConfigContext } from "~/components/WalletConnect/context";
import { messagesContext } from "../layout";

import {
  type Config,
  getAccount,
  readContract,
  simulateContract,
  waitForTransactionReceipt,
  writeContract,
  getConnections,
  watchAccount,
} from "@wagmi/core";

import AddWalletFormFields from "~/components/Forms/AddWalletFormFields";
import CoinsToApprove from "~/components/Forms/CoinsToApprove";
import AmountOfCoins from "~/components/Forms/AmountOfCoins";
import { Button, ButtonWithIcon } from "~/components/Buttons/Buttons";
import ImgWarningRed from "/public/assets/icons/wallets/warning-red.svg?jsx";
import {
  getObservedWallets,
  ObservedWalletsList,
} from "~/components/ObservedWalletsList/ObservedWalletsList";
export {
  getObservedWallets,
  ObservedWalletsList,
} from "~/components/ObservedWalletsList/ObservedWalletsList";

import {
  checkPattern,
  convertToFraction,
  replaceNonMatching,
} from "~/utils/fractions";
import {
  isExecutableDisabled,
  isNotExecutableDisabled,
  isProceedDisabled,
} from "~/utils/validators/addWallet";
import { useAddWallet, useGetBalanceHistory, useRemoveWallet } from "./server";
export { useAddWallet, useGetBalanceHistory, useRemoveWallet } from "./server";
import { type AddWalletFormStore } from "./interface";
import { fetchTokens } from "~/database/tokens";
import { addAddressToStreamConfig, getMoralisBalance } from "~/server/moralis";
import { balancesLiveStream } from "./server/balancesLiveStream";
import { disconnectWallets, openWeb3Modal } from "~/utils/walletConnections";

export default component$(() => {
  const wagmiConfig = useContext(WagmiConfigContext);
  const formMessageProvider = useContext(messagesContext);
  const { streamId } = useContext(StreamStoreContext);
  const walletTokenBalances = useSignal<any>([]);
  const addWalletAction = useAddWallet();
  const removeWalletAction = useRemoveWallet();
  const isAddWalletModalOpen = useSignal(false);
  const isDeleteModalOpen = useSignal(false);
  const transferredCoin = useStore({ symbol: "", address: "" });
  const isTransferModalOpen = useSignal(false);
  const selectedWallet = useSignal<WalletTokensBalances | null>(null);
  const receivingWalletAddress = useSignal("");
  const transferredTokenAmount = useSignal("");
  const isSecondWalletConnected = useSignal(false);
  const stepsCounter = useSignal(1);
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
  const getWalletBalanceHistory = useGetBalanceHistory();
  const observedWallets = useSignal<WalletTokensBalances[]>([]);

  const msg = useSignal("1");

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    const data = await balancesLiveStream();
    for await (const value of data) {
      msg.value = value;
    }
  });
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async ({ track }) => {
    track(() => wagmiConfig.config);
    watchAccount(wagmiConfig.config!, {
      onChange() {
        const connections = getConnections(wagmiConfig.config as Config);
        if (connections.length > 1) {
          isSecondWalletConnected.value = true;
        } else {
          isSecondWalletConnected.value = false;
        }
      },
    });
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
        const cookie = getCookie("accessToken");
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

      if (wagmiConfig.config) {
        await disconnectWallets(wagmiConfig.config);
      }
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
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async ({ track }) => {
    track(() => wagmiConfig.config);
    watchAccount(wagmiConfig.config!, {
      onChange() {
        const connections = getConnections(wagmiConfig.config as Config);
        if (connections.length > 1) {
          isSecondWalletConnected.value = true;
        } else {
          isSecondWalletConnected.value = false;
        }
      },
    });
  });
  const handleReadBalances = $(async (wallet: string) => {
    const tokenBalances = await getMoralisBalance({ wallet });

    walletTokenBalances.value = tokenBalances.tokens;
  });

  const handleTransfer = $(async () => {
    if (!selectedWallet.value || !wagmiConfig.config) {
      return { error: "no chosen wallet" };
    }

    const from = selectedWallet.value.wallet.address;
    const to = receivingWalletAddress.value;
    const token = transferredCoin.address;
    const decimals = selectedWallet.value.tokens.filter(
      (token) => token.symbol === transferredCoin.symbol,
    )[0].decimals;
    const amount = transferredTokenAmount.value;
    const { numerator, denominator } = convertToFraction(amount);
    const calculation =
      BigInt(numerator * BigInt(Math.pow(10, decimals))) / BigInt(denominator);
    if (
      from === "" ||
      to === "" ||
      token === "" ||
      amount === "" ||
      !checkPattern(transferredTokenAmount.value, /^\d*\.?\d*$/)
    ) {
      return {
        error: "Values cant be empty",
      };
    } else {
      isTransferModalOpen.value = false;
      const cookie = getCookie("accessToken");
      if (!cookie) throw new Error("No accessToken cookie found");
      const emethContractAddress = import.meta.env
        .PUBLIC_EMETH_CONTRACT_ADDRESS_SEPOLIA;
      try {
        const { request } = await simulateContract(wagmiConfig.config, {
          abi: emethContractAbi,
          address: emethContractAddress,
          functionName: "transferToken",
          args: [
            token as `0x${string}`,
            from as `0x${string}`,
            to as `0x${string}`,
            BigInt(calculation),
          ],
        });

        formMessageProvider.messages.push({
          id: formMessageProvider.messages.length,
          variant: "info",
          message: "Transferring tokens...",
          isVisible: true,
        });

        const transactionHash = await writeContract(
          wagmiConfig.config,
          request,
        );

        await waitForTransactionReceipt(wagmiConfig.config, {
          hash: transactionHash,
        });

        formMessageProvider.messages.push({
          id: formMessageProvider.messages.length,
          variant: "success",
          message: "Success!",
          isVisible: true,
        });
      } catch (err) {
        console.error("error", err);
        formMessageProvider.messages.push({
          id: formMessageProvider.messages.length,
          variant: "error",
          message: "Something went wrong.",
          isVisible: true,
        });
      }
    }
  });

  const connectWallet = $(async () => {
    await openWeb3Modal(wagmiConfig!.config);
  });

  return (
    <>
      <div class="grid grid-cols-[1fr_3fr] gap-6 p-6">
        <div class="custom-border-1 custom-bg-opacity-5 grid grid-rows-[32px_88px_1fr] gap-6 rounded-2xl p-6">
          <div class="flex items-center justify-between gap-2">
            <h1 class="text-xl font-semibold">Wallets</h1>
            <button
              class="custom-border-opacity-30 h-8 cursor-pointer text-nowrap rounded-10 px-4 text-xs font-medium duration-300 ease-in-out hover:scale-110"
              onClick$={() => {
                isAddWalletModalOpen.value = !isAddWalletModalOpen.value;
              }}
            >
              Add New Wallet
            </button>
          </div>

          <div class="grid w-full gap-2">
            <ButtonWithIcon
              image="/assets/icons/search.svg"
              text="Search for wallet"
              class="custom-text-50 custom-border-1 h-10 justify-start gap-2 rounded-lg px-3"
            />
            <ButtonWithIcon
              image="/assets/icons/arrow-down.svg"
              text="Choose Network"
              class="custom-border-1 h-10 flex-row-reverse justify-between gap-2 rounded-lg px-3"
            />
          </div>
          <ObservedWalletsList
            observedWallets={observedWallets}
            selectedWallet={selectedWallet}
          />
        </div>

        <div class="grid gap-6">
          {/* <PendingAuthorization/> */}
          <div class="custom-border-1 custom-bg-opacity-5 grid grid-rows-[64px_24px_1fr] gap-4 rounded-2xl p-6">
            {selectedWallet.value && (
              <SelectedWalletDetails
                key={selectedWallet.value.wallet.address}
                selectedWallet={selectedWallet}
                chainIdToNetworkName={chainIdToNetworkName}
                isDeleteModalopen={isDeleteModalOpen}
                isTransferModalOpen={isTransferModalOpen}
                transferredCoin={transferredCoin}
              />
            )}
          </div>
        </div>
      </div>

      {isAddWalletModalOpen.value && (
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
                  isWalletConnected={false}
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
                  class="custom-border-1 w-full bg-transparent text-white duration-300 ease-in-out hover:scale-105 disabled:scale-100 disabled:cursor-default disabled:border disabled:border-white disabled:border-opacity-10 disabled:bg-white disabled:bg-opacity-10 disabled:text-opacity-20"
                  onClick$={async () => {
                    stepsCounter.value = stepsCounter.value - 1;
                  }}
                  type="button"
                  text="Back"
                />
              ) : null}
              {addWalletFormStore.isExecutable === 0 ? (
                <Button
                  class="w-full border-0 bg-customBlue text-white duration-300 ease-in-out hover:scale-105 disabled:scale-100 disabled:cursor-default disabled:border disabled:border-white disabled:border-opacity-10 disabled:bg-white disabled:bg-opacity-10 disabled:text-opacity-20"
                  onClick$={handleAddWallet}
                  type="button"
                  disabled={isNotExecutableDisabled(addWalletFormStore)}
                  text="Add Wallet"
                />
              ) : stepsCounter.value === 3 ? (
                <Button
                  class="w-full border-0 bg-customBlue text-white duration-300 ease-in-out hover:scale-105 disabled:scale-100 disabled:cursor-default disabled:border disabled:border-white disabled:border-opacity-10 disabled:bg-white disabled:bg-opacity-10 disabled:text-opacity-20"
                  onClick$={handleAddWallet}
                  type="button"
                  disabled={
                    addWalletFormStore.isExecutable
                      ? isExecutableDisabled(addWalletFormStore)
                      : isNotExecutableDisabled(addWalletFormStore)
                  }
                  text="Add wallet"
                />
              ) : (
                <Button
                  class="w-full border-0 bg-customBlue text-white duration-300 ease-in-out hover:scale-105 disabled:scale-100 disabled:cursor-default disabled:border disabled:border-white disabled:border-opacity-10 disabled:bg-white disabled:bg-opacity-10 disabled:text-opacity-20"
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
                  text="Proceed"
                />
              )}
            </div>
          </Form>
        </Modal>
      )}

      {isDeleteModalOpen.value && (
        <Modal
          isOpen={isDeleteModalOpen}
          title=""
          hasButton={false}
          customClass="py-8 px-14 w-fit"
        >
          <div class="flex flex-col items-center gap-4">
            <ImgWarningRed />
            <h1 class="text-center text-xl">
              You are going to permanently delete your wallet!
            </h1>
          </div>
          <div class="my-8 flex justify-center">
            <ul class="custom-text-50 text-sm">
              <li>
                <span class="before:mr-3 before:inline-block before:h-3 before:w-2 before:rotate-45 before:border-b-2 before:border-r-2 before:border-solid before:border-green-600" />
                We will stop all related automation
              </li>
              <li>
                <span class="before:mr-3 before:inline-block before:h-3 before:w-2 before:rotate-45 before:border-b-2 before:border-r-2 before:border-solid before:border-green-600" />
                Change all future report processes
              </li>
              <li>
                <span class="before:mr-3 before:inline-block before:h-3 before:w-2 before:rotate-45 before:border-b-2 before:border-r-2 before:border-solid before:border-green-600" />
                Stop all alerts
              </li>
            </ul>
          </div>
          <div class="grid grid-cols-[49%_49%] gap-2">
            <button
              class="custom-border-1 flex h-12 items-center justify-center rounded-3xl px-2 text-center text-xs text-white duration-300 ease-in-out hover:scale-105"
              onClick$={() => (isDeleteModalOpen.value = false)}
            >
              Cancel
            </button>
            <button
              onClick$={async () => {
                if (selectedWallet.value && selectedWallet.value.wallet.id) {
                  const {
                    value: { success },
                  } = await removeWalletAction.submit({
                    id: selectedWallet.value.wallet.id,
                  });
                  selectedWallet.value = null;
                  isDeleteModalOpen.value = false;
                  if (success) {
                    observedWallets.value = await getObservedWallets();
                  }
                }
              }}
              class="h-12 rounded-3xl bg-red-500 px-2 text-center text-sm text-white duration-300 ease-in-out hover:scale-105"
            >
              Yes, let’s do it!
            </button>
          </div>
        </Modal>
      )}

      {isTransferModalOpen.value ? (
        <Modal isOpen={isTransferModalOpen} title="Transfer">
          <Form>
            <div class="p-4">
              <p class="mb-4 mt-4 flex items-center gap-2 text-sm">
                {transferredCoin.symbol ? transferredCoin.symbol : null}
              </p>

              <label
                for="receivingWallet"
                class="block pb-1 text-xs text-white"
              >
                Receiving Wallet Address
              </label>
              <input
                type="text"
                name="receivingWallet"
                class={`border-white-opacity-20 mb-5 block w-full rounded bg-transparent p-3 text-sm placeholder-white placeholder-opacity-50`}
                placeholder="Place wallet address"
                value={receivingWalletAddress.value}
                onInput$={(e) => {
                  const target = e.target as HTMLInputElement;
                  receivingWalletAddress.value = target.value;
                }}
              />
              <label
                for="receivingWallet"
                class="block pb-1 text-xs text-white"
              >
                Amount
              </label>
              <input
                type="text"
                name="transferredTokenAmount"
                class={`border-white-opacity-20 mb-5 block w-full rounded bg-transparent p-3 text-sm placeholder-white placeholder-opacity-50`}
                placeholder="Please enter digits and at most one dot"
                value={transferredTokenAmount.value}
                onInput$={(e) => {
                  const target = e.target as HTMLInputElement;
                  const regex = /^\d*\.?\d*$/;
                  target.value = replaceNonMatching(target.value, regex, "");
                  transferredTokenAmount.value = target.value;
                }}
              />
              <span class="block pb-1 text-xs text-white">
                {!checkPattern(transferredTokenAmount.value, /^\d*\.?\d*$/) ? (
                  <span class="text-xs text-red-500">
                    Invalid amount. There should be only one dot.
                  </span>
                ) : null}
              </span>
              <button
                class="custom-border-1 custom-bg-white row-span-1 row-start-3 mb-6 flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-xs text-white"
                onClick$={() => handleTransfer()}
              >
                transfer
              </button>
            </div>
          </Form>
        </Modal>
      ) : null}
    </>
  );
});
