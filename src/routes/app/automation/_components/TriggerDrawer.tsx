import { component$ } from "@builder.io/qwik";
import Box from "~/components/Atoms/Box/Box";
import Header from "~/components/Atoms/Headers/Header";

interface TriggerDrawerProps {}

export const TriggerDrawer = component$<TriggerDrawerProps>(() => {
  return (
    <div
      class="
    absolute right-0 top-20  h-full
    w-96  gap-6 border-l border-white/10 bg-white/3 p-6
    "
    >
      <Header variant="h4" text="Properties" />
    </div>
  );
});
