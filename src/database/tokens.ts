import { server$, z } from "@builder.io/qwik-city";
import { type Surreal } from "surrealdb.js";
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

export const GetTokenDecimalsResult = z.array(z.string());

export type GetTokenDecimalsResult = z.infer<typeof GetTokenDecimalsResult>;

export const getTokenDecimals = async (db: Surreal, address: string) => {
  try {
    const queryResult = (
      await db.query(`SELECT VALUE decimals FROM token WHERE address = '${address}';`)
    ).at(0);
    console.log("tokenDecimals from query", queryResult);
    return GetTokenDecimalsResult.parse(queryResult);
  } catch (e) {
    console.error("Error in getTokenDecimals: ", e);
    throw e;
  }
};

export const getTokenDecimalsServer = server$(async function (
  tokenAddress: string,
) {
  try {
    const db = await connectToDB(this.env);
    const tokenDecimals = await getTokenDecimals(db, tokenAddress);
    console.log("tokenDecimalsServer: ", tokenDecimals);
    return tokenDecimals;
  } catch (e) {
    console.error("Error in getTokenDecimalsServer: ", e);
    throw e;
  }
});
