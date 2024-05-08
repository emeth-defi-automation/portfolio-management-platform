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

Header1Medium.args = {
  text: "Login to Emeth",
  variant: "h1",
  class: "font-medium",
};

Header2SemiBold.args = {
  text: "Portfolio Name",
  variant: "h2",
};

Header3SemiBold.args = {
  text: "Portfolio Value",
  variant: "h3",
};

Header4SemiBold.args = {
  text: "Subportfolios",
  variant: "h4",
};

Header5Medium.args = {
  text: "Bitcoin share exceeded 20%",
  variant: "h5",
  class: "font-medium",
};
