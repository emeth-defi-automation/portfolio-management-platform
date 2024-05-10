import SelectField, { type SelectFieldProps } from "./SelectField";

export default {
  title: "molecules/SelectField",
  component: SelectField,
};

export function Default(args: SelectFieldProps) {
  return <SelectField {...args} />;
}

Default.args = {
  name: "Type",
  options: [
    { value: "", text: "Choose Network" },
    { value: "Ethereum", text: "Ethereum" },
  ],
  size: "large",
  variant: "largeArrow",
};
