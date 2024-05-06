import Header, { type HeaderProps } from "./Header";

export default {
  title: "atoms/Header",
  component: Header,
};

export function Header1Medium(args: HeaderProps) {
  return <Header {...args} />;
}
export function Header2SemiBold(args: HeaderProps) {
  return <Header {...args} />;
}
export function Header3SemiBold(args: HeaderProps) {
  return <Header {...args} />;
}
export function Header4SemiBold(args: HeaderProps) {
  return <Header {...args} />;
}
export function Header5Medium(args: HeaderProps) {
  return <Header {...args} />;
}
export function Header5(args: HeaderProps) {
  return <Header {...args} />;
}

Header1Medium.args = {
  text: "Login to Emeth",
  variant: "h1",
  weight: "medium",
};

Header2SemiBold.args = {
  text: "Portfolio Name",
  variant: "h2",
  weight: "semiBold",
};

Header3SemiBold.args = {
  text: "Portfolio Value",
  variant: "h3",
  weight: "semiBold",
};

Header4SemiBold.args = {
  text: "Subportfolios",
  variant: "h4",
  weight: "semiBold",
};

Header5Medium.args = {
  text: "Treasury WBTC",
  variant: "h5",
  weight: "medium",
};

Header5.args = {
  text: "Investment",
  variant: "h5",
  weight: "normal",
};
