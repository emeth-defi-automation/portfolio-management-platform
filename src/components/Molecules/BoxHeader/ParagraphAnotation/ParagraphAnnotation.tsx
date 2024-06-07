import { twMerge } from "tailwind-merge";
import { component$ } from "@builder.io/qwik";
import { cva, type VariantProps } from "class-variance-authority";
import Paragraph from "~/components/Atoms/Paragraphs/Paragraphs";
import { Slot } from "@builder.io/qwik";

export interface ParagraphAnnotationProps {
  title: string;
  description?: string;
  customClass?: string;
  variant?: "info" | "warning" | "success";
}

const ParagraphAnnotationStyles = cva(
  [
    "font-['Sora'] pointer flex items-center gap-2 text-nowrap justify-center rounded-full border-2 border-transparent",
    "hover:brightness-75 disabled:bg-transparent disabled:cursor-not-allowed disabled:hover:brightness-100 disabled:border-2 disabled:border-customGrey/15 disabled:text-customGrey",
  ],
  {
    variants: {
      variant: {
        blue: ["bg-customBlue"],
        transparent: ["custom-border-2 bg-transparent"],
        red: ["bg-customRed"],
        danger: ["bg-customRed/20 text-customRed"],
        gradient: ["gradient-border disabled:before:p-0 "],
        iconBox: ["custom-border-1 custom-bg-white rounded-lg !px-2 !py-2"],
        onlyIcon: ["!p-0 gap-0 !h-fit"],
      },
      size: {
        small: ["text-xs font-semibold h-8 px-4"],
        large: ["text-sm h-12 px-8"],
      },
    },
    defaultVariants: {
      variant: "blue",
      size: "large",
    },
  },
);

export type ParagraphAnnotationType = VariantProps<
  typeof ParagraphAnnotationStyles
> &
  ParagraphAnnotationProps;

// const ParagraphAnnotation = component$<ParagraphAnnotationType>(
//   return <>
//     <div class="flex items-center justify-between gap-4">
//       <div>

//       </div>
//       <Slot/>
//     </div>
//   </>;
// );
