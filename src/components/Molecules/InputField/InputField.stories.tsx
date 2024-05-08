import InputField, { type InputFieldProps } from "./InputField";

export default {
  title: "molecules/InputField",
  component: InputField,
};

export function Default(args: InputFieldProps) {
  return <InputField {...args} />;
}

Default.args = {
  name: "wallet name",
  size: "large",
  placeholder: "Enter wallet name...",
};
