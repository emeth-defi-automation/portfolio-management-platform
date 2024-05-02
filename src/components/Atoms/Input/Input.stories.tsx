import type { Meta } from "storybook-framework-qwik";
import Input, { type InputProps } from "./Input";

const meta: Meta<InputProps> = {
  component: Input,
};

export default meta;

export function PopUp(args: InputProps) {
  return <Input {...args} />;
}

export function AddWallet(args: InputProps) {
  return <Input {...args} />;
}

export function PortfolioSearch(args: InputProps) {
  return <Input {...args} />;
}

export function WalletsSearch(args: InputProps) {
  return <Input {...args} />;
}

export function TransferChecked(args: InputProps) {
  return <Input {...args} />;
}

export function TransferCoin(args: InputProps) {
  return <Input {...args} />;
}

PopUp.args = {
  placeholder: "Type or paste deposit address here",
  size: "large",
};

AddWallet.args = {
  placeholder: "Enter wallet name ...",
  size: "large",
};

PortfolioSearch.args = {
  placeholder: "Search for name",
  variant: "search",
  size: "small",
};

WalletsSearch.args = {
  placeholder: "Search for wallet",
  variant: "search",
  size: "small",
};

TransferChecked.args = {
  placeholder: "Approval limit...",
  variant: "checked",
  size: "medium",
};

TransferCoin.args = {
  placeholder: "1.00",
  variant: "withText",
  size: "xs",
  subValue: "480 BTC",
};
