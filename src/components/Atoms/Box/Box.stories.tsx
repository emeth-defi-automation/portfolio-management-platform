import Box, { type BoxProps } from "./Box";

export default {
  title: "atoms/Box",
  component: Box,
};

export function BoxPopUp(args: BoxProps) {
  return <Box {...args} />;
}

export function BoxComponent(args: BoxProps) {
  return <Box {...args} />;
}

export function BoxNavbar(args: BoxProps) {
  return <Box {...args} />;
}

BoxPopUp.args = {
  variant: "popUp",
};

BoxComponent.args = {
  variant: "mainWindow",
};

BoxNavbar.args = {
  variant: "navbar",
};
