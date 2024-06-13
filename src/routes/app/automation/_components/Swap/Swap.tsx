import { component$ } from "@builder.io/qwik";
import InputField from "~/components/Molecules/InputField/InputField";
import ParagraphAnnotation from "~/components/Molecules/ParagraphAnnotation/ParagraphAnnotation";
import IconError from "@material-design-icons/svg/outlined/error_outline.svg?jsx";
import Annotation from "~/components/Atoms/Annotation/Annotation";
import Button from "~/components/Atoms/Buttons/Button";

export const Swap = component$(() => {
  return (
    <div class="flex flex-col justify-center gap-6">
      <div class="custom-border-1 flex gap-1 rounded-lg p-1">
        <button class="custom-bg-button h-6 w-1/2 rounded-md text-center text-xs">
          Swap
        </button>
        <button class="h-6 w-1/2 rounded-md text-center text-xs">
          Transfer
        </button>
      </div>
      <InputField
        name="Action name"
        size="medium"
        placeholder="Swap #1"
        class=""
      />
      <InputField
        name="Action description"
        size="medium"
        placeholder="Swap Description"
      />
      <hr class="h-[1px] border-0 bg-white/10" />
      <div class="flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <Annotation text="You Swap" />
          <Button
            text="Choose tokens"
            variant="transparent"
            size="small"
            customClass="font-normal bg-white/10 !border-0"
          />
        </div>
        <ParagraphAnnotation
          hasIconBox={true}
          iconBoxBorder="clear"
          iconBoxSize="large"
          iconBoxCustomClass="p-0 w-8 h-8"
          iconBoxCustomIcon={<IconError class="h-8 w-8 fill-white" />}
          customClass="gap-2 custom-border-1 p-4 rounded-lg w-full"
          paragraphText="You didn’t choose tokens yet"
          annotationText="Please select the tokens you wish to exchange."
        />
      </div>
    </div>
  );
});
