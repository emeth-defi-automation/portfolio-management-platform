import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

export interface LabelProps {
  class?: string;
  name: string;
}

const LabelStyles = cva(["uppercase custom-text-50 text-xs font-['Sora']"]);

export type LabelType = VariantProps<typeof LabelStyles> & LabelProps;

const Label = ({ ...props }: LabelType) => {
  return (
    <label
      {...props}
      for={props.name}
      class={twMerge(LabelStyles(), props.class)}
    >
      {props.name}
    </label>
  );
};

export default Label;
