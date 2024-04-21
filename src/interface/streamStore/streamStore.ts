import { createContextId } from "@builder.io/qwik";

export interface StreamStore {
  streamId: string;
}

export const StreamStoreContext = createContextId<StreamStore>(
  "stream-store-context",
);
