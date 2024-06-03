import {
    createContextId,
    type Signal,
  } from "@builder.io/qwik";
  
  export interface AutomationPageInterface {
    automations: Signal<any | null>;
    activeAutomation: Signal<any | null>;
  }
  
  export const AutomationPageContext = createContextId<AutomationPageInterface>(
    "automation-page-context",
  );