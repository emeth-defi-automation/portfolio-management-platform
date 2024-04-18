import { isAddress, getAddress } from "viem";
import { connectToDB } from "../db";
import { server$, z } from "@builder.io/qwik-city";
import { type Wallet } from "~/interface/auth/Wallet";
import jwt, { type JwtPayload } from "jsonwebtoken";

export function isValidName(name: string): boolean {
  return name.length > 0 ? name.trim().length > 3 : true;
}

export function isValidAddress(address: string): boolean {
  return address.length > 0
    ? address.trim() !== "" && isAddress(address)
    : true;
}

export function isCheckSum(address: string): boolean {
  return address.length > 0 && isValidAddress(address)
    ? address === getAddress(address)
    : true;
}

export function isPrivateKey32Bytes(key: string): boolean {
  return key.length > 0 ? key.trim().length === 66 : true;
}

export function isPrivateKeyHex(key: string): boolean {
  return key.length > 0
    ? /^[0-9a-fA-F]+$/i.test(key.replace(/^0x/, "").trim())
    : true;
}

export const UniqueNameResult = z.object({
  total: z.number(),
});
export type UniqueNameResult = z.infer<typeof UniqueNameResult>;

export const isNameUnique = server$(async function (name: string) {
  const db = await connectToDB(this.env);
  const cookie = this.cookie.get("accessToken");
  if (!cookie) {
    throw new Error("No cookie found");
  }
  const { userId } = jwt.decode(cookie.value) as JwtPayload;

  const [result]: any = await db.query(
    `SELECT VALUE ->observes_wallet.out FROM ${userId};`,
  );
  if (!result) throw new Error("No observed wallets");

  const observedWalletsQueryResult = result[0];
  for (const observedWallet of observedWalletsQueryResult) {
    const [wallet] = await db.select<Wallet>(`${observedWallet}`);
    if (wallet.name === name) {
      return false;
    }
  }
  return true;

  //const queryResult = (
  //  await db.query(`SELECT count() as total FROM wallet WHERE name = '${name}'`)
  //).at(0);
  //const parsedQueryResult = UniqueNameResult.array().parse(queryResult);
  //if (parsedQueryResult.length === 0) {
  //  return true;
  //}
  //return parsedQueryResult[0].total === 0;
});
