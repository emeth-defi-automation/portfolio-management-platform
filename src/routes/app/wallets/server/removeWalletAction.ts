import { routeAction$, zod$, z } from "@builder.io/qwik-city";
import jwt, { JwtPayload } from "jsonwebtoken";
import { walletExists, getUsersObservingWallet } from "~/interface/wallets/removeWallet";
import { connectToDB } from "~/utils/db";

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