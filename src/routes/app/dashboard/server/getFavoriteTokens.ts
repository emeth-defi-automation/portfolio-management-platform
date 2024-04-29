import { server$ } from "@builder.io/qwik-city";
import { connectToDB } from "~/database/db";
import { Wallet } from "~/interface/auth/Wallet";
import { getDBTokenPriceUSD, getTokenImagePath } from "~/interface/wallets/observedWallets";
import jwt, { type JwtPayload } from "jsonwebtoken";

export const getFavouriteTokens = server$(async function () {
    const db = await connectToDB(this.env);

    const cookie = this.cookie.get("accessToken");
    if (!cookie) {
        throw new Error("No cookie found");
    }
    const { userId } = jwt.decode(cookie.value) as JwtPayload;
    const [result]: any = await db.query(
        `SELECT * FROM ${userId}->has_structure WHERE out.name = 'Favourite Tokens';`,
    );
    if (!result.length) return [];
    const createdStructure = result[0].out;
    const availableStructures: any[] = [];

    const [structure] = await db.select(`${createdStructure}`);
    const structureTokens: any = [];
    const [structureBalances]: any = await db.query(`
      SELECT ->structure_balance.out FROM ${structure.id}`);

    for (const balance of structureBalances[0]["->structure_balance"].out) {
        const [walletId]: any = await db.query(`
        SELECT out FROM for_wallet WHERE in = ${balance}`);
        const [wallet] = await db.select<Wallet>(`${walletId[0].out}`);

        const [walletName]: any = await db.query(
            `SELECT VALUE name FROM ${wallet.id}<-observes_wallet WHERE in = ${userId}`,
        );

        const [tokenBalance]: any = await db.query(`
        SELECT * FROM balance WHERE id=${balance}`);

        const [tokenId]: any = await db.query(`
        SELECT ->for_token.out FROM ${balance}`);

        const [token]: any = await db.query(
            `SELECT * FROM ${tokenId[0]["->for_token"].out[0]}`,
        );
        const [tokenValue] = await getDBTokenPriceUSD(db, token[0].address);
        const [imagePath] = await getTokenImagePath(db, token[0].symbol);
        const tokenWithBalance = {
            id: token[0].id,
            name: token[0].name,
            symbol: token[0].symbol,
            decimals: token[0].decimals,
            balance: tokenBalance[0].value,
            balanceValueUSD: tokenValue.priceUSD,
            imagePath: imagePath.imagePath,
        };

        structureTokens.push({
            wallet: {
                id: wallet.id,
                name: walletName,
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

    return availableStructures;
});