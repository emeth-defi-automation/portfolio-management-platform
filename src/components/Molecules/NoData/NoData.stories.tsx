import NoDataBlock, { type NoDataProps } from "./NoData";

export default {
  title: "atoms/Box",
  component: NoDataBlock,
};

export function NoData(args: NoDataProps) {
  return <NoDataBlock {...args} />;
}

NoData.args = {
  title: "No data available yet",
  description: "To view the chart, set up your wallets and deposit funds.",
};
