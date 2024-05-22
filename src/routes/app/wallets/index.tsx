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
import * as jwtDecode from "jwt-decode";
import { StreamStoreContext } from "~/interface/streamStore/streamStore";
import { WagmiConfigContext } from "~/components/WalletConnect/context";
import { messagesContext } from "../layout";
import Button from "~/components/Atoms/Buttons/Button";
import Box from "~/components/Atoms/Box/Box";
import IconSearch from "@material-design-icons/svg/filled/search.svg?jsx";

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
import IconWarningRed from "@material-design-icons/svg/filled/warning_amber.svg?jsx";
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
import { useAddWallet, useGetBalanceHistory, useRemoveWallet } from "./server";
export { useAddWallet, useGetBalanceHistory, useRemoveWallet } from "./server";
import { type AddWalletFormStore } from "./interface";
import { fetchTokens } from "~/database/tokens";
import { addAddressToStreamConfig, getMoralisBalance } from "~/server/moralis";
import { balancesLiveStream } from "./server/balancesLiveStream";
import { disconnectWallets, openWeb3Modal } from "~/utils/walletConnections";
import { getAccessToken } from "~/utils/refresh";
import BoxHeader from "../../../components/Molecules/BoxHeader/BoxHeader";
import Input from "~/components/Atoms/Input/Input";
import Select from "~/components/Atoms/Select/Select";

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

  const connectWallet = $(async () => {
    await openWeb3Modal(wagmiConfig!.config);
  });

  return (
    <>
      <div class="grid grid-cols-[1fr_3fr] gap-6 p-6">
        <Box customClass="grid grid-rows-[32px_88px_1fr] gap-6 h-full">
          <BoxHeader variantHeader="h3" title="Wallets" class="gap-2">
            <Button
              onClick$={() => {
                isAddWalletModalOpen.value = !isAddWalletModalOpen.value;
              }}
              text="Add New Wallet"
              variant="transparent"
              size="small"
            />
          </BoxHeader>

          <div class="grid w-full gap-2">
            <Input
              variant="search"
              iconLeft={<IconSearch class="h-4 w-4" />}
              placeholder="Search for wallet"
              size="small"
            />
            <Select
              name=""
              options={[{ value: "", text: "Choose Network" }]}
              size="medium"
            />
          </div>
          <ObservedWalletsList
            observedWallets={observedWallets}
            selectedWallet={selectedWallet}
          />
        </Box>

        <div class="grid gap-6">
          {/* <PendingAuthorization/> */}
          <Box customClass="grid grid-rows-[72px_24px_1fr] gap-4 h-full">
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
          </Box>
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
          customClass="!py-8 !px-14 !w-fit"
        >
          <BoxHeader
            variantHeader="h3"
            title="You are going to permanently delete your wallet!"
            class="flex-col-reverse gap-4"
          >
            <IconWarningRed class="h-16 w-16 fill-customRed" />
          </BoxHeader>
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
            <Button
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
                  if (success) {
                    observedWallets.value = await getObservedWallets();
                  }
                }
              }}
            />
          </div>
        </Modal>
      )}
    </>
  );
});
