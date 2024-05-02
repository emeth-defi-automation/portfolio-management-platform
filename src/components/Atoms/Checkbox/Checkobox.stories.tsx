import Checkbox, { type CheckboxProps } from "./Checkobox";

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
};

CheckBoxSmall.args = {
  variant: "checkTick",
  size: "small",
};

ToggleTick.args = {
  variant: "toggleTick",
  isToggle: true,
  checked: true,
};
