import { twMerge } from "tailwind-merge";
import { component$ } from "@builder.io/qwik";
import { cva, type VariantProps } from "class-variance-authority";
import Paragraph from "~/components/Atoms/Paragraphs/Paragraphs";
import { Slot } from "@builder.io/qwik";
import TokenIcon from "~/components/Atoms/TokenIcon/TokenIcon";
import Annotation from "~/components/Atoms/Annotation/Annotation";

export interface ParagraphAnnotationProps {
  isToken?: boolean;
  hasTokenIcon?: boolean;
  tokenIconBoxSize?: "small" | "large";
  tokenIconBorder?: "gradient" | "default" | "clear";
  tokenIconBackground?: "transparent" | "white";
  tokenIconPath?: string;
  customClass?: string;
  tokenIconCustomClass?: string;

  paragraphText?: string;
  annotationText?: string;
}

const ParagraphAnnotationStyles = cva(["flex"], {
  variants: {
    variant: {
      annotationNear: "gap-2 items-center",
      annotationBelow: "flex-col gap-1.5",
    },
  },
  defaultVariants: {
    variant: "annotationBelow",
  },
});

export type ParagraphAnnotationType = VariantProps<
  typeof ParagraphAnnotationStyles
> &
  ParagraphAnnotationProps;

const ParagraphAnnotation = component$<ParagraphAnnotationType>(
  ({
    hasTokenIcon,
    customClass,
    variant,
    ...props
  }: ParagraphAnnotationType) => {
    return (
      <>
        <div class="flex items-center justify-between gap-4">
          <div class="flex items-center justify-between gap-4">
            {hasTokenIcon ? (
              <TokenIcon
                imagePath={props.tokenIconPath}
                tokenName={props.paragraphText}
                boxSize={props.tokenIconBoxSize}
                customClass={props.tokenIconCustomClass}
                border={props.tokenIconBorder}
                background={props.tokenIconBackground}
              ></TokenIcon>
            ) : null}
            <div
              class={twMerge(
                ParagraphAnnotationStyles({ variant }),
                customClass,
              )}
            >
              <Paragraph text={props.paragraphText} size="sm" />
              <Annotation text={props.annotationText} />
            </div>
          </div>
          <Slot />
        </div>
      </>
    );
  },
);

export default ParagraphAnnotation;
