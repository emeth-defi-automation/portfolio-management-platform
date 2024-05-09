import { server$ } from "@builder.io/qwik-city";
import { connectToDB } from "~/database/db";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { getResultAddresses, getWalletDetails } from "~/interface/wallets/observedWallets";

export const getObservedWalletBalances = server$(async function () {
    const db = await connectToDB(this.env);

    const cookie = this.cookie.get("accessToken");
    if (!cookie) {
        throw new Error("No cookie found");
    }
    const { userId } = jwt.decode(cookie.value) as JwtPayload;

    const resultAddresses = await getResultAddresses(db, userId);
    if (!resultAddresses[0]) {
        return [];
    }
    const walletsWithBalance = [];
    let balanceDetails = [];

    for (const observedWalletAddress of resultAddresses) {
        const walletDetails = await getWalletDetails(
            db,
            observedWalletAddress.address,
            userId,
        );
        const [balances]: any = await db.query(
            `SELECT id, value FROM balance WHERE ->(for_wallet WHERE out = '${walletDetails.id}')`,
        );

        const walletNameResult: any = await db.query(
            `SELECT VALUE name FROM ${walletDetails.id}<-observes_wallet WHERE in = ${userId}`,
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
            wallet: walletDetails,
            walletName: walletNameResult,
            balance: balanceDetails,
        };
        balanceDetails = [];

        walletsWithBalance.push(walletWithBalance);
    }
    return walletsWithBalance;
});
// export const useObservedWalletBalances = routeLoader$(async (requestEvent) => {
//     const db = await connectToDB(requestEvent.env);

//     const cookie = requestEvent.cookie.get("accessToken");
//     if (!cookie) {
//         throw new Error("No cookie found");
//     }
//     const { userId } = jwt.decode(cookie.value) as JwtPayload;

//     const resultAddresses = await getResultAddresses(db, userId);
//     if (!resultAddresses[0]) {
//         return [];
//     }
//     const walletsWithBalance = [];
//     let balanceDetails = [];

//     for (const observedWalletAddress of resultAddresses) {
//         const walletDetails = await getWalletDetails(
//             db,
//             observedWalletAddress.address,
//             userId,
//         );
//         const [balances]: any = await db.query(
//             `SELECT id, value FROM balance WHERE ->(for_wallet WHERE out = '${walletDetails.id}')`,
//         );

//         const walletNameResult: any = await db.query(
//             `SELECT VALUE name FROM ${walletDetails.id}<-observes_wallet WHERE in = ${userId}`,
//         );

//         for (const balance of balances) {
//             if (balance.value === "0") {
//                 continue;
//             }
//             const [tokenId]: any = await db.query(`
//         SELECT VALUE ->for_token.out FROM ${balance.id}`);

//             const [tokenDetails]: any = await db.query(`
//         SELECT * FROM ${tokenId[0]}`);

//             const walletBalance = {
//                 balanceId: balance.id,
//                 tokenId: tokenDetails[0].id,
//                 tokenSymbol: tokenDetails[0].symbol,
//             };
//             balanceDetails.push(walletBalance);
//         }

//         const walletWithBalance = {
//             wallet: walletDetails,
//             walletName: walletNameResult,
//             balance: balanceDetails,
//         };
//         balanceDetails = [];

//         walletsWithBalance.push(walletWithBalance);
//     }
//     return walletsWithBalance;
// });