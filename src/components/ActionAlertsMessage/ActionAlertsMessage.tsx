import { Slot, component$ } from "@builder.io/qwik";
import Header from "../Atoms/Headers/Header";
import Paragraphs from "../Atoms/Paragraphs/Paragraphs";

export interface ActionAlertMessageProps {
  title?: string;
  description?: string;
}

export const ActionAlertMessage = component$<ActionAlertMessageProps>(
  (props) => {
    return (
      <>
        <div class="custom-border-b-1-opacity-5 flex items-center justify-between gap-2 py-5 last:border-b-0 last:pb-0">
          <div class="">
            <Header variant={"h5"} text={props.title} class="font-normal" />
            <Paragraphs
              text={props.description}
              variant={"secondaryText"}
              size={"xs"}
            />
          </div>
          <Slot />
        </div>
      </>
    );
  },
);
