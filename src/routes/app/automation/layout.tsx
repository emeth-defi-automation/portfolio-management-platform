import {
  Slot,
  component$,
  useContextProvider,
  useSignal,
  useVisibleTask$,
} from "@builder.io/qwik";
import { AutomationPageContext } from "./AutomationPageContext";

export default component$(() => {
  useContextProvider(AutomationPageContext, {
    automations: useSignal([]),
    activeAutomation: useSignal({}),
  });

  return <Slot />;
});
