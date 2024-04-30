import { server$ } from "@builder.io/qwik-city";
import { connectToDB } from "~/database/db";
import { PeriodState } from "~/interface/balance/Balance";
import { generateTimestamps, getSelectedPeriodInHours, getSelectedPeriodKey } from "~/utils/timestamps/timestamp";
import jwt, { type JwtPayload } from "jsonwebtoken";
import Moralis from "moralis";
import { EvmChain } from "@moralisweb3/common-evm-utils";
import { type Wallet } from "~/interface/auth/Wallet";
import { testPublicClient } from "../../wallets/testconfig";
import { Token } from "~/interface/token/Token";
import { contractABI } from "~/abi/abi";
import { convertWeiToQuantity, getPercentageOfTotalValueChange, getProperTotalValueChange } from "~/utils/formatBalances/formatTokenBalance";
import { mapTokenAddress } from "~/utils/mapTokenAddress";

export const toggleChart = server$(async function (data) {
    const selectedPeriod: { period: number; interval: number } =
        getSelectedPeriodInHours(data as PeriodState);
    const db = await connectToDB(this.env);

    const cookie = this.cookie.get("accessToken");
    if (!cookie) {
        throw new Error("No cookie found");
    }
    const { userId } = jwt.decode(cookie.value) as JwtPayload;

    const [result]: any = await db.query(
        `SELECT VALUE ->observes_wallet.out FROM ${userId};`,
    );
    if (!result) throw new Error("No observed wallets");
    const observedWalletsQueryResult = result[0];

    const dashboardBalance: { tokenAddress: string; balance: string }[] = [];
    let ethBlocks: number[] = [];
    const chartTimestamps = generateTimestamps(
        selectedPeriod.period,
        selectedPeriod.interval,
    );
    const chartData: number[] = new Array(chartTimestamps.length).fill(0);

    try {
        const ethPromiseArray = chartTimestamps.map(async (item) => {
            const ethBlockDetails = await Moralis.EvmApi.block.getDateToBlock({
                chain: EvmChain.ETHEREUM.hex,
                date: item,
            });
            return ethBlockDetails.raw.block;
        });

        ethBlocks = await Promise.all(ethPromiseArray);
    } catch (error) {
        console.error("Error occurred when fetching Eth block details", error);
    }

    for (const observedWallet of observedWalletsQueryResult) {
        const [wallet] = await db.select<Wallet>(`${observedWallet}`);

        // For each token update balance
        const tokens = await db.select<Token>("token");
        for (const token of tokens) {
            const readBalance = await testPublicClient.readContract({
                address: token.address as `0x${string}`,
                abi: contractABI,
                functionName: "balanceOf",
                args: [wallet.address as `0x${string}`],
            });

            const formattedBalance = convertWeiToQuantity(
                readBalance.toString(),
                token.decimals,
            );

            if (readBalance !== BigInt(0) && formattedBalance !== "0.000") {
                dashboardBalance.push({
                    tokenAddress: token.address,
                    balance: formattedBalance,
                });
            }
        }

        let combinedQuery: string = "";
        for (let i = 0; i < chartTimestamps.length; i++) {
            const walletBalanceQuery = `
          SELECT blockNumber, timestamp, 0x9d16475f4d36dd8fc5fe41f74c9f44c7eccd0709, 0xd418937d10c9cec9d20736b2701e506867ffd85f, 0x054e1324cf61fe915cca47c48625c07400f1b587
          FROM wallet_balance
          WHERE '${chartTimestamps[i]}' >= timestamp
            AND wallwalletAddress = ${wallet.address}
          ORDER BY timestamp DESC
            LIMIT 1;
        `;
            combinedQuery += walletBalanceQuery;
        }
        const walletBalanceAtTimestamp: any = await db.query(combinedQuery);

        try {
            for (let i = 0; i < chartTimestamps.length; i++) {
                try {
                    let partBalance: number = 0;

                    for (const balanceEntry of dashboardBalance) {
                        const ethTokenAddress = mapTokenAddress(balanceEntry.tokenAddress);
                        const tokenPrice = await Moralis.EvmApi.token.getTokenPrice({
                            chain: EvmChain.ETHEREUM.hex,
                            toBlock: ethBlocks[i],
                            address: ethTokenAddress,
                        });

                        if (walletBalanceAtTimestamp[i].length > 0) {
                            partBalance +=
                                parseFloat(
                                    walletBalanceAtTimestamp[i][0][
                                    balanceEntry.tokenAddress.toLowerCase()
                                    ],
                                ) * tokenPrice.raw.usdPrice;
                        } else {
                            partBalance += 0;
                        }
                    }
                    chartData[i] += partBalance;
                } catch (error) {
                    console.error(error);
                }
            }
        } catch (error) {
            console.error(error);
        }
    }

    let totalValueChange = 0;

    if (chartData.length >= 2) {
        totalValueChange = getProperTotalValueChange(
            chartData[0],
            chartData[chartData.length - 1],
        );
    }

    let percentageOfTotalValueChange = 0;

    if (chartData.length >= 2) {
        percentageOfTotalValueChange = getPercentageOfTotalValueChange(
            chartData[0],
            totalValueChange,
        );
    }

    return {
        percentageOfTotalValueChange: percentageOfTotalValueChange.toFixed(2) + "%",
        totalValueChange: totalValueChange.toFixed(2),
        period: getSelectedPeriodKey(data as PeriodState),
        chartData: chartData.map((value, index) => [
            chartTimestamps[index],
            parseFloat(value.toFixed(2)),
        ]) as [string, number][],
    };
});