import {
    type NoSerialize,
    createContextId,
    type Signal,
  } from "@builder.io/qwik";
  import { type GetAccountReturnType, type Config } from "@wagmi/core";
  import { type Address } from "viem";
  
  export interface WagmiConfig {
    config: NoSerialize<Config>;
  }
  
  export const WagmiConfigContext = createContextId<WagmiConfig>(
    "wagmi-config-context",
  );
  
  export interface Login {
    account: NoSerialize<GetAccountReturnType | undefined>;
    address: Signal<Address | undefined>;
    chainId: Signal<number | undefined>;
  }
  
  export const LoginContext = createContextId<Login>("login-context");