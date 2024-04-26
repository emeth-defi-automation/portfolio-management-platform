import { server$ } from "@builder.io/qwik-city";
import { type Token } from "~/interface/token/Token";
import { connectToDB } from "~/utils/db";

export const fetchTokens = server$(async function () {
    const db = await connectToDB(this.env);
    return await db.select<Token>("token");
});
