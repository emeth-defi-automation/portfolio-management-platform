import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

export interface AnnotationProps {
  text?: string;
  class?: string;
}

const AnnotationStyles = cva(["font-['Sora'] custom-text-50 text-xs"], {
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

export type AnnotationType = VariantProps<typeof AnnotationStyles> &
  AnnotationProps;

const Annotation = ({ transform, ...props }: AnnotationType) => {
  return (
    <span
      {...props}
      class={twMerge(AnnotationStyles({ transform }), props.class)}
    >
      {props.text}
    </span>
  );
};

export default Annotation;
