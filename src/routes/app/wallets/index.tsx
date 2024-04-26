import {
  $,
  component$,
  type NoSerialize,
  noSerialize,
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
import { isValidAddress, isValidName } from "~/utils/validators/addWallet";
import { emethContractAbi } from "~/abi/emethContractAbi";
import IsExecutableSwitch from "~/components/Forms/isExecutableSwitch";
import { getCookie } from "~/utils/refresh";
import * as jwtDecode from "jwt-decode";
import { StreamStoreContext } from "~/interface/streamStore/streamStore";
import { ModalStoreContext } from "~/interface/web3modal/ModalStore";
import { messagesContext } from "../layout";
import { type Chain, sepolia } from "viem/chains";
import {
  type Config,
  getAccount,
  readContract,
  simulateContract,
  waitForTransactionReceipt,
  watchAccount,
  writeContract,
  disconnect,
} from "@wagmi/core";
import { returnWeb3ModalAndClient } from "~/components/WalletConnect";
import AddWalletFormFields from "~/components/Forms/AddWalletFormFields";
import CoinsToApprove from "~/components/Forms/CoinsToApprove";
import AmountOfCoins from "~/components/Forms/AmountOfCoins";
import { Button, ButtonWithIcon } from "~/components/Buttons/Buttons";
import ImgWarningRed from "/public/assets/icons/wallets/warning-red.svg?jsx";
import {
  getObservedWallets,
  ObservedWalletsList,
} from "~/components/ObservedWalletsList/ObservedWalletsList";
import { useAddWallet } from "./server/addWalletAction";
import { useRemoveWallet } from "./server/removeWalletAction";
import { useGetBalanceHistory } from "./server/getBalanceHistoryAction";
import { balancesLiveStream } from "./server/balancesLiveStream";
import { addAddressToStreamConfig, getMoralisBalance } from "~/server/moralis";
import { fetchTokens } from "~/database/token/fetchTokens";
import { replaceNonMatching } from "~/utils/replaceNonMatching";
import { convertToFraction } from "~/utils/convertToFraction";
import { checkIfStringMatchesPattern } from "~/utils/checkIfStringMatchesPattern";
export { useAddWallet } from "./server/addWalletAction";
export { useRemoveWallet } from "./server/removeWalletAction";
export { useGetBalanceHistory } from "./server/getBalanceHistoryAction";

export interface addWalletFormStore {
  name: string;
  address: string;
  isExecutable: number;
  isNameUnique: boolean;
  isNameUniqueLoading: boolean;
  coinsToCount: string[];
  coinsToApprove: {
    symbol: string;
    amount: string;
  }[];
}

export interface transferredCoinInterface {
  symbol: string;
  address: string;
}

interface ModalStore {
  isConnected?: boolean;
  config?: NoSerialize<Config>;
}

export default component$(() => {
  const modalStore = useContext(ModalStoreContext);
  const formMessageProvider = useContext(messagesContext);
  const { streamId } = useContext(StreamStoreContext);
  const walletTokenBalances = useSignal<any>([]);
  const addWalletAction = useAddWallet();
  const removeWalletAction = useRemoveWallet();
  const observedWallets = useSignal<WalletTokensBalances[]>([]);
  const isAddWalletModalOpen = useSignal(false);
  const isDeleteModalOpen = useSignal(false);
  const transferredCoin = useStore({ symbol: "", address: "" });
  const isTransferModalOpen = useSignal(false);
  const selectedWallet = useSignal<WalletTokensBalances | null>(null);
  const receivingWalletAddress = useSignal("");
  const transferredTokenAmount = useSignal("");
  const stepsCounter = useSignal(1);
  const msg = useSignal("1");
  const addWalletFormStore = useStore<addWalletFormStore>({
    name: "",
    address: "",
    isExecutable: 0,
    isNameUnique: true,
    isNameUniqueLoading: false,
    coinsToCount: [],
    coinsToApprove: [],
  });
  const getWalletBalanceHistory = useGetBalanceHistory();

  const temporaryModalStore = useStore<ModalStore>({
    isConnected: false,
    config: undefined,
  });

  const setWeb3Modal = $(async () => {
    const chains: [Chain, ...Chain[]] = [sepolia];
    const projectId = import.meta.env.PUBLIC_PROJECT_ID;
    if (!projectId || typeof projectId !== "string") {
      throw new Error("Missing project ID");
    }
    return returnWeb3ModalAndClient(projectId, true, true, true, chains);
  });

  const openWeb3Modal = $(async () => {
    const { config, modal } = await setWeb3Modal();
    await modal.open({ view: "Connect" });
    temporaryModalStore.config = noSerialize(config);
    const { address } = getAccount(config);

    addWalletFormStore.address = address as `0x${string}`;
    watchAccount(config, {
      onChange(data) {
        temporaryModalStore.isConnected = data.isConnected;
      },
    });
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    const data = await balancesLiveStream();
    for await (const value of data) {
      msg.value = value;
    }
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
        if (temporaryModalStore.isConnected && temporaryModalStore.config) {
          const account = getAccount(temporaryModalStore.config);

          addWalletFormStore.address = account.address as `0x${string}`;

          if (!emethContractAddress) {
            throw new Error("Missing PUBLIC_EMETH_CONTRACT_ADDRESS_SEPOLIA");
          }

          const tokens: any = await fetchTokens();

          for (const token of tokens) {
            if (addWalletFormStore.coinsToCount.includes(token.symbol)) {
              const tokenBalance = await readContract(
                temporaryModalStore.config,
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
                const approval = await simulateContract(
                  temporaryModalStore.config,
                  {
                    account: account.address as `0x${string}`,
                    abi: contractABI,
                    address: checksumAddress(token.address as `0x${string}`),
                    functionName: "approve",
                    args: [emethContractAddress, BigInt(calculation)],
                  },
                );

                // keep receipts for now, to use waitForTransactionReceipt
                try {
                  await writeContract(
                    temporaryModalStore.config,
                    approval.request,
                  );
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
          temporaryModalStore.config as Config,
          {
            account: addWalletFormStore.address as `0x${string}`,
            address: emethContractAddress,
            abi: emethContractAbi,
            functionName: "approve",
            args: [address as `0x${string}`],
          },
        );

        await writeContract(temporaryModalStore.config as Config, request);
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
      if (temporaryModalStore.config) {
        await disconnect(temporaryModalStore.config as Config);
        temporaryModalStore.config = undefined;
      }
      addWalletFormStore.address = "";
      addWalletFormStore.name = "";
      addWalletFormStore.isExecutable = 0;
      addWalletFormStore.coinsToCount = [];
      addWalletFormStore.coinsToApprove = [];
      stepsCounter.value = 1;
      temporaryModalStore.isConnected = false;
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

  const handleReadBalances = $(async (wallet: string) => {
    const tokenBalances = await getMoralisBalance({ wallet });

    walletTokenBalances.value = tokenBalances.tokens;
  });

  const handleTransfer = $(async () => {
    if (!selectedWallet.value || !modalStore.config) {
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
      !checkIfStringMatchesPattern(transferredTokenAmount.value, /^\d*\.?\d*$/)
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
        const { request } = await simulateContract(modalStore.config, {
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

        const transactionHash = await writeContract(modalStore.config, request);

        await waitForTransactionReceipt(modalStore.config, {
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

  const connectWallet = $(() => {
    openWeb3Modal();
  });

  return (
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

      {isAddWalletModalOpen.value && (
        <Modal
          isOpen={isAddWalletModalOpen}
          title="Add Wallet"
          onClose={$(async () => {
            if (temporaryModalStore.config) {
              await disconnect(temporaryModalStore.config as Config);
              temporaryModalStore.config = undefined;
            }
            addWalletFormStore.address = "";
            addWalletFormStore.name = "";
            addWalletFormStore.isExecutable = 0;
            addWalletFormStore.coinsToCount = [];
            addWalletFormStore.coinsToApprove = [];
            stepsCounter.value = 1;
            temporaryModalStore.isConnected = false;
          })}
        >
          <Form>
            {stepsCounter.value === 1 ? (
              <>
                <IsExecutableSwitch addWalletFormStore={addWalletFormStore} />
                <AddWalletFormFields
                  addWalletFormStore={addWalletFormStore}
                  onConnectWalletClick={connectWallet}
                  isWalletConnected={temporaryModalStore.isConnected}
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
                  disabled={isExecutableDisabled(addWalletFormStore)}
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
                        temporaryModalStore.config as Config,
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
                    temporaryModalStore,
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
                {!checkIfStringMatchesPattern(
                  transferredTokenAmount.value,
                  /^\d*\.?\d*$/,
                ) ? (
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
    </div>
  );
});

const isProceedDisabled = (
  addWalletFormStore: addWalletFormStore,
  temporaryModalStore: ModalStore,
) =>
  addWalletFormStore.name === "" ||
  !isValidName(addWalletFormStore.name) ||
  !addWalletFormStore.isNameUnique ||
  addWalletFormStore.isNameUniqueLoading ||
  !temporaryModalStore.config;

const isExecutableDisabled = (addWalletFormStore: addWalletFormStore) =>
  addWalletFormStore.name === "" ||
  !isValidName(addWalletFormStore.name) ||
  !addWalletFormStore.isNameUnique ||
  addWalletFormStore.isNameUniqueLoading;

const isNotExecutableDisabled = (addWalletFormStore: addWalletFormStore) =>
  addWalletFormStore.name === "" ||
  addWalletFormStore.address === "" ||
  !isValidName(addWalletFormStore.name) ||
  !isValidAddress(addWalletFormStore.address) ||
  !addWalletFormStore.isNameUnique ||
  addWalletFormStore.isNameUniqueLoading;
