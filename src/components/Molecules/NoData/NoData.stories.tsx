import Button from "~/components/Atoms/Buttons/Button";
import NoData, { type NoDataProps } from "./NoData";

export default {
  title: "molecules/Nodata",
  component: NoData,
};

export function NoDataInfo(args: NoDataProps) {
  return (
    <NoData {...args}>
      <Button
        variant="transparent"
        text="Deposit Funds"
        size="small"
      />
      <Button text="Setup Wallet" size="small" />
    </NoData>
  );
}

export function NoDataWarning(args: NoDataProps) {
  return (
    <NoData {...args}>
      <Button text="Setup Wallet" class="w-full" />
    </NoData>
  );
}
export function NoDataSuccess(args: NoDataProps) {
  return (
    <NoData {...args}>
      <Button
        variant="transparent"
        text="Authorize another wallet"
      />
      <Button text="Back To Wallet" />
    </NoData>
  );
}

NoDataInfo.args = {
  title: "No data available yet",
  description: "To view the chart, set up your wallets and deposit funds.",
  variant: "info",
};

NoDataWarning.args = {
  title: "Error Connecting",
  description:
    "The connection attempt failed. Please click try again and follow the steps to connect in your wallet.",
  variant: "warning",
};

NoDataSuccess.args = {
  title: "Thank you!",
  description: "Authorization was successful!",
  variant: "success",
};
