import { Button, type ButtonProps } from "./Button";
import IconAdd from "/public/assets/icons/portfolio/add.svg?jsx";

export default {
  title: "atoms/Button",
  component: Button,
};

export function BlueIcon(args: ButtonProps) {
  return <Button {...args} />;
}

export function Red(args: ButtonProps) {
  return <Button {...args} />;
}

export function Transparent(args: ButtonProps) {
  return <Button {...args} />;
}

export function Icon(args: ButtonProps) {
  return <Button {...args} />;
}

BlueIcon.args = {
  text: "Add Sub Portfolio",
  variant: "blue",
  leftIcon: <IconAdd class="h-4 w-4" />,
  class: "",
  size: "small",
};

Red.args = {
  text: "Yes, let’s do it!",
  variant: "red",
  class: "",
};

Transparent.args = {
  text: "Cancel",
  variant: "gradient",
  class: "",
  size: "small",
};

Icon.args = {
  leftIcon: <IconAdd class="h-4 w-4" />,
  variant: "onlyIcon",
};
