import { $, NoSerialize } from "@builder.io/qwik";
import { Config, getConnections, disconnect, getConnectors, reconnect } from "@wagmi/core";
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

export const disconnectWallets = async (config: NoSerialize<Config>, loginWalletAddress?: string) => {
    const subik = '0x8545845EF4BD63c9481Ae424F8147a6635dcEF87';
    // console.log('connectors: ', getConnectors(config as Config));
    console.log('connections: ', await getConnections(config as Config));
    // console.log('connectorClient: ', await getConnectorClient(config as Config, {
    //     account: subik
    // })); 
    // console.log('client: ', getClient(wagmiConfig.config as Config));
    const connectors = await getConnectors(config as Config);
    console.log(connectors);
    // for (const connector of connectors) {
    //     console.log('bump')
    //     const accounts = await connector.getAccounts();
    //     if (accounts.indexOf(subik) < 0) {
    //         console.log(`disconnecting ${connector.name}`)
    //         await disconnect(config as Config, { connector })
    //         console.log('done')
    //     } 

    // }
    for (let i = 0; i < connectors.length; i++) {
        console.log('bump')
        const accounts = await connectors[i].getAccounts();
        if (accounts.indexOf(subik) < 0) {
            console.log(`disconnecting ${connectors[i].name}`)
            await disconnect(config as Config, { connector: connectors[i] })
            console.log('done')
        }
    }
    // why that does not show, is the function blocking threads somehow?
    console.log('elo elo 3 2 0')
    console.log('connections: ', await getConnections(config as Config));
} 