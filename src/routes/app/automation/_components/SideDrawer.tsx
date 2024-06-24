import { component$, useContext, useVisibleTask$ } from "@builder.io/qwik";
import { AutomationPageContext } from "../AutomationPageContext";
import { TriggerForm } from "./Forms/TriggerForm";

interface SideDrawerProps {}

export const TriggerDrawer = component$<SideDrawerProps>(() => {
  const automationPageContext = useContext(AutomationPageContext);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async ({ track }) => {
    track(() => {
      automationPageContext.activeAutomation.value.trigger;
    });
    console.log(automationPageContext.activeAutomation.value);
  });

  return (
    <div
      class={`absolute h-full w-96 gap-6 border-l border-white/10 bg-white/3 p-6 duration-500 ease-in ${automationPageContext.isDraverOpen.value ? "right-0" : "-right-96"}`}
    >
      {automationPageContext.sideDraverVariant.value === "triggerForm" ? (
        <TriggerForm />
      ) : null}
    </div>
  );
});
