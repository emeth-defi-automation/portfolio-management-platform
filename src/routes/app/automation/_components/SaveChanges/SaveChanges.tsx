import { component$ } from "@builder.io/qwik";
import Button from "~/components/Atoms/Buttons/Button";
import IconError from "@material-design-icons/svg/filled/error_outline.svg?jsx";
import ParagraphAnnotation from "~/components/Molecules/ParagraphAnnotation/ParagraphAnnotation";

export const SaveChanges = component$(() => {
  return (
    <ParagraphAnnotation
      hasIconBox={true}
      iconBoxBorder="clear"
      customClass="relative bottom-0 h-20 border-t border-white/10 bg-white/3 p-6"
      iconBoxCustomClass="p-0 w-7"
      iconBoxCustomIcon={<IconError class="h-7 w-7 fill-white" />}
      textBoxClass="max-w-[290px]"
      annotationVariant="white"
      annotationText="Remember, saving changes sends a transaction to the blockchain and incurs a gas fee."
    >
      <Button size="small" text="Save Changes" customClass="font-normal" />
    </ParagraphAnnotation>
  );
});
