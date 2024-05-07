import { server$ } from "@builder.io/qwik-city";
import { PeriodState } from "~/interface/balance/Balance";
import { getSelectedPeriodInHours, getSelectedPeriodKey } from "~/utils/timestamps/timestamp";
import { getDataForChart } from "~/utils/chartData/getDataForChart";

export const toggleChart = server$(async function (data: PeriodState) {
    
    const selectedPeriod = getSelectedPeriodInHours(data)
    const newChartData = await getDataForChart(selectedPeriod.period, selectedPeriod.interval);
    const newTotalValueChange = newChartData[newChartData.length - 1].value - newChartData[0].value
    const newPercentageValueChange = (newTotalValueChange/newChartData[newChartData.length - 1].value) * 100

    return {
        percentageOfTotalValueChange: newPercentageValueChange.toFixed(2) + "%",
        totalValueChange: newTotalValueChange.toFixed(2),
        period: getSelectedPeriodKey(data),
        chartData: newChartData
    };
});