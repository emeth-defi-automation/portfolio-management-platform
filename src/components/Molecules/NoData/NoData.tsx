import { twMerge } from "tailwind-merge";
import Header from "~/components/Atoms/Headers/Header";
import Paragraph from "~/components/Atoms/Paragraphs/Paragraphs";
import IconInfo from "@material-design-icons/svg/outlined/info.svg?jsx";
import IconError from "@material-design-icons/svg/outlined/error_outline.svg?jsx";
import IconCelebration from "@material-design-icons/svg/outlined/celebration.svg?jsx";
import { component$ } from "@builder.io/qwik";
import { Slot } from "@builder.io/qwik";

export interface NoDataProps {
  title: string;
  description?: string;
  customClass?: string;
  variant?: "info" | "warning" | "success";
}

export type NoDataType = NoDataProps;

const NoData = component$<NoDataType>(
  ({ variant, title, description, customClass }) => {
    return (
      <div
        class={twMerge(
          "flex  h-full flex-col items-center justify-center gap-4 text-center",
          customClass,
        )}
      >
        <div class="flex flex-col items-center justify-center gap-4 ">
          <span>
            {variant == "info" ? (
              <IconInfo class="h-10 w-10 fill-white" />
            ) : variant == "warning" ? (
              <IconError class="h-16 w-16 fill-customRed" />
            ) : variant == "success" ? (
              <IconCelebration class="h-14 w-14  fill-pink-600" />
            ) : null}
          </span>
          {variant == "info" ? (
            <>
              <Header variant="h5" title={title} class="font-medium" />
              <Paragraph
                variant="secondaryText"
                size="xs"
                weight="regular"
                text={description}
                class="!leading-4"
              />
            </>
          ) : (
            <>
              <Header variant="h3" title={title} class="font-medium" />
              <Paragraph
                variant="secondaryText"
                size="sm"
                weight="regular"
                text={description}
                class="!leading-4"
              />
            </>
          )}
        </div>

        <div class="flex items-center justify-center gap-2">
          <Slot />
        </div>
      </div>
    );
  },
);

export default NoData;
