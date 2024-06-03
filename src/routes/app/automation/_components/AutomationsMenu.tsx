import {
  $,
  component$,
  useContext,
  useSignal,
  useVisibleTask$,
} from "@builder.io/qwik";
import Button from "~/components/Atoms/Buttons/Button";
import Checkbox from "~/components/Atoms/Checkbox/Checkbox";
import Header from "~/components/Atoms/Headers/Header";
import Paragraph from "~/components/Atoms/Paragraphs/Paragraphs";
import { ButtonWithIcon } from "~/components/Buttons/Buttons";
import { connectToDB } from "~/database/db";
import { server$ } from "@builder.io/qwik-city";
import { AddAutomationModal } from "./AddAutomationModal";
import { AutomationPageContext } from "../AutomationPageContext";

const updateIsActiveStatus = server$(async function (actionId, isActive) {
  const db = await connectToDB(this.env);
  console.log("id: ", actionId, "isActive: ", isActive);
  try {
    console.log("zmieniam");
    await db.query(
      `UPDATE automations SET isActive = $isActive WHERE actionId = $actionId;`,
      { actionId: actionId, isActive: isActive },
    );
    console.log("chyba zmienilem");
  } catch (err) {
    console.log(err);
  }
});

const getActionsFromDb = server$(async function (user) {
  const db = await connectToDB(this.env);

  const [actions] = await db.query(
    `SELECT * FROM automations WHERE user = $user;`,
    { user: user },
  );
  console.log(actions);
  return actions;
});

interface AutomationsMenuProps {}

export const AutomationsMenu = component$<AutomationsMenuProps>(() => {
  const automationPageContext = useContext(AutomationPageContext);
  const isAddModalOpen = useSignal<boolean>(false);
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async ({ track }) => {
    track(() => {
      isAddModalOpen.value === false;
    });
    const user = localStorage.getItem("emmethUserWalletAddress");
    const actionsFromDb = await getActionsFromDb(user);
    automationPageContext.automations.value = actionsFromDb;
    console.log(automationPageContext.automations.value);
  });

  return (
    <>
      <div class="grid grid-rows-[32px_40px_1fr] gap-6 border-r border-white/10 bg-white/3 p-6">
        <div class="flex items-center justify-between gap-2">
          <Header variant="h4" text="Automations" class="font-normal" />
          <Button
            text="Add New"
            variant="transparent"
            size="small"
            customClass="font-normal bg-white/10 !border-0"
            onClick$={() => (isAddModalOpen.value = !isAddModalOpen.value)}
          />
        </div>
        <div class="grid w-full gap-2">
          <ButtonWithIcon
            image="/assets/icons/search.svg"
            text="Search for Automation"
            class="custom-border-1 h-10 flex-row-reverse justify-between gap-2 rounded-lg px-3"
          />
        </div>

        <div class="">
          {automationPageContext.automations.value.map((action: any) => (
            <div
              key={action.actionId}
              class="flex cursor-pointer items-center justify-between gap-12 p-4"
            >
              <div
                class="flex flex-col gap-3"
                onClick$={$(() => {
                  automationPageContext.activeAutomation.value = action;
                })}
              >
                <Header variant="h5" text={action.name} />
                <Paragraph
                  size="xs"
                  variant="secondaryText"
                  text={action.desc}
                />
              </div>
              <Checkbox
                variant="toggleTick"
                isChecked={action.isActive}
                class=""
                onClick={$(async () => {
                  console.log("kliknalem sie");
                  await updateIsActiveStatus(action.actionId, !action.isActive);
                })}
              />
            </div>
          ))}
        </div>
      </div>
      {isAddModalOpen.value ? (
        <AddAutomationModal isAddModalOpen={isAddModalOpen} />
      ) : null}
    </>
  );
});
