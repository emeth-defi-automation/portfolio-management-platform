import { component$, useSignal } from "@builder.io/qwik";
import Dialog from "~/components/Organism/Dialog";

export default component$(() => {
  const ref = useSignal<HTMLDialogElement | undefined>();

  return (
    <div>
      <Dialog ref={ref} hasButton={true} title="Add wallet">
        Hello
      </Dialog>

      <button
        onClick$={() => {
          ref.value?.showModal();
        }}
      >
        Open
      </button>
    </div>
  );
});
