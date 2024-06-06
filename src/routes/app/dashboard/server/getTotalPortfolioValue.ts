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
import { Console } from "node:console";



export const _totalPortfolioValue = server$(async function (period: Period) {

    const lessEqualTimestampBalanceQueries: string[][] = [];
    const lessEqualTimestampQueries: string[][] = [];
    const greaterTimestampQueries: string[][] = [];
    const tokenPriceForClosestTimestampQueries: string[] = [];
    const closerTimestamps: string[] = [];

    const tickTimes = getPortfolioDatesForSelectedPeriod(period);

    const db = await connectToDB(this.env);

    const cookie = this.cookie.get("accessToken");
    if (!cookie) {
        throw new Error("No cookie found");
    }


    const { userId } = jwt.decode(cookie.value) as JwtPayload;

    const [tokens]: any = await db.query(`SELECT symbol, decimals FROM token;`);
    const [observedWalletsIds]: any = await db.query(`SELECT VALUE out from observes_wallet WHERE in = ${userId}`);

    let tokenPriceMap: { [tokenSymbol: string]: { [timestamp: string]: number } } = {};
    let tokenBalanceMap: { [tokenSymbol: string]: { [timestamp: string]: number } } = {};
    for (const token of tokens) {
        tokenBalanceMap[token.symbol] = {};
        for (const tickTime of tickTimes) {
            tokenBalanceMap[token.symbol][tickTime] = 0;
        }
        tokenPriceMap[token.symbol] = {};

        if (token.symbol === "USDT") {
            for (const tickTime of tickTimes) {
                tokenPriceMap[token.symbol][tickTime] = 1;
            }
            continue;
        }

        for (const tickTime of tickTimes) {
            //     const [[lessEqualTimestamp]]: any = await db.query(`SELECT timestamp FROM token_price_history 
            // WHERE symbol = '${token.symbol}' 
            // AND timestamp <= '${tickTime}' 
            // ORDER BY timestamp DESC LIMIT 1;`);

            lessEqualTimestampQueries.push([tickTime, token.symbol,
                `SELECT timestamp FROM token_price_history 
                    WHERE symbol = '${token.symbol}' 
                     AND timestamp <= '${tickTime}' 
                    ORDER BY timestamp DESC LIMIT 1;`
            ])


            //     const [[greaterTimestamp]]: any = await db.query(`SELECT timestamp FROM token_price_history 
            // WHERE symbol = '${token.symbol}'
            // AND timestamp > '${tickTime}' 
            // ORDER BY timestamp ASC LIMIT 1;`);

            greaterTimestampQueries.push([tickTime, token.symbol,
                `SELECT timestamp FROM token_price_history 
            WHERE symbol = '${token.symbol}'
            AND timestamp > '${tickTime}' 
            ORDER BY timestamp ASC LIMIT 1;`
            ])


        }







        for (const observedWalletId of observedWalletsIds) {

            for (const tickTime of tickTimes) {
                lessEqualTimestampBalanceQueries.push([tickTime, token.decimals, `SELECT * FROM wallet_balance 
                WHERE walletId = ${observedWalletId} 
                AND tokenSymbol = '${token.symbol}' 
                AND timestamp <= '${tickTime}' 
                ORDER BY timestamp DESC LIMIT 1;`])
            }

        }

    }

    if (!lessEqualTimestampQueries.length || !greaterTimestampQueries.length) {
        console.log("no queries to excecute");
    } else {
        const lessTimestampQueries = lessEqualTimestampQueries.map(data => data[2]);
        const greaterTimestampQueries1 = greaterTimestampQueries.map(data => data[2]);
        const query1 = lessTimestampQueries.join('');
        const query2 = greaterTimestampQueries1.join('');
        const lessEqualTimestampResult: any = (await db.query(query1)).flat();
        const greaterEqualTimestampResult: any = (await db.query(query2)).flat();


        const length = lessEqualTimestampResult.length > greaterEqualTimestampResult.length ? lessEqualTimestampResult.length : greaterEqualTimestampResult.length

        let closestTime;
        let tokenSymbol;
        for (let i = 0; i < length; i++) {

            const lessEqualTimestamp = lessEqualTimestampResult[i];
            const greaterTimestamp = greaterEqualTimestampResult[i];


            if (!lessEqualTimestamp) {
                closestTime = greaterTimestamp;
            } else if (!greaterTimestamp) {
                closestTime = lessEqualTimestamp;
            } else {
                const diffGreater = Math.abs(new Date(lessEqualTimestampQueries[i][0]).getTime() - new Date(lessEqualTimestamp.timestamp).getTime());
                const diffLess = Math.abs(new Date(greaterTimestampQueries[i][0]).getTime() - new Date(greaterTimestamp.timestamp).getTime());
                closestTime = diffGreater < diffLess ? lessEqualTimestamp : greaterTimestamp;
            }

            if (lessEqualTimestampResult.includes(closestTime)) {
                tokenSymbol = lessEqualTimestampQueries[i][1]
            } else if (greaterEqualTimestampResult.includes(closestTime)) {
                tokenSymbol = greaterTimestampQueries[i][1]
            }


            closerTimestamps.push(closestTime)
            tokenPriceForClosestTimestampQueries.push(`SELECT price FROM token_price_history 
            WHERE timestamp = '${closestTime.timestamp}' 
            AND symbol = '${tokenSymbol}';`)

        }




        const tokenPriceForClosestTimestampResults: any = (await db.query(tokenPriceForClosestTimestampQueries.join(" "))).flat();


        for (let j = 0; j < length; j++) {
            tokenPriceMap[lessEqualTimestampQueries[j][1]][lessEqualTimestampQueries[j][0]] = tokenPriceForClosestTimestampResults[j].price;
        }

    }




    if (!lessEqualTimestampBalanceQueries.length) {
        console.log('No lessEqualTimestampBalanceQueries to execute');
    } else {
        const queries = lessEqualTimestampBalanceQueries.map(data => data[2]);
        const query = queries.join('');

        const lessEqualTimestampBalance: any = await db.query(query);
        lessEqualTimestampBalance.flat().forEach((element: any, index: number) => {
            const balanceOfTokenQuantity = convertWeiToQuantity(element.walletValue, parseInt(lessEqualTimestampBalanceQueries[index][1]));
            tokenBalanceMap[element.tokenSymbol][lessEqualTimestampBalanceQueries[index][0]] += Number(balanceOfTokenQuantity);
        });

    }


    console.log(period, tokenBalanceMap)


    let tokenValueMap: { [tokenSymbol: string]: { [timestamp: string]: number } } = {};

    for (const tokenSymbol in tokenBalanceMap) {
        tokenValueMap[tokenSymbol] = {};
        for (const timestamp in tokenBalanceMap[tokenSymbol]) {
            const quantity = tokenBalanceMap[tokenSymbol][timestamp];
            const price = Number(tokenPriceMap[tokenSymbol][timestamp]);
            tokenValueMap[tokenSymbol][timestamp] = quantity * price;
        }
    }
    let timestampValueMap: { [timestamp: string]: number } = {};

    for (const tokenSymbol in tokenValueMap) {
        for (const timestamp in tokenValueMap[tokenSymbol]) {
            const value = tokenValueMap[tokenSymbol][timestamp];

            if (timestamp in timestampValueMap) {
                timestampValueMap[timestamp] += value;
            } else {
                timestampValueMap[timestamp] = value;
            }
        }
    }
    let percentageChange = 0;
    const oldestValue = timestampValueMap[Object.keys(timestampValueMap)[0]];
    const latestValue = timestampValueMap[Object.keys(timestampValueMap)[Object.keys(timestampValueMap).length - 1]];
    const change = latestValue - oldestValue;
    if (oldestValue !== 0) {
        percentageChange = ((change) / oldestValue) * 100;
    }
    return {
        change, percentageChange,
        values: Object.entries(timestampValueMap).map(([timestamp, value]) => [timestamp, value]) as [string, number][]
    }
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