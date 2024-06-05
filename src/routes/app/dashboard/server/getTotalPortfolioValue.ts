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
import InputField from "~/components/Molecules/InputField/InputField";



export const _totalPortfolioValue = server$(async function (period: Period) {

    // const lessEqualTimestampQueries: string[] = [];
    // const greaterTimestampQueries: string[] = [];
    // const tokenPriceForClosestTimestampQueries: string[] = [];
    const lessEqualTimestampBalanceQueries: string[] = [];
    const greaterTimestampBalance: string[] = [];

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
            const [[lessEqualTimestamp]]: any = await db.query(`SELECT timestamp FROM token_price_history 
            WHERE symbol = '${token.symbol}' 
            AND timestamp <= '${tickTime}' 
            ORDER BY timestamp DESC LIMIT 1;`);


            const [[greaterTimestamp]]: any = await db.query(`SELECT timestamp FROM token_price_history 
            WHERE symbol = '${token.symbol}'
            AND timestamp > '${tickTime}' 
            ORDER BY timestamp ASC LIMIT 1;`)

            let closestTimestamp;
            if (!lessEqualTimestamp) {
                closestTimestamp = greaterTimestamp;
            } else if (!greaterTimestamp) {
                closestTimestamp = lessEqualTimestamp;
            } else {
                const diffGreater = Math.abs(new Date(tickTime).getTime() - new Date(lessEqualTimestamp.timestamp).getTime());
                const diffLess = Math.abs(new Date(tickTime).getTime() - new Date(greaterTimestamp.timestamp).getTime());
                closestTimestamp = diffGreater < diffLess ? lessEqualTimestamp : greaterTimestamp;
            }



            const [[tokenPriceForClosestTimestamp]]: any = await db.query(`SELECT price FROM token_price_history 
            WHERE timestamp = '${closestTimestamp.timestamp}' 
            AND symbol = '${token.symbol}'`);
            tokenPriceMap[token.symbol][tickTime] = tokenPriceForClosestTimestamp.price;


        }


        for (const observedWalletId of observedWalletsIds) {

            for (const tickTime of tickTimes) {

                lessEqualTimestampBalanceQueries.push(`SELECT walletValue, timestamp FROM wallet_balance 
                WHERE walletId = ${observedWalletId} 
                AND tokenSymbol = '${token.symbol}' 
                AND timestamp <= '${tickTime}' 
                ORDER BY timestamp DESC LIMIT 1;`)

                greaterTimestampBalance.push(`SELECT walletValue, timestamp FROM wallet_balance 
                WHERE walletId = ${observedWalletId} 
                AND tokenSymbol = '${token.symbol}'
                AND timestamp > '${tickTime}'
                ORDER BY timestamp ASC LIMIT 1;`)

            }


        }

    }

    let lessEqualTimestampBalanceResults: any = []
    let greaterTimestampBalanceResults: any = []

    if (lessEqualTimestampBalanceQueries.length > 0) {
        lessEqualTimestampBalanceResults = await db.query(lessEqualTimestampBalanceQueries.join(" "));
    } else {
        console.log('No lessEqualTimestampBalanceQueries to execute');
    }

    if (greaterTimestampBalance.length > 0) {
        greaterTimestampBalanceResults = await db.query(greaterTimestampBalance.join(" "));
    } else {
        console.log('No greaterTimestampBalance to execute');
    }


    for (const token of tokens) {
        for (const tickTime of tickTimes) {
            let closestBalance;
            const lessEqualTimestampBalanceArr = lessEqualTimestampBalanceResults.flat();
            const greaterTimestampBalanceArr = greaterTimestampBalanceResults.flat();


            if (!greaterTimestampBalanceArr || greaterTimestampBalanceArr.length === 0) {
                closestBalance = lessEqualTimestampBalanceArr[lessEqualTimestampBalanceArr.length - 1];
            } else if (!lessEqualTimestampBalanceArr || lessEqualTimestampBalanceArr.length === 0) {
                closestBalance = greaterTimestampBalanceArr[greaterTimestampBalanceArr.length - 1];
            } else if (greaterTimestampBalance.length == 0 && lessEqualTimestampBalanceArr.length === 0) {
                closestBalance = { timestamp: tickTime, walletValue: 0 };
            } else if (greaterTimestampBalanceArr.length !== 0 && lessEqualTimestampBalanceArr.length !== 0) {

                for (const lessEqualTimestampBalance of lessEqualTimestampBalanceArr) {
                    for (const greaterTimestampBalance of greaterTimestampBalanceArr) {
                        const diffGreater = Math.abs(new Date(tickTime).getTime() - new Date(lessEqualTimestampBalance.timestamp).getTime());
                        const diffLess = Math.abs(new Date(tickTime).getTime() - new Date(greaterTimestampBalance.timestamp).getTime());
                        closestBalance = diffGreater < diffLess ? lessEqualTimestampBalance : greaterTimestampBalance;
                    }
                }

            }

            const balanceOfTokenQuantity = closestBalance ? convertWeiToQuantity(closestBalance.walletValue, parseInt(token.decimals)) : 0;
            tokenBalanceMap[token.symbol][tickTime] += Number(balanceOfTokenQuantity);
        }
    }


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
    const oldestValue = timestampValueMap[Object.keys(timestampValueMap)[0]];
    const latestValue = timestampValueMap[Object.keys(timestampValueMap)[Object.keys(timestampValueMap).length - 1]];
    const change = latestValue - oldestValue;
    const percentageChange = ((change) / oldestValue) * 100;

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