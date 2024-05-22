import { twMerge } from "tailwind-merge";
import Label from "~/components/Atoms/Label/Label";
import Input from "~/components/Atoms/Input/Input";
import { type JSXOutput, type QRL } from "@builder.io/qwik";

export interface InputFieldProps {
  class?: string;
  name: string;
  onValueChange?: any;
  placeholder?: string;
  variant: "search" | "checked" | null;
  size: "xs" | "small" | "medium" | "large" | null;
  disabled?: boolean;
  value?: string;
  onInput?: QRL<(value: any) => void>;
  customClass?: string;
  subValue?: string;
  iconLeft?: JSXOutput | null;
  iconRight?: JSXOutput | null;
  type?: string;
  inputClass?: string;
}

const InputField = ({ ...props }: InputFieldProps) => {
  return (
    <div {...props} class={twMerge("mb-4 flex flex-col gap-2", props.class)}>
      <Label name={props.name} />
      <Input
        variant={props.variant}
        size={props.size}
        placeholder={props.placeholder}
        disabled={props.disabled}
        type={props.type ? props.type : "text"}
        name={props.name}
        value={props.value}
        onInput={props.onInput}
        customClass={props.inputClass}
      />
    </div>
  );
};

export default InputField;
