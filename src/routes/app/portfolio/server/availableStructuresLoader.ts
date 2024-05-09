import { server$ } from "@builder.io/qwik-city";
import { getDBTokenPriceUSD } from "~/interface/wallets/observedWallets";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { connectToDB } from "~/database/db";
import { Wallet } from "~/interface/auth/Wallet";

export const getAvailableStructures = server$(async function () {
    const db = await connectToDB(this.env);
    const cookie = this.cookie.get("accessToken");
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

                const [[walletNameResult]]: any = await db.query(
                    `SELECT VALUE name FROM ${wallet.id}<-observes_wallet WHERE in = ${userId}`,
                );

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
                        name: walletNameResult,
                        chainId: wallet.chainId,
                        isExecutable: wallet.isExecutable,
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
    return {
        structures: availableStructures,
        isLoading: false,
    };
});
