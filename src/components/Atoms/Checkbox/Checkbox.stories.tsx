import Checkbox, { type CheckboxProps } from "./Checkbox";

export default { title: "atoms/Checkbox", component: Checkbox };

export function CheckBoxLarge(args: CheckboxProps) {
  return <Checkbox {...args} />;
}

export function CheckBoxSmall(args: CheckboxProps) {
  return <Checkbox {...args} />;
}

export function ToggleTick(args: CheckboxProps) {
  return <Checkbox {...args} />;
}

CheckBoxLarge.args = {
  variant: "checkTick",
  size: "large",
  isChecked: false,
};

CheckBoxSmall.args = {
  variant: "checkTick",
  size: "small",
  isChecked: false,
};

ToggleTick.args = {
  variant: "toggleTick",
  isChecked: true,
};
