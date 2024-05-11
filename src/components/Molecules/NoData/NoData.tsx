import { twMerge } from "tailwind-merge";
import Button from "~/components/Atoms/Buttons/Button";
import Header from "~/components/Atoms/Headers/Header";
import Paragraph from "~/components/Atoms/Paragraphs/Paragraphs";
import IconInfo from "@material-design-icons/svg/outlined/info.svg?jsx";
import IconError from "@material-design-icons/svg/outlined/error_outline.svg?jsx";
import IconCelebration from "@material-design-icons/svg/outlined/celebration.svg?jsx";
// import { Slot } from "@builder.io/qwik";

export interface NoDataProps {
  title: string;
  description?: string;
  class?: string;
  variant?: "info" | "warning" | "success";
  size?: "small" | "large";
}

export type NoDataType = NoDataProps;

const NoData = ({ ...props }) => {
  return (
    <div {...props} class={twMerge("flex flex-col gap-4", props.class)}>
      <div class="flex flex-col items-center justify-center gap-4">
        <span>
          {props.variant == "info" ? (
            <IconInfo class="h-10 w-10 fill-white" />
          ) : props.variant == "warning" ? (
            <IconError class="h-16 w-16 fill-customRed" />
          ) : props.variant == "success" ? (
            <IconCelebration class="h-14 w-14 fill-white" />
          ) : null}
        </span>
        {props.size == "small" ? (
          <>
            <Header variant="h5" text={props.title} class="font-medium" />
            <Paragraph
              variant="secondaryText"
              size="xs"
              weight="regular"
              text={props.description}
            />
          </>
        ) : (
          <>
            <Header variant="h3" text={props.title} class="font-medium" />
            <Paragraph
              variant="secondaryText"
              size="sm"
              weight="regular"
              text={props.description}
            />
          </>
        )}
      </div>

      <div class="flex items-center justify-center gap-2">
        <Button
          variant="transparent"
          text="Deposit Funds"
          class="py-2.5 text-xs"
        />
        <Button text="Setup Wallet" class="py-2.5 text-xs" />
        {/* <Slot/> */}
      </div>
    </div>
  );
};

export default NoData;
