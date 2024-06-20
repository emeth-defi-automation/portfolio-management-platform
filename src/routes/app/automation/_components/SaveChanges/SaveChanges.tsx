import { component$ } from "@builder.io/qwik";
import Button from "~/components/Atoms/Buttons/Button";
import IconError from "@material-design-icons/svg/filled/error_outline.svg?jsx";
import Paragraph from "~/components/Atoms/Paragraphs/Paragraphs";

export const SaveChanges = component$(() => {
  return (
    <div class="relative bottom-0 flex h-20 w-full items-center justify-between border-t border-white/10 bg-white/3 p-6">
      <div class="flex items-center gap-2">
        <IconError class="h-7 w-7 fill-white" />
        <Paragraph
          size="xs"
          class="max-w-[290px] text-wrap !leading-normal"
          text="Remember, saving changes sends a transaction to the blockchain and incurs a gas fee."
        />
      </div>
      <Button size="small" text="Save Changes" customClass="font-normal" />
    </div>
  );
});
