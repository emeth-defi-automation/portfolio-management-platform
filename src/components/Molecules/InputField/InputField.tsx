import { twMerge } from "tailwind-merge";
import Label from "~/components/Atoms/Label/Label";
import Input from "~/components/Atoms/Input/Input";
import { type JSXOutput, type QRL, type Signal } from "@builder.io/qwik";

export interface InputFieldProps {
  class?: string;
  name: string;
  placeholder?: string;
  variant: "search" | "checked" | "swap" | null;
  size: "xs" | "small" | "medium" | "large" | null;
  labelClass?: string;
  disabled?: boolean;
  value?: string | number;
  onInput?: QRL<(value: any) => void>;
  iconLeft?: JSXOutput | null;
  iconRight?: JSXOutput | null;
  type?: string;
  isInvalid?: boolean;
  id: string;
  ref?: Signal<Element | undefined>;
}

const InputField = ({ ...props }: InputFieldProps) => {
  return (
    <div class={twMerge("mb-4 flex flex-col gap-2", props.class)}>
      <Label name={props.name} for={props.id} class={props.labelClass} />
      <Input
        ref={props.ref}
        id={props.id}
        variant={props.variant}
        size={props.size}
        placeholder={props.placeholder}
        disabled={props.disabled}
        type={props.type ? props.type : "text"}
        name={props.name}
        value={props.value}
        onInput={props.onInput}
        inputClass={
          props.isInvalid ? "!border-red-700 border border-solid" : ""
        }
      />
    </div>
  );
};

export default InputField;
