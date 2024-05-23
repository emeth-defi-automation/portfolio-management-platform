import { component$ } from "@builder.io/qwik";
import { AutomationsMenu } from "./_components/AutomationsMenu";
import { CentralView } from "./_components/CentralView";

export default component$(() => {
  return (
    <>
      <div class="grid grid-cols-[1fr_2.5fr]">
        <AutomationsMenu />
        <CentralView />
      </div>
    </>
  );
});
