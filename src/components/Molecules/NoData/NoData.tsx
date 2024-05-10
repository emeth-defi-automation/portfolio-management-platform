import { twMerge } from "tailwind-merge";
import IconInfoWhite from "/public/assets/icons/info-white.svg?jsx";
import Button from "~/components/Atoms/Buttons/Button";
import Header from "~/components/Atoms/Headers/Header";
import Paragraph from "~/components/Atoms/Paragraphs/Paragraphs";
import { cva, type VariantProps  } from "class-variance-authority";
// import { Slot } from "@builder.io/qwik";

export interface NoDataProps {
  title: string;
  description?: string;
  class?: string;
}

// TODO: different icons variants
const NoDataStyles = cva(
  [
    "",
  ],
  {
    variants: {
      variant: {
        info: [""],
        warning: [""],
        success: [""]
      },
    },
    defaultVariants: {
      variant: "info",
    },
  },
);

export type NoDataType = VariantProps<typeof NoDataStyles> & NoDataProps;

const NoData = ({ ...props }) => {
  return (
    <div {...props} class={twMerge("flex flex-col gap-4", props.class)}>
      <div class="flex flex-col items-center justify-center gap-4">
        <IconInfoWhite class="h-10 w-10" />
        <Header variant="h5" text={props.title}/>
        <Paragraph variant="secondaryText" size="xs" weight="regular" text={props.description}/>
      </div>

      <div class="flex items-center justify-center gap-2">
        <Button variant="transparent" text="Deposit Funds" class="py-2.5" />
        <Button text="Setup Wallet" class="py-2.5" />
        {/* <Slot/> */}
      </div>
    </div>
  );
};

export default NoData;
