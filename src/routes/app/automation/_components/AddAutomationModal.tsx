import { $, Signal, component$, useStore } from "@builder.io/qwik";
import { server$ } from "@builder.io/qwik-city";
import Button from "~/components/Atoms/Buttons/Button";
import Input from "~/components/Atoms/Input/Input";
import Label from "~/components/Atoms/Label/Label";
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

const addActionBasicToDB = server$(async function (
  name: string,
  desc: string,
  actionId: string,
  user: string,
) {
  const cookie = this.cookie.get("accessToken");
  if (!cookie) {
    throw new Error("No cookie found");
  }
  const db = await connectToDB(this.env);

  await db.query(
    `INSERT INTO automations (name, isActive, desc, user, actionId) VALUES ($name, $isActive, $desc, $user, $actionId);`,
    {
      name: name,
      isActive: false,
      desc: desc,
      user: user,
      actionId: actionId,
    },
  );
});

export const AddAutomationModal = component$<AddAutomationModalProps>(
  ({ isAddModalOpen }) => {
    const newAutomationStore = useStore({
      name: "",
      desc: "",
    });

    const handleAddBasicAutomation = $(async function () {
      const id = generateRandomId();
      console.log(id);
      const user = localStorage.getItem("emmethUserWalletAddress") || "";
      console.log(user);
      console.log("addind automation");

      if (!(user && newAutomationStore.name.length > 3 && id)) {
        // handle visible error with messaging
        console.log("cos nie halo");
        return;
      }

      try {
        await addActionBasicToDB(
          newAutomationStore.name,
          newAutomationStore.desc,
          id,
          user,
        );
        console.log(`automation ${newAutomationStore.name} added to database`);
      } catch (err) {
        console.log(err);
      }
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
          <div class="mb-2">
            <Label name="name" class="mb-2 block" />
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
          </div>

          <div class="mb-2">
            <Label name="desc" class="mb-2 block" />
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
          </div>
          <Button
            text="Approve"
            onClick$={async () => {
              // console.log(newAutomationStore);
              await handleAddBasicAutomation();
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
