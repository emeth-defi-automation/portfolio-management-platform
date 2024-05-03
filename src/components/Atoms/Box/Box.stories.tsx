import Box, { type BoxProps } from "./Box";

export default {
  title: "atoms/Box",
  component: Box,
};

export function BoxComponent(args: BoxProps) {
  return <Box {...args} />;
}

export function BoxNavbar(args: BoxProps) {
  return <Box {...args} />;
}

BoxComponent.args = {
  variant: "box",
};

BoxNavbar.args = {
  variant: "navbar",
};
