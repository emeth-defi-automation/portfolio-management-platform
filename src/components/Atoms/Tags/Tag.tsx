import { type JSXOutput } from "@builder.io/qwik";
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

export interface TagProps {
  text?: string;
  class?: string;
  icon?: JSXOutput | null;
  isBorder?: boolean;
}

const tagStyles = cva(
  [
    "font-['Sora'] flex items-center gap-1 text-white custom-border-1 px-2 py-1.5 rounded-lg min-w-fit text-nowrap",
  ],
  {
    variants: {
      variant: {
        default: [""],
        gradient: [""],
        greyText: ["text-customGrey"],
        blueText: ["text-customBlue"],
        success: ["text-customGreen custom-bg-opacity-5"],
        error: ["text-customRed custom-bg-opacity-5"],
        warning: ["text-customWarning custom-bg-opacity-5"],
      },
      borderColor: {
        default: [""],
        gradient: [
          "!border !border-transparent gradient-border before:rounded-lg before:p-[1px]",
        ],
        success: ["!border-customGreen"],
        error: ["!border-customRed"],
        warning: ["!border-customWarning"],
        blueText: ["!border-customBlue"],
        greyText: ["border-customGrey"],
      },
      size: {
        small: ["text-xs font-medium w-fit h-7"],
        large: ["text-sm text-center py-3.5"],
      },
    },
    defaultVariants: {
      variant: "default",
      size: "small",
    },
  },
);

export type tagType = VariantProps<typeof tagStyles> & TagProps;

const Tag = ({ variant, size, borderColor, ...props }: tagType) => {
  borderColor = props.isBorder ? variant : null;
  return (
    <div
      {...props}
      class={twMerge(tagStyles({ variant, size, borderColor }), props.class)}
    >
      {props.icon ? <span class="grow-0">{props.icon}</span> : null}
      {props.text ? <span class="grow">{props.text}</span> : null}
    </div>
  );
};

export default Tag;
