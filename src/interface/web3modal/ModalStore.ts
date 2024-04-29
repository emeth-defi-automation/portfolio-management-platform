import { type NoSerialize, createContextId, type Signal } from "@builder.io/qwik";
import { GetAccountReturnType, type Config } from "@wagmi/core";
import { Address } from "viem";

export interface ModalStore {
  isConnected?: boolean;
  config?: NoSerialize<Config>;
}

export const ModalStoreContext = createContextId<ModalStore>(
  "modal-store-context",
);

export interface Login {
  account: NoSerialize<GetAccountReturnType>;
  address: Signal<Address | undefined>;
  chainId: Signal<number | undefined>;
}

export const LoginContext = createContextId<Login>("login-context");