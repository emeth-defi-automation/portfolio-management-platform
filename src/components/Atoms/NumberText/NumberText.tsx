import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

export interface NumberTextProps {
  text?: string;
  class?: string;
}

const NumberTextStyles = cva(["font-['Sora'] text-xs"], {
  variants: {
    color: {
      high: ["text-customGreen"],
      low: ["text-customRed"],
      normal: ["white"],
    },
  },
  defaultVariants: {
    color: "normal",
  },
});

export type NumberTextType = VariantProps<typeof NumberTextStyles> &
  NumberTextProps;

const NumberText = ({ color, ...props }: NumberTextType) => {
  return (
    <span {...props} class={twMerge(NumberTextStyles({ color }), props.class)}>
      {props.text}
    </span>
  );
};

export default NumberText;
