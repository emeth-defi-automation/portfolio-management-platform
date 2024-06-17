import { component$, Slot } from "@builder.io/qwik";
import Paragraph from "~/components/Atoms/Paragraphs/Paragraphs";
import Select from "../Atoms/Select/Select";
import Input from "../Atoms/Input/Input";

export const ProgressBar = component$(() => {
  return (
    <div class="flex items-center justify-between gap-20">
      <div class="flex w-full items-center justify-between gap-3">
        <Paragraph text="Destination" />
        <Select
          size="medium"
          options={[{ value: "", text: "Custom wallet" }]}
        />
        <Paragraph text="To" />
        <Input
          placeholder="Paste Wallet Address"
          size="small"
          customClass="placeholder:text-opacity-100"
        />
      </div>
      <Slot />
    </div>
  );
});
