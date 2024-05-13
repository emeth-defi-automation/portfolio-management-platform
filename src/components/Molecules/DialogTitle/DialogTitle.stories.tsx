import DialogTitle, { type DialogTitleProps } from "./DialogTitle";
import IconClose from "/public/assets/icons/close.svg?jsx";
import Button from "~/components/Atoms/Buttons/Button";

export default {
  title: "molecules/DialogTitle",
  component: DialogTitle,
};

export function Alert(args: DialogTitleProps) {
  return (
    <DialogTitle {...args}>
      <Button
        variant="transparent"
        text="See all"
        size="small"
        class="h-8 font-medium"
      />
    </DialogTitle>
  );
}

export function Modal(args: DialogTitleProps) {
  return (
    <DialogTitle {...args}>
      <Button variant="onlyIcon" leftIcon=<IconClose class="h-4 w-4" /> />
    </DialogTitle>
  );
}

Alert.args = {
  variantHeader: "h3",
  title: "Alerts",
};

Modal.args = {
  variantHeader: "h3",
  title: "Add Wallet",
};
