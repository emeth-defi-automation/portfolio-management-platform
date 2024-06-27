import {
  $,
  component$,
  useContext,
  useStore,
  useVisibleTask$,
} from "@builder.io/qwik";
import { server$ } from "@builder.io/qwik-city";
import Button from "~/components/Atoms/Buttons/Button";
import Checkbox from "~/components/Atoms/Checkbox/Checkbox";
import Header from "~/components/Atoms/Headers/Header";
import Label from "~/components/Atoms/Label/Label";
import { connectToDB } from "~/database/db";
import { AutomationPageContext } from "../../AutomationPageContext";
import { messagesContext } from "~/routes/app/layout";
import InputField from "~/components/Molecules/InputField/InputField";
import { Divider } from "~/components/Atoms/Divider/Divider";
import SelectField from "~/components/Molecules/SelectField/SelectField";

const updateAutomationAction = server$(
  async function (
    actionId,
    user,
    triggerName,
    triggerDesc,
    isActive,
    timeZero,
    duration,
  ) {
    const db = await connectToDB(this.env);
    try {
      const result = await db.query(
        `UPDATE automations 
            SET trigger = {
              isActive: $isActive, 
              timeZero: $timeZero, 
              triggerName: $triggerName, 
              triggerDesc: $triggerDesc, 
              duration: $duration,
              user: $user
            } 
            WHERE actionId = $actionId AND user = $user;`,
        {
          actionId: `${actionId}`,
          user: user,
          isActive: isActive,
          timeZero: timeZero,
          duration: duration,
          triggerName: triggerName,
          triggerDesc: triggerDesc,
        },
      );
    } catch (err) {
      console.log(err);
    }
  },
);

interface TriggerFormProps {}

export const TriggerForm = component$<TriggerFormProps>(() => {
  const automationPageContext = useContext(AutomationPageContext);
  const formMessageProvider = useContext(messagesContext);
  const addTriggerStore = useStore({
    isActive: false,
    triggerName: "",
    triggerDesc: "",
    durationCount: 0,
    interval: 0,
    timeZero: "",
  });
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async ({ track }) => {
    track(() => {
      automationPageContext.isDraverOpen.value;
    });
  });

  const handleAddAutomation = $(async function () {
    const {
      isActive,

      triggerName,
      triggerDesc,
      timeZero,
      durationCount,
      interval,
    } = addTriggerStore;
    formMessageProvider.messages.push({
      id: formMessageProvider.messages.length,
      variant: "info",
      message: "Creating action...",
      isVisible: true,
    });
    try {
      const duration = durationCount * interval;
      const timeZeroCalculated = Math.floor(
        new Date(timeZero).getTime() / 1000,
      );

      const user = localStorage.getItem("emmethUserWalletAddress");

      await updateAutomationAction(
        automationPageContext.activeAutomation.value.actionId,
        user,
        triggerName,
        triggerDesc,
        isActive,
        timeZeroCalculated,
        duration,
      );

      formMessageProvider.messages.push({
        id: formMessageProvider.messages.length,
        variant: "success",
        message: "Success!",
        isVisible: true,
      });
      automationPageContext.isDraverOpen.value = false;
    } catch (err) {
      console.log(err);
      formMessageProvider.messages.push({
        id: formMessageProvider.messages.length,
        variant: "error",
        message: "Something went wrong.",
        isVisible: true,
      });
    }
  });
  return (
    <div
      class={` h-full w-full ${automationPageContext.isDraverOpen.value ? "animate-slowAppearance" : ""}`}
    >
      <div class="w-full">
        <Header variant="h4" text="Properties" />
        <div class="my-4 flex w-full flex-col gap-4">
          <InputField
            id="triggerName"
            type="text"
            class="!mb-0"
            variant={null}
            size="medium"
            name="Trigger Name"
            placeholder="Enter trigger name"
            value=""
            onInput={$((e) => {
              const target = e.target;
              addTriggerStore.triggerName = target.value;
            })}
          />
          <InputField
            id="triggerDesc"
            type="text"
            class="!mb-0"
            variant={null}
            size="medium"
            name="Trigger Description"
            placeholder="Enter short trigger description"
            value=""
            onInput={$((e) => {
              const target = e.target;
              addTriggerStore.triggerDesc = target.value;
            })}
          />
          <Divider class="my-2" />
          {/* TRIGGER TYPE */}
          <InputField
            id="startAt"
            class="!mb-0"
            type="datetime-local"
            variant={null}
            size="medium"
            name="Start at"
            value=""
            onInput={$((e) => {
              const target = e.target;
              addTriggerStore.timeZero = target.value;
            })}
          />
          <SelectField
            id="TriggerDrawenDurationInterval"
            name="Interval"
            size="large"
            options={[
              {
                text: "Pick interval",
                value: 0,
              },
              {
                text: "Days",
                value: 86400,
              },
              {
                text: "Hours",
                value: 3600,
              },
              {
                text: "Minutes",
                value: 60,
              },
            ]}
            onValueChange={$((value: number) => {
              addTriggerStore.interval = value;
            })}
          />
          <InputField
            name="How many"
            id="TriggerDrawenDurationCount"
            placeholder="0"
            type="number"
            variant={null}
            size="medium"
            value={addTriggerStore.durationCount}
            onInput={$((e) => {
              const target = e.target;
              addTriggerStore.durationCount = target.value;
            })}
          />
          <div class="flex items-center gap-2">
            <Checkbox
              variant="toggleTick"
              isChecked={addTriggerStore.isActive}
              onClick={$(() => {
                addTriggerStore.isActive = !addTriggerStore.isActive;
              })}
            />
            <Label name="Is Active?" class="my-2 block" />
          </div>
          <Button
            text="Approve"
            onClick$={$(async () => {
              try {
                await handleAddAutomation();
                automationPageContext.isDraverOpen.value = false;
                automationPageContext.activeAutomation.value = null;
              } catch (err) {
                console.log(err);
              }
            })}
          />
        </div>
      </div>
    </div>
  );
});
