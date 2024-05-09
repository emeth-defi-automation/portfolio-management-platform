import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

export interface ParagraphProps {
  class?: string;
  text?: string;
}

const ParagraphStyles = cva(["font-['Sora'] !leading-none"], {
  variants: {
    variant: {
      primaryText: ["color-white"],
      secondaryText: ["custom-text-50"],
      gradientText: ["custom-text-gradient text-transparent"],
    },
    size: {
      xs: ["text-xs"],
      sm: ["text-sm"],
      base: ["text-base"],
      xl: ["text-xl"],
    },
    weight: {
      light: ["font-light"],
      regular: ["font-normal"],
      medium: ["font-medium"],
      semiBold: ["font-semibold"],
    },
  },
  defaultVariants: {
    variant: "primaryText",
    size: "sm",
    weight: "regular",
  },
});

export type ParagraphType = VariantProps<typeof ParagraphStyles> &
  ParagraphProps;

const Paragraph = ({ variant, size, weight, ...props }: ParagraphType) => {
  return (
    <p
      {...props}
      class={twMerge(ParagraphStyles({ variant, size, weight }), props.class)}
    >
      {props.text}
    </p>
  );
};

export default Paragraph;
