import BoxHeader, { type BoxHeaderProps } from "./BoxHeader";
import IconClose from "/public/assets/icons/close.svg?jsx";

export default {
  title: "molecules/BoxHeader",
  component: BoxHeader,
};

export function Alert(args: BoxHeaderProps) {
  return <BoxHeader {...args} />;
}

export function Modal(args: BoxHeaderProps) {
  return <BoxHeader {...args} />;
}

Alert.args = {
  variantHeader: "h3",
  title: "Alerts",
  variantButton: "transparent",
  size: "small",
  text: "See all",
  buttonClass: "h-8 font-medium",
};

Modal.args = {
  variantHeader: "h3",
  title: "Add Wallet",
  variantButton: "onlyIcon",
  leftIcon: <IconClose class="h-4 w-4" />,
};
