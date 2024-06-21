import Checkbox from "../Atoms/Checkbox/Checkbox";
import { FormBadge2, type FormBadge2Props } from "./FormBadge2";

export default {
  component: FormBadge2,
};

export function SelectToken(args: FormBadge2Props) {
  return (
    <FormBadge2 {...args}>
      <Checkbox isChecked={true} />
    </FormBadge2>
  );
}

export function ApprovalLimit(args: FormBadge2Props) {
  return <FormBadge2 {...args}></FormBadge2>;
}

SelectToken.args = {
  tokenName: "Bitcoin",
  tokenSymbol: "BTC",
  tokenPath: "/assets/icons/tokens/btc.svg",
};

ApprovalLimit.args = {
  tokenName: "Bitcoin",
  tokenSymbol: "BTC",
  tokenPath: "/assets/icons/tokens/btc.svg",
};
