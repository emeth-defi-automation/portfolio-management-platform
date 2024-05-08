import Label, { type LabelProps } from "./Label";

export default {
  title: "atoms/Label",
  component: Label,
};

export function Default(args: LabelProps) {
  return <Label {...args} />;
}

Default.args = {
  text: "Type",
};
