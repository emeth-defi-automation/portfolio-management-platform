import { NoSerialize } from "@builder.io/qwik";
import {
    Config,
    getConnections,
    disconnect,
    getConnectors,
    reconnect,
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
    modal.subscribeEvents((e) => console.log("subscribed event: ", e));
    await modal.open({ view: "Connect" });
};

export const disconnectWallets = async (
    config: NoSerialize<Config>,
    logout?: boolean,
) => {
    if (!logout) {
        console.log("connections: ", await getConnections(config as Config));

        const loginAddress = localStorage.getItem("emmethUserWalletAddress");
        const connectors = await getConnectors(config as Config);

        for (const connector of connectors) {
            const accounts = await connector.getAccounts();
            if (accounts.indexOf(loginAddress as `0x${string}`) < 0) {
                await disconnect(config as Config, { connector });
            }
        }

        console.log("connections: ", await getConnections(config as Config));

    } else {
        const connectors = await getConnectors(config as Config);

        for (const connector of connectors) {
            await disconnect(config as Config, { connector });
        }
        await disconnect(config as Config);

        localStorage.removeItem("emmethUserWalletAddress");

        console.log("connections: ", await getConnections(config as Config));
    }
};
