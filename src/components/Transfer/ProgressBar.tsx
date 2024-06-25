import { $, component$, Slot, useSignal } from "@builder.io/qwik";
import Paragraph from "~/components/Atoms/Paragraphs/Paragraphs";
import Select from "../Atoms/Select/Select";
import Input from "../Atoms/Input/Input";

export const ProgressBar = component$(() => {
  const type = useSignal("custom");
  return (
    <div class="flex w-full max-w-full items-center justify-between gap-20">
      <div class="flex w-full items-center justify-between gap-3">
        <Paragraph text="Destination" />
        <Select
          id=""
          name=""
          size="medium"
          options={[
            { value: "custom", text: "Custom wallet" },
            { value: "observed", text: "Observed wallet" },
          ]}
          onValueChange={$((value: string) => {
            type.value = value;
          })}
        />
        <Paragraph text="To" />
        {type.value === "custom" ? (
          <Input
            id=""
            placeholder="Paste Wallet Address"
            size="small"
            inputClass="placeholder:text-opacity-100"
          />
        ) : (
          <Select
            id="observedWallets"
            name="observedWallets"
            options={[{ value: "", text: "Pick a wallet" }]}
            size="medium"
          />
        )}
      </div>
      <Slot />
    </div>
  );
});
