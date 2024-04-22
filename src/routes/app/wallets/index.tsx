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
import { Form, routeAction$, server$, z, zod$ } from "@builder.io/qwik-city";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { contractABI } from "~/abi/abi";
import { type Wallet } from "~/interface/auth/Wallet";
import { connectToDB } from "~/utils/db";
import { chainIdToNetworkName } from "~/utils/chains";
import { Modal } from "~/components/Modal/Modal";
import { SelectedWalletDetails } from "~/components/Wallets/Details/SelectedWalletDetails";
import { type Balance } from "~/interface/balance/Balance";
import { type WalletTokensBalances } from "~/interface/walletsTokensBalances/walletsTokensBalances";
import { checksumAddress, isAddress } from "viem";
import { isValidAddress, isValidName } from "~/utils/validators/addWallet";
import {
  getUsersObservingWallet,
  walletExists,
} from "~/interface/wallets/removeWallet";
import {
  getExistingRelation,
  getExistingWallet,
} from "~/interface/wallets/addWallet";
import { emethContractAbi } from "~/abi/emethContractAbi";
import IsExecutableSwitch from "~/components/Forms/isExecutableSwitch";
import { getCookie } from "~/utils/refresh";
import * as jwtDecode from "jwt-decode";
import { type Token } from "~/interface/token/Token";
import { testPublicClient } from "./testconfig";
import Moralis from "moralis";
import { StreamStoreContext } from "~/interface/streamStore/streamStore";
import { ModalStoreContext } from "~/interface/web3modal/ModalStore";
import { messagesContext } from "../layout";
import { Readable } from "node:stream";
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
// import { PendingAuthorization } from "~/components/PendingAuthorization/PendingAuthorization";
import ImgWarningRed from "/public/assets/icons/wallets/warning-red.svg?jsx";
import {
  getObservedWallets,
  ObservedWalletsList,
} from "~/components/ObservedWalletsList/ObservedWalletsList";
import { EvmChain } from "@moralisweb3/common-evm-utils";
import { convertWeiToQuantity } from "~/utils/formatBalances/formatTokenBalance";

export const useAddWallet = routeAction$(
  async (data, requestEvent) => {
    const db = await connectToDB(requestEvent.env);
    await db.query(
      `DEFINE INDEX walletAddressChainIndex ON TABLE wallet COLUMNS address, chainId UNIQUE;`,
    );

    const cookie = requestEvent.cookie.get("accessToken");
    if (!cookie) {
      throw new Error("No cookie found");
    }

    const { userId } = jwt.decode(cookie.value) as JwtPayload;

    const existingWallet = await getExistingWallet(db, data.address.toString());

    let walletId;
    if (existingWallet.at(0)) {
      walletId = existingWallet[0].id;
    } else {
      const [createWalletQueryResult] = await db.create<Wallet>("wallet", {
        chainId: 1,
        address: data.address.toString(),
        isExecutable: data.isExecutable === "1" ? true : false,
      });
      walletId = createWalletQueryResult.id;
      const nativeBalance = await testPublicClient.getBalance({
        address: createWalletQueryResult.address as `0x${string}`,
      });
      await db.query(
        `UPDATE ${walletId} SET nativeBalance = '${nativeBalance}';`,
      );

      // create balances for tokens
      const tokens = await db.select<Token>("token");
      for (const token of tokens) {
        const readBalance = await testPublicClient.readContract({
          address: token.address as `0x${string}`,
          abi: contractABI,
          functionName: "balanceOf",
          args: [createWalletQueryResult.address as `0x${string}`],
        });
        if (readBalance < 0) {
          continue;
        }
        const [balance] = await db.create<Balance>(`balance`, {
          value: readBalance.toString(),
        });
        // balance -> token && balance -> wallet
        await db.query(`RELATE ONLY ${balance.id}->for_token->${token.id}`);
        await db.query(
          `RELATE ONLY ${balance.id}->for_wallet->${createWalletQueryResult.id}`,
        );
      }
    }

    if (!(await getExistingRelation(db, userId, walletId)).at(0)) {
      await db.query(
        `RELATE ONLY ${userId}->observes_wallet->${walletId} SET name = '${data.name}';`,
      );
    }
    return {
      success: true,
      wallet: { id: walletId, chainId: 1, address: data.address },
    };
  },
  zod$({
    address: z.string().refine((address) => isAddress(address), {
      message: "Invalid address",
    }),
    name: z.string(),
    isExecutable: z.string(),
  }),
);

export const useGetBalanceHistory = routeAction$(async (data, requestEvent) => {
  const balanceHistory: any[] = [];

  const walletTransactions = await getErc20TokenTransfers(
    null,
    data.address as string,
  );

  const responses = [];
  for (const tx of walletTransactions) {
    balanceHistory.push({
      blockNumber: tx.block_number,
      timestamp: tx.block_timestamp,
    });
    responses.push(
      await getWalletBalance(tx.block_number, data.address as string),
    );
  }

  const db = await connectToDB(requestEvent.env);
  const cookie = requestEvent.cookie.get("accessToken");

  if (!cookie) {
    throw new Error("No cookie found");
  }

  const tokenAddresses = {
    GLM: "0x054e1324cf61fe915cca47c48625c07400f1b587",
    USDC: "0xd418937d10c9cec9d20736b2701e506867ffd85f",
    USDT: "0x9d16475f4d36dd8fc5fe41f74c9f44c7eccd0709",
  };

  for (let i = 0; i < responses.length; i++) {
    const currentBalance: { [key: string]: string } = {};
    // @ts-ignore
    responses[i]?.jsonResponse.forEach((entry: any) => {
      currentBalance[entry.token_address] = convertWeiToQuantity(
        entry.balance,
        parseInt(entry.decimals),
      );
    });

    const dbObject = {
      blockNumber: balanceHistory[i].blockNumber,
      timestamp: balanceHistory[i].timestamp,
      walletAddress: data.address,
      [tokenAddresses.GLM]: currentBalance[tokenAddresses.GLM]
        ? currentBalance[tokenAddresses.GLM]
        : "0",
      [tokenAddresses.USDC]: currentBalance[tokenAddresses.USDC]
        ? currentBalance[tokenAddresses.USDC]
        : "0",
      [tokenAddresses.USDT]: currentBalance[tokenAddresses.USDT]
        ? currentBalance[tokenAddresses.USDT]
        : "0",
    };

    await db.create("wallet_balance", dbObject);
  }
});

async function getErc20TokenTransfers(cursor: string | null, address: string) {
  let allEntries: any = [];
  try {
    const response = await Moralis.EvmApi.token.getWalletTokenTransfers({
      chain: EvmChain.SEPOLIA,
      order: "ASC",
      cursor: cursor as string,
      contractAddresses: [
        "0x054E1324CF61fe915cca47C48625C07400F1B587",
        "0xD418937d10c9CeC9d20736b2701E506867fFD85f",
        "0x9D16475f4d36dD8FC5fE41F74c9F44c7EcCd0709",
      ],
      address: address,
    });
    allEntries = allEntries.concat(response.raw.result);

    if (response.raw.cursor) {
      allEntries = allEntries.concat(
        await getErc20TokenTransfers(response.raw.cursor, address),
      );
    }
  } catch (error) {
    console.error(error);
  }
  return allEntries;
}

async function getWalletBalance(block: string, address: string) {
  try {
    return Moralis.EvmApi.token.getWalletTokenBalances({
      chain: EvmChain.SEPOLIA.hex,
      toBlock: parseInt(block),
      tokenAddresses: [
        "0x054E1324CF61fe915cca47C48625C07400F1B587",
        "0xD418937d10c9CeC9d20736b2701E506867fFD85f",
        "0x9D16475f4d36dD8FC5fE41F74c9F44c7EcCd0709",
      ],
      address: address,
    });
  } catch (error) {
    console.error(error);
  }
}
export const useRemoveWallet = routeAction$(
  async (wallet, requestEvent) => {
    const db = await connectToDB(requestEvent.env);

    const cookie = requestEvent.cookie.get("accessToken");
    if (!cookie) {
      throw new Error("No cookie found");
    }

    if (!(await walletExists(db, wallet.id))) {
      throw new Error("Wallet does not exist");
    }

    const { userId } = jwt.decode(cookie.value) as JwtPayload;

    await db.query(`
    DELETE ${userId}->observes_wallet WHERE out=${wallet.id};
    LET $wallet_address = SELECT VALUE address FROM ${wallet.id};
    DELETE wallet_balance WHERE walletAddress = $wallet_address[0]`);

    const [usersObservingWallet] = await getUsersObservingWallet(db, wallet.id);

    if (!usersObservingWallet["<-observes_wallet"].in.length) {
      await db.query(`
        BEGIN TRANSACTION;
        FOR $balance IN (SELECT VALUE in FROM for_wallet WHERE out = ${wallet.id}) {
          DELETE balance WHERE id = $balance.id};
        DELETE wallet WHERE id = ${wallet.id};
        COMMIT TRANSACTION`);
    }

    return { success: true };
  },
  zod$({
    id: z.string(),
  }),
);

export const convertToFraction = (numericString: string) => {
  let fractionObject;
  if (!numericString.includes(".")) {
    fractionObject = {
      numerator: BigInt(numericString),
      denominator: BigInt(1),
    };
  } else {
    const fractionArray = numericString.split(".");
    fractionObject = {
      numerator: BigInt(`${fractionArray[0]}${fractionArray[1]}`),
      denominator: BigInt(Math.pow(10, fractionArray[1].length)),
    };
  }
  return fractionObject;
};

export function replaceNonMatching(
  inputString: string,
  regex: RegExp,
  replacement: string,
): string {
  return inputString.replace(
    new RegExp(`[^${regex.source}]`, "g"),
    replacement,
  );
}

export const chekckIfProperAmount = (input: string, regex: RegExp) => {
  return regex.test(input);
};

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

const fetchTokens = server$(async function () {
  const db = await connectToDB(this.env);
  return await db.select<Token>("token");
});

const addAddressToStreamConfig = server$(async function (
  streamId: string,
  address: string,
) {
  await Moralis.Streams.addAddress({ address, id: streamId });
});

interface ModalStore {
  isConnected?: boolean;
  config?: NoSerialize<Config>;
}

export const dbBalancesStream = server$(async function* () {
  const db = await connectToDB(this.env);

  const resultsStream = new Readable({
    objectMode: true,
    read() {},
  });

  await db.live("balance", ({ action, result }) => {
    if (action === "CLOSE") {
      resultsStream.push(null);
      return;
    }
    resultsStream.push(result);
  });

  for await (const result of resultsStream) {
    yield result;
  }
});

export const getMoralisBalance = server$(async (data) => {
  const walletAddress = data.wallet;

  const response = await Moralis.EvmApi.token.getWalletTokenBalances({
    chain: EvmChain.SEPOLIA.hex,
    tokenAddresses: [
      "0x054E1324CF61fe915cca47C48625C07400F1B587",
      "0xD418937d10c9CeC9d20736b2701E506867fFD85f",
      "0x9D16475f4d36dD8FC5fE41F74c9F44c7EcCd0709",
    ],
    address: `${walletAddress}`,
  });

  const rawResponse = response.raw;
  return { tokens: rawResponse };
});

export default component$(() => {
  const modalStore = useContext(ModalStoreContext);
  const formMessageProvider = useContext(messagesContext);
  const { streamId } = useContext(StreamStoreContext);
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
  const walletTokenBalances = useSignal<any>([]);

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
    await modal.open();
    temporaryModalStore.config = noSerialize(config);
    const { address } = getAccount(config);

    addWalletFormStore.address = address as `0x${string}`;
    watchAccount(config, {
      onChange(data) {
        temporaryModalStore.isConnected = data.isConnected;
      },
    });
  });
  const msg = useSignal("1");
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    const data = await dbBalancesStream();
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
      !chekckIfProperAmount(transferredTokenAmount.value, /^\d*\.?\d*$/)
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
                {!chekckIfProperAmount(
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

// const isExecutableClass = (addWalletFormStore: addWalletFormStore) =>
//   isExecutableDisabled(addWalletFormStore)
//     ? "bg-modal-button text-gray-400"
//     : "bg-black";

// const isNotExecutableClass = (addWalletFormStore: addWalletFormStore) =>
//   isNotExecutableDisabled(addWalletFormStore)
//     ? "bg-modal-button text-gray-400"
//     : "bg-black";
