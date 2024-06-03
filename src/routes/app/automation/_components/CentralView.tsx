import { component$, useContext } from "@builder.io/qwik";
import Button from "~/components/Atoms/Buttons/Button";
import Checkbox from "~/components/Atoms/Checkbox/Checkbox";
import Header from "~/components/Atoms/Headers/Header";
import Paragraph from "~/components/Atoms/Paragraphs/Paragraphs";
import IconEdit from "@material-design-icons/svg/outlined/edit.svg?jsx";
import { TriggerDrawer } from "./TriggerDrawer";
import { AutomationPageContext } from "../AutomationPageContext";
import IconTrash from "@material-design-icons/svg/outlined/delete.svg?jsx";
import { connectToDB } from "~/database/db";
import { server$ } from "@builder.io/qwik-city";

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

  return (
    <div class="p-6">
      <div class="flex items-center justify-between">
        {automationPageContext.activeAutomation.value ? (
          <div class=" flex items-center gap-2">
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
              onClick$={async () => {
                const user = localStorage.getItem("emmethUserWalletAddress");
                await deleteActionFromDb(
                  automationPageContext.activeAutomation.value.actionId,
                  user,
                );
              }}
            />
          </div>
        ) : null}

        {/* <div class="flex items-center gap-2">
          <Paragraph size="xs" class="text-customGreen" text="Active" />
          <Checkbox variant="toggleTick" isChecked={true} class="" />
        </div> */}
      </div>
    </div>
  );
});
