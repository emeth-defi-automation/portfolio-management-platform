import { $, component$, useContext } from "@builder.io/qwik";
import Button from "~/components/Atoms/Buttons/Button";

import Header from "~/components/Atoms/Headers/Header";

import IconEdit from "@material-design-icons/svg/outlined/edit.svg?jsx";

import { AutomationPageContext } from "../AutomationPageContext";
import IconTrash from "@material-design-icons/svg/outlined/delete.svg?jsx";
import { connectToDB } from "~/database/db";
import { server$ } from "@builder.io/qwik-city";
import { messagesContext } from "../../layout";
import Annotation from "~/components/Atoms/Annotation/Annotation";
import IconAdd from "@material-design-icons/svg/outlined/add.svg?jsx";
import { AutomationCard } from "./AutomationCard/AutomationCard";
import Paragraph from "~/components/Atoms/Paragraphs/Paragraphs";
import Checkbox from "~/components/Atoms/Checkbox/Checkbox";

const deleteActionFromDb = server$(async function (actionId, user) {
  // await updateIsActiveStatus(actionId, false);

  const db = await connectToDB(this.env);
  try {
    await db.query(
      `DELETE FROM automations 
      WHERE user = $user AND actionId = $actionId;`,
      {
        user: user,
        actionId: actionId,
      },
    );
  } catch (err) {
    console.error(err);
  }
});

interface CentralViewProps {}

export const CentralView = component$<CentralViewProps>(() => {
  const automationPageContext = useContext(AutomationPageContext);
  const formMessageProvider = useContext(messagesContext);

  const handleDeleteAction = $(async () => {
    const user = localStorage.getItem("emmethUserWalletAddress");
    try {
      await deleteActionFromDb(
        automationPageContext.activeAutomation.value.actionId,
        user,
      );
      formMessageProvider.messages.push({
        id: formMessageProvider.messages.length,
        variant: "success",
        message: "Successfully removed automation!",
        isVisible: true,
      });
    } catch (err) {
      console.error(err);
      formMessageProvider.messages.push({
        id: formMessageProvider.messages.length,
        variant: "error",
        message: "Something went wrong",
        isVisible: true,
      });
    }
  });

  return (
    <div
      class={`p-6 duration-500 ease-out ${automationPageContext.isDraverOpen.value ? "w-[calc(100%-48rem)]" : "w-full"}`}
    >
      {automationPageContext.activeAutomation.value ? (
        <div class="flex h-full w-full flex-col">
          <div class="flex w-full items-center justify-between">
            <div class="flex items-center gap-2">
              <Header
                variant="h4"
                text={automationPageContext.activeAutomation.value?.name}
                class="font-normal"
              />
              <Button
                leftIcon={<IconEdit class="h-3 w-3 fill-white" />}
                customClass="bg-white/10 h-8 w-8 p-0"
              />
              <Button
                leftIcon={<IconTrash class="h-4 w-4 fill-customRed" />}
                customClass="bg-customRed/10 h-8 w-8 p-0"
                onClick$={$(async () => {
                  await handleDeleteAction();
                })}
              />
            </div>
            <div class="flex  items-center  gap-2">
              <Paragraph size="xs" class="text-customGreen" text="Active" />
              <Checkbox variant="toggleTick" isChecked={true} class="" />
            </div>
          </div>
          <div class="flex h-full w-full flex-col items-center justify-center gap-10">
            <div class="flex w-[438px] flex-col gap-4">
              <Annotation text="Trigger" />

              {!automationPageContext.activeAutomation.value.deployed &&
              !automationPageContext.activeAutomation.value.trigger ? (
                <Button
                  text="Add Trigger"
                  customClass="h-14"
                  variant="dashed"
                  leftIcon={<IconAdd class="h-4 w-4" />}
                  onClick$={async () => {
                    automationPageContext.isDraverOpen.value = true;
                    automationPageContext.sideDraverVariant.value =
                      "triggerForm";
                  }}
                />
              ) : (
                <AutomationCard
                  variant="trigger"
                  isActive={true}
                  title={
                    automationPageContext.activeAutomation.value?.trigger
                      .triggerName
                  }
                  description={
                    automationPageContext.activeAutomation.value?.trigger
                      .triggerDesc
                  }
                />
              )}
            </div>
            <div class="flex w-[438px] flex-col gap-4">
              <Annotation text="Actions" />

              {automationPageContext.activeAutomation.value.actions.map(
                (action: any) => (
                  <AutomationCard
                    key={`${automationPageContext.activeAutomation.value.automationId}${action.actionId}`}
                    variant={action.actionType.toLowerCase()}
                    isActive={false}
                    title={action.actionName}
                    description={action.actionDesc}
                  />
                ),
              )}
              <Button
                text="Add Action"
                customClass="h-14"
                variant="dashed"
                leftIcon={<IconAdd class="h-4 w-4" />}
                onClick$={async () => {
                  automationPageContext.isDraverOpen.value = true;
                  automationPageContext.sideDraverVariant.value =
                    "addActionForm";
                }}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
});
