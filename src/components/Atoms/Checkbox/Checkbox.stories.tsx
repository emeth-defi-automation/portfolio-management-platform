import Checkbox, { type CheckboxProps } from "./Checkbox";

export default { title: "atoms/checkbox", component: Checkbox };

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
  checked: false
};

CheckBoxSmall.args = {
  variant: "checkTick",
  size: "small",
  checked: false
};

ToggleTick.args = {
  variant: "toggleTick",
  checked: true,
};
