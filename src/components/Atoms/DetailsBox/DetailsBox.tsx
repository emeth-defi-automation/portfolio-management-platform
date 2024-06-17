import { component$ } from "@builder.io/qwik";
import { twMerge } from "tailwind-merge";
import Annotation from "../Annotation/Annotation";
import IconOpen from "@material-design-icons/svg/filled/open_in_new.svg?jsx";
import Button from "../Buttons/Button";

export interface DetailsBoxProps {
  customClass: string;
  title?: string;
  text?: string;
  tokenPath?: string;
  isAddress?: boolean;
}

export const DetailsBox = component$<DetailsBoxProps>((props) => {
  return (
    <div
      class={twMerge(
        "flex items-center justify-between rounded-lg bg-black/10 p-4",
        props.customClass,
      )}
    >
      <div class="flex items-center gap-2">
        {props.tokenPath ? (
          <img width={16} height={16} src={props.tokenPath} />
        ) : (
          ""
        )}
        <Annotation
          text={props.title}
          variant={props.tokenPath ? "white" : "default"}
        />
      </div>
      <div class="flex items-center gap-2">
        <Annotation
          text={props.text}
          variant={props.tokenPath ? "default" : "white"}
        />
        {props.isAddress ? (
          <Button
            variant="onlyIcon"
            leftIcon={<IconOpen class="h-3 w-3 fill-white" />}
          />
        ) : (
          ""
        )}
      </div>
    </div>
  );
});
