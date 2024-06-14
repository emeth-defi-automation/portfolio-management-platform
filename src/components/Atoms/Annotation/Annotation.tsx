import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

export interface AnnotationProps {
  text?: string;
  class?: string;
}

const AnnotationStyles = cva(["font-['Sora'] text-xs"], {
  variants: {
    transform: {
      upper: ["uppercase"],
      normal: ["normal-case"],
    },
    variant: {
      default: ["custom-text-50"],
      white: ["text-white"],
    },
  },
  defaultVariants: {
    transform: "normal",
    variant: "default",
  },
});

export type AnnotationType = VariantProps<typeof AnnotationStyles> &
  AnnotationProps;

const Annotation = ({ transform, variant, ...props }: AnnotationType) => {
  return (
    <span
      {...props}
      class={twMerge(AnnotationStyles({ transform, variant }), props.class)}
    >
      {props.text}
    </span>
  );
};

export default Annotation;
