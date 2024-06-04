import { $, component$, useContext } from "@builder.io/qwik";
import Button from "~/components/Atoms/Buttons/Button";

import Header from "~/components/Atoms/Headers/Header";

import IconEdit from "@material-design-icons/svg/outlined/edit.svg?jsx";

import { AutomationPageContext } from "../AutomationPageContext";
import IconTrash from "@material-design-icons/svg/outlined/delete.svg?jsx";
import { connectToDB } from "~/database/db";
import { server$ } from "@builder.io/qwik-city";
import { messagesContext } from "../../layout";

const deleteActionFromDb = server$(async function (actionId, user) {
  // await updateIsActiveStatus(actionId, false);

  const db = await connectToDB(this.env);
  try {
    console.log("deleting");
    await db.query(
      `DELETE FROM automations 
      WHERE user = $user AND actionId = $actionId;`,
      {
        user: user,
        actionId: actionId,
      },
    );
    console.log("deleted");
  } catch (err) {
    console.log(err);
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
      console.log(err);
      formMessageProvider.messages.push({
        id: formMessageProvider.messages.length,
        variant: "error",
        message: "Something went wrong",
        isVisible: true,
      });
    }
  });
  return (
    <div class="p-6">
      {automationPageContext.activeAutomation.value ? (
        <div class="flex h-full w-full flex-col">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <Header
                variant="h4"
                text={automationPageContext.activeAutomation.value?.name}
                class="font-normal"
              />
              <Button
                customClass="mb-1"
                variant="onlyIcon"
                leftIcon={<IconEdit class="h-4 w-4 fill-white" />}
              />
              <Button
                customClass="mb-1"
                variant="onlyIcon"
                leftIcon={<IconTrash class="h-4 w-4 fill-customRed" />}
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
          <div class="grow-1 flex h-full items-center justify-center">
            {!automationPageContext.activeAutomation.value.deployed ? (
              <Button
                text="Add trigger!"
                customClass="mb-1"
                variant="blue"
                onClick$={async () => {
                  automationPageContext.isDraverOpen.value = true;
                }}
              />
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
});
