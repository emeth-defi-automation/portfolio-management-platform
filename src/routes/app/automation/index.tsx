import { component$ } from "@builder.io/qwik";
import { AutomationsMenu } from "./_components/AutomationsMenu";
import { CentralView } from "./_components/CentralView";
import { TriggerDrawer } from "./_components/SideDrawer";

export default component$(() => {
  return (
    <>
      <div class="relative flex min-h-full w-full overflow-hidden">
        <AutomationsMenu />
        <CentralView />
        <TriggerDrawer />
      </div>
    </>
  );
});
