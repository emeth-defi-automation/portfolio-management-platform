import { routeAction$, zod$, z } from "@builder.io/qwik-city";
import jwt, { JwtPayload } from "jsonwebtoken";
import { isAddress } from "viem";
import { contractABI } from "~/abi/abi";
import { Wallet } from "~/interface/auth/Wallet";
import { Balance } from "~/interface/balance/Balance";
import { getExistingWallet, getExistingRelation } from "~/interface/wallets/addWallet";
import { connectToDB } from "~/database/db";
import { testPublicClient } from "../testconfig";
import { Token } from "~/interface/token/Token";
import { getBalanceHistory } from "~/utils/balanceHistory/getBalanceHistory";
import { getCurrentBalance } from "~/utils/balanceHistory/getCurrentBalance";

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
            const currentBalance = await getCurrentBalance(data.address.toString());
            getBalanceHistory(currentBalance, data.address.toString(), walletId);
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