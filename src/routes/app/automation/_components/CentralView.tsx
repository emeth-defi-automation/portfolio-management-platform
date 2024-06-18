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
import { SaveChanges } from "./SaveChanges/SaveChanges";

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
    <div class="">
      {automationPageContext.activeAutomation.value ? (
        <>
        <div class="flex h-full w-full flex-col p-6">
          <div class="flex items-center justify-between">
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
              {/* <div class="flex items-center gap-2">
          <Paragraph size="xs" class="text-customGreen" text="Active" />
          <Checkbox variant="toggleTick" isChecked={true} class="" />
        </div> */}
            </div>
          </div>
          <div class="flex h-full items-center justify-center">
            {!automationPageContext.activeAutomation.value.deployed ? (
              <div class="flex w-[438px] flex-col gap-4">
                <Annotation text="Trigger" />
                <Button
                  text="Add Trigger"
                  customClass=""
                  variant="dashed"
                  leftIcon={<IconAdd class="h-4 w-4" />}
                  onClick$={async () => {
                    automationPageContext.isDraverOpen.value = true;
                  }}
                />
              </div>
            ) : null}
          </div>
        </div>
        </>
      ) : null}
      <SaveChanges/>
    </div>
  );
});
