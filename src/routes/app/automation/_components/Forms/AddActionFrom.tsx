import {
  $,
  component$,
  useContext,
  useSignal,
  useStore,
  useVisibleTask$,
} from "@builder.io/qwik";
import { server$ } from "@builder.io/qwik-city";
import Button from "~/components/Atoms/Buttons/Button";

import Header from "~/components/Atoms/Headers/Header";

import { connectToDB } from "~/database/db";
import { AutomationPageContext } from "../../AutomationPageContext";
import { messagesContext } from "~/routes/app/layout";
import InputField from "~/components/Molecules/InputField/InputField";

import SelectField from "~/components/Molecules/SelectField/SelectField";
import Annotation from "~/components/Atoms/Annotation/Annotation";

import ParagraphAnnotation from "~/components/Molecules/ParagraphAnnotation/ParagraphAnnotation";
import IconError from "@material-design-icons/svg/outlined/error_outline.svg?jsx";
import { Summary } from "../SwapAndTransfer/Summary";
import { generateRandomId } from "~/utils/automations";
import { AddSwapActionModal } from "../AddSwapAutomationModal";

const addAutomationAction = server$(
  async function (
    automationId,
    actionId,
    user,
    actionName,
    actionDesc,
    actionType,
  ) {
    const db = await connectToDB(this.env);

    try {
      const newAction = {
        actionName: actionName,
        actionDesc: actionDesc,
        actionType: actionType,
        actionId: actionId,
      };
      console.log(
        automationId,
        actionId,
        user,
        actionName,
        actionDesc,
        actionType,
      );
      const result = await db.query(
        `
            UPDATE automations
            SET actions = ARRAY::APPEND(actions, $newAction)
            WHERE actionId = $automationId AND user = $user;
          `,
        {
          newAction,
          automationId,
          user,
        },
      );

      console.log("Action added successfully:", result);
    } catch (error) {
      console.error("Error adding action:", error);
    }
  },
);

interface AddActionFormProps {}

export const AddActionForm = component$<AddActionFormProps>(() => {
  const state = useSignal("");
  const automationPageContext = useContext(AutomationPageContext);
  const formMessageProvider = useContext(messagesContext);
  const addActionStore = useStore({
    actionName: "",
    actionType: "",
    actionDesc: "",
  });
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async ({ track }) => {
    track(() => {
      automationPageContext.isDraverOpen.value;
    });
  });

  const handleChooseOptions = $(async () => {
    const user = localStorage.getItem("emmethUserWalletAddress");
    const actionId = `${generateRandomId()}`;

    // try {
    //   await addAutomationAction(
    //     automationPageContext.activeAutomation.value.actionId,
    //     actionId,
    //     user,
    //     addActionStore.actionName,
    //     addActionStore.actionDesc,
    //     addActionStore.actionType,
    //   );
    // } catch (err) {
    //   console.log(err);
    // }
    console.log("tu jezdem na zewnatrz: ", state.value);

    if (state.value.toLowerCase() === "swap") {
      console.log("tu jezdem");
      automationPageContext.addSwapModalOpen.value = true;
    }
    if (state.value.toLowerCase() === "transfer") {
      automationPageContext.addSwapModalOpen.value = true;
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
    </div>
  );
});
