import type { AddNetwork, OfficialOptions } from "@tenkeylabs/dappwright";
import { MetaMaskWallet } from "@tenkeylabs/dappwright";

export const sepoliaNetwork: AddNetwork = {
  networkName: "Sepolia",
  rpc: "https://sepolia.gateway.tenderly.co",
  chainId: 11155111,
  symbol: "SepoliaETH",
};

export const metamaskOptions: OfficialOptions = {
  wallet: "metamask",
  version: MetaMaskWallet.recommendedVersion,
  seed: "test test test test test test test test test test test junk",
  headless: false,
};
