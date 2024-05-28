import {
  $,
  component$,
  createContextId,
  type Signal,
  useContext,
  useContextProvider,
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
import * as jwtDecode from "jwt-decode";
import { WagmiConfigContext } from "~/components/WalletConnect/context";
import { messagesContext } from "../layout";
import Button from "~/components/Atoms/Buttons/Button";

import {
  type Config,
  getAccount,
  readContract,
  simulateContract,
  writeContract,
  getConnections,
  watchAccount,
} from "@wagmi/core";

import AddWalletFormFields from "~/components/Forms/AddWalletFormFields";
import CoinsToApprove from "~/components/Forms/CoinsToApprove";
import AmountOfCoins from "~/components/Forms/AmountOfCoins";
import { ButtonWithIcon } from "~/components/Buttons/Buttons";
import ImgWarningRed from "/public/assets/icons/wallets/warning-red.svg?jsx";
import {
  getObservedWallets,
  ObservedWalletsList,
} from "~/components/ObservedWalletsList/ObservedWalletsList";
export {
  getObservedWallets,
  ObservedWalletsList,
} from "~/components/ObservedWalletsList/ObservedWalletsList";

import { convertToFraction } from "~/utils/fractions";
import {
  isExecutableDisabled,
  isNotExecutableDisabled,
  isProceedDisabled,
} from "~/utils/validators/addWallet";
import { useAddWallet, useRemoveWallet } from "./server";
export { useAddWallet, useGetBalanceHistory, useRemoveWallet } from "./server";
import { type AddWalletFormStore } from "./interface";
import { fetchTokens } from "~/database/tokens";
import { getMoralisBalance } from "~/server/moralis";
import { disconnectWallets, openWeb3Modal } from "~/utils/walletConnections";
import { getAccessToken } from "~/utils/refresh";
import { type Wallet } from "~/interface/auth/Wallet";

export const SelectedWalletDetailsContext = createContextId<Signal<Wallet>>(
  "selected-wallet-details-context",
);
export const SelectedWalletNameContext = createContextId<Signal<string>>(
  "selected-wallet-name-context",
);

export default component$(() => {
  // context start
  const selectedWalletDetails = useSignal<Wallet | undefined>(undefined);
  useContextProvider(SelectedWalletDetailsContext, selectedWalletDetails);

  const selectedWalletName = useSignal<string>("");
  useContextProvider(SelectedWalletNameContext, selectedWalletName);
  // context end
  const wagmiConfig = useContext(WagmiConfigContext);
  const formMessageProvider = useContext(messagesContext);
  const walletTokenBalances = useSignal<any>([]);
  const addWalletAction = useAddWallet();
  const removeWalletAction = useRemoveWallet();
  const isAddWalletModalOpen = useSignal(false);
  const isDeleteModalOpen = useSignal(false);
  const transferredCoin = useStore({ symbol: "", address: "" });
  const isTransferModalOpen = useSignal(false);
  const selWallet = useSignal<Wallet | null>(null);
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
  // const observedWallets = useSignal<WalletTokensBalances[]>([]);

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

      // could be removed
      // if (success) {
      //   observedWallets.value = await getObservedWallets();
      // }

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

  const connectWallet = $(async () => {
    await openWeb3Modal(wagmiConfig!.config);
  });

  return (
    <>
      <div class="grid grid-cols-[1fr_3fr] gap-6 p-6">
        <div class="custom-border-1 custom-bg-opacity-5 grid grid-rows-[32px_88px_1fr] gap-6 rounded-2xl p-6">
          <div class="flex items-center justify-between gap-2">
            <h1 class="text-xl font-semibold">Wallets</h1>
            <Button
              onClick$={() => {
                isAddWalletModalOpen.value = !isAddWalletModalOpen.value;
              }}
              text="Add New Wallet"
              variant="transparent"
              size="small"
            />
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
          <ObservedWalletsList />
        </div>

        <div class="grid gap-6">
          {/* <PendingAuthorization/> */}
          <div class="custom-border-1 custom-bg-opacity-5 grid grid-rows-[64px_24px_1fr] gap-4 rounded-2xl p-6">
            {selectedWalletDetails.value && (
              <SelectedWalletDetails
                selWallet={selWallet}
                key={selectedWalletDetails.value.id}
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
            <Button
              variant="transparent"
              text="Cancel"
              onClick$={() => (isDeleteModalOpen.value = false)}
              customClass="w-full"
            />
            {/* <Button
              variant="red"
              text="Yes, Let’s Do It!"
              customClass="w-full"
              onClick$={async () => {
                if (selectedWallet.value && selectedWallet.value.wallet.id) {
                  const {
                    value: { success },
                  } = await removeWalletAction.submit({
                    id: selectedWallet.value.wallet.id,
                  });
                  selectedWallet.value = null;
                  isDeleteModalOpen.value = false;
                  // if (success) {
                  //   observedWallets.value = await getObservedWallets();
                  // }
                }
              }}
            /> */}
          </div>
        </Modal>
      )}
    </>
  );
});
