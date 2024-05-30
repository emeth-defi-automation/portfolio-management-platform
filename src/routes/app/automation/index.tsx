import { component$ } from "@builder.io/qwik";
import { AutomationsMenu } from "./_components/AutomationsMenu";
import { CentralView } from "./_components/CentralView";

export default component$(() => {
  return (
    <>
      <div class="grid grid-cols-[1fr_2.5fr]">
        <AutomationsMenu />
        {/* class="grid grid-rows-[32px_40px_1fr] gap-6 border-r border-white/10 bg-white/3 p-6" */}
        <CentralView />
      </div>
    </>
  );
});
