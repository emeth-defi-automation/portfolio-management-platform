import { server$ } from "@builder.io/qwik-city";
import { generateTimestamps } from "../timestamps/timestamp";
import { getTokenBalancesForChart } from "./getTokenBalancesForChart";
import { getTokenPricesForCharts } from "./getTokenPricesForChart";
import { getBlockNumbersFromTimestamps } from "./getBlockNumbersFromTimestamps";
import { convertWeiToQuantity } from "../formatBalances/formatTokenBalance";

interface ChartData {
  value: number;
  timestamp: string;
}

export const getDataForChart = server$(async function (
  period: number,
  interval: number,
): Promise<ChartData[]> {
  const chartData: ChartData[] = [];
  const timestamps: string[] = generateTimestamps(period, interval);
  const blockNumbers: number[] =
    await getBlockNumbersFromTimestamps(timestamps);
  for (let i = 0; i < blockNumbers.length; i++) {
    const tokensBalances = await getTokenBalancesForChart(blockNumbers[i]);
    const tokensPrices = await getTokenPricesForCharts(blockNumbers[i]);
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
