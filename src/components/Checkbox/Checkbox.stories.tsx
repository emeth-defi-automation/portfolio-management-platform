import type { Meta, StoryObj } from "storybook-framework-qwik";
import { CheckBox, type CheckBoxProps } from "~/components/Checkbox/Checkbox";
import { $ } from "@builder.io/qwik";

const meta: Meta<CheckBoxProps> = {
  component: CheckBox,
};

type Story = StoryObj<CheckBoxProps>;

export default meta;

export const checkbox: Story = {
  render: () => (
    <CheckBox onClick={$(() => {})} name="name" value="1" checked={false} />
  ),
};
