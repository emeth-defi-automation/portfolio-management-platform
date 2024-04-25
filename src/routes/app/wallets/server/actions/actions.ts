import { routeAction$, z, zod$ } from "@builder.io/qwik-city";
import { connectToDB } from "~/utils/db";
import jwt, { type JwtPayload } from "jsonwebtoken";
import {
    getExistingRelation,
    getExistingWallet,
} from "~/interface/wallets/addWallet";
import { type Wallet } from "~/interface/auth/Wallet";
import { testPublicClient } from "../../testconfig";
import { type Token } from "~/interface/token/Token";
import { contractABI } from "~/abi/abi";
import { isAddress } from "viem";
import { type Balance } from "~/interface/balance/Balance";
import { convertWeiToQuantity } from "~/utils/formatBalances/formatTokenBalance";

import {
    getUsersObservingWallet,
    walletExists,
} from "~/interface/wallets/removeWallet";
import { getErc20TokenTransfers, getWalletBalance } from "~/server/helpers/moralis";



/**
 * This function is used to add a wallet, create balances for tokens, and create a relations.
 * 
 * @param {Object} data - The data of wallet that shall be added.
 * @param {string} data.address - The address of the wallet.
 * @param {string} data.name - The name of the wallet.
 * @param {string} data.isExecutable - Whether the wallet is executable.
 * @returns {Promise<Object>} A promise that resolves to an object containing the success status and the wallet data.
 */
// eslint-disable-next-line qwik/loader-location
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

/**
 * This function is used to get the balance history of a wallet. It fetches the ERC20 token transfers
 * for the wallet, then for each transaction, it gets the wallet balance at the block number of the transaction
 * and stores it in the balance history. It then iterates over the responses, converting the balance from Wei to a 
 * more readable format and storing the balance for each token at each block in the database.
 * 
 * @param {Object} data - The data object (wallet).
 * @param {string} data.address - The address of the wallet.
 * @returns {Promise<void>} A promise that resolves when the function has completed.
 */
// eslint-disable-next-line qwik/loader-location
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

/**
 * This function is used to remove relation between user and wallet.
 * If wallet is not observed by any user, it will be deleted with relations and balances. 
 * 
 * @param {Object} wallet - The wallet object.
 * @returns {Promise<Object>} A promise that resolves to an object containing the success status.
 */
// eslint-disable-next-line qwik/loader-location
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
