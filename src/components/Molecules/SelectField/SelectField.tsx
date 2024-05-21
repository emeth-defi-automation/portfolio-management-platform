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
}

const SelectFieldStyles = cva(["flex flex-col gap-2"]);

export type SelectFieldType = VariantProps<typeof SelectFieldStyles> &
  SelectFieldProps;

const SelectField = ({ ...props }: SelectFieldType) => {
  return (
    <div {...props} class={twMerge(SelectFieldStyles(), props.class)}>
      <Label name={props.name} />
      <Select name={props.name} options={props.options} size={props.size} />
    </div>
  );
};

export default SelectField;
