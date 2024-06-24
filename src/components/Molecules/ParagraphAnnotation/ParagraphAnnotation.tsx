import { twMerge } from "tailwind-merge";
import { component$, type JSXOutput, Slot, type QRL } from "@builder.io/qwik";
import { cva, type VariantProps } from "class-variance-authority";
import Paragraph from "~/components/Atoms/Paragraphs/Paragraphs";
import IconBox from "~/components/Atoms/IconBox/IconBox";
import Annotation from "~/components/Atoms/Annotation/Annotation";

export interface ParagraphAnnotationProps {
  hasIconBox?: boolean;
  iconBoxSize?: "small" | "large";
  iconBoxBorder?: "gradient" | "default" | "clear";
  iconBoxBackground?: "transparent" | "white10" | "white3";
  iconBoxTokenPath?: string;
  iconBoxCustomIcon?: JSXOutput | null;
  iconBoxCustomClass?: string;

  textBoxClass?: string;
  customClass?: string;
  paragraphText?: string;
  annotationText?: string;
  onClick$?:
    | QRL<() => void>
    | (() => void)
    | QRL<() => Promise<void>>
    | (() => Promise<void>);
}

const ParagraphAnnotationStyles = cva(["flex"], {
  variants: {
    variant: {
      annotationNear: "gap-2 items-center",
      annotationBelow: "flex-col gap-1.5",
    },
    annotationVariant: {
      white: "white",
      default: "default",
    },
  },
  defaultVariants: {
    variant: "annotationBelow",
    annotationVariant: "default",
  },
});

export type ParagraphAnnotationType = VariantProps<
  typeof ParagraphAnnotationStyles
> &
  ParagraphAnnotationProps;

const ParagraphAnnotation = component$<ParagraphAnnotationType>(
  ({
    hasIconBox,
    textBoxClass,
    variant,
    annotationVariant,
    ...props
  }: ParagraphAnnotationType) => {
    return (
      <>
        <div
          class={twMerge(
            "flex w-full cursor-pointer items-center justify-between gap-4",
            props.customClass,
          )}
          onClick$={props.onClick$}
        >
          <div class={twMerge("flex items-center gap-4")}>
            {hasIconBox ? (
              <IconBox
                tokenPath={props.iconBoxTokenPath}
                tokenName={props.paragraphText}
                boxSize={props.iconBoxSize}
                customClass={props.iconBoxCustomClass}
                border={props.iconBoxBorder}
                background={props.iconBoxBackground}
                customIcon={props.iconBoxCustomIcon}
              ></IconBox>
            ) : null}
            <div
              class={twMerge(
                ParagraphAnnotationStyles({ variant }),
                textBoxClass,
              )}
            >
              <Paragraph text={props.paragraphText} size="sm" />
              <Annotation
                text={props.annotationText}
                variant={annotationVariant}
              />
            </div>
          </div>
          <Slot />
        </div>
      </>
    );
  },
);

export default ParagraphAnnotation;
