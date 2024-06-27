import { component$ } from "@builder.io/qwik";
import { type AddWalletFormStore } from "~/routes/app/wallets/interface";
import Label from "~/components/Atoms/Label/Label";
import Button from "~/components/Atoms/Buttons/Button";

export interface AddWalletFormProps {
  addWalletFormStore: AddWalletFormStore;
}

export default component$<AddWalletFormProps>(({ addWalletFormStore }) => {
  return (
    <>
      <div class="mb-4">
        <Label name="type" class="mb-2" />
        <div class="custom-border-1 flex h-10 items-center rounded p-1">
          <Button
            text="Observable"
            onClick$={() => {
              addWalletFormStore.isExecutable = 0;
            }}
            customClass="w-full h-full p-0"
            variant={`${addWalletFormStore.isExecutable ? "onlyIcon" : "transfer"}`}
          />
          <Button
            text="Executable"
            onClick$={() => {
              addWalletFormStore.isExecutable = 1;
            }}
            customClass="w-full h-full p-0"
            variant={`${addWalletFormStore.isExecutable ? "transfer" : "onlyIcon"}`}
          />
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
