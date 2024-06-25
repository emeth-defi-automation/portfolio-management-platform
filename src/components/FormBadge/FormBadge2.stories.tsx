import { $ } from "@builder.io/qwik";
import Checkbox from "../Atoms/Checkbox/Checkbox";
import Input from "../Atoms/Input/Input";
import { FormBadge2, type FormBadge2Props } from "./FormBadge2";
import IconSuccess from "@material-design-icons/svg/round/check_circle_outline.svg?jsx";
import { checkPattern } from "~/utils/fractions";

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
    <FormBadge2 {...args}>
      <Input
        id=""
        isValid={true}
        // iconRight={isValid function ? <IconSuccess class="h-4 w-4" /> : null}
      />
    </FormBadge2>
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
