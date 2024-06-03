import { component$ } from "@builder.io/qwik";
import Button from "~/components/Atoms/Buttons/Button";
import Checkbox from "~/components/Atoms/Checkbox/Checkbox";
import Header from "~/components/Atoms/Headers/Header";
import Paragraph from "~/components/Atoms/Paragraphs/Paragraphs";
import IconEdit from "@material-design-icons/svg/outlined/edit.svg?jsx";
import { TriggerDrawer } from "./TriggerDrawer";

interface CentralViewProps {}

export const CentralView = component$<CentralViewProps>(() => {
  return (
    <div class="p-6">
      <div class="flex items-center justify-between">
        <div class=" flex items-center gap-2">
          <Header variant="h4" text="New Automation" class="font-normal" />
          <Button
            customClass="mb-1"
            variant="onlyIcon"
            leftIcon={<IconEdit class="h-4 w-4 fill-white" />}
          />
        </div>
        <div class="flex items-center gap-2">
          <Paragraph size="xs" class="text-customGreen" text="Active" />
          <Checkbox variant="toggleTick" isChecked={true} class="" />
        </div>
      </div>
    </div>
  );
});
