import Tag, { type TagProps } from "./Tag";
import IconSuccess from "/public/assets/icons/dashboard/success.svg?jsx";
import IconWarning from "/public/assets/icons/dashboard/warning.svg?jsx";
import IconError from "/public/assets/icons/error.svg?jsx";
import IconPending from "/public/assets/icons/pending.svg?jsx";
import IconEthereum from "/public/assets/icons/ethereum.svg?jsx";
import IconLoading from "/public/assets/icons/wallets/loading.svg?jsx";

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
  icon: <IconPending class="h-5 w-5" />,
  size: "small",
};

Blue.args = {
  isBorder: false,
  text: "In Progress",
  variant: "blueText",
  class: "",
  icon: <IconLoading class="h-2.5 w-2.5" />,
  size: "small",
};

Error.args = {
  isBorder: false,
  text: "Error",
  variant: "error",
  class: "",
  icon: <IconError class="h-3.5 w-3.5" />,
  size: "small",
};

Warning.args = {
  isBorder: false,
  text: "Warning",
  variant: "warning",
  class: "",
  icon: <IconWarning class="h-3.5 w-3.5" />,
  size: "small",
};

Success.args = {
  isBorder: false,
  text: "Success",
  variant: "success",
  class: "",
  icon: <IconSuccess class="h-2.5 w-2.5" />,
  size: "small",
};

WalletConnected.args = {
  isBorder: false,
  text: "Success",
  variant: "success",
  class: "",
  icon: <IconSuccess class="h-4 w-4" />,
  size: "large",
};

WalletNotConnected.args = {
  isBorder: false,
  text: "Wallet Not Connected",
  variant: "warning",
  class: "",
  icon: <IconWarning class="h-4 w-4" />,
  size: "large",
};
