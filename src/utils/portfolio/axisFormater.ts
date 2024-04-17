import { type PeriodState } from "~/interface/balance/Balance";
import { getSelectedPeriodKey } from "../timestamps/timestamp";
import * as d3 from "d3";

export const axisFormater = (value: Date, period: PeriodState): string => {
  let formater = null;
  const key = getSelectedPeriodKey(period);
  switch (key) {
    case "24h":
      formater = d3.utcFormat("%a %H:%M");
      return formater(value as Date);
    case "1W":
      formater = d3.utcFormat("%a %d.%m");
      return formater(value as Date);
    case "1M":
      formater = d3.utcFormat("%d.%m");
      return formater(value as Date);
    case "1Y":
      formater = d3.utcFormat("%Y %b");
      return formater(value as Date);
  }
  return "";
};
