
import { component$ } from "@builder.io/qwik";
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

export interface DetailsBoxProps {
  customClass: string;
}

const DetailsBoxStyles = cva(
  ["flex justify-between items-center"],
  {
    variants: {
      variant: {
        
      },
    },
    defaultVariants: {
      
    },
  },
);

export type DetailsBoxType = VariantProps<typeof DetailsBoxStyles> & DetailsBoxProps;

const DetailsBox = component$(({...props }: DetailsBoxType) => {
  return (
    <>
      <div
        {...props}
        class={twMerge(DetailsBoxStyles({ }), props.customClass)}
      >
        
      </div>
    </>
  );
});

export default DetailsBox;
