import { server$ } from "@builder.io/qwik-city";
import { Readable } from "node:stream";
import { connectToDB } from "~/database/db";

export const balancesLiveStream = server$(async function* () {
    const db = await connectToDB(this.env);

    const resultsStream = new Readable({
        objectMode: true,
        read() { },
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