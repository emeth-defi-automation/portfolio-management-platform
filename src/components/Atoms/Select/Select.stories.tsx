import type { Meta } from "storybook-framework-qwik";
import Select, { type SelectProps } from "./Select";

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
  ],
  size: "large",
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
};
