import { twMerge } from "tailwind-merge";

export interface LabelProps {
  class?: string;
  name: string;
}

const Label = ({ ...props }: LabelProps) => {
  return (
    <label
      {...props}
      for={props.name}
      class={twMerge(
        "custom-text-50 block text-nowrap font-['Sora'] text-xs uppercase",
        props.class,
      )}
    >
      {props.name}
    </label>
  );
};

export default Label;
