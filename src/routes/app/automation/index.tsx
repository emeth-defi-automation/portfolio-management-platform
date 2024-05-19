import { component$ } from "@builder.io/qwik";
import Button from "~/components/Atoms/Buttons/Button";
import { ButtonWithIcon } from "~/components/Buttons/Buttons";
import IconEdit from "@material-design-icons/svg/outlined/edit.svg?jsx";
import IconToggleOn from "@material-design-icons/svg/filled/toggle_on.svg?jsx";
// import Checkbox from "~/components/Atoms/Checkbox/Checkbox";
import Header from "~/components/Atoms/Headers/Header";
import Paragraph from "~/components/Atoms/Paragraphs/Paragraphs";

export default component$(() => {
  return (
    <>
      <div class="grid grid-cols-[30%_70%]">
        <div class="border-r border-white/10 bg-white/[0.03] grid grid-rows-[32px_40px_1fr] gap-6 p-6">
          <div class="flex items-center justify-between gap-2">
            <Header variant="h4" text="Automations" class="font-normal"/>
            <Button text="Add New" variant="transparent" size="small" customClass="font-normal bg-white/10 !border-0" />
          </div>
          <div class="grid w-full gap-2">
            <ButtonWithIcon
              image="/assets/icons/search.svg"
              text="Search for Automation"
              class="custom-border-1 h-10 flex-row-reverse justify-between gap-2 rounded-lg px-3"
            />
          </div>
          <div class="">
              <div class="p-4 flex items-center justify-between gap-12">
                <div class="flex flex-col gap-3">
                  <Header variant="h5" text="Automation Name #1"/>
                  <Paragraph size="xs" variant="secondaryText" text="At a scheduled time with a defined alert"/>
                </div>
                <div>
                  <IconToggleOn class="w-10 h-10 fill-customGreen"/>
                </div>
              </div>
              <div class="p-4 flex items-center justify-between gap-12">
                <div class="flex flex-col gap-3">
                  <Header variant="h5" text="Automation Name #2"/>
                  <Paragraph size="xs" variant="secondaryText" text="At a scheduled time with a defined alert"/>
                </div>
                <div>
                  <IconToggleOn class="w-10 h-10 fill-customGreen"/>
                </div>
              </div>
          </div>
        </div>
        <div class="p-6">
          <div class="flex justify-between items-center">
            <div class="flex gap-2">
              <Header variant="h4" text="New Automation" class="font-normal"/>
              <IconEdit class="w-4 h-4 fill-white"/>
            </div>
            <div class="flex items-center gap-2">
              <Paragraph size="xs" class="text-customGreen" text="Active"/>
              <IconToggleOn class="w-10 h-10 fill-customGreen"/>
            </div>
            {/* <Checkbox 
              variant="toggleTick"
              checked={true}
              class=""
            /> */}
          </div>
        </div>
      </div>
    </>
  );
});
