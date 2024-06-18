import Select, { type SelectProps } from "./Select";
import { $ } from "@builder.io/qwik";

export default {
  title: "atoms/Select",
  component: Select,
};

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
  onValueChange: $((target: any) => console.log(target)),
};

Modal.args = {
  options: [
    { value: "", text: "Choose Network" },
    { value: "Ethereum", text: "Ethereum" },
  ],
  size: "medium",
};

Dashboard.args = {
  options: [{ value: "", text: "All" }],
  size: "small",
  onValueChange: $((target: any) => console.log(target)),
};
