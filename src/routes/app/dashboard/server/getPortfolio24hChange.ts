import { server$ } from "@builder.io/qwik-city";
import { getDataForChart } from "~/utils/chartData/getDataForChart";

export const getPortfolio24hChange = server$(async function () {
    const newChartData = await getDataForChart(24, 4);
    const newTotalValueChange = newChartData[newChartData.length - 1].value - newChartData[0].value
    const newPercentageValueChange = (newTotalValueChange/newChartData[newChartData.length - 1].value) * 100
 
    return {
        percentageOfTotalValueChange: newPercentageValueChange.toFixed(2) + "%",
        totalValueChange: newTotalValueChange.toFixed(2),
        period: "24h",
        chartData: newChartData
    };
});