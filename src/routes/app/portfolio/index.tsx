import { Button, ButtonWithIcon } from "~/components/Buttons/Buttons";
import IconArrowDown from "/public/assets/icons/arrow-down.svg?jsx";
import IconClose from "/public/assets/icons/close.svg?jsx";
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
  getAccount,
  readContract,
} from "@wagmi/core";
import { emethContractAbi } from "~/abi/emethContractAbi";
import { getCookie } from "~/utils/refresh";
import CoinsToTransfer from "~/components/Forms/portfolioTransfters/CoinsToTransfer";
import CoinsAmounts from "~/components/Forms/portfolioTransfters/CoinsAmounts";
import Destination from "~/components/Forms/portfolioTransfters/Destination";
import { NoDataAdded } from "~/components/NoDataAdded/NoDataAdded";
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
import {
  fetchTokens,
  getTokenDecimalsServer,
  getTokenSymbolByAddress,
  queryTokens,
} from "~/database/tokens";
import { convertToFraction } from "~/utils/fractions";
import {
  type WalletWithBalance,
  type BatchTransferFormStore,
} from "./interface";
import { WagmiConfigContext } from "~/components/WalletConnect/context";
import { swapTokensForTokens } from "~/utils/tokens/swap";
import { FormBadge } from "~/components/FormBadge/FormBadge";
import { Spinner } from "~/components/Spinner/Spinner";

import { type ObservedBalanceDetails } from "~/interface/walletsTokensBalances/walletsTokensBalances";
import { useDebouncer } from "~/utils/debouncer";
import { uniswapRouterAbi } from "~/abi/UniswapRouterAbi";

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
  const tokenFromSymbol = useSignal("");
  const tokenFromAmount = useSignal("");
  const tokenToAddress = useSignal("");
  const accountToAddress = useSignal("");
  const walletAddressOfTokenToSwap = useSignal("");
  const allTokensFromDb = useSignal([]);
  const tokensToSwapListVisible = useSignal(false);
  const tokenToEstimatedAmount = useSignal("");
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
        // console.log("amountInWEI", amountIn); 
        // console.log("tokenInAddress", tokenInAddress);
        // console.log("tokenOutAddress", tokenOutAddress);
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
        
        tokenToEstimatedAmount.value = estimatedValue[1].toString();
      },
    ),
    500,
  );

  useTask$(async () => {
    const tokens: any = await fetchTokens();
    allTokensFromDb.value = tokens;
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({track}) => {
    track(() => isSwapModalOpen.value)
    const cookieWallet = localStorage.getItem('emmethUserWalletAddress');
    if(cookieWallet){
      accountToAddress.value = cookieWallet; 
    }

  });
  useVisibleTask$(({track}) => {
    track(() => tokenToEstimatedAmount.value)
    console.log('[NO ZMIENILO SIE]: ', tokenToEstimatedAmount.value)

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
    const cookie = getCookie("accessToken");

    if (!cookie) throw new Error("No accessToken cookie found");

    const emethContractAddress = import.meta.env
      .PUBLIC_EMETH_CONTRACT_ADDRESS_SEPOLIA;

    if (!emethContractAddress) {
      throw new Error("Missing PUBLIC_EMETH_CONTRACT_ADDRESS_SEPOLIA");
    }

    try {
      const tokens = await queryTokens();
      if (wagmiConfig.config) {
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
        const { request } = await simulateContract(wagmiConfig.config, {
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
          wagmiConfig.config,
          request,
        );

        await waitForTransactionReceipt(wagmiConfig.config, {
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
        <NoDataAdded
          title="You didn't add any Sub Portfolio yet"
          description="Please add your first Sub Portfolio"
          buttonText="Add Sub Portfolio"
          buttonOnClick$={async () => {
            isCreateNewStructureModalOpen.value =
              !isCreateNewStructureModalOpen.value;
          }}
        />
      ) : (
        <div class="grid grid-rows-[32px_auto] gap-6 px-10 pb-10 pt-8">
          <div class="flex items-center justify-between">
            <h2 class="text-2xl font-semibold">Portfolio Name</h2>
            <div class="flex items-center gap-2">
              <ButtonWithIcon
                image="/assets/icons/portfolio/transfer.svg"
                text="Transfer"
                class="custom-border-2"
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
              />
              <ButtonWithIcon
                image="/assets/icons/portfolio/add.svg"
                text="Add Sub Portfolio"
                class="bg-customBlue"
                onClick$={async () => {
                  isCreateNewStructureModalOpen.value =
                    !isCreateNewStructureModalOpen.value;
                }}
              />
            </div>
          </div>
          <div class="grid">
            <div class="custom-border-1 custom-bg-opacity-5 grid min-h-[260px] grid-rows-[20px_32px_auto] gap-6 rounded-2xl p-6">
              <p class="text-xl font-semibold">Token list</p>
              <div class="grid grid-cols-4 gap-2">
                <ButtonWithIcon
                  image="/assets/icons/search.svg"
                  text="Search for name"
                  class="custom-text-50 custom-border-1 h-10 justify-start gap-2 rounded-lg px-3"
                />
                <ButtonWithIcon
                  image="/assets/icons/arrow-down.svg"
                  text="Choose Subportfolio"
                  class="custom-border-1 h-10 flex-row-reverse justify-between gap-2 rounded-lg px-3"
                />
                <ButtonWithIcon
                  image="/assets/icons/arrow-down.svg"
                  text="Choose Wallet"
                  class="custom-border-1 h-10 flex-row-reverse justify-between gap-2 rounded-lg px-3"
                />
                <ButtonWithIcon
                  image="/assets/icons/arrow-down.svg"
                  text="Choose Network"
                  class="custom-border-1 h-10 flex-row-reverse justify-between gap-2 rounded-lg px-3"
                />
              </div>
              <div class="grid grid-rows-[40px_auto] items-start gap-4  text-left text-sm">
                <div class="custom-text-50 grid grid-cols-[18%_13%_15%_18%_10%_10%_13%_6%] items-center text-xs font-normal">
                  <div class="">TOKEN NAME</div>
                  <div class="">QUANTITY</div>
                  <div class="">VALUE</div>
                  <div class="custom-bg-white custom-border-1 flex h-8 w-fit gap-2 rounded-lg p-[2px] text-center text-white">
                    <button class="custom-bg-button rounded-lg px-2">
                      24h
                    </button>
                    <button class="rounded-lg px-2">3d</button>
                    <button class="rounded-lg px-2">30d</button>
                  </div>
                  <div class="">WALLET</div>
                  <div class="">NETWORK</div>
                  <div class=""></div>
                </div>
                {availableStructures.value.structures.map(
                  (createdStructures: any) => (
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
                  ),
                )}
              </div>
            </div>
          </div>
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
              class="custom-border-1 w-full bg-transparent  disabled:scale-100 disabled:bg-[#e6e6e6] disabled:text-gray-500"
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
                  batchTransferFormStore.receiverAddress = "";
                  batchTransferFormStore.coinsToTransfer = [];
                  stepsCounter.value = 1;
                  isTransferModalOpen.value = false;
                }
              }}
              type="button"
              text={stepsCounter.value === 1 ? "Cancel" : "Back"}
            />
            <Button
              class="w-full border-0 bg-customBlue disabled:scale-100 disabled:bg-[#e6e6e6] disabled:text-gray-500"
              onClick$={async () => {
                if (stepsCounter.value === 3) {
                  isTransferModalOpen.value = false;
                  stepsCounter.value = 1;

                  await handleBatchTransfer();
                } else {
                  stepsCounter.value = stepsCounter.value + 1;
                }
              }}
              text={stepsCounter.value === 3 ? "Send" : "Next"}
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
          })}
        >
          <Form
            action={createStructureAction}
            onSubmitCompleted$={() => {
              if (createStructureAction.value?.success) {
                isCreateNewStructureModalOpen.value = false;
                isWalletSelected.selection = [];
                isTokenSelected.selection = [];
                selectedWallets.wallets = [];
                selectedTokens.balances = [];
                structureStore.name = "";
              }
            }}
            class="mt-8 text-sm"
          >
            <label
              for="name"
              class="custom-text-50 mb-2 block text-xs uppercase"
            >
              Name
            </label>
            <input
              type="text"
              name="name"
              placeholder="Structure name..."
              class={`custom-border-1 mb-4 block h-12 w-full rounded-lg bg-transparent px-3 text-white  placeholder:text-white ${isValidName(structureStore.name) ? "bg-red-300" : ""}`}
              value={structureStore.name}
              onInput$={(e) => {
                const target = e.target as HTMLInputElement;
                structureStore.name = target.value;
              }}
            />
            {!isValidName(structureStore.name) && (
              <p class="mb-4 text-red-500">Name too short</p>
            )}

            <label
              for="walletsId"
              class="custom-text-50 mb-2 block text-xs uppercase"
            >
              Select Wallets
            </label>

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
                  <div class="custom-bg-button absolute start-2 top-[0.45rem] flex h-8 w-fit gap-2 rounded-md px-3 py-1.5">
                    <p>{selectedWallets.wallets.length} selections</p>
                    <button
                      class="cursor-pointer"
                      type="button"
                      onClick$={() => {
                        isSelectAllChecked.wallets = false;
                        isSelectAllChecked.tokens = false;
                        isWalletSelected.selection = [];
                        selectedWallets.wallets = [];
                      }}
                    >
                      <IconClose />
                    </button>
                  </div>
                )}
                <span class="absolute end-4 top-4 cursor-pointer">
                  <IconArrowDown />
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

            <label
              for="balance"
              class="custom-text-50 mb-2 block text-xs uppercase"
            >
              Select Tokens
            </label>

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
                    <button
                      class="cursor-pointer"
                      type="button"
                      onClick$={() => {
                        isSelectAllChecked.tokens = false;
                        selectedTokens.balances = [];
                        isTokenSelected.selection.map(
                          (balance) => (balance.status = false),
                        );
                      }}
                    >
                      <IconClose />
                    </button>
                  </div>
                )}
                <span class="absolute end-4 top-4 cursor-pointer">
                  <IconArrowDown />
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
              <button
                type="button"
                class="custom-border-1 h-12 w-1/2 rounded-10 duration-300 ease-in-out hover:scale-105 "
                onClick$={() => {
                  isCreateNewStructureModalOpen.value = false;
                  isWalletSelected.selection = [];
                  isTokenSelected.selection = [];
                  selectedWallets.wallets = [];
                  selectedTokens.balances = [];
                  structureStore.name = "";
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                class=" h-12 w-1/2 rounded-10 bg-blue-500 duration-300 ease-in-out hover:scale-105"
                disabled={!isValidName(structureStore.name)}
              >
                Add token
              </button>
            </div>
          </Form>
        </Modal>
      )}
      {isSwapModalOpen.value ? (
        <Modal
          isOpen={isSwapModalOpen}
          title="Swap"
          onClose={$(() => {
            tokenFromAddress.value = "";
            tokenFromAmount.value = "";
            tokenToAddress.value = "";
            accountToAddress.value = "";
          })}
        >
          {tokenFromAddress.value ? (
            <div class="flex-column">
              {/* amount */}
              <div>
                <div class="mb-1 flex items-center justify-between">
                  <p class="custom-text-50 text-light text-xs uppercase">
                    You pay 
                  </p>
                </div>
                <input
                  class="bg-black"
                  type="number"
                  name="amount"
                  placeholder={`0`}
                  bind:value={tokenFromAmount} 
                  onInput$={async (e) => {
                    const target = e.target as HTMLInputElement;
                    tokenFromAmount.value = target.value;
                    // console.log("[wallet to send from]", tokenFromAddress.value);
                    if (
                      tokenFromAddress.value &&
                      tokenToAddress.value &&
                      tokenFromAmount.value
                    ) {
                      // console.log("[wallet to send from]", tokenFromAddress.value);
                      // console.log("[wallet to send to]", tokenToAddress.value);
                      // console.log("[how many]", tokenFromAmount.value);
                      const amountIn = BigInt(parseInt(target.value));
                      await tokenFromAmountDebounce({ 
                        amountIn: amountIn,
                        tokenInAddress: tokenFromAddress.value as `0x${string}`,
                        tokenOutAddress: tokenToAddress.value as `0x${string}`,
                      });
                      console.log("[estimatedAmount]", tokenToEstimatedAmount.value);
                    }
                  }}
                />
                <label for="amount">{tokenFromSymbol.value}</label>
              </div>
               {/* select token */}
              <div class="flex max-h-[450px] flex-col overflow-auto pb-4">
                <div class="mb-3 flex items-center justify-between">
                  <p class="custom-text-50 text-light text-xs uppercase">
                    You get
                  </p>
                  <div>
                    {tokenToAddress.value ? (
                      <span class="text-sm">
                        {getTokenSymbolByAddress(
                          tokenToAddress.value as `0x${string}`,
                        )}
                      </span>
                    ) : (
                      <span>Select token</span>
                    )}
                    <button
                      onClick$={() => {
                        tokensToSwapListVisible.value =
                          !tokensToSwapListVisible.value;
                      }}
                    >
                      <IconArrowDown />
                    </button>
                  </div>
                </div>
                <p class="custom-text-50 text-light text-xs uppercase mb-2">
                  {tokenToEstimatedAmount.value} 
                </p>
                {tokensToSwapListVisible.value && 
                  allTokensFromDb.value.map(async (token: any) => {
                    const tokenSymbol = await getTokenSymbolByAddress(
                      tokenFromAddress.value as `0x${string}`,
                    ) 
                    console.log('1', token.symbol)
                    console.log('2', tokenSymbol, 'a to: ',tokenFromAddress.value )
                    if(token.symbol !== tokenSymbol){   
                      return(
                        <FormBadge
                          key={`formBadge_${token.id}`}
                          class="mb-2"
                          image={token.imagePath}
                          description={token.symbol}
                          for={token.symbol}
                          input={
                            <input 
                              id={`input_${token.id}`}
                              type="checkbox"
                              name={token.symbol}
                              value={token.address}
                              class="border-gradient custom-border-1 custom-bg-white checked checked:after:border-bg absolute end-2 z-10 h-6 w-6 appearance-none rounded checked:after:absolute checked:after:left-1/2 checked:after:top-2.5 checked:after:h-2.5 checked:after:w-1.5 checked:after:-translate-x-1/2 checked:after:-translate-y-1/2 checked:after:rotate-45 checked:after:border-solid hover:cursor-pointer focus:after:absolute focus:after:z-[1]"
                              checked={tokenToAddress.value === token.address}
                              onClick$={() => {
                                tokenToAddress.value = token.address;
                              }}
                            />
                          }
                          customClass="border-gradient"
                        />
                      )
                    }
                    }
                    )}
              </div>
              {/* where to send */}
              <div>
                <label for="accountToAddress">Account To Address</label>
                <input
                  class="bg-black"
                  type="text"
                  name="accountToAddress"
                  placeholder="Provide account to address"
                  bind:value={accountToAddress}
                />
              </div>
              {/* buttons */}
              <div class="mt-6 flex gap-4">
                <button
                  type="button"
                  class="custom-border-1 h-12 w-1/2 rounded-10 duration-300 ease-in-out hover:scale-105 "
                  onClick$={() => {
                    isSwapModalOpen.value = false;
                    tokenFromAddress.value = "";
                    tokenFromAmount.value = "";
                    tokenToAddress.value = "";
                    accountToAddress.value = "";
                  }}
                >
                  Cancel
                </button>
                <button
                  class="h-12 w-1/2 rounded-10 rounded-lg bg-blue-500 p-2 text-white duration-300 ease-in-out hover:scale-105"
                  onClick$={async () => {
                    isSwapModalOpen.value = false;
                    await swapTokensForTokens(
                      tokenFromAddress.value as `0x${string}`,
                      tokenToAddress.value as `0x${string}`,
                      tokenFromAmount.value,
                      walletAddressOfTokenToSwap.value as `0x${string}`,
                      accountToAddress.value as `0x${string}`,
                      wagmiConfig,
                    );
                  }}
                >
                  Swap tokens
                </button>
              </div>
            </div>
          ) : (
            <h1>Can't swap selected token</h1>
          )}
        </Modal>
      ) : null}
      <h1>
        {tokenFromAddress.value} -- {tokenFromAmount.value} --{" "}
        {tokenToAddress.value}
      </h1>
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
