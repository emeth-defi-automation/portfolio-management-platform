import { fetchTokenDayData, getDBTokenPriceUSD, getDBTokensAddresses } from "~/interface/wallets/observedWallets";
import { convertWeiToQuantity } from "~/utils/formatBalances/formatTokenBalance";
import { testPublicClient } from "../../wallets/testconfig";
import { contractABI } from "~/abi/abi";
import { type Token } from "~/interface/token/Token";
import { server$ } from "@builder.io/qwik-city";
import { connectToDB } from "~/database/db";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { checksumAddress } from "viem";
import { Wallet } from "~/interface/auth/Wallet";
import { Balance } from "~/interface/balance/Balance";
import { getPortfolioDatesForSelectedPeriod, Period } from "./getPortfolio24hChange";



export const _totalPortfolioValue = server$(async function (period: Period) {
    const tickTimes = getPortfolioDatesForSelectedPeriod(period);
    console.log("ticktimes from _totalportfoliovalue", tickTimes);


    const db = await connectToDB(this.env);

    const cookie = this.cookie.get("accessToken");
    if (!cookie) {
        throw new Error("No cookie found");
    }
    const { userId } = jwt.decode(cookie.value) as JwtPayload;

    const [tokens]: any = await db.query(`SELECT symbol, decimals FROM token;`);
    console.log(tokens);

    const tokenValueMap = Object.fromEntries(
        tokens.map((token: any) => [
            token.symbol,
            Object.fromEntries(tickTimes.map((tickTime: string) => [tickTime, Number(0)]))
        ])
    );

    const [observedWalletsIds]: any = await db.query(`SELECT VALUE out from observes_wallet WHERE in = ${userId}`);

    let totalValue = 0;
    for (const token of tokens) {
        for (const observedWalletId of observedWalletsIds) {
            // for(const tickTime of tickTimes) {
            //     const [[tokenBalanceForWallet]]: any = await db.query(`SELECT walletValue, timestamp FROM wallet_balance 
            //         WHERE walletId = ${observedWalletId} 
            //         AND tokenSymbol = ${token.symbol}
            //         AND timestamp <= ${tickTime}`);
            //     if (!tokenBalanceForWallet) {
            //         continue;
            //     }
            //     const currentBalanceOfToken = convertWeiToQuantity(
            //         tokenBalanceForWallet.walletValue,
            //         parseInt(token.decimals),
            //     );
            // }

            const [[tokenBalanceForWallet]]: any = await db.query(`SELECT walletValue, timestamp FROM wallet_balance 
                WHERE walletId = ${observedWalletId} AND tokenSymbol = '${token.symbol}'
                ORDER BY timestamp DESC LIMIT 1;`);
            if (!tokenBalanceForWallet) {
                continue;
            }
            console.log(tokenBalanceForWallet);
            const currentBalanceOfToken = convertWeiToQuantity(
                tokenBalanceForWallet.walletValue,
                parseInt(token.decimals),
            );
            tokenValueMap[token.symbol].quantity += Number(currentBalanceOfToken);
        }

        let latestTokenPrice: any = undefined;
        if (token.symbol === "USDT") {
            [[latestTokenPrice]] = await db.query(
                `SELECT * FROM token_price_history WHERE symbol = 'USDC' ORDER BY timestamp DESC limit 1;`,
            );
        } else {
            [[latestTokenPrice]] = await db.query(
                `SELECT * FROM token_price_history WHERE symbol = '${token.symbol}' ORDER BY timestamp DESC limit 1;`,
            );
        }

        if (!latestTokenPrice) {
            continue;
        }

        totalValue += tokenValueMap[token.symbol].quantity * latestTokenPrice.price;
    }

    return totalValue.toFixed(2);
})

export const getTotalPortfolioValue = server$(async function () {
    const db = await connectToDB(this.env);

    const cookie = this.cookie.get("accessToken");
    if (!cookie) {
        throw new Error("No cookie found");
    }
    const { userId } = jwt.decode(cookie.value) as JwtPayload;

    const uniswapSubgraphURL = this.env.get("UNIV3_OPTIMIST_SUBGRAPH_URL");
    if (!uniswapSubgraphURL) {
        throw new Error("Missing UNISWAP_SUBGRAPH_URL");
    }
    const dbTokensAddresses = await getDBTokensAddresses(db);
    const tokenAddresses = dbTokensAddresses.map((token) =>
        token.address.toLowerCase(),
    );

    const tokenDayData = await fetchTokenDayData(
        uniswapSubgraphURL,
        tokenAddresses,
    );
    for (const {
        token: { id },
        priceUSD,
    } of tokenDayData) {
        await db.query(`
        UPDATE token
        SET priceUSD = '${priceUSD}'
        WHERE address = '${checksumAddress(id as `0x${string}`)}';
      `);
    }

    const [result]: any = await db.query(
        `SELECT ->observes_wallet.out FROM ${userId};`,
    );
    if (!result) throw new Error("No observed wallets");
    const observedWalletsQueryResult = result[0]["->observes_wallet"].out;

    let totalValue = 0;

    for (const observedWallet of observedWalletsQueryResult) {
        const [wallet] = await db.select<Wallet>(`${observedWallet}`);
        const nativeBalance = await testPublicClient.getBalance({
            address: wallet.address as `0x${string}`,
            blockTag: "safe",
        });
        await db.query(
            `UPDATE ${observedWallet} SET nativeBalance = '${nativeBalance}';`,
        );

        // For each token update balance
        const tokens = await db.select<Token>("token");
        for (const token of tokens) {
            const readBalance = await testPublicClient.readContract({
                address: token.address as `0x${string}`,
                abi: contractABI,
                functionName: "balanceOf",
                args: [wallet.address as `0x${string}`],
            });

            // Certain balance which shall be updated
            const [[balanceToUpdate]]: any = await db.query(
                `SELECT * FROM balance WHERE ->(for_wallet WHERE out = '${wallet.id}') AND ->(for_token WHERE out = '${token.id}');`,
            );

            await db.update<Balance>(`${balanceToUpdate.id}`, {
                value: readBalance.toString(),
            });

            const formattedBalance = convertWeiToQuantity(
                readBalance.toString(),
                token.decimals,
            );

            if (readBalance !== BigInt(0) && formattedBalance !== "0.000") {
                // Add the token to the wallet object
                const [{ priceUSD }] = await getDBTokenPriceUSD(db, token.address);
                const balanceValueUSD = (
                    Number(formattedBalance) * Number(priceUSD)
                ).toFixed(2);
                totalValue += Number(balanceValueUSD);
            }
        }
    }
    return totalValue.toFixed(2);
});