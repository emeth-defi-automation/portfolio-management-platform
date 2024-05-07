import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

export interface SpanTextProps {
  text?: string;
  class?: string;
}

const SpanTextStyles = cva(["font-['Sora'] custom-text-50 text-xs"], {
  variants: {
    transform: {
      upper: ["uppercase"],
      normal: ["normal-case"],
    },
  },
  defaultVariants: {
    transform: "normal",
  },
});

export type SpanTextType = VariantProps<typeof SpanTextStyles> & SpanTextProps;

const SpanText = ({ transform, ...props }: SpanTextType) => {
  return (
    <span
      {...props}
      class={twMerge(SpanTextStyles({ transform }), props.class)}
    >
      {props.text}
    </span>
  );
};

export default SpanText;
