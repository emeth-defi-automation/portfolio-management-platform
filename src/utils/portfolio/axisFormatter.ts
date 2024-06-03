import * as d3 from "d3";
import { Period } from "~/routes/app/dashboard/server/getPortfolio24hChange";

export const axisXFormatter = (value: Date, period: Period): string => {
  let formatter = null;
  switch (period) {
    case Period.DAY:
      formatter = d3.utcFormat("%a %H:%M");
      return formatter(value as Date);
    case Period.WEEK:
      formatter = d3.utcFormat("%a %d.%m");
      return formatter(value as Date);
    case Period.MONTH:
      formatter = d3.utcFormat("%d.%m");
      return formatter(value as Date);
    case Period.YEAR:
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
