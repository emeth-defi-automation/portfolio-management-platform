import { component$, Slot } from "@builder.io/qwik";
import Annotation from "../Atoms/Annotation/Annotation";

export const ProgressBar = component$(() => {
  return (
    <div class="flex w-full items-center justify-between gap-3">
      <div class="flex min-w-[720px] gap-[1px]">
        <div class="flex flex-1 flex-col gap-3">
          <Annotation transform="upper" text="tokens" />
          <div class="custom-bg-button h-2 w-full rounded-l-lg"></div>
        </div>
        <div class="flex flex-1 flex-col gap-3">
          <Annotation transform="upper" text="value & destination" />
          <div class="h-2 w-full bg-white/10"></div>
        </div>
        <div class="flex flex-1 flex-col gap-3">
          <Annotation transform="upper" text="summary" />
          <div class="h-2 w-full rounded-r-lg bg-white/10"></div>
        </div>
      </div>
      <div class="flex items-center gap-4">
        <Slot />
        <Slot />
      </div>
    </div>
  );
});
