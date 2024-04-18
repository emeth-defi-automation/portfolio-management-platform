import { type PeriodState } from "~/interface/balance/Balance";
import { getSelectedPeriodKey } from "../timestamps/timestamp";
import * as d3 from "d3";

export const axisXFormatter = (value: Date, period: PeriodState): string => {
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

export const axisYFormatter = (value: number): string => {
  const lookup = [
    { value: 1, symbol: "", digits: 2 },
    { value: 1e3, symbol: "k", digits: 1 },
    { value: 1e6, symbol: "M", digits: 1 },
    { value: 1e9, symbol: "G", digits: 1 },
    { value: 1e12, symbol: "T", digits: 1 },
    { value: 1e15, symbol: "P", digits: 1 },
    { value: 1e18, symbol: "E", digits: 1 },
  ];
  const regexp = /\.0+$|(?<=\.[0-9]*[1-9])0+$/;
  const item = lookup.reverse().find((item) => value >= item.value);
  return (
    "$" +
    (item
      ? (value / item.value)
          .toFixed(item.digits)
          .replace(regexp, "")
          .concat(item.symbol)
      : "0")
  );
};
