import TokenIcon, { type TokenIconProps } from "./TokenIcon";

export default {
  title: "atoms/TokenIcon",
  component: TokenIcon,
};

export function Token(args: TokenIconProps) {
  return <TokenIcon {...args} />;
}

Token.args = {
  tokenName: "Bitcoin",
  imagePath: "/public/assets/icons/tokens/btc.svg",
  border: "default",
  background: "white"
};
