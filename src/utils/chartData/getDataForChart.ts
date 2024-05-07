import { server$ } from "@builder.io/qwik-city";
import { generateTimestamps } from "../timestamps/timestamp";
import { getTokenBalancesForChart } from "./getTokenBalancesForChart";
import { getTokenPricesForCharts } from "./getTokenPricesForChart";
import {
  getEthBlockNumbersFromTimestamps,
  getSepBlockNumbersFromTimestamps,
} from "./getBlockNumbersFromTimestamps";
import { convertWeiToQuantity } from "../formatBalances/formatTokenBalance";

export interface ChartData {
  value: number;
  timestamp: string;
}

export const getDataForChart = server$(async function (
  period: number,
  interval: number,
): Promise<ChartData[]> {
  const chartData: ChartData[] = [];
  const timestamps: string[] = generateTimestamps(period, interval);
  const ethBlockNumbers: number[] =
    await getEthBlockNumbersFromTimestamps(timestamps);
  const sepBlockNumbers: number[] =
    await getSepBlockNumbersFromTimestamps(timestamps);
  for (let i = 0; i < ethBlockNumbers.length; i++) {
    const tokensBalances = await getTokenBalancesForChart(sepBlockNumbers[i]);
    const tokensPrices = await getTokenPricesForCharts(ethBlockNumbers[i]);
    let partialSum = 0;
    for (const token of tokensBalances) {
      const tokenPrice =
        tokensPrices.find((item) => item.tokenSymbol === token.tokenSymbol)
          ?.usdPrice ?? 0;
      partialSum +=
        tokenPrice *
        Number(convertWeiToQuantity(token.value, token.tokenDecimals));
    }
    chartData.push({ value: partialSum, timestamp: timestamps[i] });
  }
  return chartData;
});
