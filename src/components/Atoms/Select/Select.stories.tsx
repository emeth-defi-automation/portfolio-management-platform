import type { Meta } from "storybook-framework-qwik";
import Select, { type SelectProps } from "./Select";
import { $ } from "@builder.io/qwik";

const meta: Meta<SelectProps> = {
  component: Select,
};

export default meta;

export function Portfolio(args: SelectProps) {
  return <Select {...args} />;
}

export function Modal(args: SelectProps) {
  return <Select {...args} />;
}

export function Dashboard(args: SelectProps) {
  return <Select {...args} />;
}

Portfolio.args = {
  options: [
    { value: "", text: "Choose Network" },
    { value: "Ethereum", text: "Ethereum" },
    { value: "USDC", text: "USDC" },
    { value: "USDT", text: "USDT" },
    { value: "GLM", text: "GLM" },
  ],
  size: "large",
  variant: "largeArrow",
  onValueChange: $((target: any) => console.log(target)),
};

Modal.args = {
  options: [
    { value: "", text: "Choose Network" },
    { value: "Ethereum", text: "Ethereum" },
  ],
  size: "medium",
  variant: "largeArrow",
};

Dashboard.args = {
  options: [{ value: "", text: "All" }],
  size: "small",
  variant: "smallArrow",
  onValueChange: $((target: any) => console.log(target)),
};
