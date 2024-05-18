import type { Meta } from "storybook-framework-qwik";
import Input, { type InputProps } from "./Input";
import IconSearch from "@material-design-icons/svg/filled/search.svg?jsx";
import IconChecked from "@material-design-icons/svg/outlined/check_circle_outline.svg?jsx";

const meta: Meta<InputProps> = {
  component: Input,
};

export default meta;

export function PopUp(args: InputProps) {
  return <Input {...args} />;
}

export function PortfolioSearch(args: InputProps) {
  return <Input {...args} />;
}

export function TransferChecked(args: InputProps) {
  return <Input {...args} />;
}

export function TransferCoin(args: InputProps) {
  return <Input {...args} />;
}

PopUp.args = {
  placeholder: "Type or paste deposit address here",
  size: "large",
};
PortfolioSearch.args = {
  placeholder: "Search for name",
  variant: "search",
  size: "small",
  iconLeft: <IconSearch/>
};

TransferChecked.args = {
  placeholder: "Approval limit...",
  variant: "checked",
  size: "medium",
  iconRight: <IconChecked class="h-4 w-4"/>
};

TransferCoin.args = {
  placeholder: "1.00",
  // variant: "withText",
  size: "xs",
  subValue: "480 BTC",
};
