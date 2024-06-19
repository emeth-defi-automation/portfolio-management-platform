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
          id=""
          name=""
          size="medium"
          options={[{ value: "", text: "Custom wallet" }]}
        />
        <Paragraph text="To" />
        <Input
          id=""
          placeholder="Paste Wallet Address"
          size="small"
          InputClass="placeholder:text-opacity-100"
        />
      </div>
      <Slot />
    </div>
  );
});
