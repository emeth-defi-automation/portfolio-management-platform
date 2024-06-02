import { $, Signal, component$, useStore } from "@builder.io/qwik";
import { server$ } from "@builder.io/qwik-city";
import Button from "~/components/Atoms/Buttons/Button";
import Input from "~/components/Atoms/Input/Input";
import { Modal } from "~/components/Modal/Modal";
import { connectToDB } from "~/database/db";

interface AddAutomationModalProps {
  isAddModalOpen: Signal<boolean>;
}
function generateRandomId() {
  const now = new Date();
  const datePart =
    now.getFullYear().toString().slice(-2) +
    (now.getMonth() + 1).toString().padStart(2, "0") +
    now.getDate().toString().padStart(2, "0") +
    now.getHours().toString().padStart(2, "0") +
    now.getMinutes().toString().padStart(2, "0") +
    now.getSeconds().toString().padStart(2, "0");
  const randomPart = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return datePart + randomPart;
}
const addActionBasicToDB = server$(async function (name, desc, actionId, user) {
  const cookie = this.cookie.get("accessToken");
  if (!cookie) {
    throw new Error("No cookie found");
  }
  const db = await connectToDB(this.env);

  await db.query(
    `INSERT INTO automations (name, isActive, desc, user, actionId) VALUES ("${name}", "${desc}", ${false}, ${actionId}, "${user}");`,
  );
});

export const AutomationsMenu = component$<AddAutomationModalProps>(
  ({ isAddModalOpen }) => {
    const newAutomationStore = useStore({
      name: "",
      desc: "",
    });

    const handleAddBasicAutomation = $(async function () {
      const id = generateRandomId();
      const user = localStorage.getItem("emmethUserWalletAddress");
      addActionBasicToDB(
        newAutomationStore.name,
        newAutomationStore.desc,
        id,
        user,
      );
    });

    return (
      <Modal
        title="Add action"
        isOpen={isAddModalOpen}
        onClose={$(() => {
          isAddModalOpen.value = false;
          newAutomationStore.name = "";
          newAutomationStore.desc = "";
        })}
      >
        <div class="flex flex-col gap-2">
          <Input
            name="name"
            placeholder="Enter name"
            value={newAutomationStore.name}
            type="text"
            onInput={$((e) => {
              const target = e.target;
              newAutomationStore.name = target.value;
            })}
          />
          <Input
            name="desc"
            placeholder="Enter short description"
            value={newAutomationStore.desc}
            type="text"
            onInput={$((e) => {
              const target = e.target;
              newAutomationStore.desc = target.value;
            })}
          />
          <Button
            text="Approve"
            onClick$={() => {
              handleAddBasicAutomation();
              isAddModalOpen.value = false;
              newAutomationStore.name = "";
              newAutomationStore.desc = "";
            }}
          />
        </div>
      </Modal>
    );
  },
);
