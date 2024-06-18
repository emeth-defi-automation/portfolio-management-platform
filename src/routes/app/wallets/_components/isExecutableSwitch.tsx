import { component$ } from "@builder.io/qwik";
import { type AddWalletFormStore } from "~/routes/app/wallets/interface";
import Label from "~/components/Atoms/Label/Label";

export interface AddWalletFormProps {
  addWalletFormStore: AddWalletFormStore;
}

export default component$<AddWalletFormProps>(({ addWalletFormStore }) => {
  return (
    <>
      <div class="mb-4">
        <Label name="type" class="mb-2" />
        <div class="custom-bg-white custom-border-1 grid grid-cols-[50%_50%] rounded p-1">
          <button
            onClick$={() => {
              addWalletFormStore.isExecutable = 0;
            }}
            type="button"
            class={`${addWalletFormStore.isExecutable ? "bg-black" : "custom-bg-button"}  col-span-1 rounded p-2.5 text-white`}
          >
            Observable
          </button>
          <button
            onClick$={() => {
              addWalletFormStore.isExecutable = 1;
            }}
            type="button"
            class={`${addWalletFormStore.isExecutable ? "custom-bg-button" : "bg-black"} col-span-1 rounded p-2.5  text-white`}
          >
            Executable
          </button>
          <input
            type="hidden"
            value={addWalletFormStore.isExecutable}
            name="isExecutable"
          />
        </div>
      </div>
    </>
  );
});
