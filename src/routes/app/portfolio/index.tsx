import { Button, ButtonWithIcon } from "~/components/Buttons/Buttons";
import IconEdit from "/public/assets/icons/portfolio/edit.svg?jsx";
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
  type NoSerialize,
  useContext,
} from "@builder.io/qwik";
import { messagesContext } from "../layout";
import {
  Form,
  routeAction$,
  routeLoader$,
  z,
  zod$,
} from "@builder.io/qwik-city";
import { connectToDB } from "~/utils/db";
import jwt, { type JwtPayload } from "jsonwebtoken";
import {
  getDBTokenPriceUSD,
  getResultAddresses,
  getWalletDetails,
} from "~/interface/wallets/observedWallets";
import { type Wallet } from "~/interface/auth/Wallet";
import { Modal } from "~/components/Modal/Modal";
import { isValidName } from "~/utils/validators/addWallet";
import { structureExists } from "~/interface/structure/removeStructure";
import {
  getAccount,
  simulateContract,
  watchAccount,
  writeContract,
  type Config,
  readContract,
  waitForTransactionReceipt,
} from "@wagmi/core";
import { ModalStoreContext } from "~/interface/web3modal/ModalStore";
import { emethContractAbi } from "~/abi/emethContractAbi";
import { getCookie } from "~/utils/refresh";
import { FormBadge } from "~/components/FormBadge/FormBadge";
import CoinsToApprove from "~/components/Forms/CoinsToApprove";
interface ModalStore {
  isConnected?: boolean;
  config?: NoSerialize<Config>;
}
type WalletWithBalance = {
  wallet: { id: string; chainID: number; name: string, address: string };
  balance: [{ balanceId: string; tokenId: string; tokenSymbol: string }];
};
type CoinObject = {
  symbol: string;
  amount: BigInt;
}
type CoinToApprove = {
  wallet: string;
  address: string;
  coins: CoinObject[];
}
type StructureToApprove = {
  name: string;
  coins: CoinToApprove[];
}
export interface BatchTransferFormStore {
  receiverAddress:string;
  coinsToTransfer: StructureToApprove[];
}
export const useDeleteStructure = routeAction$(
  async (structure, requestEvent) => {
    const db = await connectToDB(requestEvent.env);

    const cookie = requestEvent.cookie.get("accessToken");
    if (!cookie) {
      throw new Error("No cookie found");
    }
    if (!(await structureExists(db, structure.id))) {
      throw new Error("Structure does not exist");
    }

    await db.delete(structure.id as string);

    return {
      success: true,
      structure: { id: structure.id },
    };
  },
  zod$({
    id: z.string(),
  }),
);
export const useDeleteToken = routeAction$(
  async (data, requestEvent) => {
    const db = await connectToDB(requestEvent.env);
    const cookie = requestEvent.cookie.get("accessToken");
    if (!cookie) {
      throw new Error("No cookie found");
    }
    if (!(await structureExists(db, data.structureId))) {
      throw new Error("Structure does not exist");
    }

    await db.query(`
    DELETE structure_balance WHERE in=${data.structureId} AND out=${data.balanceId}`);

    const [balanceCount]: any = await db.query(`
    RETURN COUNT(SELECT id AS num_rows FROM structure_balance WHERE in=${data.structureId})`);

    if (balanceCount === 0) {
      await db.delete(data.structureId as string);
    }
  },
  zod$({
    structureId: z.string(),
    balanceId: z.string(),
  }),
);

export const useObservedWalletBalances = routeLoader$(async (requestEvent) => {
  const db = await connectToDB(requestEvent.env);

  const cookie = requestEvent.cookie.get("accessToken");
  if (!cookie) {
    throw new Error("No cookie found");
  }
  const { userId } = jwt.decode(cookie.value) as JwtPayload;

  const resultAddresses: any = await getResultAddresses(db, userId);
  if (!resultAddresses[0]["->observes_wallet"].out.address.length) {
    return [];
  }
  const walletsWithBalance = [];
  let balanceDetails = [];

  for (const observedWalletAddress of resultAddresses[0]["->observes_wallet"]
    .out.address) {
    const walletDetails = await getWalletDetails(db, observedWalletAddress);
        const [balances]: any = await db.query(
      `SELECT id, value FROM balance WHERE ->(for_wallet WHERE out = '${walletDetails[0].id}')`,
    );

    for (const balance of balances) {
      if (balance.value === "0") {
        continue;
      }
      const [tokenId]: any = await db.query(`
      SELECT VALUE ->for_token.out FROM ${balance.id}`);

      const [tokenDetails]: any = await db.query(`
      SELECT * FROM ${tokenId[0]}`);

      const walletBalance = {
        balanceId: balance.id,
        tokenId: tokenDetails[0].id,
        tokenSymbol: tokenDetails[0].symbol,
      };
      balanceDetails.push(walletBalance);
    }

    const walletWithBalance = {
      wallet: walletDetails[0],
      balance: balanceDetails,
    };
    balanceDetails = [];

    walletsWithBalance.push(walletWithBalance);
  }
  return walletsWithBalance;
});

export const useAvailableStructures = routeLoader$(async (requestEvent) => {
  const db = await connectToDB(requestEvent.env);
  const cookie = requestEvent.cookie.get("accessToken");
  if (!cookie) {
    throw new Error("No cookie found");
  }
  const { userId } = jwt.decode(cookie.value) as JwtPayload;

  const [result]: any = await db.query(`
    SELECT VALUE ->has_structure.out FROM ${userId}`);

  if (!result) throw new Error("No structures available");
  const createdStructureQueryResult = result[0];
  const availableStructures: any[] = [];

  for (const createdStructure of createdStructureQueryResult) {
    const [structure] = await db.select(`${createdStructure}`);
    const structureTokens: any = [];
    const [structureBalances]: any = await db.query(`
      SELECT VALUE ->structure_balance.out
      FROM ${structure.id}`);

    if (!structureBalances[0].length) {
      await db.delete(structure.id);
    } else {
      for (const balance of structureBalances[0]) {
        const [walletId]: any = await db.query(`
        SELECT out
        FROM for_wallet
        WHERE in = ${balance}`);

        const [wallet] = await db.select<Wallet>(`${walletId[0].out}`);

        const [tokenBalance]: string[] = await db.query(`
        SELECT VALUE value
        FROM balance
        WHERE id = ${balance}`);

        const [tokenId]: any = await db.query(`
        SELECT VALUE ->for_token.out
        FROM ${balance}`);

        const [token]: any = await db.query(
          `SELECT *
         FROM ${tokenId[0]}`,
        );

        const [tokenValue] = await getDBTokenPriceUSD(db, token[0].address);
        const tokenWithBalance = {
          id: token[0].id,
          name: token[0].name,
          symbol: token[0].symbol,
          decimals: token[0].decimals,
          balance: tokenBalance[0],
          balanceValueUSD: tokenValue.priceUSD,
          balanceId: balance,
        };

        structureTokens.push({
          wallet: {
            id: wallet.id,
            name: wallet.name,
            chainId: wallet.chainId,
          },
          balance: tokenWithBalance,
        });
      }

      availableStructures.push({
        structure: {
          id: structure.id,
          name: structure.name,
        },
        structureBalance: structureTokens,
      });
    }
  }

  return availableStructures;
});
export const useCreateStructure = routeAction$(
  async (data, requestEvent) => {
    const cookie = requestEvent.cookie.get("accessToken");
    if (!cookie) {
      throw new Error("No cookie found");
    }
    const { userId } = jwt.decode(cookie.value) as JwtPayload;

    const db = await connectToDB(requestEvent.env);
    let [namesList]: any = await db.query(`
    SELECT name FROM structure GROUP BY name`);

    namesList = namesList.map((item: { name: string }) => item.name.trim());

    if (namesList.includes(data.name)) {
      return {
        success: false,
        message: "Name already taken",
      };
    }
    const structure = await db.create("structure", {
      name: data.name,
    });

    await db.query(`
    relate only ${userId}-> has_structure -> ${structure[0].id}`);

    for (const balanceId of data.balancesId) {
      await db.query(`
      relate only ${structure[0].id}-> structure_balance -> ${balanceId}`);
    }

    return {
      success: true,
      structure: { name: data.name, balances: data.balancesId },
    };
  },
  zod$({
    name: z.string().min(2, { message: "structure name invalid" }),
    balancesId: z.array(z.string()),
  }),
);

export default component$(() => {
  const modalStore = useContext(ModalStoreContext);
  const clickedToken = useStore({ balanceId: "", structureId: "" });
  const structureStore = useStore({ name: "" });
  const selectedWallets = useStore({ wallets: [] as any[] });
  const isCreateNewStructureModalOpen = useSignal(false);
  const isTransferModalOpen = useSignal(false);
  const deleteToken = useDeleteToken();
  const formMessageProvider = useContext(messagesContext);
  const availableStructures = useAvailableStructures();
  const createStructureAction = useCreateStructure();
  const deleteStructureAction = useDeleteStructure();
  const observedWalletsWithBalance = useObservedWalletBalances();
  const isWalletSelected = useStore({
    selection: [] as { walletId: string; status: boolean }[],
  });
  const isSelectAllChecked = useStore({ wallets: false, tokens: false });
  const selectedTokens = useStore({ balances: [] as string[] });
  const isTokenSelected = useStore({
    selection: [] as { balanceId: string; status: boolean }[],
  });
  const availableBalances = useSignal<number>(0);
  const batchTransferFormStore = useStore<BatchTransferFormStore>({
    receiverAddress: "",
    coinsToTransfer: [],
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
  console.log('observer: ',observedWalletsWithBalance.value)
  console.log('structures full: ',availableStructures.value)
  console.log('structures: ',availableStructures.value[1].structureBalance)
  console.log('store: ', batchTransferFormStore)
  // const cookie = getCookie("accessToken");
  
  //   if (!cookie) throw new Error("No accessToken cookie found");

  // const emethContractAddress = import.meta.env
  // .PUBLIC_EMETH_CONTRACT_ADDRESS_SEPOLIA;

  // if (!emethContractAddress) {
  //   throw new Error("Missing PUBLIC_EMETH_CONTRACT_ADDRESS_SEPOLIA");
  // }

  // try{
  //   const argsArray = [
  //     {
  //       from: '0x0577b55800816b6A2Da3BDbD3d862dce8e99505D' as `0x${string}`,
  //       to: '0x8545845EF4BD63c9481Ae424F8147a6635dcEF87' as `0x${string}`,
  //       amount: BigInt(10 * 10**18),
  //       token: '0xD418937d10c9CeC9d20736b2701E506867fFD85f' as `0x${string}`
  //     },
  //     {
  //       from: '0x4F4acBC8047651cE5A00f57Eff73e831669df3fc' as `0x${string}`,
  //       to: '0x8545845EF4BD63c9481Ae424F8147a6635dcEF87' as `0x${string}`,
  //       amount: BigInt(10 * 10**18),
  //       token: '0xD418937d10c9CeC9d20736b2701E506867fFD85f' as `0x${string}`
  //     }
  //   ]
  //   const { request } = await simulateContract(modalStore.config as Config, {
  //     abi: emethContractAbi,
  //     address: emethContractAddress,
  //     functionName: "transferBatch",
  //     args: [argsArray]
  //   });
  //   console.log("--> TRANSFER REQUEST", request);
  //   formMessageProvider.messages.push({
  //     id: formMessageProvider.messages.length,
  //     variant: "info",
  //     message: "Transferring tokens...",
  //     isVisible: true,
  //   });
  //   const transactionHash = await writeContract(modalStore.config as Config, request);

  //   const receipt = await waitForTransactionReceipt(modalStore.config as Config, {
  //      hash: transactionHash,
  //    });

  //    console.log('[RECEIPT]: ', receipt)
  //   formMessageProvider.messages.push({
  //           id: formMessageProvider.messages.length,
  //           variant: "success",
  //           message: "Success!",
  //           isVisible: true,
  //         });

  // }catch(err){
  //   console.log('error while tranfering: ', err);
  //   formMessageProvider.messages.push({
  //     id: formMessageProvider.messages.length,
  //     variant: "error",
  //     message: "Something went wrong.",
  //     isVisible: true,
  //   });
  // }     
 })
  return (
    <>
      <div class="grid grid-rows-[32px_auto] gap-6 px-10 pb-10 pt-8">
        <div class="flex items-center justify-between">
          <div class="text flex items-center gap-2 text-2xl font-semibold">
            <h2>Portfolio Name</h2>
            <IconEdit />
          </div>
          <div class="flex items-center gap-2">
            <ButtonWithIcon
              image="/assets/icons/portfolio/transfer.svg"
              text="Transfer"
              class="custom-border-2"
              onClick$={async () => {
                for (const structure of availableStructures.value){
                  const coins = [];
                   for(const wallet of structure.structureBalance){
                    const walletAddress = `${observedWalletsWithBalance.value.find(item => item.wallet.name === wallet.wallet.name)?.wallet.address}`;
                    coins.push({
                        wallet: wallet.wallet.name,
                        address: walletAddress,
                        coins: []
                    })
                   }
                    batchTransferFormStore.coinsToTransfer.push({
                      name: structure.structure.name,
                      coins: coins
                    })
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
          <div class="custom-border-1 flex min-h-[260px] flex-col gap-4 rounded-2xl p-6">
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
            <div class="grid grid-rows-[40px_auto] items-center gap-4 overflow-auto text-left text-sm">
              <div class="custom-text-50 grid grid-cols-[18%_13%_15%_18%_10%_10%_16%_3%] items-center text-xs font-normal">
                <div class="">TOKEN NAME</div>
                <div class="">QUANTITY</div>
                <div class="">VALUE</div>
                <div class="custom-bg-white custom-border-1 flex h-8 w-fit gap-2 rounded-lg p-[2px] text-center text-white">
                  <button class="custom-bg-button rounded-lg px-2">24h</button>
                  <button class="rounded-lg px-2">3d</button>
                  <button class="rounded-lg px-2">30d</button>
                </div>
                <div class="">WALLET</div>
                <div class="">NETWORK</div>
                <div class=""></div>
              </div>

              {availableStructures.value.map((createdStructures) => (
                <Group
                  key={createdStructures.structure.name}
                  createdStructure={createdStructures}
                  tokenStore={clickedToken}
                  onClick$={async () => {
                    await deleteStructureAction.submit({
                      id: createdStructures.structure.id,
                    });
                  }}
                />
              ))}
            </div>
            {
              isTransferModalOpen.value ? <Modal title="Transfer Funds" isOpen={isTransferModalOpen}>
                <div class="flex flex-col overflow-y-scroll">
                  {
                    availableStructures.value.map((structure, index) => (
                      <div class="flex flex-col" key={`${structure.name}${index}`}>
                        <p>{structure.structure.name}</p>
                        <div class="flex flex-col p-2 custom-border-1">
                          {structure.structureBalance.map((balance:any, index: number) => (
                            <FormBadge key={index}
                            class="mb-2"
                            description={balance.wallet.name}
                            image={`/assets/icons/tokens/${balance.balance.symbol.toLowerCase()}.svg`}
                            for={`${structure.structure.name}${balance.balance.symbol}`}
                            input={ <input
                              id={`${structure.structure.name}${balance.balance.symbol}`}
                              name={`${structure.structure.name}${balance.balance.symbol}`}
                              type="checkbox"
                              value={`${structure.structure.name}${balance.balance.symbol}`}
                              class="border-gradient custom-border-1 custom-bg-white checked checked:after:border-bg absolute end-2 z-10  h-6 w-6 appearance-none rounded checked:after:absolute checked:after:left-1/2 checked:after:top-1/2 checked:after:h-2.5 checked:after:w-1.5 checked:after:-translate-x-1/2 checked:after:-translate-y-1/2 checked:after:rotate-45 checked:after:border-solid hover:cursor-pointer focus:after:absolute focus:after:z-[1]"
                              checked={false}
                             
                              onClick$={() => {
                                console.log('Adding that bitch..')
                                const x = batchTransferFormStore.coinsToTransfer.find(item => item.name === structure.structure.name);
                                if(x){
                                  const y = x.coins.find(item => item.wallet === balance.wallet.name);
                                  if(y){    
                                    if(!y.coins.find(coin => coin.symbol === balance.balance.symbol)){
                                      console.log('pushnalem')
                                      y.coins.push({
                                        symbol: balance.balance.symbol,
                                        amount: BigInt(0)
                                      })
                                    }else {
                                      const element = y.coins.find(coin => coin.symbol === balance.balance.symbol)!;
                                      const indexToRemove = y.coins.indexOf(element);
                                      y.coins.splice(indexToRemove, 1);
                                    }
                                    
                                  } 
                                }
                                
                              }}
                            />
                            }
                            />
                            ))}
                        </div>
                      </div> 
                    ))
                  }
                </div>
                <div class="flex gap-4">
                <Button
                  class="custom-border-1 w-full bg-transparent  disabled:scale-100 disabled:bg-[#e6e6e6] disabled:text-gray-500"
                  onClick$={async () => {
                   
                  }}
                  type="button"
                  text="Cancel"
                />
                  <Button
                  class="w-full border-0 bg-customBlue disabled:scale-100 disabled:bg-[#e6e6e6] disabled:text-gray-500"
                  onClick$={async () => {
                    await handleBatchTransfer();
                  }}
                  text="Next"
                />
                </div>
              </Modal> : null 
            }
            {isCreateNewStructureModalOpen.value && (
              <Modal
                isOpen={isCreateNewStructureModalOpen}
                title="Create new structure"
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
                    <p class="mb-4 text-red-500">Invalid name</p>
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
                              class="border-gradient custom-border-1 custom-bg-white checked:after:border-bg z-10 h-5 w-5 appearance-none rounded checked:after:absolute checked:after:ms-[0.35rem] checked:after:mt-0.5 checked:after:h-2.5 checked:after:w-1.5 checked:after:rotate-45 checked:after:border-solid hover:cursor-pointer focus:after:absolute focus:after:z-[1]"
                              checked={isSelectAllChecked.wallets}
                              onClick$={(e) => {
                                isSelectAllChecked.wallets = true;
                                const { checked } =
                                  e.target as HTMLInputElement;
                                if (checked) {
                                  observedWalletsWithBalance.value.map(
                                    (wallet) => {
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
                      <div class="flex max-h-[180px] w-[98%] flex-col gap-2 overflow-auto">
                        {observedWalletsWithBalance.value.map((option) => (
                          <div class="relative min-h-9" key={option.wallet.id}>
                            <input
                              type="checkbox"
                              name="walletsId[]"
                              id={option.wallet.id}
                              checked={isWalletSelected.selection.some(
                                (item) =>
                                  option.wallet.id === item.walletId &&
                                  item.status,
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
                                    (selectedWallet) =>
                                      selectedWallet.wallet.id === defaultValue,
                                  );
                                if (checked) {
                                  if (selectedWallet) {
                                    selectedWallets.wallets.push(
                                      selectedWallet,
                                    );
                                    selectedWallet.balance.map((balance) =>
                                      isTokenSelected.selection.push({
                                        balanceId: balance.balanceId,
                                        status: false,
                                      }),
                                    );
                                  }
                                } else {
                                  selectedWallets.wallets =
                                    selectedWallets.wallets.filter(
                                      (wallet) =>
                                        wallet.wallet.id !== defaultValue,
                                    );
                                }
                              }}
                            />
                            <label
                              for={option.wallet.id}
                              class="custom-bg-white custom-border-1 absolute inline-flex min-h-9 w-full cursor-pointer items-center space-x-2 rounded-lg"
                            >
                              <span class="absolute start-9">
                                {option.wallet.name}
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
                          </span>{" "}
                          selected{" "}
                        </p>
                        <div class="">
                          <label class="flex h-6 items-center gap-3">
                            <input
                              type="checkbox"
                              checked={isSelectAllChecked.tokens}
                              class="border-gradient custom-border-1 custom-bg-white checked:after:border-bg  z-10 h-5 w-5 appearance-none rounded checked:after:absolute checked:after:ms-[0.35rem] checked:after:mt-0.5 checked:after:h-2.5 checked:after:w-1.5 checked:after:rotate-45 checked:after:border-solid hover:cursor-pointer focus:after:absolute focus:after:z-[1]"
                              onClick$={(e) => {
                                isSelectAllChecked.tokens = true;

                                const { checked } =
                                  e.target as HTMLInputElement;

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
                                            item.balanceId ===
                                            balance.balanceId,
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
                      <div class="flex max-h-[180px] w-[98%] flex-col gap-2 overflow-auto">
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
                      type="submit"
                      class="custom-border-1 h-12 w-1/2 rounded-10 duration-300 ease-in-out hover:scale-105"
                      disabled={!isValidName(structureStore.name)}
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
          </div>
          {/* <div class="custom-border-1 custom-bg-white flex w-[322px] flex-col gap-6 overflow-auto rounded-2xl p-6">
            <div class="flex h-8 items-center justify-between">
              <p class="text-[20px] font-semibold">Details</p>
              <Button
                image="/assets/icons/portfolio/rebalance.svg"
                text="Rebalance"
                class="custom-border-2"
              />
            </div>
            <div class="flex h-auto items-center gap-4">
              <div class="custom-border-1 flex h-11 w-11 items-center justify-center rounded-lg">
                <IconBtc width={24} height={24} class="min-w-6" />
              </div>
              <div class="flex flex-col gap-2">
                <h4 class="text-sm font-medium">Bitcoin</h4>
                <p class="text-xs text-white text-opacity-50">BTC</p>
              </div>
            </div>
            <p class="text-[16px] font-medium">$82 617,96</p>
            <div class="custom-border-1  custom-bg-white grid grid-cols-4 items-center rounded-lg px-1 py-1 text-xs font-normal">
              <button class="custom-bg-button rounded-md p-2">
                Hour
              </button>
              <button class="rounded-md p-2">Day</button>
              <button class="rounded-md p-2">Month</button>
              <button class="rounded-md p-2">Year</button>
            </div>
            <ImgChart />
            <div class="flex flex-col gap-4">
              <h4 class="text-sm font-medium">Market data</h4>
              <p class="text-xs font-thin leading-[180%]">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                Pellentesque quis rutrum mi. Fusce elit est, condimentum eget
                various et, tempor in erat. Fusce vulputate faucibus arcu id
                molestie. Sed auctor tortor eu arcu feugiat, ut placerat nisl
                convallis. Pellentesque sodales congue vulputate. Aliquam erat
                volutpat. Fusce convallis sit amet dui at gravida. Aliquam a
                elit nec justo gravida tristique. Praesent non semper felis.
                Mauris ornare, purus vel luctus aliquam, erat lorem placerat
                sem, posuere condimentum dolor justo convallis leo.
              </p>
            </div>
          </div> */}
        </div>
      </div>
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
        <div class="relative min-h-9">
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
            <span class="absolute start-9">{`${balance.tokenSymbol} - ${item.wallet.name}`}</span>
          </label>
        </div>,
      );
    });
  });
  availableBalances.value = totalBalances;
  return options;
}
