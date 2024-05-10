import NoData, { type NoDataProps } from "./NoData";

export default {
  title: "molecules/Nodata",
  component: NoData,
};

export function NoDataBlock(args: NoDataProps) {
  return <NoData {...args} />;
}

NoDataBlock.args = {
  title: "No data available yet",
  description: "To view the chart, set up your wallets and deposit funds.",
};
