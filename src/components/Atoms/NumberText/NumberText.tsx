import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

export interface NumberTextProps {
  text?: string;
  class?: string;
}

const NumberTextStyles = cva(["font-['Sora'] text-xs"], {
  variants: {
    color: {
      green: ["text-customGreen"],
      red: ["text-customRed"],
      white: ["white"],
    },
  },
  defaultVariants: {
    color: "white",
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
