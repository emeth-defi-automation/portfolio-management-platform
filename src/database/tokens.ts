import { server$ } from "@builder.io/qwik-city";
import { connectToDB } from "~/database/db";
import { type Token } from "~/interface/token/Token";

export const queryTokens = server$(async function () {
  const db = await connectToDB(this.env);

  const [tokens]: any = await db.query(
    `SELECT decimals, symbol, address FROM token;`,
  );
  return tokens;
});

export const fetchTokens = server$(async function () {
  const db = await connectToDB(this.env);
  return await db.select<Token>("token");
});
