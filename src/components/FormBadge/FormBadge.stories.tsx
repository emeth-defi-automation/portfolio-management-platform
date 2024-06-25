import { $ } from "@builder.io/qwik";
import Checkbox from "../Atoms/Checkbox/Checkbox";
import Input from "../Atoms/Input/Input";
import { FormBadge, type FormBadgeProps } from "./FormBadge";
import IconSuccess from "@material-design-icons/svg/round/check_circle_outline.svg?jsx";
import { checkPattern } from "~/utils/fractions";

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

export function ApprovalLimit(args: FormBadgeProps) {
  const onInput = $((e: any) => {
    const target = e.target;
    const value = target.value;
    console.log(value);
    return value;
  });

  const isValid = $((value: string) => {
    return (
      checkPattern(value, /^\d*\.?\d*$/) && value !== "0" && value.length > 0
    );
  });

  return (
    <FormBadge {...args}>
      <Input
        id=""
        isValid={true}
        // iconRight={isValid function ? <IconSuccess class="h-4 w-4" /> : null}
      />
    </FormBadge>
  );
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
