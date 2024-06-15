import { component$ } from "@builder.io/qwik";
import Box from "~/components/Atoms/Box/Box";
import Button from "~/components/Atoms/Buttons/Button";
import ParagraphAnnotation from "~/components/Molecules/ParagraphAnnotation/ParagraphAnnotation";
import IconEdit from "@material-design-icons/svg/outlined/edit.svg?jsx";
import IconSwap from "@material-design-icons/svg/round/swap_horiz.svg?jsx";
import IconSend from "@material-design-icons/svg/filled/send.svg?jsx";
import IconAlarm from "@material-design-icons/svg/round/alarm.svg?jsx";

export interface  AutomationCardProps {
  variant: "swap" | "transfer" | "trigger" | null;
  isActive: boolean;
}

export const  AutomationCard = component$< AutomationCardProps>((props) => {
  return (
    <Box customClass={`!shadow-none p-4 rounded-md ${props.isActive ? "!border-0 gradient-border before:rounded-lg overflow-hidden before:top-[0px] before:left-[0px] before:w-[calc(100%+1px)] before:h-[calc(100%+1px)]" : ""}`}>
      <ParagraphAnnotation
        hasIconBox={true}
        iconBoxCustomIcon={
          props.variant == "swap" ? (
            <IconSwap class="w-full h-full fill-white" />
          ) : props.variant == "transfer" ? (
            <IconSend class="w-full h-full fill-white" />
          ) : props.variant == "trigger" ? (
            <IconAlarm class="w-full h-full fill-white" />
          ) : null
        }
        iconBoxBackground="white3"
        iconBoxBorder={props.isActive ? "gradient" : "default"}
        paragraphText="Swap #1"
        annotationText="Swap Description"
      >
        <Button
          leftIcon={<IconEdit class="h-3 w-3 fill-white" />}
          customClass="bg-white/10 h-8 w-8 p-0"
        />
      </ParagraphAnnotation>
    </Box>
  );
});
