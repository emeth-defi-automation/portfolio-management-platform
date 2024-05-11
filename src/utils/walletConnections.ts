import { type NoSerialize } from "@builder.io/qwik";
import {
  type Config,
  disconnect,
  getConnectors,
  reconnect,
  getConnections,
} from "@wagmi/core";
import { createWeb3Modal } from "@web3modal/wagmi";

export const openWeb3Modal = async (config: NoSerialize<Config>) => {
  const projectId = import.meta.env.PUBLIC_PROJECT_ID;
  if (!projectId || typeof projectId !== "string") {
    throw new Error("Missing project ID");
  }
  if (config) await reconnect(config!);
  const modal = createWeb3Modal({
    wagmiConfig: config!,
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



    console.log('outside: ', connections)
    if (connections.length > 0) {

      console.log('inside')
      for (const connection of connections) {
        console.log(connection)
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
