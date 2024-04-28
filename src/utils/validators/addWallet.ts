import { isAddress, getAddress } from "viem";
import { connectToDB } from "../db";
import { server$, z } from "@builder.io/qwik-city";
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
  name: z.string(),
});
export type UniqueNameResult = z.infer<typeof UniqueNameResult>;

export const isNameUnique = server$(async function (name: string) {
  const db = await connectToDB(this.env);
  const cookie = this.cookie.get("accessToken");
  if (!cookie) {
    throw new Error("No cookie found");
  }
  const { userId } = jwt.decode(cookie.value) as JwtPayload;
  const result = (
    await db.query(`SELECT name FROM '${userId}'->observes_wallet;`)
  ).at(0);
  if (!result) {
    return true;
  }
  const usersObservedWallets = UniqueNameResult.array().parse(result);
  for (const observedWallet of usersObservedWallets) {
    if (observedWallet.name === name) {
      return false;
    }
  }
  return true;
});
