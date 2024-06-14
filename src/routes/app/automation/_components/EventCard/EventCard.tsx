import { component$ } from "@builder.io/qwik";
import Box from "~/components/Atoms/Box/Box";
import Button from "~/components/Atoms/Buttons/Button";
import ParagraphAnnotation from "~/components/Molecules/ParagraphAnnotation/ParagraphAnnotation";
import IconEdit from "@material-design-icons/svg/outlined/edit.svg?jsx";
import IconSwap from "@material-design-icons/svg/round/swap_horiz.svg?jsx";
import IconSend from "@material-design-icons/svg/filled/send.svg?jsx";
import IconAlarm from "@material-design-icons/svg/round/alarm.svg?jsx";

export interface EventCardProps {
  variant: "swap" | "transfer" | "trigger" | null;
}

export const EventCard = component$<EventCardProps>((props) => {
  return (
    // TODO: when Card is active ("choosen") add this classes to box - "!border-0 gradient-border before:rounded-lg"
    <Box customClass="p-4 rounded-lg">
      <ParagraphAnnotation
        hasIconBox={true}
        iconBoxCustomIcon={
          props.variant == "swap" ? (
            <IconSwap class="h-full w-full fill-white" />
          ) : props.variant == "transfer" ? (
            <IconSend class="h-full w-full fill-white" />
          ) : props.variant == "trigger" ? (
            <IconAlarm class="h-full w-full fill-white" />
          ) : null
        }
        iconBoxBackground="white3"
        // iconBoxBorder="gradient" TODO: when Card is active ("choosen") border is gradient
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
