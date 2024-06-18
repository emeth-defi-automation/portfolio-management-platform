import {
  type NoSerialize,
  createContextId,
  type Signal,
} from "@builder.io/qwik";
import { type GetAccountReturnType, type Config } from "@wagmi/core";
import { type Address } from "viem";

export interface WagmiConfig {
  config: Signal<NoSerialize<Config> | false>;
}

export const WagmiConfigContext = createContextId<WagmiConfig>(
  "wagmi-config-context",
);
export interface OnClient {
  onClient: Signal<boolean>;
}

export const OnClientContext = createContextId<OnClient>(
  "wagmi-config-context",
);

export interface Login {
  account: NoSerialize<GetAccountReturnType | undefined>;
  address: Signal<Address | undefined>;
  chainId: Signal<number | undefined>;
}

export const LoginContext = createContextId<Login>("login-context");
