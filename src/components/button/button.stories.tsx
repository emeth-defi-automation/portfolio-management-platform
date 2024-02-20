import type { Meta, StoryObj } from "storybook-framework-qwik";
import { Button, type ButtonProps } from "./button";

const meta: Meta<ButtonProps> = {
  component: Button,
};

type Story = StoryObj<ButtonProps>;

export default meta;

export const Primary: Story = {
  render: (props) => <Button {...props}>Some button</Button>,
};

export const Highlighted: Story = {
  args: {
    isHighlighted: true,
  },
  render: (props) => <Button {...props}>Some button</Button>,
};
