import { DetailsBox, type DetailsBoxProps } from "./DetailsBox";

export default {
  title: "atoms/DetailsBox",
  component: DetailsBox,
};

export function Type(args: DetailsBoxProps) {
  return <DetailsBox {...args} />;
}

export function Wallet(args: DetailsBoxProps) {
  return <DetailsBox {...args} />;
}

export function Send(args: DetailsBoxProps) {
  return <DetailsBox {...args} />;
}

Type.args = {
  title: "Type",
  text: "My Wallet",
};

Wallet.args = {
  title: "To",
  text: "0x698...1933",
  isAddress: true,
};

Send.args = {
  title: "67,059.95",
  tokenPath: "/public/assets/icons/tokens/usdc.svg",
  text: "$67,059.95",
};
