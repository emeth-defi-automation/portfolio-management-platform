import { type PeriodState } from "~/interface/balance/Balance";
import { getSelectedPeriodKey } from "../timestamps/timestamp";
import * as d3 from "d3";

export const axisFormatter = (value: Date, period: PeriodState): string => {
  let formatter = null;
  const key = getSelectedPeriodKey(period);
  switch (key) {
    case "24h":
      formatter = d3.utcFormat("%a %H:%M");
      return formatter(value as Date);
    case "1W":
      formatter = d3.utcFormat("%a %d.%m");
      return formatter(value as Date);
    case "1M":
      formatter = d3.utcFormat("%d.%m");
      return formatter(value as Date);
    case "1Y":
      formatter = d3.utcFormat("%Y %b");
      return formatter(value as Date);
  }
  return "";
};
