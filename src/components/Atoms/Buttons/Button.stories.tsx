import Button, { type ButtonProps } from "./Button";
import IconAdd from "@material-design-icons/svg/outlined/add.svg?jsx";
import IconWalletConnect from "/public/assets/icons/login/walletconnect.svg?jsx";
import IconTrashRed from "@material-design-icons/svg/outlined/delete.svg?jsx";
import IconMaximize from "@material-design-icons/svg/outlined/open_in_full.svg?jsx";
import IconInfo from "@material-design-icons/svg/outlined/info.svg?jsx";
import IconArrowForward from "@material-design-icons/svg/outlined/arrow_forward.svg?jsx";

export default {
  title: "atoms/Button",
  component: Button,
};

export function ConnectButton(args: ButtonProps) {
  return <Button {...args} />;
}

export function InfoButton(args: ButtonProps) {
  return <Button {...args} />;
}

export function Gradient(args: ButtonProps) {
  return <Button {...args} />;
}

export function Transparent(args: ButtonProps) {
  return <Button {...args} />;
}

export function BlueIcon(args: ButtonProps) {
  return <Button {...args} />;
}

export function Danger(args: ButtonProps) {
  return <Button {...args} />;
}

export function Red(args: ButtonProps) {
  return <Button {...args} />;
}

export function IconBox(args: ButtonProps) {
  return <Button {...args} />;
}

export function OnlyIcon(args: ButtonProps) {
  return <Button {...args} />;
}

ConnectButton.args = {
  disabled: false,
  text: "Use Wallet Connect",
  variant: "transparent",
  leftIcon: <IconWalletConnect class="h-6 w-6" />,
  rightIcon: <IconArrowForward class="h-4 w-4" />,
  class: "px-4 w-72",
  size: "large",
};

InfoButton.args = {
  disabled: false,
  text: "How to use Wallet?",
  leftIcon: <IconInfo class="h-6 w-6 " />,
  rightIcon: <IconArrowForward class="h-4 w-4" />,
  variant: "blue",
  class: "font-normal h-10",
  size: "small",
};

Gradient.args = {
  disabled: false,
  text: "Accept and Sign",
  variant: "gradient",
  class: "",
};

Transparent.args = {
  disabled: false,
  text: "Cancel",
  variant: "transparent",
  class: "",
};

BlueIcon.args = {
  disabled: false,
  text: "Add Sub Portfolio",
  leftIcon: <IconAdd class="h-4 w-4" />,
  variant: "blue",
  class: "",
  size: "small",
};

Red.args = {
  disabled: false,
  text: "Yes, Let's Do It!",
  variant: "red",
  class: "px-20",
};

Danger.args = {
  disabled: false,
  text: "Delete Wallet",
  leftIcon: <IconTrashRed class="h-4 w-4" />,
  variant: "danger",
  class: "",
  size: "small",
};

IconBox.args = {
  leftIcon: <IconMaximize class="h-4 w-4" />,
  variant: "iconBox",
  size: "small",
};

OnlyIcon.args = {
  leftIcon: <IconAdd class="h-4 w-4" />,
  variant: "onlyIcon",
};
