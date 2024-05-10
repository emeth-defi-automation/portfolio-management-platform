import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";
import Label from "~/components/Atoms/Label/Label";
import Input from "~/components/Atoms/Input/Input";

export interface InputFieldProps {
  class?: string;
  name: string;
  onValueChange?: any;
  placeholder?: string;
  variant: "search" | "checked" | null;
  size: "xs" | "small" | "medium" | "large" | null;
}

const InputFieldStyles = cva(["flex flex-col gap-2"]);

export type InputFieldType = VariantProps<typeof InputFieldStyles> &
  InputFieldProps;

const InputField = ({ ...props }: InputFieldType) => {
  return (
    <div {...props} class={twMerge(InputFieldStyles(), props.class)}>
      <Label name={props.name} />
      <Input
        variant={props.variant}
        size={props.size}
        placeholder={props.placeholder}
      />
    </div>
  );
};

export default InputField;
