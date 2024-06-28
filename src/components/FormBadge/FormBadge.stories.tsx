import Checkbox from "../Atoms/Checkbox/Checkbox";
import { FormBadge, type FormBadgeProps } from "./FormBadge";

export default {
  component: FormBadge,
};

export function SelectToken(args: FormBadgeProps) {
  return (
    <FormBadge {...args}>
      <Checkbox isChecked={true} />
    </FormBadge>
  );
}

SelectToken.args = {
  tokenName: "Bitcoin",
  tokenSymbol: "BTC",
  tokenPath: "/assets/icons/tokens/btc.svg",
};
