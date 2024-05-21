import Tag, { type TagProps } from "./Tag";
import IconSuccess from "@material-design-icons/svg/round/check_circle_outline.svg?jsx";
import IconWarning from "@material-design-icons/svg/filled/warning_amber.svg?jsx";
import IconError from "@material-design-icons/svg/filled/error_outline.svg?jsx";
import IconPending from "@material-design-icons/svg/outlined/pending.svg?jsx";
import IconEthereum from "/public/assets/icons/ethereum.svg?jsx";
import IconLoading from "@material-design-icons/svg/round/sync.svg?jsx";

export default {
  title: "atoms/Tag",
  component: Tag,
};

export function Default(args: TagProps) {
  return <Tag {...args} />;
}

export function Executable(args: TagProps) {
  return <Tag {...args} />;
}

export function Grey(args: TagProps) {
  return <Tag {...args} />;
}

export function Blue(args: TagProps) {
  return <Tag {...args} />;
}

export function Error(args: TagProps) {
  return <Tag {...args} />;
}

export function Warning(args: TagProps) {
  return <Tag {...args} />;
}

export function Success(args: TagProps) {
  return <Tag {...args} />;
}

export function WalletConnected(args: TagProps) {
  return <Tag {...args} />;
}

export function WalletNotConnected(args: TagProps) {
  return <Tag {...args} />;
}

Default.args = {
  isBorder: false,
  text: "Ethereum",
  variant: "default",
  class: "",
  icon: <IconEthereum class="h-5 w-5" />,
  size: "small",
};

Executable.args = {
  isBorder: false,
  text: "Executable",
  variant: "gradient",
  class: "font-normal",
  size: "small",
};

Grey.args = {
  isBorder: false,
  text: "Pending",
  variant: "greyText",
  class: "",
  icon: <IconPending class="h-4 w-4 fill-customGrey" />,
  size: "small",
};

Blue.args = {
  isBorder: false,
  text: "In Progress",
  variant: "blueText",
  class: "",
  icon: <IconLoading class="h-4 w-4 fill-customBlue" />,
  size: "small",
};

Error.args = {
  isBorder: false,
  text: "Error",
  variant: "error",
  class: "",
  icon: <IconError class="h-4 w-4 fill-customRed" />,
  size: "small",
};

Warning.args = {
  isBorder: false,
  text: "Warning",
  variant: "warning",
  class: "",
  icon: <IconWarning class="h-3.5 w-3.5 fill-customWarning" />,
  size: "small",
};

Success.args = {
  isBorder: false,
  text: "Success",
  variant: "success",
  class: "",
  icon: <IconSuccess class="h-3.5 w-3.5 fill-customGreen" />,
  size: "small",
};

WalletConnected.args = {
  isBorder: false,
  text: "Success",
  variant: "success",
  class: "flex-row-reverse",
  icon: <IconSuccess class="h-4 w-4 fill-customGreen" />,
  size: "large",
};

WalletNotConnected.args = {
  isBorder: false,
  text: "Wallet Not Connected",
  variant: "warning",
  class: "",
  icon: <IconWarning class="h-5 w-4.5 fill-customWarning" />,
  size: "large",
};
