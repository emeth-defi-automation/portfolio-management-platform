import { type NoSerialize } from "@builder.io/qwik";
import {
  type Config,
  disconnect,
  getConnectors,
  reconnect,
  getConnections,
} from "@wagmi/core";
import { createWeb3Modal } from "@web3modal/wagmi";

export const openWeb3Modal = async (config: any) => {
// export const openWeb3Modal = async (config: NoSerialize<Config>) => {
  console.log('configerinio: ',config.value)
  const projectId = import.meta.env.PUBLIC_PROJECT_ID;
  if (!projectId || typeof projectId !== "string") {
    throw new Error("Missing project ID");
  }
  if (config.value) reconnect(config.value);
  const modal = createWeb3Modal({
    wagmiConfig: config.value,
    projectId,
  });

  await modal.open({ view: "Connect" });

  return modal;
};

export const disconnectWallets = async (
  // config: NoSerialize<Config>,
  config: any,
  logout?: boolean,
) => {
  if (!logout) {
    const loginAddress = localStorage.getItem("emmethUserWalletAddress");
    const connectors = await getConnectors(config.value as Config);

    for (const connector of connectors) {
      const accounts = await connector.getAccounts();
      if (accounts.indexOf(loginAddress as `0x${string}`) < 0) {
        await disconnect(config.value as Config, { connector });
      }
    }
  } else {
    const connections = await getConnections(config.value as Config);
    if (connections.length > 0) {
      for (const connection of connections) {
        const connector = connection.connector;
        await disconnect(config.value as Config, { connector });
      }
    }

    if (localStorage.getItem("emmethUserWalletAddress")) {
      localStorage.removeItem("emmethUserWalletAddress");
    }

    await disconnect(config.value as Config);
  }
};
