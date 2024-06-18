import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";
import Label from "~/components/Atoms/Label/Label";
import Select, { type Option } from "~/components/Atoms/Select/Select";

export interface SelectFieldProps {
  class?: string;
  name: string;
  options?: Option[];
  onValueChange?: any;
  size: "small" | "large" | null;
  labelClass?: string;
  disabled?: boolean;
  id: string;
}

const SelectFieldStyles = cva(["flex flex-col gap-2"]);

export type SelectFieldType = VariantProps<typeof SelectFieldStyles> &
  SelectFieldProps;

const SelectField = ({ ...props }: SelectFieldType) => {
  return (
    <div class={twMerge(SelectFieldStyles(), props.class)}>
      <Label name={props.name} for={props.id} class={props.labelClass} />
      <Select
        id={props.id}
        name={props.name}
        options={props.options}
        size={props.size}
        disabled={props.disabled ? props.disabled : false}
        onValueChange={props.onValueChange}
      />
    </div>
  );
};

export default SelectField;
