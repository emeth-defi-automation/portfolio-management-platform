import { $, NoSerialize } from "@builder.io/qwik";
import { Config, getConnections, getConnectors, reconnect } from "@wagmi/core";
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
};

export const disconnectWallets = (config: NoSerialize<Config>, loginWalletAddress?: string) => {
    console.log('connectors: ', getConnectors(config as Config));
    console.log('connections: ', getConnections(config as Config));
    // console.log('client: ', getClient(wagmiConfig.config as Config));
    const subik = '0x8545845EF4BD63c9481Ae424F8147a6635dcEF87';
    const connectors = getConnectors(config as Config);
    console.log(connectors);

}