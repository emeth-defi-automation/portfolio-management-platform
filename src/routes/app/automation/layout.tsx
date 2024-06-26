import {
  Slot,
  component$,
  useContextProvider,
  useSignal,
} from "@builder.io/qwik";
import { AutomationPageContext } from "./AutomationPageContext";

export default component$(() => {
  useContextProvider(AutomationPageContext, {
    automations: useSignal([]),
    activeAutomation: useSignal(null),
    isDraverOpen: useSignal(false),
  });

  return <Slot />;
});
