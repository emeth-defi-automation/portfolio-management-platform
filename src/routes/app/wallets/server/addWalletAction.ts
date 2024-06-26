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
            const nativeBalance = await testPublicClient.getBalance({
                address: data.address as `0x${string}`,
            });

            const chainId = 1;
            const address = data.address.toString();
            const isExecutable = data.isExecutable === "1" ? true : false;

            const query = `
                BEGIN TRANSACTION;
                LET $ins = (INSERT INTO wallet (chainId, address, isExecutable, nativeBalance)
                VALUES (${chainId}, '${address}', ${isExecutable}, '${nativeBalance}'));  
                $ins; 
                RELATE ONLY ${userId}->observes_wallet->$ins SET name = '${data.name}';
                COMMIT;
                `;
            let result: any;
            try {
                result = await db.query(query);
                walletId = result[2].out

            } catch (error) {
                await db.query("ROLLBACK;")
                console.error("error inserting wallet and creating relation", error)
            }


            // create balances for tokens
            const tokens = await db.select<Token>("token");
            for (const token of tokens) {
                const readBalance = await testPublicClient.readContract({
                    address: token.address as `0x${string}`,
                    abi: contractABI,
                    functionName: "balanceOf",
                    args: [result[1][0].address as `0x${string}`],
                });
                if (!readBalance) {
                    continue;
                }
                const [balance] = await db.create<Balance>(`balance`, {
                    value: readBalance.toString(),
                });
                // balance -> token && balance -> wallet
                await db.query(`RELATE ONLY ${balance.id}->for_token->${token.id}`);
                await db.query(
                    `RELATE ONLY ${balance.id}->for_wallet->${result[1][0].id}`,
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
