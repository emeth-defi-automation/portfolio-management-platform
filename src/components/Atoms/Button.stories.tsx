import Button, { type ButtonProps } from "./Button";
import IconAdd from "/public/assets/icons/portfolio/add.svg?jsx";
import IconArrowForward from "/public/assets/icons/arrow-forward.svg?jsx";
import IconWalletConnect from "/public/assets/icons/login/walletconnect.svg?jsx";
import IconInfoWhite from "/public/assets/icons/info-white.svg?jsx";
import IconTrashRed from "/public/assets/icons/wallets/delete-red.svg?jsx";
import IconMaximize from "/public/assets/icons/dashboard/maximize.svg?jsx";

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

export function iconBox(args: ButtonProps) {
  return <Button {...args} />;
}

export function onlyIcon(args: ButtonProps) {
  return <Button {...args} />;
}

ConnectButton.args = {
  text: "Use Wallet Connect",
  variant: "transparent",
  leftIcon: <IconWalletConnect class="h-6 w-6" />,
  rightIcon: <IconArrowForward class="h-4 w-4" />,
  class: "w-72 py-3",
  size: "large",
};

InfoButton.args = {
  text: "How to use Wallet?",
  leftIcon: <IconInfoWhite class="h-6 w-6" />,
  rightIcon: <IconArrowForward class="h-4 w-4" />,
  variant: "blue",
  class: "py-[10px] px-2 w-48 font-normal",
  size: "small",
};

Gradient.args = {
  text: "Accept and Sign",
  variant: "gradient",
  class: "px-10",
};

Transparent.args = {
  text: "Cancel",
  variant: "transparent",
  class: "px-20 py-4",
};

BlueIcon.args = {
  text: "Add Sub Portfolio",
  leftIcon: <IconAdd class="h-4 w-4" />,
  variant: "blue",
  class: "py-3",
  size: "small",
};

Red.args = {
  text: "Yes, Let's Do It!",
  variant: "red",
  class: "px-20",
};

Danger.args = {
  text: "Delete Wallet",
  leftIcon: <IconTrashRed class="h-4 w-4" />,
  variant: "danger",
  class: "py-2",
  size: "small",
};

iconBox.args = {
  leftIcon: <IconMaximize class="h-4 w-4" />,
  variant: "iconBox",
};

onlyIcon.args = {
  leftIcon: <IconAdd class="h-4 w-4" />,
  variant: "onlyIcon",
};
