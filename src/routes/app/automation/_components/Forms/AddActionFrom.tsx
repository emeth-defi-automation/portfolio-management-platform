import {
  $,
  component$,
  useContext,
  useSignal,
  useStore,
  useVisibleTask$,
} from "@builder.io/qwik";
import Button from "~/components/Atoms/Buttons/Button";
import Header from "~/components/Atoms/Headers/Header";
import { AutomationPageContext } from "../../AutomationPageContext";
import InputField from "~/components/Molecules/InputField/InputField";
import SelectField from "~/components/Molecules/SelectField/SelectField";
import Annotation from "~/components/Atoms/Annotation/Annotation";

import ParagraphAnnotation from "~/components/Molecules/ParagraphAnnotation/ParagraphAnnotation";
import IconError from "@material-design-icons/svg/outlined/error_outline.svg?jsx";
// import { Summary } from "../SwapAndTransfer/Summary";
import { AddSwapActionModal } from "../AddSwapAutomationModal";
import { Transfer } from "~/components/Transfer/Transfer";

interface AddActionFormProps {}

export const AddActionForm = component$<AddActionFormProps>(() => {
  const state = useSignal("");
  const automationPageContext = useContext(AutomationPageContext);
  const addActionStore = useStore({
    actionName: "",
    actionType: "",
    actionDesc: "",
    automationId: automationPageContext.activeAutomation.value.actionId,
  });
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async ({ track }) => {
    track(() => {
      automationPageContext.isDraverOpen.value;
    });
    addActionStore.actionName = "";
    addActionStore.actionDesc = "";
    addActionStore.actionType = "";
  });

  const handleChooseOptions = $(async () => {
    if (state.value.toLowerCase() === "swap") {
      automationPageContext.addSwapModalOpen.value = true;
    }
    if (state.value.toLowerCase() === "transfer") {
      automationPageContext.addTransferModalOpen.value = true;
    }
  });

  return (
    <div
      class={` h-full w-full ${automationPageContext.isDraverOpen.value ? "animate-slowAppearance" : ""}`}
    >
      <div class="w-full">
        <Header variant="h4" text="Action Properties" />
        <div class="mt-2 flex flex-col justify-center gap-6">
          <SelectField
            id="actionType"
            name="Action Type"
            size="large"
            labelClass="normal-case"
            options={[
              { value: "", text: "Pick action type" },
              { value: "Swap", text: "Swap" },
              { value: "Transfer", text: "Transfer" },
            ]}
            onValueChange={$((value: string) => {
              state.value = value;
              addActionStore.actionType = value;
            })}
          />
          <InputField
            id=""
            name="Action name"
            variant={null}
            size="medium"
            placeholder={`${state.value} #1`}
            labelClass="normal-case"
            onInput={$((e) => {
              const target = e.target;
              addActionStore.actionName = target.value;
            })}
          />
          <InputField
            id=""
            variant={null}
            name="Action description"
            size="medium"
            placeholder={`${state.value} Description`}
            labelClass="normal-case"
            onInput={$((e) => {
              const target = e.target;
              addActionStore.actionDesc = target.value;
            })}
          />
          <hr class="h-[1px] border-0 bg-white/10" />
          <div class="flex items-center justify-between">
            <Annotation text={`${state.value} Summary`} />
            <Button
              text="Choose options"
              variant="transparent"
              size="small"
              customClass="font-normal bg-white/10 !border-0"
              onClick$={() => handleChooseOptions()}
            />
          </div>
          <ParagraphAnnotation
            hasIconBox={true}
            iconBoxBorder="clear"
            iconBoxSize="large"
            iconBoxCustomClass="p-0 w-8 h-8"
            iconBoxCustomIcon={<IconError class="h-8 w-8 fill-customWarning" />}
            customClass="gap-2 border border-customWarning bg-customWarning/10 p-4 rounded-lg w-full"
            paragraphText="You didn’t choose tokens yet"
            annotationText={`Please select the tokens you wish to ${state.value == "Swap" ? "exchange" : "transfer"}.`}
          />
          {/* <Summary actionType={state.value} /> */}
        </div>
      </div>
      {automationPageContext.addSwapModalOpen.value ? (
        <AddSwapActionModal
          isOpen={automationPageContext.addSwapModalOpen}
          automationAction={addActionStore}
        />
      ) : null}
      {automationPageContext.addTransferModalOpen.value ? (
        <Transfer
          isOpen={automationPageContext.addTransferModalOpen}
          automationAction={addActionStore}
        />
      ) : null}
    </div>
  );
});
