import IconArrowDown from "@material-design-icons/svg/filled/expand_more.svg?jsx";
import IconClose from "@material-design-icons/svg/round/close.svg?jsx";
import Button from "~/components/Atoms/Buttons/Button";
import IconTransfer from "@material-design-icons/svg/round/arrow_circle_up.svg?jsx";
import IconAdd from "@material-design-icons/svg/outlined/add.svg?jsx";
import { Group } from "~/components/Groups/Group";
import {
  $,
  component$,
  type JSXOutput,
  type QRL,
  type Signal,
  useSignal,
  useStore,
  useTask$,
  useContext,
  useVisibleTask$,
} from "@builder.io/qwik";
import { messagesContext } from "../layout";
import { Form } from "@builder.io/qwik-city";
import { Modal } from "~/components/Modal/Modal";
import { isValidName } from "~/utils/validators/addWallet";

import {
  simulateContract,
  writeContract,
  waitForTransactionReceipt,
} from "@wagmi/core";
import { emethContractAbi } from "~/abi/emethContractAbi";
import CoinsToTransfer from "~/components/Forms/portfolioTransfters/CoinsToTransfer";
import CoinsAmounts from "~/components/Forms/portfolioTransfters/CoinsAmounts";
import Destination from "~/components/Forms/portfolioTransfters/Destination";
import {
  useDeleteStructure,
  useDeleteToken,
  useCreateStructure,
  getObservedWalletBalances,
  getAvailableStructures,
} from "./server";
export {
  useDeleteStructure,
  useDeleteToken,
  useCreateStructure,
  getObservedWalletBalances,
  getAvailableStructures,
} from "./server";
import { fetchTokens, queryTokens } from "~/database/tokens";
import { convertToFraction } from "~/utils/fractions";
import {
  type WalletWithBalance,
  type BatchTransferFormStore,
} from "./interface";
import { WagmiConfigContext } from "~/components/WalletConnect/context";

import { Spinner } from "~/components/Spinner/Spinner";

import { type ObservedBalanceDetails } from "~/interface/walletsTokensBalances/walletsTokensBalances";
import {
  hasExecutableWallet,
  isNameUnique,
} from "~/utils/validators/availableStructure";

import { SwapModal } from "./_components/Swap/Swap";
import NoData from "~/components/Molecules/NoData/NoData";
import { useDebouncer } from "~/utils/debouncer";
import Box from "~/components/Atoms/Box/Box";
import Header from "~/components/Atoms/Headers/Header";
import Annotation from "~/components/Atoms/Annotation/Annotation";
import BoxHeader from "../../../components/Molecules/BoxHeader/BoxHeader";
import InputField from "../../../components/Molecules/InputField/InputField";
import Label from "~/components/Atoms/Label/Label";
import Input from "~/components/Atoms/Input/Input";
import IconSearch from "@material-design-icons/svg/filled/search.svg?jsx";
import Select from "~/components/Atoms/Select/Select";

export default component$(() => {
  const wagmiConfig = useContext(WagmiConfigContext);
  const clickedToken = useStore({ balanceId: "", structureId: "" });
  const structureStore = useStore({ name: "" });
  const selectedWallets = useStore({ wallets: [] as any[] });
  const isCreateNewStructureModalOpen = useSignal(false);
  const isTransferModalOpen = useSignal(false);
  const isSwapModalOpen = useSignal<boolean>(false);
  const deleteToken = useDeleteToken();
  const formMessageProvider = useContext(messagesContext);
  const createStructureAction = useCreateStructure();
  const deleteStructureAction = useDeleteStructure();
  const isWalletSelected = useStore({
    selection: [] as { walletId: string; status: boolean }[],
  });
  const isSelectAllChecked = useStore({ wallets: false, tokens: false });
  const selectedTokens = useStore({ balances: [] as string[] });
  const isTokenSelected = useStore({
    selection: [] as { balanceId: string; status: boolean }[],
  });
  const availableBalances = useSignal<number>(0);
  const stepsCounter = useSignal(1);
  const batchTransferFormStore = useStore<BatchTransferFormStore>({
    receiverAddress: "",
    coinsToTransfer: [],
  });
  const tokenFromAddress = useSignal("");
  const allTokensFromDb = useSignal([]);
  const walletAddressOfTokenToSwap = useSignal("");
  const tokenFromSymbol = useSignal("");
  const structureNameInputRef = useSignal<HTMLInputElement>();
  const isStructureNameUnique = useSignal(true);

  useTask$(async ({ track }) => {
    track(() => {
      structureNameInputRef.value?.focus();
    });
  });

  const nameInputDebounce = useDebouncer(
    $(async (value: string) => {
      isStructureNameUnique.value = await isNameUnique(value);
    }),
    300,
  );

  useTask$(async () => {
    const tokens: any = await fetchTokens();
    allTokensFromDb.value = tokens;
  });

  const observedWalletsWithBalance = useSignal<any>([]);
  const availableStructures = useSignal<any>({
    structures: [],
    isLoading: true,
  });

  useTask$(async ({ track }) => {
    track(() => {
      clickedToken.structureId;
      clickedToken.balanceId;
      if (clickedToken.structureId !== "" && clickedToken.balanceId !== "") {
        deleteToken.submit({
          balanceId: clickedToken.balanceId,
          structureId: clickedToken.structureId,
        });
      }
    });
  });
  useTask$(async ({ track }) => {
    track(() => {
      isSelectAllChecked.wallets =
        selectedWallets.wallets.length ===
        observedWalletsWithBalance.value.length;
      isSelectAllChecked.tokens =
        selectedTokens.balances.length === availableBalances.value &&
        (selectedTokens.balances.length > 0 || availableBalances.value > 0);
    });
  });
  useTask$(async ({ track }) => {
    track(() => {
      if (selectedWallets.wallets.length === 0) {
        isSelectAllChecked.wallets = false;
        selectedTokens.balances = [];
        isTokenSelected.selection.map((balance) => (balance.status = false));
      }
    });
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    availableStructures.value = await getAvailableStructures();
    observedWalletsWithBalance.value = await getObservedWalletBalances();
  });
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async ({ track }) => {
    track(() => {
      createStructureAction.value;
      deleteToken.value;
      deleteStructureAction.value;
    });

    availableStructures.value = await getAvailableStructures();
  });

  const handleCheckboxChange = $(
    (category: any, objectId: string, key: string) => {
      const updatedSelection = [...category.selection];
      const selectedIndex = updatedSelection.findIndex(
        (item) => item[key] === objectId,
      );

      if (selectedIndex !== -1) {
        updatedSelection[selectedIndex].status =
          !updatedSelection[selectedIndex].status;
      } else {
        updatedSelection.push({ [key]: objectId, status: true });
      }
      category.selection = updatedSelection;
    },
  );

  const handleBatchTransfer = $(async () => {
    const emethContractAddress = import.meta.env
      .PUBLIC_EMETH_CONTRACT_ADDRESS_SEPOLIA;

    if (!emethContractAddress) {
      throw new Error("Missing PUBLIC_EMETH_CONTRACT_ADDRESS_SEPOLIA");
    }

    try {
      const tokens = await queryTokens();
      if (wagmiConfig.config.value) {
        const argsArray = [];
        for (const cStructure of batchTransferFormStore.coinsToTransfer) {
          for (const cCoin of cStructure.coins) {
            const chosenToken = tokens.find(
              (token: any) => token.symbol === cCoin.symbol.toUpperCase(),
            );
            const { numerator, denominator } = convertToFraction(cCoin.amount);
            const calculation =
              BigInt(numerator * BigInt(10 ** chosenToken.decimals)) /
              BigInt(denominator);
            argsArray.push({
              from: cCoin.address as `0x${string}`,
              to: batchTransferFormStore.receiverAddress as `0x${string}`,
              amount: calculation,
              token: chosenToken.address as `0x${string}`,
            });
          }
        }
        const { request } = await simulateContract(wagmiConfig.config.value, {
          abi: emethContractAbi,
          address: emethContractAddress,
          functionName: "transferBatch",
          args: [argsArray],
        });

        formMessageProvider.messages.push({
          id: formMessageProvider.messages.length,
          variant: "info",
          message: "Transferring tokens...",
          isVisible: true,
        });
        const transactionHash = await writeContract(
          wagmiConfig.config.value,
          request,
        );
        await waitForTransactionReceipt(wagmiConfig.config.value, {
          hash: transactionHash,
        });

        batchTransferFormStore.receiverAddress = "";
        batchTransferFormStore.coinsToTransfer = [];
        formMessageProvider.messages.push({
          id: formMessageProvider.messages.length,
          variant: "success",
          message: "Success!",
          isVisible: true,
        });
      }
    } catch (err) {
      console.error(err);
      formMessageProvider.messages.push({
        id: formMessageProvider.messages.length,
        variant: "error",
        message: "Something went wrong.",
        isVisible: true,
      });
    }
  });

  return (
    <>
      {availableStructures.value.isLoading ? (
        <Spinner />
      ) : !availableStructures.value.structures.length ? (
        <NoData
          variant="info"
          title="You didn't add any Sub Portfolio yet"
          description="Please add your first Sub Portfolio"
        >
          <Button
            text="Add Sub Portfolio"
            onClick$={async () => {
              isCreateNewStructureModalOpen.value =
                !isCreateNewStructureModalOpen.value;
            }}
            size="small"
          />
        </NoData>
      ) : (
        <div class="grid grid-rows-[32px_auto] gap-6 px-10 pb-10 pt-8">
          <BoxHeader variantHeader="h2" title="Portfolio Name">
            <div class="flex items-center gap-2">
              <Button
                variant="transparent"
                text="Transfer"
                size="small"
                disabled={
                  !hasExecutableWallet(availableStructures.value.structures)
                }
                onClick$={async () => {
                  for (const structure of availableStructures.value
                    .structures) {
                    const coins = [];
                    for (const wallet of structure.structureBalance) {
                      const walletAddress = `${observedWalletsWithBalance.value.find((item: WalletWithBalance) => item.wallet.id === wallet.wallet.id)?.wallet.address}`;
                      coins.push({
                        wallet: wallet.wallet.name,
                        isExecutable: wallet.wallet.isExecutable,
                        address: walletAddress,
                        symbol: wallet.balance.symbol,
                        amount: "0",
                        isChecked: false,
                      });
                    }
                    batchTransferFormStore.coinsToTransfer.push({
                      name: structure.structure.name,
                      coins: coins,
                    });
                  }
                  isTransferModalOpen.value = true;
                }}
                customClass="font-normal"
                leftIcon={<IconTransfer class="h-4 w-4 fill-white" />}
              />
              <Button
                text="Add Sub Portfolio"
                variant="blue"
                size="small"
                onClick$={async () => {
                  isCreateNewStructureModalOpen.value =
                    !isCreateNewStructureModalOpen.value;
                }}
                customClass="font-normal"
                leftIcon={<IconAdd class="h-4 w-4 fill-white" />}
              />
            </div>
          </BoxHeader>
          <Box customClass="grid min-h-[260px] grid-rows-[20px_32px_auto] gap-6 h-full">
            <Header variant="h3" text="Token list" />
            <div class="grid grid-cols-4 gap-2">
              <Input
                id="name"
                variant="search"
                placeholder="Search for name"
                size="small"
                iconLeft={<IconSearch class="h-4 w-4" />}
              />
              <Select
                id="subportfolio"
                name="subportfolio"
                options={[{ value: "", text: "Choose Subportfolio" }]}
                size="medium"
              />
              <Select
                id="wallet"
                name="wallet"
                options={[{ value: "", text: "Choose Wallet" }]}
                size="medium"
              />
              <Select
                id="name"
                name="network"
                options={[{ value: "", text: "Choose Network" }]}
                size="medium"
              />
            </div>
            <div class="grid grid-rows-[40px_auto] items-start gap-4  text-left text-sm">
              <div class="custom-text-50 grid grid-cols-[18%_13%_15%_18%_10%_10%_13%_6%] items-center text-xs font-normal">
                <Annotation text="Token name" transform="upper" />
                <Annotation text="Quantity" transform="upper" />
                <Annotation text="Value" transform="upper" />
                <div class="custom-bg-white custom-border-1 flex h-8 w-fit gap-2 rounded-lg p-[2px] text-center text-white">
                  <button class="custom-bg-button rounded-lg px-2">24h</button>
                  <button class="rounded-lg px-2">3d</button>
                  <button class="rounded-lg px-2">30d</button>
                </div>
                <Annotation text="Wallet" transform="upper" />
                <Annotation text="Network" transform="upper" />
                <Annotation text="" transform="upper" />
              </div>
              {availableStructures.value.structures.map(
                (createdStructures: any) => {
                  return (
                    <Group
                      key={createdStructures.structure.name}
                      createdStructure={createdStructures}
                      tokenStore={clickedToken}
                      onClick$={async () => {
                        await deleteStructureAction.submit({
                          id: createdStructures.structure.id,
                        });
                      }}
                      isSwapModalOpen={isSwapModalOpen}
                      walletAddressOfTokenToSwap={walletAddressOfTokenToSwap}
                      tokenFromAddress={tokenFromAddress}
                      tokenFromSymbol={tokenFromSymbol}
                    />
                  );
                },
              )}
            </div>
          </Box>
        </div>
      )}
      {isTransferModalOpen.value ? (
        <Modal
          title="Transfer Funds"
          isOpen={isTransferModalOpen}
          onClose={$(() => {
            batchTransferFormStore.receiverAddress = "";
            batchTransferFormStore.coinsToTransfer = [];
            stepsCounter.value = 1;
          })}
        >
          <div class="mb-4 flex flex-col overflow-y-scroll">
            {stepsCounter.value === 1 ? (
              <CoinsToTransfer
                // add filter to exclude structures with no exe wallet
                availableStructures={availableStructures}
                batchTransferFormStore={batchTransferFormStore}
              />
            ) : null}
            {stepsCounter.value === 2 ? (
              <CoinsAmounts batchTransferFormStore={batchTransferFormStore} />
            ) : null}
            {stepsCounter.value === 3 ? (
              <Destination batchTransferFormStore={batchTransferFormStore} />
            ) : null}
          </div>
          <div class="flex gap-4">
            <Button
              variant="transparent"
              type="button"
              text={stepsCounter.value === 1 ? "Cancel" : "Back"}
              onClick$={async () => {
                if (stepsCounter.value === 2) {
                  batchTransferFormStore.coinsToTransfer = [];
                  for (const structure of availableStructures.value
                    .structures) {
                    const coins = [];
                    for (const wallet of structure.structureBalance) {
                      const walletAddress = `${observedWalletsWithBalance.value.find((item: WalletWithBalance) => item.walletName === wallet.wallet.name)?.wallet.address}`;
                      coins.push({
                        wallet: wallet.wallet.name,
                        isExecutable: wallet.wallet.isExecutable,
                        address: walletAddress,
                        symbol: wallet.balance.symbol,
                        amount: "0",
                        isChecked: false,
                      });
                    }
                    batchTransferFormStore.coinsToTransfer.push({
                      name: structure.structure.name,
                      coins: coins,
                    });
                  }
                }
                if (stepsCounter.value > 1) {
                  stepsCounter.value = stepsCounter.value - 1;
                } else {
                  isTransferModalOpen.value = false;
                  batchTransferFormStore.receiverAddress = "";
                  batchTransferFormStore.coinsToTransfer = [];
                  stepsCounter.value = 1;
                }
              }}
              customClass="w-full"
            />
            <Button
              variant="blue"
              text={stepsCounter.value === 3 ? "Send" : "Next"}
              onClick$={async () => {
                if (stepsCounter.value === 3) {
                  isTransferModalOpen.value = false;
                  stepsCounter.value = 1;

                  await handleBatchTransfer();
                } else {
                  stepsCounter.value = stepsCounter.value + 1;
                }
              }}
              customClass="w-full"
            />
          </div>
        </Modal>
      ) : null}
      {isCreateNewStructureModalOpen.value && (
        <Modal
          isOpen={isCreateNewStructureModalOpen}
          title="Create new structure"
          onClose={$(() => {
            isWalletSelected.selection = [];
            isTokenSelected.selection = [];
            selectedWallets.wallets = [];
            selectedTokens.balances = [];
            structureStore.name = "";
            isStructureNameUnique.value = true;
          })}
        >
          <Form
            action={createStructureAction}
            onSubmitCompleted$={$(() => {
              if (createStructureAction.value?.success) {
                isCreateNewStructureModalOpen.value = false;
                isWalletSelected.selection = [];
                isTokenSelected.selection = [];
                selectedWallets.wallets = [];
                selectedTokens.balances = [];
                structureStore.name = "";
                isStructureNameUnique.value = true;
              }
            })}
            class="mt-8 text-sm"
          >
            {!isValidName(structureStore.name) && (
              <Annotation
                text="Name too short"
                class="absolute end-6 mb-4 pt-[1px] !text-customRed"
              />
            )}
            <InputField
              id="name"
              name="name"
              variant={null}
              size="large"
              ref={structureNameInputRef}
              placeholder="Structure name..."
              value={structureStore.name}
              onInput={$((e) => {
                const target = e.target as HTMLInputElement;
                structureStore.name = target.value;
                nameInputDebounce(target.value);
              })}
            />
            <Label name="Select Wallets" class="mb-2" />

            <div class="mb-3 w-full text-sm">
              {/* input Select wallet */}
              <input
                id="walletCheckbox"
                type="checkbox"
                class="walletCheckbox absolute h-0 w-0 overflow-hidden"
              />
              <label
                for="walletCheckbox"
                class="walletLabel custom-border-1 relative block h-12 w-full cursor-pointer rounded-lg bg-transparent outline-none"
              >
                {selectedWallets.wallets.length > 0 && (
                  <div class="custom-bg-button absolute start-2 top-[0.45rem] flex h-8 w-fit items-center gap-2 rounded-md px-3 py-1.5">
                    <p>{selectedWallets.wallets.length} selections</p>
                    <Button
                      variant="onlyIcon"
                      leftIcon={<IconClose class="h-4 w-4 fill-white" />}
                      onClick$={() => {
                        isSelectAllChecked.wallets = false;
                        isSelectAllChecked.tokens = false;
                        isWalletSelected.selection = [];
                        selectedWallets.wallets = [];
                      }}
                    />
                  </div>
                )}
                <span class="absolute end-4 top-4 cursor-pointer">
                  <IconArrowDown class="h-4 w-4 fill-white" />
                </span>
              </label>

              {/* div całości z opcjami */}
              <div class="walletList flex w-full flex-col gap-4 rounded-lg rounded-t-none border border-t-0 border-solid border-white border-opacity-15 px-4 py-6 shadow-md">
                <div class="flex items-center justify-between">
                  <p class="text-xs uppercase text-white">
                    <span class="bg-gradient-to-r from-red-600 via-orange-400 to-pink-500 bg-clip-text font-semibold text-transparent">
                      {selectedWallets.wallets.length} wallets
                    </span>
                    selected
                  </p>
                  <div class="relative">
                    <label class="flex h-6 items-center gap-3">
                      <input
                        type="checkbox"
                        class="border-gradient custom-border-1 custom-bg-white checked:after:border-bg z-10 h-6 w-6 appearance-none rounded checked:after:absolute checked:after:ms-2 checked:after:mt-1 checked:after:h-2.5 checked:after:w-1.5 checked:after:rotate-45 checked:after:border-solid hover:cursor-pointer focus:after:absolute focus:after:z-[1]"
                        checked={isSelectAllChecked.wallets}
                        onClick$={(e) => {
                          isSelectAllChecked.wallets = true;
                          const { checked } = e.target as HTMLInputElement;
                          if (checked) {
                            observedWalletsWithBalance.value.map(
                              (wallet: WalletWithBalance) => {
                                if (
                                  !selectedWallets.wallets.find(
                                    (item) =>
                                      item.wallet.id === wallet.wallet.id,
                                  )
                                ) {
                                  selectedWallets.wallets.push(wallet);
                                  wallet.balance.map((balance) =>
                                    isTokenSelected.selection.push({
                                      balanceId: balance.balanceId,
                                      status: false,
                                    }),
                                  );
                                }

                                const selectedIndex =
                                  isWalletSelected.selection.findIndex(
                                    (item) =>
                                      item.walletId === wallet.wallet.id,
                                  );

                                if (selectedIndex === -1) {
                                  isWalletSelected.selection.push({
                                    walletId: wallet.wallet.id,
                                    status: true,
                                  });
                                } else {
                                  isWalletSelected.selection[
                                    selectedIndex
                                  ].status = true;
                                }
                              },
                            );
                          } else {
                            isSelectAllChecked.wallets = false;
                            isSelectAllChecked.tokens = false;
                            isWalletSelected.selection = [];
                            selectedWallets.wallets = [];
                            isTokenSelected.selection.map(
                              (balance) => (balance.status = false),
                            );
                            selectedTokens.balances = [];
                          }
                        }}
                      />
                      <span class="custom-text-50 text-xs uppercase">
                        select all
                      </span>
                    </label>
                  </div>
                </div>
                {/* div strikte z opcjami */}
                <div class="scrollbar m-1 flex max-h-[80px] flex-col gap-2 overflow-auto">
                  {observedWalletsWithBalance.value.map((option: any) => (
                    <div class="relative mr-2 min-h-9" key={option.wallet.id}>
                      <input
                        type="checkbox"
                        name="walletsId[]"
                        id={option.wallet.id}
                        checked={isWalletSelected.selection.some(
                          (item) =>
                            option.wallet.id === item.walletId && item.status,
                        )}
                        class="border-gradient custom-border-1 custom-bg-white checked:after:border-bg absolute start-2 top-2 z-10 h-5 w-5 appearance-none rounded checked:after:absolute checked:after:ms-[0.35rem] checked:after:mt-0.5 checked:after:h-2.5 checked:after:w-1.5 checked:after:rotate-45 checked:after:border-solid hover:cursor-pointer focus:after:absolute focus:after:z-[1]"
                        value={option.wallet.id}
                        onClick$={(e) => {
                          handleCheckboxChange(
                            isWalletSelected,
                            option.wallet.id,
                            "walletId",
                          );

                          const { defaultValue, checked } =
                            e.target as HTMLInputElement;

                          const selectedWallet =
                            observedWalletsWithBalance.value.find(
                              (selectedWallet: any) =>
                                selectedWallet.wallet.id === defaultValue,
                            );
                          if (checked) {
                            if (selectedWallet) {
                              selectedWallets.wallets.push(selectedWallet);
                              selectedWallet.balance.map(
                                (balance: ObservedBalanceDetails) =>
                                  isTokenSelected.selection.push({
                                    balanceId: balance.balanceId,
                                    status: false,
                                  }),
                              );
                            }
                          } else {
                            selectedWallets.wallets =
                              selectedWallets.wallets.filter(
                                (wallet) => wallet.wallet.id !== defaultValue,
                              );
                          }
                        }}
                      />
                      <label
                        for={option.wallet.id}
                        class="custom-bg-white custom-border-1 absolute inline-flex min-h-9 w-full cursor-pointer items-center space-x-2 rounded-lg"
                      >
                        <span class="absolute start-9">
                          {option.walletName}
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <Label name="Select tokens" class="mb-2" />

            <div class="mb-3 w-full text-sm">
              {/* input Select token */}
              <input
                id="tokenCheckbox"
                type="checkbox"
                class="tokenCheckbox absolute h-0 w-0 overflow-hidden"
              />
              <label
                for="tokenCheckbox"
                class="tokenLabel custom-border-1 relative block h-12 w-full cursor-pointer rounded-lg bg-transparent outline-none"
              >
                {selectedTokens.balances.length > 0 && (
                  <div class="custom-bg-button absolute start-2 top-[0.45rem] flex h-8 w-fit gap-2 rounded-md px-3 py-1.5">
                    <p>{selectedTokens.balances.length} selections</p>
                    <Button
                      variant="onlyIcon"
                      leftIcon={<IconClose class="h-4 w-4 fill-white" />}
                      onClick$={() => {
                        isSelectAllChecked.tokens = false;
                        selectedTokens.balances = [];
                        isTokenSelected.selection.map(
                          (balance) => (balance.status = false),
                        );
                      }}
                    />
                  </div>
                )}
                <span class="absolute end-4 top-4 cursor-pointer">
                  <IconArrowDown class="h-4 w-4 fill-white" />
                </span>
              </label>

              {/* div całości z opcjami */}
              <div class="tokenList flex w-full flex-col gap-4 rounded-lg rounded-t-none border border-t-0 border-solid border-white border-opacity-15 px-4 py-6 shadow-md">
                <div class="flex items-center justify-between">
                  <p class="text-xs uppercase text-white">
                    <span class="bg-gradient-to-r from-red-600 via-orange-400 to-pink-500 bg-clip-text font-semibold text-transparent">
                      {selectedTokens.balances.length} tokens
                    </span>
                    selected
                  </p>
                  <div class="">
                    <label class="flex h-6 items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelectAllChecked.tokens}
                        class="border-gradient custom-border-1 custom-bg-white checked:after:border-bg  z-10 h-6 w-6 appearance-none rounded checked:after:absolute checked:after:ms-2 checked:after:mt-1 checked:after:h-2.5 checked:after:w-1.5 checked:after:rotate-45 checked:after:border-solid hover:cursor-pointer focus:after:absolute focus:after:z-[1]"
                        onClick$={(e) => {
                          isSelectAllChecked.tokens = true;

                          const { checked } = e.target as HTMLInputElement;

                          if (checked) {
                            selectedWallets.wallets.map((wallet) => {
                              wallet.balance.map((balance: any) => {
                                if (
                                  !selectedTokens.balances.find(
                                    (balanceId) =>
                                      balanceId === balance.balanceId,
                                  )
                                ) {
                                  selectedTokens.balances.push(
                                    balance.balanceId,
                                  );
                                }

                                const selectedIndex =
                                  isTokenSelected.selection.findIndex(
                                    (item) =>
                                      item.balanceId === balance.balanceId,
                                  );

                                if (selectedIndex === -1) {
                                  isTokenSelected.selection.push({
                                    balanceId: wallet.balanceId,
                                    status: true,
                                  });
                                } else {
                                  isTokenSelected.selection[
                                    selectedIndex
                                  ].status = true;
                                }
                              });
                            });
                          } else {
                            isSelectAllChecked.tokens = false;
                            isTokenSelected.selection.map(
                              (balance) => (balance.status = false),
                            );
                            selectedTokens.balances = [];
                          }
                        }}
                      />
                      <span class="custom-text-50 text-xs uppercase">
                        select all
                      </span>
                    </label>
                  </div>
                </div>
                {/* div strikte z opcjami */}
                <div class="scrollbar flex max-h-[80px] flex-col gap-2 overflow-auto">
                  {parseWalletsToOptions(
                    selectedWallets.wallets,
                    selectedTokens,
                    isTokenSelected,
                    handleCheckboxChange,
                    availableBalances,
                  )}
                </div>
              </div>
            </div>
            <div class="flex gap-4">
              <Button
                variant="transparent"
                type="button"
                text="Cancel"
                onClick$={() => {
                  isCreateNewStructureModalOpen.value = false;
                  isWalletSelected.selection = [];
                  isTokenSelected.selection = [];
                  selectedWallets.wallets = [];
                  selectedTokens.balances = [];
                  structureStore.name = "";
                  isStructureNameUnique.value = true;
                }}
                customClass="w-full"
              />
              <Button
                variant="blue"
                text="Add Token"
                disabled={
                  !(
                    isValidName(structureStore.name) &&
                    isStructureNameUnique.value &&
                    structureStore.name.length > 0 &&
                    selectedTokens.balances.length > 0
                  )
                }
                type="submit"
                customClass="w-full"
              />
            </div>
          </Form>
        </Modal>
      )}
      {isSwapModalOpen.value ? (
        <SwapModal
          chosenTokenSymbol={tokenFromSymbol}
          chosenToken={tokenFromAddress}
          chosenTokenWalletAddress={walletAddressOfTokenToSwap}
          isOpen={isSwapModalOpen}
          wallets={observedWalletsWithBalance.value}
          allTokensFromDb={allTokensFromDb}
        />
      ) : null}
    </>
  );
});

function parseWalletsToOptions(
  wallets: WalletWithBalance[],
  selectedTokens: { balances: string[] },
  isTokenSelected: { selection: { balanceId: string; status: boolean }[] },
  callback: QRL,
  availableBalances: Signal,
): JSXOutput[] {
  let totalBalances: number = 0;
  const options: JSXOutput[] = [];
  wallets.forEach((item) => {
    item.balance.forEach((balance) => {
      totalBalances += 1;
      options.push(
        <div class="relative mr-2 min-h-9">
          <input
            key={balance.balanceId}
            id={balance.balanceId}
            type="checkbox"
            name="balancesId[]"
            class="border-gradient custom-border-1 custom-bg-white checked:after:border-bg absolute start-2 top-2 z-10 h-5 w-5 appearance-none rounded checked:after:absolute checked:after:ms-[0.35rem] checked:after:mt-0.5 checked:after:h-2.5 checked:after:w-1.5 checked:after:rotate-45 checked:after:border-solid hover:cursor-pointer focus:after:absolute focus:after:z-[1]"
            value={balance.balanceId}
            checked={isTokenSelected.selection.some(
              (item) => balance.balanceId === item.balanceId && item.status,
            )}
            onClick$={(e) => {
              callback(isTokenSelected, balance.balanceId, "balanceId");
              const { defaultValue, checked } = e.target as HTMLInputElement;

              if (checked) {
                selectedTokens.balances.push(balance.balanceId);
              } else {
                selectedTokens.balances = selectedTokens.balances.filter(
                  (balance) => {
                    return balance !== defaultValue;
                  },
                );
              }
            }}
          />
          <label
            for={balance.balanceId}
            class="custom-bg-white custom-border-1 absolute inline-flex min-h-9 w-full cursor-pointer items-center space-x-2 rounded-lg"
            key={`${balance.balanceId} - ${balance.tokenId}`}
          >
            <span class="absolute start-9">{`${balance.tokenSymbol} - ${item.walletName}`}</span>
          </label>
        </div>,
      );
    });
  });
  availableBalances.value = totalBalances;
  return options;
}
