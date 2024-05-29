import { twMerge } from "tailwind-merge";
import Label from "~/components/Atoms/Label/Label";
import Input from "~/components/Atoms/Input/Input";
import { type JSXOutput, type QRL } from "@builder.io/qwik";

export interface InputFieldProps {
  class?: string;
  name: string;
  onValueChange?: any;
  placeholder?: string;
  variant: "search" | "checked" | "swap" | null;
  size: "xs" | "small" | "medium" | "large" | null;
  disabled?: boolean;
  value?: string;
  onInput?: QRL<(value: any) => void>;
  subValue?: string;
  iconLeft?: JSXOutput | null;
  iconRight?: JSXOutput | null;
  type?: string;
  isInvalid?: boolean;
  id: string;
}

const InputField = ({ ...props }: InputFieldProps) => {
  return (
    <div class={twMerge("mb-4 flex flex-col gap-2", props.class)}>
      <Label name={props.name} for={props.id} />
      <Input
        id={props.id}
        variant={props.variant}
        size={props.size}
        placeholder={props.placeholder}
        disabled={props.disabled}
        type={props.type ? props.type : "text"}
        name={props.name}
        value={props.value}
        onInput={props.onInput}
        InputClass={props.isInvalid ? "!border-red-700 border border-solid": ""}
      />
    </div>
  );
};

export default InputField;
