import BoxHeader, { type BoxHeaderProps } from "./BoxHeader";
import IconClose from "@material-design-icons/svg/filled/close.svg?jsx";
import IconTrashRed from "@material-design-icons/svg/filled/delete.svg?jsx";
import Button from "~/components/Atoms/Buttons/Button";
import Annotation from "~/components/Atoms/Annotation/Annotation";
import Checkbox from "~/components/Atoms/Checkbox/Checkbox";

export default {
  title: "molecules/BoxHeader",
  component: BoxHeader,
};

export function Alert(args: BoxHeaderProps) {
  return (
    <BoxHeader {...args}>
      <Button
        variant="transparent"
        text="See all"
        size="small"
        customClass="h-8"
      />
    </BoxHeader>
  );
}

export function Modal(args: BoxHeaderProps) {
  return (
    <BoxHeader {...args}>
      <Button
        variant="onlyIcon"
        leftIcon={<IconClose customClass="h-5 w-5 fill-white" />}
      />
    </BoxHeader>
  );
}

export function Wallet(args: BoxHeaderProps) {
  return (
    <BoxHeader {...args}>
      <div class="flex gap-2">
        <Button
          variant="transparent"
          text="Edit"
          size="small"
          customClass="h-8"
        />
        <Button
          variant="transparent"
          text="Deactivate"
          size="small"
          customClass="h-8"
        />
        <Button
          variant="danger"
          text="Delete wallet"
          size="small"
          customClass="h-8"
          leftIcon={<IconTrashRed class="h-4 w-4 fill-customRed" />}
        />
      </div>
    </BoxHeader>
  );
}

export function Transfer(args: BoxHeaderProps) {
  return (
    <BoxHeader {...args}>
      <div class="relative flex items-center gap-2 ">
        <Annotation text="All" />
        <Checkbox variant="toggleTick" checked={true} />
      </div>
    </BoxHeader>
  );
}

Alert.args = {
  variantHeader: "h3",
  title: "Alert",
};

Modal.args = {
  variantHeader: "h3",
  title: "Add wallet",
};

Wallet.args = {
  variantHeader: "h3",
  title: "Treasury ETH",
};

Transfer.args = {
  variantHeader: "h4",
  title: "Subportfolios",
};
