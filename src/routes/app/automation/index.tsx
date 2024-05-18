import { component$ } from "@builder.io/qwik";
import Button from "~/components/Atoms/Buttons/Button";
import { ButtonWithIcon } from "~/components/Buttons/Buttons";
import IconEdit from "@material-design-icons/svg/outlined/edit.svg?jsx";
import Checkbox from "~/components/Atoms/Checkbox/Checkbox";

export default component$(() => {
  return (
    <>
      <div class="grid grid-cols-[25%_75%]">
        <div class="custom-border-1 bg-white/[0.03] grid grid-rows-[32px_40px_1fr] !border-t-0 !border-l-0 gap-6 p-6">
          <div class="flex items-center justify-between gap-2">
            <h1 class="text-base font-normal">Automations</h1>
            <Button text="Add New" variant="transparent" size="small" customClass="font-normal bg-white/10 !border-0" />
          </div>

          <div class="grid w-full gap-2">
            <ButtonWithIcon
              image="/assets/icons/search.svg"
              text="Search for Automation"
              class="custom-text-50 custom-border-1 h-10 justify-start gap-2 rounded-lg px-3"
            />
          </div>
        </div>
        <div class="p-6">
          <div class="flex justify-between items-center">
            <div class="flex gap-2">
              <p>New Automation</p>
              <IconEdit class="w-4 h-4 fill-white"/>
            </div>
            <div>
              <Checkbox 
                variant="toggleTick"
                checked={true}
                class=""
              />   
            </div>
          </div>
        </div>
      </div>
    </>
  );
});
