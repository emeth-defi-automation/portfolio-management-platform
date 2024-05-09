import { type NoSerialize } from "@builder.io/qwik";
import { type Config, disconnect, getConnectors, reconnect, getConnections } from "@wagmi/core";
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
  // console.log('state modal ', modal.getState());
  // console.log('getEvent ', modal.getEvent())
  // modal.subscribeEvents(event => {
  //   // if(event.data.event === 'CONNECT_SUCCESS')
  //   console.log('event: ', event)
  // })
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
    // const connectors = await getConnectors(config as Config);
    const connections = await getConnections(config as Config);

    // for (const connector of connectors) {
    //   // console.log(connector);
    //   await disconnect(config as Config, { connector });
    //   // console.log('disconnected ')
    // }
    for (const connection of connections) {
      // console.log(connector);
      const connector = connection.connector;
      await disconnect(config as Config, { connector });
      // console.log('disconnected ')
    }

    if (localStorage.getItem("emmethUserWalletAddress")) {
      localStorage.removeItem("emmethUserWalletAddress");
    }
    // if (localStorage.getItem("refreshToken")) {
    //   localStorage.removeItem("refreshToken");
    // }

    await disconnect(config as Config);
  }
};
