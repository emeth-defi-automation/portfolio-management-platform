import IconBox, { type IconBoxProps } from "./IconBox";
import IconSchedule from "@material-design-icons/svg/round/check_circle_outline.svg?jsx";

export default {
  title: "atoms/IconBox",
  component: IconBox,
};

export function Token(args: IconBoxProps) {
  return <IconBox {...args} />;
}

export function Trigger(args: IconBoxProps) {
  return <IconBox {...args} />;
}

Token.args = {
  tokenName: "Bitcoin",
  tokenPath: "/public/assets/icons/tokens/btc.svg",
  border: "default",
  background: "white",
};

Trigger.args = {
  boxSize: "small",
  customIcon: <IconSchedule class="h-full w-full fill-white" />,
  border: "gradient",
  background: "transparent",
};
