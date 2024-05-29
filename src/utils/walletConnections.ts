import { noSerialize, type NoSerialize } from "@builder.io/qwik";
import {
  type Config,
  disconnect,
  getConnectors,
  reconnect,
  getConnections,
  watchAccount,
} from "@wagmi/core";
import { createWeb3Modal, defaultWagmiConfig } from "@web3modal/wagmi";
import { mainnet, sepolia } from "viem/chains";
import { metadata } from "~/routes/layout";

export const openWeb3Modal = async (wagmiContext: any, login: any) => {
  const projectId = import.meta.env.PUBLIC_PROJECT_ID;
  if (!projectId || typeof projectId !== "string") {
    throw new Error("Missing project ID");
  }
  const wconfig = defaultWagmiConfig({
    chains: [mainnet, sepolia],
    projectId: import.meta.env.PUBLIC_PROJECT_ID,
    metadata,
  });

  wagmiContext.config = noSerialize(wconfig);

  if (wagmiContext.config) {
    watchAccount(wagmiContext.config!, {
      onChange(account) {
        if (
          window.location.pathname === "/signin" ||
          window.location.pathname === "/"
        ) {
          localStorage.setItem(
            "emmethUserWalletAddress",
            `${account.address}`,
          );
        } else {
          reconnect(wagmiContext.config as Config);
        }
        login.account = noSerialize(account);
        login.address.value = account.address;
        login.chainId.value = account.chainId;
      },
    });
  }

  if (wagmiContext.config) await reconnect(wagmiContext.config!);
  const modal = createWeb3Modal({
    wagmiConfig: wagmiContext.config!,
    projectId,
  });

  await modal.open({ view: "Connect" });

  return modal;
};

export const disconnectWallets = async (
  config: NoSerialize<Config>,
  logout?: boolean,
) => {
  if (!logout) {
    const loginAddress = localStorage.getItem("emmethUserWalletAddress");
    const connectors = await getConnectors(config as Config);

    for (const connector of connectors) {
      const accounts = await connector.getAccounts();
      if (accounts.indexOf(loginAddress as `0x${string}`) < 0) {
        await disconnect(config as Config, { connector });
      }
    }
  } else {
    const connections = await getConnections(config as Config);
    if (connections.length > 0) {
      for (const connection of connections) {
        const connector = connection.connector;
        await disconnect(config as Config, { connector });
      }
    }

    if (localStorage.getItem("emmethUserWalletAddress")) {
      localStorage.removeItem("emmethUserWalletAddress");
    }

    await disconnect(config as Config);
  }
};
