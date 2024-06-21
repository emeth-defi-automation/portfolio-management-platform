import { component$ } from "@builder.io/qwik";
import Box from "~/components/Atoms/Box/Box";
import Button from "~/components/Atoms/Buttons/Button";
import ParagraphAnnotation from "~/components/Molecules/ParagraphAnnotation/ParagraphAnnotation";
import IconEdit from "@material-design-icons/svg/outlined/edit.svg?jsx";
import IconSwap from "@material-design-icons/svg/round/swap_horiz.svg?jsx";
import IconSend from "@material-design-icons/svg/filled/send.svg?jsx";
import IconAlarm from "@material-design-icons/svg/round/alarm.svg?jsx";

export interface AutomationCardProps {
  variant: "swap" | "transfer" | "trigger" | null;
  isActive: boolean;
  title?: string;
  description?: string;
}

export const AutomationCard = component$<AutomationCardProps>((props) => {
  return (
    <Box
      customClass={`!shadow-cards p-4 rounded-lg flex items-center  ${props.isActive ? "!overflow-visible gradient-border before:rounded-lg" : "cursor-pointer"}`}
    >
      <ParagraphAnnotation
        hasIconBox={true}
        iconBoxCustomIcon={
          props.variant == "swap" ? (
            <IconSwap class="h-6.5 w-6.5 fill-white" />
          ) : props.variant == "transfer" ? (
            <IconSend class="h-6.5 w-6.5 fill-white" />
          ) : props.variant == "trigger" ? (
            <IconAlarm class="h-6.5 w-6.5 fill-white" />
          ) : null
        }
        iconBoxBackground="white3"
        iconBoxBorder={props.isActive ? "gradient" : "default"}
        paragraphText={props.title}
        annotationText={props.description}
      >
        <Button
          leftIcon={<IconEdit class="h-3 w-3 fill-white" />}
          customClass="bg-white/10 h-8 w-8 p-0"
        />
      </ParagraphAnnotation>
    </Box>
  );
});
