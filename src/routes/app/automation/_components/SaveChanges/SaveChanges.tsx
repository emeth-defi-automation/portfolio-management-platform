import { component$ } from "@builder.io/qwik";
import Button from "~/components/Atoms/Buttons/Button";
import IconInfo from "@material-design-icons/svg/outlined/info.svg?jsx";
import Paragraph from "~/components/Atoms/Paragraphs/Paragraphs";

export const SaveChanges = component$(
  () => {
    return (
      <div class="absolute bottom-0 flex items-center justify-between gap-[280px] h-20 p-6 border-t border-white/10 bg-white/3">
        <div class="flex items-center gap-2">
          <IconInfo class="fill-white w-5 h-5"/>
          <Paragraph text="Remember, saving changes sends a transaction
to the blockchain and incurs a gas fee." class="max-w-[240px] text-wrap text-[10px] !leading-normal"/>
        </div>
        <Button
          size="small"
          text="Save Changes"
          customClass="font-normal"
        />
      </div>
    );
  },
);
