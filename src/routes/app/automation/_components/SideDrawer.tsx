import { component$, useContext } from "@builder.io/qwik";
import { AutomationPageContext } from "../AutomationPageContext";
import { TriggerForm } from "./Forms/TriggerForm";
import { AddActionForm } from "./Forms/AddActionFrom";
import { Summary } from "./SwapAndTransfer/Summary";

interface SideDrawerProps {}

export const TriggerDrawer = component$<SideDrawerProps>(() => {
  const automationPageContext = useContext(AutomationPageContext);

  return (
    <div
      class={`absolute h-full w-96 gap-6 border-l border-white/10 bg-white/3 p-6 duration-500 ease-in ${automationPageContext.isDraverOpen.value ? "right-0" : "-right-96"}`}
    >
      {automationPageContext.sideDraverVariant.value === "triggerForm" ? (
        <TriggerForm />
      ) : automationPageContext.sideDraverVariant.value === "addActionForm" ? (
        <AddActionForm />
      ) : automationPageContext.sideDraverVariant.value === "transferAction" ? (
        <Summary />
      ) : automationPageContext.sideDraverVariant.value === "swapAction" ? (
        <Summary />
      ) : null}
    </div>
  );
});
