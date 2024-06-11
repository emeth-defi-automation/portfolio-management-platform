import { component$, Slot } from "@builder.io/qwik";
import Paragraph from "../Atoms/Paragraphs/Paragraphs";

export const Destination = component$(() => {
  return (
    <div class="flex items-center justify-between gap-4 py-3">
      <Paragraph text="Destination address" />
      <div class="flex items-center gap-6">
        <Slot />
        <Slot />
      </div>
    </div>
  );
});
