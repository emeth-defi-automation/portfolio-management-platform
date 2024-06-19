import { component$ } from "@builder.io/qwik";
import { AutomationsMenu } from "./_components/AutomationsMenu";
import { CentralView } from "./_components/CentralView";
import { TriggerDrawer } from "./_components/TriggerDrawer";

export default component$(() => {
  return (
    <>
      {/* <div class="grid grid-cols-[1fr_2fr_1fr]"> */}
      <div class="flex min-h-full w-full">
        <AutomationsMenu />
        <CentralView />
        <TriggerDrawer />
      </div>
    </>
  );
});
