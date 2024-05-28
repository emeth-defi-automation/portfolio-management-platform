import { server$ } from "@builder.io/qwik-city";
import { Readable } from "node:stream";
import { connectToDB } from "~/database/db";
import jwt, { type JwtPayload } from "jsonwebtoken";

export const observedWalletsLiveStream = server$(async function* () {
    const db = await connectToDB(this.env);

    const resultsStream = new Readable({
        objectMode: true,
        read() { },
    });

    await db.live("wallet", async ({ action, result }) => {
        console.log("WE ARE LIVE");
        if (action === "CLOSE") {
            resultsStream.push(null);
            return;
        }
        // const cookie = this.cookie.get("accessToken")?.value;
        // if (!cookie) {
        //     throw new Error("No cookie found");
        // }
        // const { userId } = jwt.decode(cookie) as JwtPayload;
        // console.log("userId", userId);
        // const [walletId]: any = db.query(`SELECT VALUE out FROM observes_wallet WHERE in = ${userId};`);
        // console.log("walletId", walletId);
        // if (!walletId) {
        //     console.log("User doesnt observe", result);
        //     return;
        // }
        resultsStream.push(result);
    });

    for await (const result of resultsStream) {
        yield result;
    }
});