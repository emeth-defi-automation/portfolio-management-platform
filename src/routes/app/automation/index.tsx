import { component$ } from "@builder.io/qwik";
import Button from "~/components/Atoms/Buttons/Button";
import { ButtonWithIcon } from "~/components/Buttons/Buttons";
import IconEdit from "@material-design-icons/svg/outlined/edit.svg?jsx";
import Checkbox from "~/components/Atoms/Checkbox/Checkbox";
import Header from "~/components/Atoms/Headers/Header";
import Paragraph from "~/components/Atoms/Paragraphs/Paragraphs";

export default component$(() => {
  return (
    <>
      <div class="grid grid-cols-[1fr_2.5fr]">
        <div class="grid grid-rows-[32px_40px_1fr] gap-6 border-r border-white/10 bg-white/3 p-6">
          <div class="flex items-center justify-between gap-2">
            <Header variant="h4" text="Automations" class="font-normal" />
            <Button
              text="Add New"
              variant="transparent"
              size="small"
              customClass="font-normal bg-white/10 !border-0"
            />
          </div>
          <div class="grid w-full gap-2">
            <ButtonWithIcon
              image="/assets/icons/search.svg"
              text="Search for Automation"
              class="custom-border-1 h-10 flex-row-reverse justify-between gap-2 rounded-lg px-3"
            />
          </div>
          <div class="">
            <div class="flex items-center justify-between gap-12 p-4">
              <div class="flex flex-col gap-3">
                <Header variant="h5" text="Automation Name #1" />
                <Paragraph
                  size="xs"
                  variant="secondaryText"
                  text="At a scheduled time with a defined alert"
                />
              </div>
              <Checkbox variant="toggleTick" isChecked={true} class="" />
            </div>
            <div class="flex items-center justify-between p-4">
              <div class="flex flex-col gap-3">
                <Header variant="h5" text="Automation Name #2" />
                <Paragraph
                  size="xs"
                  variant="secondaryText"
                  text="At a scheduled time with a defined alert"
                />
              </div>
              <Checkbox variant="toggleTick" isChecked={true} />
            </div>
          </div>
        </div>
        <div class="p-6">
          <div class="flex items-center justify-between">
            <div class="flex gap-2">
              <Header variant="h4" text="New Automation" class="font-normal" />
              <Button
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
      </div>
    </>
  );
});
