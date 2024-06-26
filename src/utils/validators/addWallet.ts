import { isAddress, getAddress } from "viem";
import { connectToDB } from "../../database/db";
import { server$, z } from "@builder.io/qwik-city";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { type AddWalletFormStore } from "~/routes/app/wallets/interface";
import { type Signal } from "@builder.io/qwik";

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

const UniqueNameResult = z.object({
  name: z.string(),
});
type UniqueNameResult = z.infer<typeof UniqueNameResult>;

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

export const UniqueAddressResult = z.array(z.number());
export const isAddressUnique = server$(async function (address: string) {
  const db = await connectToDB(this.env);
  const cookie = this.cookie.get("accessToken");
  if (!cookie) {
    throw new Error("No cookie found");
  }
  const { userId } = jwt.decode(cookie.value) as JwtPayload;
  const result = (
    await db.query(`
     LET $walletId = SELECT VALUE ->observes_wallet.out FROM ${userId};
     LET $wallets = SELECT address FROM wallet WHERE $walletId;
     SELECT VALUE count() FROM $wallets WHERE address = type::string('${address}');
    `)
  ).at(2);

  if (!result) {
    return true;
  }
  const [usersObservedWallets] = UniqueAddressResult.parse(result);
  return !usersObservedWallets;
});

/**
 * Checks if the proceed action should be disabled based on the state of the add wallet form and temporary modal.
 *
 * @param addWalletFormStore The store containing the data of the add wallet form.
 * @param temporaryModalStore The store containing the data of the temporary modal.
 * @returns True if the proceed action should be disabled, otherwise false.
 */

export const isProceedDisabled = (
  addWalletFormStore: AddWalletFormStore,
  isSecondWalletConnected: Signal<boolean>,
) =>
  addWalletFormStore.name === "" ||
  !isValidName(addWalletFormStore.name) ||
  !addWalletFormStore.isNameUnique ||
  addWalletFormStore.isNameUniqueLoading ||
  !isSecondWalletConnected;

/**
 * Checks if the execute action should be disabled based on the state of the add wallet form.
 *
 * @param addWalletFormStore The store containing the data of the add wallet form.
 * @returns True if the execute action should be disabled, otherwise false.
 */

export const isExecutableDisabled = (addWalletFormStore: AddWalletFormStore) =>
  addWalletFormStore.name === "" ||
  !isValidName(addWalletFormStore.name) ||
  !addWalletFormStore.isNameUnique ||
  addWalletFormStore.isNameUniqueLoading ||
  !addWalletFormStore.isAddressUnique;

/**
 * Checks if the action should be disabled based on the state of the add wallet form for a non-executable action.
 *
 * @param addWalletFormStore The store containing the data of the add wallet form.
 * @returns True if the action should be disabled, otherwise false.
 */

export const isNotExecutableDisabled = (
  addWalletFormStore: AddWalletFormStore,
) =>
  addWalletFormStore.name === "" ||
  addWalletFormStore.address === "" ||
  !isValidName(addWalletFormStore.name) ||
  !isValidAddress(addWalletFormStore.address) ||
  !addWalletFormStore.isNameUnique ||
  addWalletFormStore.isNameUniqueLoading ||
  !addWalletFormStore.isAddressUnique ||
  !isCheckSum(addWalletFormStore.address);
